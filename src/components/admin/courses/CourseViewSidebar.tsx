"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FolderOpen,
  Book, 
  BookOpen, 
  Target, 
  GraduationCap, 
  ClipboardList,
  Award,
  PlayCircle,
  FileText
  ClipboardList,
  Award,
  PlayCircle,
  FileText
} from "lucide-react";
import { cn, getDisplayThumbnailUrl } from "@/lib/utils";

interface CourseViewSidebarProps {
  course: any;
  activeItem: any;
  setActiveItem: (item: any) => void;
  expandedModules: Record<string, boolean>;
  setExpandedModules: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedLessons: Record<string, boolean>;
  setExpandedLessons: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function CourseViewSidebar({ 
  course, 
  activeItem, 
  setActiveItem,
  expandedModules,
  setExpandedModules,
  expandedLessons,
  setExpandedLessons
}: CourseViewSidebarProps) {

  useEffect(() => {
    if (activeItem) {
      if (activeItem.type === "module") {
        setExpandedModules(prev => ({ ...prev, [activeItem.id]: true }));
      } else if (activeItem.type === "lesson") {
        const mod = course.modules?.find((m: any) => 
          m.lessons?.some((l: any) => String(l.id) === String(activeItem.id)) ||
          m.topics?.some((l: any) => String(l.id) === String(activeItem.id))
          m.lessons?.some((l: any) => String(l.id) === String(activeItem.id)) ||
          m.topics?.some((l: any) => String(l.id) === String(activeItem.id))
        );
        if (mod) {
          setExpandedModules(prev => ({ ...prev, [mod.id]: true }));
          setExpandedLessons(prev => ({ ...prev, [activeItem.id]: true }));
        }
      } else if (activeItem.type === "topic" || activeItem.type === "quiz" || activeItem.type === "assignment") {
        let foundLessonId: string | null = null;
        let foundModuleId: string | null = null;

        // Check if it's a course-level quiz or assignment first
        const isCourseQuiz = (course.quizzes || []).some((q: any) => String(q.id) === String(activeItem.id));
        const isCourseAssignment = (course.assignments || []).some((a: any) => String(a.id) === String(activeItem.id)) ||
                                   !!activeItem.isFinal ||
                                   String((course.final_assessment || course.finalAssessment || course.final_assignment)?.id) === String(activeItem.id);
        if (isCourseQuiz || isCourseAssignment) {
          // No need to expand modules
          return;
        }

        for (const mod of course.modules || []) {
          const hasModQuiz = mod.quizzes?.some((q: any) => String(q.id) === String(activeItem.id));
          const hasModAss = mod.assignments?.some((a: any) => String(a.id) === String(activeItem.id));
          if (hasModQuiz || hasModAss) {
            foundModuleId = mod.id;
            break;
          }

          const lessons = mod.lessons || mod.topics || [];
          for (const les of lessons) {
            const hasTopic = les.topics?.some((t: any) => String(t.id) === String(activeItem.id)) ||
                             les.lessons?.some((t: any) => String(t.id) === String(activeItem.id));
          const lessons = mod.lessons || mod.topics || [];
          for (const les of lessons) {
            const hasTopic = les.topics?.some((t: any) => String(t.id) === String(activeItem.id)) ||
                             les.lessons?.some((t: any) => String(t.id) === String(activeItem.id));
            const hasQuiz = les.quizzes?.some((q: any) => String(q.id) === String(activeItem.id));
            const hasAss = les.assignments?.some((a: any) => String(a.id) === String(activeItem.id));
            if (hasTopic || hasQuiz || hasAss || String(les.id) === String(activeItem.id)) {
              foundLessonId = les.id;
              foundModuleId = mod.id;
              break;
            }
          }
          if (foundModuleId) break;
        }

        if (foundModuleId) {
          setExpandedModules(prev => ({ ...prev, [foundModuleId]: true }));
          setExpandedModules(prev => ({ ...prev, [foundModuleId]: true }));
        }
        if (foundLessonId) {
          setExpandedLessons(prev => ({ ...prev, [foundLessonId]: true }));
          setExpandedLessons(prev => ({ ...prev, [foundLessonId]: true }));
        }
      }
    }
  }, [activeItem, course]);

  const toggleModuleExpand = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleLessonExpand = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const modules = course.modules || [];

  return (
    <aside className="w-[320px] bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-4 shrink-0 h-full overflow-hidden text-slate-700">
      {/* Course Info Header */}
    <aside className="w-[320px] bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-4 shrink-0 h-full overflow-hidden text-slate-700">
      {/* Course Info Header */}
      <div 
        onClick={() => setActiveItem({ type: "course", id: course.id, data: course })}
        className={cn(
          "rounded-2xl p-4 cursor-pointer transition-all flex flex-col gap-3 group relative overflow-hidden",
          (!activeItem || activeItem.type === "course") 
            ? "bg-white shadow-sm border border-blue-200 ring-1 ring-blue-500/10" 
            : "bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm"
        )}
      >
        {getDisplayThumbnailUrl(course.thumbnail_url) && (
          <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0">
            <img src={getDisplayThumbnailUrl(course.thumbnail_url)} alt={course.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-1 z-10">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Course Overview</span>
          <h3 className="font-bold text-sm text-slate-800 leading-tight">
            {course.name}
          </h3>
          {course.category?.name && (
            <span className="text-xs text-slate-500 mt-1">{course.category.name}</span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl border border-slate-200 p-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-3 border-b border-slate-100 mb-2">
          Course Content
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl border border-slate-200 p-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-3 border-b border-slate-100 mb-2">
          Course Content
        </h3>
        
        <div className="flex-grow overflow-y-auto px-1 flex flex-col gap-1 no-scrollbar pb-4">
        <div className="flex-grow overflow-y-auto px-1 flex flex-col gap-1 no-scrollbar pb-4">
          {modules.length === 0 ? (
            <div className="text-sm text-slate-400 italic px-3 py-2">No modules found.</div>
            <div className="text-sm text-slate-400 italic px-3 py-2">No modules found.</div>
          ) : (
            modules.map((module: any, mIdx: number) => {
              const isModuleActive = activeItem?.type === "module" && String(activeItem.id) === String(module.id);
              const isExpanded = !!expandedModules[module.id];
              
              return (
                <div key={`module-${module.id}`} className="flex flex-col gap-0.5 mb-3 border-b border-slate-100/60 pb-3 last:border-0 last:pb-0 last:mb-0">
                  <div 
                    onClick={() => setActiveItem({ type: "module", id: module.id, data: module })}
                    className={cn(
                      "group/module rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-all duration-150 mb-1 border border-transparent",
                      isModuleActive 
                        ? 'bg-white border-blue-200/85 border-l-4 border-l-blue-600 text-blue-700 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)] pl-2' 
                        : 'hover:bg-slate-50/60 text-slate-700 font-semibold hover:border-slate-100 hover:shadow-[0_2px_6px_rgba(0,0,0,0.01)] hover:translate-x-0.5'
                    )}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                      <button
                        onClick={(e) => toggleModuleExpand(module.id, e)}
                        className="p-0.5 rounded-md text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors shrink-0"
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <Folder className={cn("shrink-0", isModuleActive ? "text-blue-600" : "text-slate-400")} size={15} />
                        <span className="text-[13.5px] font-semibold truncate text-slate-800">
                          {module.name || `Module ${mIdx + 1}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (() => {
                    const order = module.order || [];
                    const lessonsArray = module.topics || module.lessons || [];
                    const lessonsArray = module.topics || module.lessons || [];
                    const items = order.length > 0 ? order : [
                      ...lessonsArray.map((l: any) => ({ id: l.id, type: 'lesson' as const })),
                      ...lessonsArray.map((l: any) => ({ id: l.id, type: 'lesson' as const })),
                      ...(module.quizzes || []).map((q: any) => ({ id: q.id, type: 'quiz' as const })),
                      ...(module.assignments || []).map((a: any) => ({ id: a.id, type: 'assignment' as const }))
                    ];

                    return (
                      <div className="flex flex-col pl-3.5 ml-4 border-l border-slate-150/60 gap-1 mt-0.5 mb-1.5">
                        {items.map((item: any) => {
                          if (item.type === 'lesson' || item.type === 'topic') {
                            const lesson = lessonsArray.find((l: any) => String(l.id) === String(item.id));
                            const lesson = lessonsArray.find((l: any) => String(l.id) === String(item.id));
                            if (!lesson) return null;
                            const isLessonActive = activeItem?.type === "lesson" && String(activeItem.id) === String(lesson.id);
                            const isLessonExpanded = !!expandedLessons[lesson.id];

                             return (
                              <div key={`lesson-${lesson.id}`} className="flex flex-col gap-0.5">
                                <div 
                                  onClick={() => setActiveItem({ type: "lesson", id: lesson.id, data: lesson })}
                                  className={cn(
                                    "group/lesson rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-all duration-150 relative mb-1 border border-transparent",
                                    isLessonActive
                                      ? 'bg-white border-indigo-200/85 border-l-4 border-l-indigo-500 text-indigo-700 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)] pl-2' 
                                      : 'hover:bg-slate-50/60 text-slate-650 hover:text-slate-800 font-medium hover:border-slate-100 hover:translate-x-0.5'
                                  )}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden flex-1 pl-0.5">
                                    <button
                                      onClick={(e) => toggleLessonExpand(lesson.id, e)}
                                      className="p-0.5 rounded-md text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors shrink-0"
                                    >
                                      {isLessonExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                      {isLessonExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>
                                    <BookOpen className={cn("shrink-0", isLessonActive ? "text-indigo-650" : "text-slate-400")} size={14} />
                                    <span className="text-[13px] font-semibold truncate flex-1">
                                      {lesson.name || lesson.title}
                                    </span>
                                  </div>
                                </div>

                                {isLessonExpanded && (() => {
                                  const lessonOrder = lesson.order || [];
                                  const subTopicsArray = lesson.lessons || lesson.topics || [];
                                  const subTopicsArray = lesson.lessons || lesson.topics || [];
                                  const lessonItems = lessonOrder.length > 0 ? lessonOrder : [
                                    ...subTopicsArray.map((t: any) => ({ id: t.id, type: 'topic' as const })),
                                    ...subTopicsArray.map((t: any) => ({ id: t.id, type: 'topic' as const })),
                                    ...(lesson.quizzes || []).map((q: any) => ({ id: q.id, type: 'quiz' as const })),
                                    ...(lesson.assignments || []).map((a: any) => ({ id: a.id, type: 'assignment' as const }))
                                  ];
                                  
                                  return (
                                    <div className="flex flex-col pl-3.5 ml-4 border-l border-slate-150/60 gap-1 mb-1.5">
                                      {lessonItems.map((lItem: any) => {
                                        if (lItem.type === 'topic' || lItem.type === 'lesson') {
                                          const topic = subTopicsArray.find((t: any) => String(t.id) === String(lItem.id));
                                          const topic = subTopicsArray.find((t: any) => String(t.id) === String(lItem.id));
                                          if (!topic) return null;
                                          const isTopicActive = activeItem?.type === "topic" && String(activeItem.id) === String(topic.id);
                                          return (
                                            <div 
                                              key={`topic-${topic.id}`}
                                              onClick={() => setActiveItem({ type: "topic", id: topic.id, data: topic })}
                                              className={cn(
                                                "group/item rounded-xl px-3 py-1 flex items-center justify-between cursor-pointer transition-all duration-150 relative mb-1 border border-transparent",
                                                isTopicActive 
                                                  ? 'bg-white border-blue-200/85 border-l-4 border-l-blue-400 text-blue-700 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)] pl-2' 
                                                  : 'hover:bg-slate-50/65 text-slate-500 hover:text-slate-750 font-normal hover:translate-x-0.5'
                                              )}
                                            >
                                              <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-1">
                                                <PlayCircle className={cn("shrink-0", isTopicActive ? "text-blue-500" : "text-slate-400")} size={13} />
                                                <span className="text-[13px] font-normal truncate flex-1">
                                                  {topic.name || topic.title}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        }
                                        
                                        if (lItem.type === 'quiz') {
                                          const quiz = (lesson.quizzes || []).find((q: any) => String(q.id) === String(lItem.id));
                                          if (!quiz) return null;
                                          const isQuizActive = activeItem?.type === "quiz" && String(activeItem.id) === String(quiz.id);
                                          return (
                                            <div 
                                              key={`quiz-${quiz.id}`}
                                              onClick={() => setActiveItem({ type: "quiz", id: quiz.id, data: quiz })}
                                              className={cn(
                                                "group/item rounded-xl px-3 py-1 flex items-center justify-between cursor-pointer transition-all duration-150 relative mb-1 border border-transparent",
                                                isQuizActive 
                                                  ? 'bg-white border-emerald-200/85 border-l-4 border-l-emerald-500 text-emerald-700 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)] pl-2' 
                                                  : 'hover:bg-slate-50/65 text-slate-500 hover:text-slate-750 font-normal hover:translate-x-0.5'
                                              )}
                                            >
                                              <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-1">
                                                <GraduationCap className={cn("shrink-0", isQuizActive ? "text-emerald-600" : "text-slate-400")} size={13} />
                                                <span className="text-[13px] font-normal truncate flex-1">
                                                  {quiz.name || quiz.title || quiz.quiz_title}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        }
  
                                        if (lItem.type === 'assignment') {
                                          const assignment = (lesson.assignments || []).find((a: any) => String(a.id) === String(lItem.id));
                                          if (!assignment) return null;
                                          const isAssignmentActive = activeItem?.type === "assignment" && String(activeItem.id) === String(assignment.id);
                                          return (
                                            <div 
                                              key={`assignment-${assignment.id}`}
                                              onClick={() => setActiveItem({ type: "assignment", id: assignment.id, data: assignment })}
                                              className={cn(
                                                "group/item rounded-xl px-3 py-1 flex items-center justify-between cursor-pointer transition-all duration-150 relative mb-1 border border-transparent",
                                                isAssignmentActive 
                                                  ? 'bg-white border-violet-200/85 border-l-4 border-l-violet-500 text-violet-700 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)] pl-2' 
                                                  : 'hover:bg-slate-50/65 text-slate-500 hover:text-slate-750 font-normal hover:translate-x-0.5'
                                              )}
                                            >
                                              <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-1">
                                                <FileText className={cn("shrink-0", isAssignmentActive ? "text-violet-600" : "text-slate-400")} size={13} />
                                                <span className="text-[13px] font-normal truncate flex-1">
                                                  {assignment.title || assignment.name}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })}
                                    </div>
                                  );
                                })()}
                              </div>
                             );
                          }

                          if (item.type === 'quiz') {
                            const quiz = (module.quizzes || []).find((q: any) => String(q.id) === String(item.id));
                            if (!quiz) return null;
                            const isQuizActive = activeItem?.type === "quiz" && String(activeItem.id) === String(quiz.id);
                            return (
                              <div 
                                key={`quiz-${quiz.id}`}
                                onClick={() => setActiveItem({ type: "quiz", id: quiz.id, data: quiz })}
                                className={cn(
                                  "group/item rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-all duration-150 relative mb-1 border border-transparent",
                                  isQuizActive 
                                    ? 'bg-white border-emerald-200/85 border-l-4 border-l-emerald-500 text-emerald-700 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)] pl-2' 
                                    : 'hover:bg-slate-50/60 text-slate-600 hover:text-slate-800 font-medium hover:border-slate-100 hover:translate-x-0.5'
                                )}
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-1">
                                  <GraduationCap className={cn("shrink-0", isQuizActive ? "text-emerald-600" : "text-slate-400")} size={14} />
                                  <span className="text-[13px] font-medium truncate flex-1">
                                    {quiz.name || quiz.title || quiz.quiz_title}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === 'assignment') {
                            const assignment = (module.assignments || []).find((a: any) => String(a.id) === String(item.id));
                            if (!assignment) return null;
                            const isAssignmentActive = activeItem?.type === "assignment" && String(activeItem.id) === String(assignment.id);
                            return (
                              <div 
                                key={`assignment-${assignment.id}`}
                                onClick={() => setActiveItem({ type: "assignment", id: assignment.id, data: assignment })}
                                className={cn(
                                  "group/item rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-all duration-150 relative mb-1 border border-transparent",
                                  isAssignmentActive 
                                    ? 'bg-white border-violet-200/85 border-l-4 border-l-violet-500 text-violet-700 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)] pl-2' 
                                    : 'hover:bg-slate-50/60 text-slate-600 hover:text-slate-800 font-medium hover:border-slate-100 hover:translate-x-0.5'
                                )}
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-1">
                                  <FileText className={cn("shrink-0", isAssignmentActive ? "text-violet-600" : "text-slate-400")} size={14} />
                                  <span className="text-[13px] font-medium truncate flex-1">
                                    {assignment.title || assignment.name}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    );
                  })()}
                </div>
              );
            })
          )}


          {(() => {
            const finalAssessment = (course as any)?.final_assessment || (course as any)?.finalAssessment || (course as any)?.final_assignment ||
              ((course as any)?.final_assessment_id
                ? ((course as any)?.assignments?.find((a: any) => String(a.id) === String((course as any).final_assessment_id)) || { id: (course as any).final_assessment_id, title: `Assignment ${(course as any).final_assessment_id}` })
                : null);
            if (!finalAssessment) return null;
            const assignment = { id: finalAssessment.id, title: finalAssessment.title || finalAssessment.name };
            const isAssignmentActive = activeItem?.type === "assignment" && String(activeItem.id) === String(assignment.id);
            return (
              <div 
                key={`course-final-assessment-${assignment.id}`}
                onClick={() => setActiveItem({ type: "assignment", id: assignment.id, data: assignment, isFinal: true })}
                className={cn(
                  "group/module rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-all duration-150 border mt-2",
                  isAssignmentActive 
                    ? 'bg-white border-indigo-200 border-l-4 border-l-indigo-600 text-indigo-700 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)] pl-2' 
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/5 text-slate-800 font-semibold shadow-xs hover:translate-x-0.5'
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                  <Award className={cn("shrink-0", isAssignmentActive ? "text-indigo-650" : "text-indigo-500")} size={15} />
                  <span className={cn("text-[11px] font-bold truncate uppercase tracking-wider", isAssignmentActive ? "text-indigo-700" : "text-slate-700")}>
                    {assignment.title || "Final Assessment"}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </aside>
  );
}


