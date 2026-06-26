"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCourseStore } from "@/store/useCourseStore";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CourseCreationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const lastSavedPayloadsRef = useRef<Map<string, string>>(new Map());
  const quizzesCacheRef = useRef<any[] | null>(null);
  const assignmentsCacheRef = useRef<any[] | null>(null);
  const previousIdRef = useRef<string | null>(null);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Reset caches when course ID changes
  useEffect(() => {
    if (id !== previousIdRef.current) {
      lastSavedPayloadsRef.current.clear();
      quizzesCacheRef.current = null;
      assignmentsCacheRef.current = null;
      previousIdRef.current = id;
    }
  }, [id]);
  
  const { 
    course, 
    activeModuleId, 
    activeLessonId, 
    activeTopicId,
    activeQuizId,
    activeAssignmentId 
  } = useCourseStore();

  const activeModule = activeModuleId ? course.modules.find(m => String(m.id) === String(activeModuleId)) : undefined;
  const activeLesson = activeLessonId && activeModule ? activeModule.lessons.find(l => String(l.id) === String(activeLessonId)) : undefined;
  const activeTopic = activeTopicId && activeLesson ? activeLesson.topics.find(t => String(t.id) === String(activeTopicId)) : undefined;

  let activeQuiz: any = undefined;
  if (activeQuizId) {
    if (activeLesson) {
      activeQuiz = activeLesson.quizzes?.find(q => String(q.id) === String(activeQuizId));
    } else if (activeModule) {
      activeQuiz = activeModule.quizzes?.find(q => String(q.id) === String(activeQuizId));
    } else {
      activeQuiz = course.quizzes?.find(q => String(q.id) === String(activeQuizId));
    }
  }

  let activeAssignment: any = undefined;
  if (activeAssignmentId) {
    if (activeLesson) {
      activeAssignment = activeLesson.assignments?.find(a => String(a.id) === String(activeAssignmentId));
    } else if (activeModule) {
      activeAssignment = activeModule.assignments?.find(a => String(a.id) === String(activeAssignmentId));
    } else {
      activeAssignment = course.assignments?.find(a => String(a.id) === String(activeAssignmentId));
    }
  }

  const cleanPayload = (obj: any) => {
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      // Only skip null/undefined, keep empty arrays (like quizzes: [], assignments: [])
      if (val === null || val === undefined) {
        continue;
      }
      clean[key] = val;
    }
    return clean;
  };

  const handleSave = async (status: "draft" | "published", isSilent = false) => {
    const currentCourse = useCourseStore.getState().course;
    if (!currentCourse.title) {
      if (!isSilent) {
        alert("Please enter a course title first.");
      }
      return;
    }

    let toastId: string | number | undefined = undefined;
    if (!isSilent) {
      toastId = toast.loading(
        status === "published" 
          ? "Publishing course structure hierarchically..." 
          : "Saving course structure hierarchically..."
      );
    }

    try {
      let courseId = currentCourse.id;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^| )token=([^;]+)/);
        if (match) {
          headers["Authorization"] = `Bearer ${match[2]}`;
        }
      }

      const secureFetch = async (url: string, options: RequestInit = {}) => {
        const res = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });
        if (!res.ok) {
          let errData: any = {};
          let text = "";
          try {
            text = await res.text();
            errData = JSON.parse(text);
          } catch (e) {
            errData = { message: text || res.statusText || `Status ${res.status}` };
          }
          let messageStr = "API request failed";
          if (errData.errors) {
            if (Array.isArray(errData.errors)) {
              messageStr = errData.errors.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(", ");
            } else if (typeof errData.errors === "object") {
              messageStr = Object.values(errData.errors).flat().join(", ");
            } else {
              messageStr = String(errData.errors);
            }
          } else if (Array.isArray(errData.message)) {
            messageStr = errData.message.join(", ");
          } else if (errData.message) {
            messageStr = errData.message;
          } else if (errData.detail) {
            messageStr = errData.detail;
          }
          if (res.status === 401 || messageStr.toLowerCase().includes("token expired")) {
            throw new Error("Token expired");
          }
          throw new Error(messageStr);
        }
        return res;
      };

      // Process deleted items
      const { deletedModules, deletedLessons, deletedTopics, clearDeletedItems } = useCourseStore.getState();
      
      for (const mId of deletedModules) {
        if (!mId.startsWith('temp-')) {
          await secureFetch(`/api/v1/modules/${mId}`, { method: 'DELETE' }).catch(e => console.warn('Failed to delete module', e));
        }
      }
      for (const lId of deletedLessons) {
        if (!lId.startsWith('temp-')) {
          // UI Lesson maps to Backend Topic
          await secureFetch(`/api/v1/topics/${lId}`, { method: 'DELETE' }).catch(e => console.warn('Failed to delete UI lesson', e));
        }
      }
      for (const tId of deletedTopics) {
        if (!tId.startsWith('temp-')) {
          // UI Topic maps to Backend Lesson
          await secureFetch(`/api/v1/lessons/${tId}`, { method: 'DELETE' }).catch(e => console.warn('Failed to delete UI topic', e));
        }
      }
      
      clearDeletedItems();

      // Fetch all quizzes and assignments to build title-to-ID lookup maps
      let quizzesList: any[] | null = quizzesCacheRef.current;
      if (!quizzesList) {
        try {
          const quizzesRes = await secureFetch("/api/v1/quizzes");
          const quizzesJson = await quizzesRes.json();
          quizzesList = quizzesJson.data || quizzesJson || [];
          quizzesCacheRef.current = quizzesList;
        } catch (err: any) {
          if (err.message === "Token expired") throw err;
          console.warn("Failed to fetch quizzes list, fallback to empty", err);
          quizzesList = [];
        }
      }

      const quizTitleToIdMap = new Map<string, number>();
      if (Array.isArray(quizzesList)) {
        for (const q of quizzesList) {
          const title = q.quiz_title || q.title || "";
          if (title && q.id) {
            quizTitleToIdMap.set(title.trim().toLowerCase(), Number(q.id));
          }
        }
      }

      let assignmentsList: any[] | null = assignmentsCacheRef.current;
      if (!assignmentsList) {
        try {
          const assignmentsRes = await secureFetch("/api/v1/assignments");
          const assignmentsJson = await assignmentsRes.json();
          assignmentsList = assignmentsJson.data || assignmentsJson || [];
          assignmentsCacheRef.current = assignmentsList;
        } catch (err: any) {
          if (err.message === "Token expired") throw err;
          console.warn("Failed to fetch assignments list, fallback to empty", err);
          assignmentsList = [];
        }
      }

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

      const courseQuizzes = (currentCourse.quizzes || [])
        .map(getQuizId)
        .filter((id): id is number => id !== null);
      const courseAssignments = (currentCourse.assignments || [])
        .map(getAssignmentId)
        .filter((id): id is number => id !== null);

      const backendStatus = status === "published" ? "active" : "draft";

      const updatedCourse = JSON.parse(JSON.stringify(currentCourse));
      let newActiveModuleId = useCourseStore.getState().activeModuleId;
      let newActiveLessonId = useCourseStore.getState().activeLessonId;
      let newActiveTopicId = useCourseStore.getState().activeTopicId;

      // 1. Create or Update Course
      if (!courseId || String(courseId).startsWith("temp-")) {
        const res = await secureFetch("/api/v1/courses", {
          method: "POST",
          body: JSON.stringify(cleanPayload({
            name: currentCourse.title,
            description: currentCourse.description || "Platform Course",
            thumbnail_url: currentCourse.thumbnail_url || undefined,
            tags: currentCourse.tags ? currentCourse.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
            quizzes: courseQuizzes,
            assignments: courseAssignments,
          })),
        });
        const json = await res.json();
        courseId = json.data?.id || json.id;
        updatedCourse.id = courseId;
        lastSavedPayloadsRef.current.set(`course-${courseId}`, payloadStr);

        // Update search parameter in window URL
        if (typeof window !== "undefined" && courseId) {
          const url = new URL(window.location.href);
          if (url.searchParams.get("id") !== String(courseId)) {
            url.searchParams.set("id", String(courseId));
            window.history.replaceState(null, "", url.pathname + url.search);
          }
        }

        if (backendStatus === "active") {
          await secureFetch(`/api/v1/courses/${courseId}`, {
            method: "PUT",
            body: JSON.stringify(cleanPayload({
              name: currentCourse.title,
              description: currentCourse.description || "Platform Course",
              thumbnail_url: currentCourse.thumbnail_url || undefined,
              status: "active",
              tags: currentCourse.tags ? currentCourse.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
              quizzes: courseQuizzes,
              assignments: courseAssignments,
            })),
          });
          lastSavedPayloadsRef.current.set(`course-${courseId}`, activePayloadStr);
        }
      } else {
        await secureFetch(`/api/v1/courses/${courseId}`, {
          method: "PUT",
          body: JSON.stringify(cleanPayload({
            name: currentCourse.title,
            description: currentCourse.description || "Platform Course",
            thumbnail_url: currentCourse.thumbnail_url || undefined,
            status: backendStatus,
            tags: currentCourse.tags ? currentCourse.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
            quizzes: courseQuizzes,
            assignments: courseAssignments,
          })),
        });
      }

      // 2. Modules Loop
      for (let mIdx = 0; mIdx < currentCourse.modules.length; mIdx++) {
        const m = currentCourse.modules[mIdx];
        const isNewModule = String(m.id).startsWith("temp-");
        let moduleId = m.id;

        const mQuizzes = (m.quizzes || [])
          .map(getQuizId)
          .filter((id): id is number => id !== null);
        const mAssignments = (m.assignments || [])
          .map(getAssignmentId)
          .filter((id): id is number => id !== null);

        if (isNewModule) {
          const payloadStr = JSON.stringify(cleanPayload({
            name: m.title || `Module ${mIdx + 1}`,
            description: m.description || "",
            order_num: mIdx + 1,
            quizzes: mQuizzes,
            assignments: mAssignments,
          }));
          const res = await secureFetch(`/api/v1/courses/${courseId}/modules`, {
            method: "POST",
            body: payloadStr,
          });
          const json = await res.json();
          moduleId = String(json.data?.id || json.id);
          updatedCourse.modules[mIdx].id = moduleId;
          lastSavedPayloadsRef.current.set(`module-${moduleId}`, payloadStr);
          if (m.id === newActiveModuleId) {
            newActiveModuleId = moduleId;
          }
        } else {
          const payloadStr = JSON.stringify(cleanPayload({
            name: m.title || `Module ${mIdx + 1}`,
            description: m.description || "",
            order_num: mIdx + 1,
            quizzes: mQuizzes,
            assignments: mAssignments,
          }));
          if (lastSavedPayloadsRef.current.get(`module-${moduleId}`) !== payloadStr) {
            await secureFetch(`/api/v1/modules/${moduleId}`, {
              method: "PUT",
              body: payloadStr,
            });
            lastSavedPayloadsRef.current.set(`module-${moduleId}`, payloadStr);
          }
        }

        // 3. Topics (UI Lessons) Loop
        for (let lIdx = 0; lIdx < m.lessons.length; lIdx++) {
          const l = m.lessons[lIdx];
          const isNewTopic = String(l.id).startsWith("temp-");
          let topicId = l.id;

          const order = l.order || [];
          const quizOrderMap = new Map(order.filter(o => o.type === 'quiz').map((o, idx) => [o.id, idx]));
          const sortedQuizzes = [...(l.quizzes || [])].sort((a, b) => {
            const idxA = quizOrderMap.has(a.id) ? quizOrderMap.get(a.id)! : 999;
            const idxB = quizOrderMap.has(b.id) ? quizOrderMap.get(b.id)! : 999;
            return idxA - idxB;
          });
          const lQuizzes = sortedQuizzes.map(getQuizId).filter((id): id is number => id !== null);

          const assignmentOrderMap = new Map(order.filter(o => o.type === 'assignment').map((o, idx) => [o.id, idx]));
          const sortedAssignments = [...(l.assignments || [])].sort((a, b) => {
            const idxA = assignmentOrderMap.has(a.id) ? assignmentOrderMap.get(a.id)! : 999;
            const idxB = assignmentOrderMap.has(b.id) ? assignmentOrderMap.get(b.id)! : 999;
            return idxA - idxB;
          });
          const lAssignments = sortedAssignments.map(getAssignmentId).filter((id): id is number => id !== null);

          const topicOrderMap = new Map(order.filter(o => o.type === 'topic').map((o, idx) => [o.id, idx]));
          const sortedTopics = [...(l.topics || [])].sort((a, b) => {
            const idxA = topicOrderMap.has(a.id) ? topicOrderMap.get(a.id)! : 999;
            const idxB = topicOrderMap.has(b.id) ? topicOrderMap.get(b.id)! : 999;
            return idxA - idxB;
          });

          if (isNewTopic) {
            const payloadStr = JSON.stringify(cleanPayload({
              name: l.title || `Lesson ${lIdx + 1}`,
              content_text: l.content || "",
              text: l.content || "",
              order_num: lIdx + 1,
              quizzes: lQuizzes,
              assignments: lAssignments,
            }));
            const res = await secureFetch(`/api/v1/modules/${moduleId}/topics`, {
              method: "POST",
              body: payloadStr,
            });
            const json = await res.json();
            topicId = String(json.data?.id || json.id);
            updatedCourse.modules[mIdx].lessons[lIdx].id = topicId;
            lastSavedPayloadsRef.current.set(`topic-${topicId}`, payloadStr);
            if (l.id === newActiveLessonId) {
              newActiveLessonId = topicId;
            }
            // Update order array inside module
            if (updatedCourse.modules[mIdx].order) {
              updatedCourse.modules[mIdx].order = updatedCourse.modules[mIdx].order.map((o: any) => 
                o.id === l.id ? { ...o, id: topicId } : o
              );
            }
          } else {
            const payloadStr = JSON.stringify(cleanPayload({
              name: l.title || `Lesson ${lIdx + 1}`,
              content_text: l.content || "",
              text: l.content || "",
              order_num: lIdx + 1,
              quizzes: lQuizzes,
              assignments: lAssignments,
            }));
            if (lastSavedPayloadsRef.current.get(`topic-${topicId}`) !== payloadStr) {
              await secureFetch(`/api/v1/topics/${topicId}`, {
                method: "PUT",
                body: payloadStr,
              });
              lastSavedPayloadsRef.current.set(`topic-${topicId}`, payloadStr);
            }
          }

          // 4. Sub-Topics (Backend Lessons) Loop
          for (let tIdx = 0; tIdx < sortedTopics.length; tIdx++) {
            const t = sortedTopics[tIdx];
            const isNewSubTopic = String(t.id).startsWith("temp-");
            let subTopicId = t.id;

            if (isNewSubTopic) {
              const payloadStr = JSON.stringify(cleanPayload({
                name: t.title || `Topic ${tIdx + 1}`,
                type: "text",
                text: t.content || "",
                content_text: t.content || "",
                duration_minutes: 15,
                order_num: tIdx + 1,
              }));
              const res = await secureFetch(`/api/v1/topics/${topicId}/lessons`, {
                method: "POST",
                body: payloadStr,
              });
              const json = await res.json();
              subTopicId = String(json.data?.id || json.id);
              updatedCourse.modules[mIdx].lessons[lIdx].topics[tIdx].id = subTopicId;
              lastSavedPayloadsRef.current.set(`lesson-${subTopicId}`, payloadStr);
              if (t.id === newActiveTopicId) {
                newActiveTopicId = subTopicId;
              }
              // Update order array inside lesson
              if (updatedCourse.modules[mIdx].lessons[lIdx].order) {
                updatedCourse.modules[mIdx].lessons[lIdx].order = updatedCourse.modules[mIdx].lessons[lIdx].order.map((o: any) => 
                  o.id === t.id ? { ...o, id: subTopicId } : o
                );
              }
            } else {
              const payloadStr = JSON.stringify(cleanPayload({
                name: t.title || `Topic ${tIdx + 1}`,
                type: "text",
                text: t.content || "",
                content_text: t.content || "",
                duration_minutes: 15,
                order_num: tIdx + 1,
              }));
              if (lastSavedPayloadsRef.current.get(`lesson-${subTopicId}`) !== payloadStr) {
                await secureFetch(`/api/v1/lessons/${subTopicId}`, {
                  method: "PUT",
                  body: payloadStr,
                });
                lastSavedPayloadsRef.current.set(`lesson-${subTopicId}`, payloadStr);
              }
            }
          }
        }
      }

      // Update the Zustand store with final saved details and backend-generated IDs
      useCourseStore.setState((state) => ({
        course: {
          ...state.course,
          id: courseId,
          modules: updatedCourse.modules,
        },
        activeModuleId: newActiveModuleId,
        activeLessonId: newActiveLessonId,
        activeTopicId: newActiveTopicId,
      }));

      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courseStats"] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });

      if (!isSilent) {
        toast.success(
          status === "published" 
            ? "Course published successfully!" 
            : "Course saved successfully!",
          { id: toastId }
        );
        router.push("/admin/courses");
      }
    } catch (error: any) {
      console.error(error);
      if (error.message === "Token expired") {
        if (!isSilent && toastId) {
          toast.error("Your session has expired. Redirecting to login...", { id: toastId });
        }
        if (typeof document !== "undefined") {
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "mock_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }
      } else {
        if (!isSilent) {
          toast.error(error.message || "Failed to save course structure", { id: toastId });
        }
      }
    }
  };

  // Background auto-save every 30 seconds
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      handleSave("draft", true);
    }, 30000);
    return () => clearInterval(interval);
  }, [mounted]);

  const handleBack = async () => {
    if (!course.title) {
      router.push("/admin/courses");
      return;
    }
    await handleSave("draft");
  };

  const isRootLevel = pathname === "/admin/courses/create";

  if (!mounted) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center">
        <div className="text-slate-500 font-medium">Loading course builder...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col">
      {/* CENTRALIZED HEADER / BREADCRUMB */}
      <div className="flex justify-between items-center p-6 bg-white border-b border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest leading-none">
          {/* Base Course Breadcrumb */}
          {isRootLevel ? (
            <span className="text-slate-800">Course</span>
          ) : (
            <Link href="/admin/courses/create" className="text-slate-400 hover:text-blue-600 transition-colors">Course</Link>
          )}

          {/* Module Breadcrumb */}
          {!isRootLevel && activeModuleId && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              {activeLessonId || activeTopicId || activeQuizId || activeAssignmentId ? (
                <Link href="/admin/courses/create/module" className="text-slate-400 hover:text-blue-600 transition-colors truncate max-w-[150px]">
                  {activeModule?.title || "Module"}
                </Link>
              ) : (
                <span className="text-slate-800 truncate max-w-[150px]">{activeModule?.title || "New Module"}</span>
              )}
            </>
          )}

          {/* Lesson Breadcrumb */}
          {activeLessonId && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              {activeTopicId || (activeQuizId && activeLessonId) || (activeAssignmentId && activeLessonId) ? (
                <Link href="/admin/courses/create/lesson" className="text-slate-400 hover:text-blue-600 transition-colors truncate max-w-[150px]">
                  {activeLesson?.title || "Lesson"}
                </Link>
              ) : (
                <span className="text-slate-800 truncate max-w-[150px]">{activeLesson?.title || "New Lesson"}</span>
              )}
            </>
          )}

          {/* Topic Breadcrumb */}
          {activeTopicId && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 truncate max-w-[150px]">{activeTopic?.title || "New Topic"}</span>
            </>
          )}

          {/* Quiz Breadcrumb */}
          {activeQuizId && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 truncate max-w-[150px]">{activeQuiz?.title || "New Quiz"}</span>
            </>
          )}

          {/* Assignment Breadcrumb */}
          {activeAssignmentId && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 truncate max-w-[150px]">{activeAssignment?.title || "New Assignment"}</span>
            </>
          )}
        </div>

        {/* CENTRALIZED ACTIONS */}
        <div className="flex gap-3">
          <button 
            onClick={handleBack}
            className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold shadow-xs hover:bg-slate-50 transition-all text-xs"
          >
            Back
          </button>
          <button 
            onClick={() => handleSave("draft")}
            className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-all text-xs whitespace-nowrap"
          >
            Save as Draft
          </button>
          <button 
            onClick={() => handleSave("published")}
            className="px-8 py-2 rounded-lg bg-green-600 text-white font-bold shadow-md hover:bg-green-700 transition-all text-xs whitespace-nowrap"
          >
            Publish
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
