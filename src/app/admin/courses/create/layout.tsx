"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCourseStore } from "@/store/useCourseStore";

export default function CourseCreationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { 
    course, 
    activeModuleId, 
    activeLessonId, 
    activeTopicId,
    activeQuizId,
    activeAssignmentId 
  } = useCourseStore();

  const activeModule = course.modules.find(m => m.id === activeModuleId);
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);
  const activeTopic = activeLesson?.topics.find(t => t.id === activeTopicId);
  const activeQuiz = activeLesson?.quizzes?.find(q => q.id === activeQuizId);
  const activeAssignment = activeLesson?.assignments?.find(a => a.id === activeAssignmentId);

  const handleSaveAsDraft = async () => {
    if (!course.title) {
      alert("Please enter a course title first.");
      return;
    }

    // Dynamic import to prevent SSR issues if any
    const { toast } = await import("react-hot-toast");
    const toastId = toast.loading("Saving course structure hierarchically...");

    try {
      let courseId = course.id;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^| )token=([^;]+)/);
        if (match) {
          headers["Authorization"] = `Bearer ${match[2]}`;
        }
      }

      // Fetch all quizzes and assignments to build title-to-ID lookup maps
      const quizzesRes = await fetch("/api/v1/quizzes", { headers });
      const quizzesJson = await quizzesRes.json().catch(() => ({}));
      const quizzesList = quizzesJson.data || quizzesJson || [];
      const quizTitleToIdMap = new Map<string, number>();
      if (Array.isArray(quizzesList)) {
        for (const q of quizzesList) {
          const title = q.quiz_title || q.title || "";
          if (title && q.id) {
            quizTitleToIdMap.set(title.trim().toLowerCase(), Number(q.id));
          }
        }
      }

      const assignmentsRes = await fetch("/api/v1/assignments", { headers });
      const assignmentsJson = await assignmentsRes.json().catch(() => ({}));
      const assignmentsList = assignmentsJson.data || assignmentsJson || [];
      const assignmentTitleToIdMap = new Map<string, number>();
      if (Array.isArray(assignmentsList)) {
        for (const a of assignmentsList) {
          const title = a.assignment_name || a.title || "";
          const aId = a.assignment_id || a.id;
          if (title && aId) {
            assignmentTitleToIdMap.set(title.trim().toLowerCase(), Number(aId));
          }
        }
      }

      const getQuizId = (quiz: any) => {
        if (!isNaN(Number(quiz.id))) return Number(quiz.id);
        const titleKey = (quiz.title || "").trim().toLowerCase();
        return quizTitleToIdMap.get(titleKey) || null;
      };

      const getAssignmentId = (assignment: any) => {
        if (!isNaN(Number(assignment.id))) return Number(assignment.id);
        const titleKey = (assignment.title || "").trim().toLowerCase();
        return assignmentTitleToIdMap.get(titleKey) || null;
      };

      const courseQuizzes = (course.quizzes || [])
        .map(getQuizId)
        .filter((id): id is number => id !== null);
      const courseAssignments = (course.assignments || [])
        .map(getAssignmentId)
        .filter((id): id is number => id !== null);

      // 1. Create or Update Course
      if (!courseId || String(courseId).includes("-")) {
        const res = await fetch("/api/v1/courses", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: course.title,
            description: course.description || "Platform Course",
            thumbnail_url: course.thumbnail_url || null,
            status: "draft",
            quizzes: courseQuizzes,
            assignments: courseAssignments,
          }),
        });
        if (!res.ok) throw new Error("Failed to create course");
        const json = await res.json();
        courseId = json.data?.id || json.id;
      } else {
        const res = await fetch(`/api/v1/courses/${courseId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            name: course.title,
            description: course.description || "Platform Course",
            thumbnail_url: course.thumbnail_url || null,
            status: "draft",
            quizzes: courseQuizzes,
            assignments: courseAssignments,
          }),
        });
        if (!res.ok) throw new Error("Failed to update course");
      }

      // 2. Modules Loop
      for (let mIdx = 0; mIdx < course.modules.length; mIdx++) {
        const m = course.modules[mIdx];
        const isNewModule = String(m.id).includes("-");
        let moduleId = m.id;

        const mQuizzes = (m.quizzes || [])
          .map(getQuizId)
          .filter((id): id is number => id !== null);
        const mAssignments = (m.assignments || [])
          .map(getAssignmentId)
          .filter((id): id is number => id !== null);

        if (isNewModule) {
          const res = await fetch(`/api/v1/courses/${courseId}/modules`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              name: m.title || `Module ${mIdx + 1}`,
              description: m.description || "",
              order_num: mIdx + 1,
              quizzes: mQuizzes,
              assignments: mAssignments,
            }),
          });
          if (!res.ok) throw new Error("Failed to create module");
          const json = await res.json();
          moduleId = String(json.data?.id || json.id);
        } else {
          const res = await fetch(`/api/v1/modules/${moduleId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({
              name: m.title || `Module ${mIdx + 1}`,
              description: m.description || "",
              order_num: mIdx + 1,
              quizzes: mQuizzes,
              assignments: mAssignments,
            }),
          });
          if (!res.ok) throw new Error("Failed to update module");
        }

        // 3. Topics (UI Lessons) Loop
        for (let lIdx = 0; lIdx < m.lessons.length; lIdx++) {
          const l = m.lessons[lIdx];
          const isNewTopic = String(l.id).includes("-");
          let topicId = l.id;

          const lQuizzes = (l.quizzes || [])
            .map(getQuizId)
            .filter((id): id is number => id !== null);
          const lAssignments = (l.assignments || [])
            .map(getAssignmentId)
            .filter((id): id is number => id !== null);

          if (isNewTopic) {
            const res = await fetch(`/api/v1/modules/${moduleId}/topics`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                name: l.title || `Lesson ${lIdx + 1}`,
                content_text: l.content || "",
                text: l.content || "",
                order_num: lIdx + 1,
                quizzes: lQuizzes,
                assignments: lAssignments,
              }),
            });
            if (!res.ok) throw new Error("Failed to create topic (UI lesson)");
            const json = await res.json();
            topicId = String(json.data?.id || json.id);
          } else {
            const res = await fetch(`/api/v1/topics/${topicId}`, {
              method: "PUT",
              headers,
              body: JSON.stringify({
                name: l.title || `Lesson ${lIdx + 1}`,
                content_text: l.content || "",
                text: l.content || "",
                order_num: lIdx + 1,
                quizzes: lQuizzes,
                assignments: lAssignments,
              }),
            });
            if (!res.ok) throw new Error("Failed to update topic (UI lesson)");
          }

          // 4. Lessons (UI Topics) Loop
          for (let tIdx = 0; tIdx < l.topics.length; tIdx++) {
            const t = l.topics[tIdx];
            const isNewLesson = String(t.id).includes("-");
            const lessonId = t.id;

            if (isNewLesson) {
              const res = await fetch(`/api/v1/topics/${topicId}/lessons`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  name: t.title || `Topic ${tIdx + 1}`,
                  text: t.content || "",
                  content_text: t.content || "",
                  duration_minutes: 15,
                  order_num: tIdx + 1,
                }),
              });
              if (!res.ok) throw new Error("Failed to create lesson (UI topic)");
            } else {
              const res = await fetch(`/api/v1/lessons/${lessonId}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                  name: t.title || `Topic ${tIdx + 1}`,
                  text: t.content || "",
                  content_text: t.content || "",
                  duration_minutes: 15,
                  order_num: tIdx + 1,
                }),
              });
              if (!res.ok) throw new Error("Failed to update lesson (UI topic)");
            }
          }
        }
      }

      toast.success("Course saved successfully!", { id: toastId });
      router.push("/admin/courses");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save course structure", { id: toastId });
    }
  };

  const isRootLevel = pathname === "/admin/courses/create";

  if (!mounted) {
    return (
      <div className="bg-muted min-h-screen flex items-center justify-center">
        <div className="text-slate-500 font-medium">Loading course builder...</div>
      </div>
    );
  }

  return (
    <div className="bg-muted min-h-screen flex flex-col">
      {/* CENTRALIZED HEADER / BREADCRUMB */}
      <div className="flex justify-between items-center p-6 bg-card border-b border-gray-100 dark:border-border/50 shadow-sm shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest leading-none">
          {/* Base Course Breadcrumb */}
          {isRootLevel ? (
            <span className="text-foreground">Course</span>
          ) : (
            <Link href="/admin/courses/create" className="text-gray-400 hover:text-blue-600 transition-colors">Course</Link>
          )}

          {/* Module Breadcrumb */}
          {!isRootLevel && activeModuleId && (
            <>
              <ChevronRight size={12} className="text-gray-300" />
              {activeLessonId || activeTopicId || activeQuizId || activeAssignmentId ? (
                <Link href="/admin/courses/create/module" className="text-gray-400 hover:text-blue-600 transition-colors truncate max-w-[150px]">
                  {activeModule?.title || "Module"}
                </Link>
              ) : (
                <span className="text-foreground truncate max-w-[150px]">{activeModule?.title || "New Module"}</span>
              )}
            </>
          )}

          {/* Lesson Breadcrumb */}
          {(activeLessonId || activeTopicId || activeQuizId || activeAssignmentId) && (
            <>
              <ChevronRight size={12} className="text-gray-300" />
              {activeTopicId || activeQuizId || activeAssignmentId ? (
                <Link href="/admin/courses/create/lesson" className="text-gray-400 hover:text-blue-600 transition-colors truncate max-w-[150px]">
                  {activeLesson?.title || "Lesson"}
                </Link>
              ) : (
                <span className="text-foreground truncate max-w-[150px]">{activeLesson?.title || "New Lesson"}</span>
              )}
            </>
          )}

          {/* Topic Breadcrumb */}
          {activeTopicId && (
            <>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-foreground truncate max-w-[150px]">{activeTopic?.title || "New Topic"}</span>
            </>
          )}

          {/* Quiz Breadcrumb */}
          {activeQuizId && (
            <>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-foreground truncate max-w-[150px]">{activeQuiz?.title || "New Quiz"}</span>
            </>
          )}

          {/* Assignment Breadcrumb */}
          {activeAssignmentId && (
            <>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-foreground truncate max-w-[150px]">{activeAssignment?.title || "New Assignment"}</span>
            </>
          )}
        </div>

        {/* CENTRALIZED ACTIONS */}
        <div className="flex gap-3">
          <Link href="/admin/courses">
            <button className="px-5 py-2 rounded-lg border border-border bg-card text-card-foreground font-medium shadow-sm hover:bg-muted transition-all text-xs">
              Back
            </button>
          </Link>
          <button 
            onClick={handleSaveAsDraft}
            className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-all text-xs whitespace-nowrap"
          >
            Save as Draft
          </button>
        </div>
      </div>

      {/* CHILDREN INJECTED HERE */}
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}
