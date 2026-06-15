"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCourseStore } from "@/store/useCourseStore";

export default function CourseCreationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
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

  const handleSaveAsDraft = () => {
    // In a real application, you'd trigger an API call with `course`
    alert("Course saved as draft!");
  };

  const isRootLevel = pathname === "/admin/courses/create";

  return (
    <div className="bg-muted min-h-screen flex flex-col">
      {/* CENTRALIZED HEADER / BREADCRUMB */}
      <div className="flex justify-between items-center p-6 bg-card border-b border-gray-100 shadow-sm shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Link href="/admin/courses/create" className={isRootLevel ? "text-slate-900" : "hover:text-blue-600 transition-colors"}>
            Course
          </Link>

          {(pathname.includes("/module") || pathname.includes("/lesson") || pathname.includes("/topic") || pathname.includes("/quiz") || pathname.includes("/assignment") || activeModuleId) && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <Link href="/admin/courses/create/module" className={pathname.endsWith("/module") && !activeLessonId ? "text-slate-900" : "hover:text-blue-600 transition-colors"}>
                {activeModule?.title || "Module"}
              </Link>
            </>
          )}

          {(pathname.includes("/lesson") || pathname.includes("/topic") || pathname.includes("/quiz") || pathname.includes("/assignment") || activeLessonId) && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <Link href="/admin/courses/create/lesson" className={pathname.endsWith("/lesson") && !activeTopicId && !activeQuizId && !activeAssignmentId ? "text-slate-900" : "hover:text-blue-600 transition-colors"}>
                {activeLesson?.title || "Lesson"}
              </Link>
            </>
          )}

          {(pathname.includes("/topic") || activeTopicId) && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-900 truncate max-w-[150px]">{activeTopic?.title || "New Topic"}</span>
            </>
          )}

          {(pathname.includes("/quiz") || activeQuizId) && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-900 truncate max-w-[150px]">{activeQuiz?.title || "New Quiz"}</span>
            </>
          )}

          {(pathname.includes("/assignment") || activeAssignmentId) && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-900 truncate max-w-[150px]">{activeAssignment?.title || "New Assignment"}</span>
            </>
          )}
        </div>

        {/* CENTRALIZED ACTIONS */}
        <div className="flex gap-3">
          <button 
            onClick={handleSaveAsDraft}
            className="px-5 py-2 rounded-lg border border-border bg-card text-card-foreground font-medium shadow-sm hover:bg-muted transition-all text-xs"
          >
            Save as Draft
          </button>
          <button 
            className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-all text-xs whitespace-nowrap"
          >
            Save
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
