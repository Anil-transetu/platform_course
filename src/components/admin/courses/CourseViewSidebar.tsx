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
  ClipboardList 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseViewSidebarProps {
  course: any;
  activeItem: any;
  setActiveItem: (item: any) => void;
}

export default function CourseViewSidebar({ course, activeItem, setActiveItem }: CourseViewSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

  // Auto-expand module and lesson on active change
  useEffect(() => {
    if (activeItem) {
      if (activeItem.type === "module") {
        setExpandedModules(prev => ({ ...prev, [activeItem.id]: true }));
      } else if (activeItem.type === "lesson") {
        // Find module ID
        const mod = course.modules?.find((m: any) => 
          m.lessons?.some((l: any) => String(l.id) === String(activeItem.id))
        );
        if (mod) {
          setExpandedModules(prev => ({ ...prev, [mod.id]: true }));
          setExpandedLessons(prev => ({ ...prev, [activeItem.id]: true }));
        }
      } else if (activeItem.type === "topic" || activeItem.type === "quiz" || activeItem.type === "assignment") {
        // Find lesson & module
        let foundLessonId: string | null = null;
        let foundModuleId: string | null = null;

        for (const mod of course.modules || []) {
          // Check module-level quiz/assignment
          const hasModQuiz = mod.quizzes?.some((q: any) => String(q.id) === String(activeItem.id));
          const hasModAss = mod.assignments?.some((a: any) => String(a.id) === String(activeItem.id));
          if (hasModQuiz || hasModAss) {
            foundModuleId = mod.id;
            break;
          }

          for (const les of mod.lessons || []) {
            const hasTopic = les.topics?.some((t: any) => String(t.id) === String(activeItem.id));
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
          setExpandedModules(prev => ({ ...prev, [foundModuleId!]: true }));
        }
        if (foundLessonId) {
          setExpandedLessons(prev => ({ ...prev, [foundLessonId!]: true }));
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
  const hasCourseContent = (course.quizzes && course.quizzes.length > 0) || (course.assignments && course.assignments.length > 0);

  return (
    <aside className="w-[320px] bg-[#f5f8fc] border-r border-slate-200/80 p-6 flex flex-col gap-6 shadow-[2px_0_15px_rgba(0,0,0,0.015)] shrink-0 h-full overflow-hidden text-slate-700">
      {/* Course Title Selector */}
      <div 
        onClick={() => setActiveItem({ type: "course", id: course.id, data: course })}
        className={cn(
          "p-4 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-blue-50/10 hover:border-blue-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all group flex flex-col gap-1.5",
          (!activeItem || activeItem.type === "course") && "border-blue-500 bg-blue-50/5 ring-1 ring-blue-500/20"
        )}
      >
        <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest leading-none font-sans">Course Overview</span>
        <h3 className="font-extrabold text-sm text-slate-800 truncate leading-tight group-hover:text-blue-600 transition-colors">
          {course.name}
        </h3>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Course Outline
        </h3>
        
        <div className="flex-grow overflow-y-auto pr-1 -mr-2 flex flex-col gap-3 no-scrollbar">
          {modules.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No modules added yet.</div>
          ) : (
            modules.map((module: any, mIdx: number) => {
              const isModuleActive = activeItem?.type === "module" && String(activeItem.id) === String(module.id);
              const isExpanded = !!expandedModules[module.id];
              
              return (
                <div key={`module-${module.id}`} className="flex flex-col gap-1 mb-1">
                  <div 
                    onClick={() => setActiveItem({ type: "module", id: module.id, data: module })}
                    className={cn(
                      "group/module rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all border",
                      isModuleActive 
                        ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20' 
                        : 'bg-white border-slate-200/85 hover:border-blue-200 hover:bg-blue-50/5 text-slate-850 font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.015)]'
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <button
                        onClick={(e) => toggleModuleExpand(module.id, e)}
                        className={cn(
                          "p-1 rounded-md transition-colors",
                          isModuleActive
                            ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                            : 'hover:bg-slate-100 text-slate-450 hover:text-slate-700'
                        )}
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        {isExpanded ? (
                          <FolderOpen className={isModuleActive ? "text-white" : "text-blue-600"} size={16} />
                        ) : (
                          <Folder className={isModuleActive ? "text-white" : "text-blue-600"} size={16} />
                        )}
                        <span className={cn(
                          "text-[11px] font-extrabold truncate uppercase tracking-wider",
                          isModuleActive ? "text-white" : "text-slate-800"
                        )}>
                          {module.name || `MODULE ${mIdx + 1}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mixed Content inside Module (Expanded) */}
                  {isExpanded && (() => {
                    const order = module.order || [];
                    const items = order.length > 0 ? order : [
                      ...(module.topics || []).map((l: any) => ({ id: l.id, type: 'lesson' as const })),
                      ...(module.quizzes || []).map((q: any) => ({ id: q.id, type: 'quiz' as const })),
                      ...(module.assignments || []).map((a: any) => ({ id: a.id, type: 'assignment' as const }))
                    ];

                    return (
                      <div className="flex flex-col pl-4 ml-3 border-l border-slate-200/80 gap-1.5">
                        {items.map((item: any) => {
                          if (item.type === 'lesson' || item.type === 'topic') {
                            const lesson = (module.topics || module.lessons || []).find((l: any) => String(l.id) === String(item.id));
                            if (!lesson) return null;
                            const lIdx = (module.topics || module.lessons || []).indexOf(lesson);
                            const isLessonActive = activeItem?.type === "lesson" && String(activeItem.id) === String(lesson.id);
                            const isLessonExpanded = !!expandedLessons[lesson.id];

                            return (
                              <div key={`lesson-${lesson.id}`} className="flex flex-col gap-1.5">
                                <div 
                                  onClick={() => setActiveItem({ type: "lesson", id: lesson.id, data: lesson })}
                                  className={cn(
                                    "group/lesson rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border",
                                    isLessonActive
                                      ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20' 
                                      : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-700 hover:text-slate-900'
                                  )}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                                    <button
                                      onClick={(e) => toggleLessonExpand(lesson.id, e)}
                                      className={cn(
                                        "p-0.5 rounded-md transition-colors",
                                        isLessonActive
                                          ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                          : 'hover:bg-slate-250 text-slate-400 hover:text-slate-700'
                                      )}
                                    >
                                      {isLessonExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    </button>

                                    {isLessonExpanded ? (
                                      <BookOpen className={isLessonActive ? "text-white" : "text-blue-500"} size={15} />
                                    ) : (
                                      <Book className={isLessonActive ? "text-white" : "text-blue-500"} size={15} />
                                    )}
                                    <span className="text-xs font-semibold truncate flex-1">
                                      {lesson.name || lesson.title || `Lesson ${lIdx + 1}`}
                                    </span>
                                  </div>
                                </div>

                                {/* Children of Lesson (Expanded) */}
                                {isLessonExpanded && (() => {
                                  const lessonOrder = lesson.order || [];
                                  const lessonItems = lessonOrder.length > 0 ? lessonOrder : [
                                    ...(lesson.lessons || lesson.topics || []).map((t: any) => ({ id: t.id, type: 'topic' as const })),
                                    ...(lesson.quizzes || []).map((q: any) => ({ id: q.id, type: 'quiz' as const })),
                                    ...(lesson.assignments || []).map((a: any) => ({ id: a.id, type: 'assignment' as const }))
                                  ];
                                  
                                  return (
                                    <div className="flex flex-col pl-4 mt-0.5 border-l border-slate-200 gap-1 ml-4.5">
                                      {lessonItems.map((lItem: any) => {
                                        if (lItem.type === 'topic' || lItem.type === 'lesson') {
                                          const topic = (lesson.lessons || lesson.topics || []).find((t: any) => String(t.id) === String(lItem.id));
                                          if (!topic) return null;
                                          const tIdx = (lesson.lessons || lesson.topics || []).indexOf(topic);
                                          const isTopicActive = activeItem?.type === "topic" && String(activeItem.id) === String(topic.id);
                                          return (
                                            <div 
                                              key={`topic-${topic.id}`}
                                              onClick={() => setActiveItem({ type: "topic", id: topic.id, data: topic })}
                                              className={cn(
                                                "group/item rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border",
                                                isTopicActive 
                                                  ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-xs' 
                                                  : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-655 hover:text-slate-900'
                                              )}
                                            >
                                              <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                <Target className={isTopicActive ? "text-white" : "text-slate-400"} size={14} />
                                                <span className="text-xs font-medium truncate flex-1">
                                                  {topic.name || topic.title || `Topic ${tIdx + 1}`}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        }
                                        
                                        if (lItem.type === 'quiz') {
                                          const quiz = (lesson.quizzes || []).find((q: any) => String(q.id) === String(lItem.id));
                                          if (!quiz) return null;
                                          const qIdx = (lesson.quizzes || []).indexOf(quiz);
                                          const isQuizActive = activeItem?.type === "quiz" && String(activeItem.id) === String(quiz.id);
                                          return (
                                            <div 
                                              key={`quiz-${quiz.id}`}
                                              onClick={() => setActiveItem({ type: "quiz", id: quiz.id, data: quiz })}
                                              className={cn(
                                                "group/item rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border",
                                                isQuizActive 
                                                  ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-xs' 
                                                  : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-655 hover:text-slate-900'
                                              )}
                                            >
                                              <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                <GraduationCap className={isQuizActive ? "text-white" : "text-slate-400"} size={14} />
                                                <span className="text-xs font-medium truncate flex-1">
                                                  {quiz.name || quiz.title || quiz.quiz_title || `Quiz ${qIdx + 1}`}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        }

                                        if (lItem.type === 'assignment') {
                                          const assignment = (lesson.assignments || []).find((a: any) => String(a.id) === String(lItem.id));
                                          if (!assignment) return null;
                                          const aIdx = (lesson.assignments || []).indexOf(assignment);
                                          const isAssignmentActive = activeItem?.type === "assignment" && String(activeItem.id) === String(assignment.id);
                                          return (
                                            <div 
                                              key={`assignment-${assignment.id}`}
                                              onClick={() => setActiveItem({ type: "assignment", id: assignment.id, data: assignment })}
                                              className={cn(
                                                "group/item rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border",
                                                isAssignmentActive 
                                                  ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-xs' 
                                                  : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-655 hover:text-slate-900'
                                              )}
                                            >
                                              <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                <ClipboardList className={isAssignmentActive ? "text-white" : "text-slate-400"} size={14} />
                                                <span className="text-xs font-medium truncate flex-1">
                                                  {assignment.title || assignment.name || `Assignment ${aIdx + 1}`}
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
                            const qIdx = (module.quizzes || []).indexOf(quiz);
                            const isQuizActive = activeItem?.type === "quiz" && String(activeItem.id) === String(quiz.id);
                            return (
                              <div 
                                key={`quiz-${quiz.id}`}
                                onClick={() => setActiveItem({ type: "quiz", id: quiz.id, data: quiz })}
                                className={cn(
                                  "group/item rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border",
                                  isQuizActive 
                                    ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-xs' 
                                    : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-655 hover:text-slate-900'
                                )}
                              >
                                <div className="flex items-center gap-2 overflow-hidden flex-1 pl-5">
                                  <GraduationCap className={isQuizActive ? "text-white" : "text-slate-400"} size={14} />
                                  <span className="text-xs font-semibold truncate flex-1">
                                    {quiz.name || quiz.title || quiz.quiz_title || `Quiz ${qIdx + 1}`}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === 'assignment') {
                            const assignment = (module.assignments || []).find((a: any) => String(a.id) === String(item.id));
                            if (!assignment) return null;
                            const aIdx = (module.assignments || []).indexOf(assignment);
                            const isAssignmentActive = activeItem?.type === "assignment" && String(activeItem.id) === String(assignment.id);
                            return (
                              <div 
                                key={`assignment-${assignment.id}`}
                                onClick={() => setActiveItem({ type: "assignment", id: assignment.id, data: assignment })}
                                className={cn(
                                  "group/item rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border",
                                  isAssignmentActive 
                                    ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-xs' 
                                    : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-655 hover:text-slate-900'
                                )}
                              >
                                <div className="flex items-center gap-2 overflow-hidden flex-1 pl-5">
                                  <ClipboardList className={isAssignmentActive ? "text-white" : "text-slate-400"} size={14} />
                                  <span className="text-xs font-semibold truncate flex-1">
                                    {assignment.title || assignment.name || `Assignment ${aIdx + 1}`}
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

          {/* FINAL ASSESSMENT (Course-level assignment) */}
          {course.assignments && course.assignments.length > 0 && (() => {
            const assignment = course.assignments[0];
            const isAssignmentActive = activeItem?.type === "assignment" && String(activeItem.id) === String(assignment.id);
            return (
              <div 
                key={`course-assignment-${assignment.id}`}
                onClick={() => setActiveItem({ type: "assignment", id: assignment.id, data: assignment })}
                className={cn(
                  "group/module rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all border mt-2",
                  isAssignmentActive 
                    ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20' 
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/5 text-slate-850 font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.015)]'
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                  <ClipboardList className={isAssignmentActive ? "text-white" : "text-blue-600"} size={16} />
                  <span className={cn(
                    "text-[11px] font-extrabold truncate uppercase tracking-wider",
                    isAssignmentActive ? "text-white" : "text-slate-800"
                  )}>
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
