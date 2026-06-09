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
