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
}

export default function CourseViewSidebar({ course, activeItem, setActiveItem }: CourseViewSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

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
        const isCourseAssignment = (course.assignments || []).some((a: any) => String(a.id) === String(activeItem.id));
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
        {course.thumbnail_url && (
          <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0">
            <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover" />
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
                <div key={`module-${module.id}`} className="flex flex-col gap-0.5">
                  <div 
                    onClick={() => setActiveItem({ type: "module", id: module.id, data: module })}
                    className={cn(
                      "group/module rounded-xl px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors",
                      isModuleActive 
                        ? 'bg-blue-50 text-blue-700 font-semibold' 
                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <button
                        onClick={(e) => toggleModuleExpand(module.id, e)}
                        className="p-0.5 rounded-md text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <Folder className={cn("shrink-0", isModuleActive ? "text-blue-600" : "text-slate-400")} size={16} />
                        <span className="text-sm truncate">
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
                      <div className="flex flex-col pl-4 ml-5 border-l border-slate-100 gap-0.5 mt-0.5">
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
                                    "group/lesson rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-colors relative",
                                    isLessonActive
                                      ? 'bg-blue-50 text-blue-700 font-semibold' 
                                      : 'hover:bg-slate-50 text-slate-600 font-medium'
                                  )}
                                >
                                  {isLessonActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r-md" />}
                                  <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                                    <button
                                      onClick={(e) => toggleLessonExpand(lesson.id, e)}
                                      className="p-0.5 rounded-md text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                                    >
                                      {isLessonExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                      {isLessonExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>
                                    <BookOpen className={cn("shrink-0", isLessonActive ? "text-blue-600" : "text-slate-400")} size={15} />
                                    <span className="text-[13px] truncate flex-1">
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
                                    <div className="flex flex-col pl-4 ml-6 border-l border-slate-100 gap-0.5">
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
                                                "group/item rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors relative",
                                                isTopicActive 
                                                  ? 'text-blue-700 font-semibold bg-blue-50/50' 
                                                  : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-medium'
                                              )}
                                            >
                                              {isTopicActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-600 rounded-r-md" />}
                                              <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-2">
                                                <PlayCircle className={cn("shrink-0", isTopicActive ? "text-blue-600" : "text-slate-400")} size={14} />
                                                <span className="text-[13px] truncate flex-1">
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
                                                "group/item rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors relative",
                                                isQuizActive 
                                                  ? 'text-blue-700 font-semibold bg-blue-50/50' 
                                                  : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-medium'
                                              )}
                                            >
                                              {isQuizActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-600 rounded-r-md" />}
                                              <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-2">
                                                <GraduationCap className={cn("shrink-0", isQuizActive ? "text-blue-600" : "text-slate-400")} size={14} />
                                                <span className="text-[13px] truncate flex-1">
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
                                                "group/item rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors relative",
                                                isAssignmentActive 
                                                  ? 'text-blue-700 font-semibold bg-blue-50/50' 
                                                  : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-medium'
                                              )}
                                            >
                                              {isAssignmentActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-600 rounded-r-md" />}
                                              <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-2">
                                                <FileText className={cn("shrink-0", isAssignmentActive ? "text-blue-600" : "text-slate-400")} size={14} />
                                                <span className="text-[13px] truncate flex-1">
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
                                  "group/item rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-colors relative",
                                  isQuizActive 
                                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                                    : 'hover:bg-slate-50 text-slate-600 font-medium'
                                )}
                              >
                                {isQuizActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r-md" />}
                                <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-3">
                                  <GraduationCap className={cn("shrink-0", isQuizActive ? "text-blue-600" : "text-slate-400")} size={15} />
                                  <span className="text-[13px] truncate flex-1">
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
                                  "group/item rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-colors relative",
                                  isAssignmentActive 
                                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                                    : 'hover:bg-slate-50 text-slate-600 font-medium'
                                )}
                              >
                                {isAssignmentActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r-md" />}
                                <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-3">
                                  <FileText className={cn("shrink-0", isAssignmentActive ? "text-blue-600" : "text-slate-400")} size={15} />
                                  <span className="text-[13px] truncate flex-1">
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

          {/* FINAL ASSESSMENT (as last item in the list) */}
          {course.quizzes && course.quizzes.length > 0 ? (
            course.quizzes.map((quiz: any) => {
              const isQuizActive = activeItem?.type === "quiz" && String(activeItem.id) === String(quiz.id);
              return (
                <div 
                  key={`course-quiz-${quiz.id}`}
                  onClick={() => setActiveItem({ type: "quiz", id: quiz.id, data: quiz })}
                  className={cn(
                    "group/module rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-all border mt-2",
                    isQuizActive 
                      ? 'bg-green-50 text-green-700 font-semibold border-green-200' 
                      : 'bg-white border-slate-200 hover:border-green-200 hover:bg-green-50/50 text-slate-800 font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                    <GraduationCap className={cn("shrink-0", isQuizActive ? "text-green-600" : "text-green-500")} size={16} />
                    <span className={cn("text-[11px] font-bold truncate uppercase tracking-wider", isQuizActive ? "text-green-700" : "text-slate-800")}>
                      {quiz.name || quiz.title || "Course Quiz"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : null}

          {course.assignments && course.assignments.length > 0 ? (
            (() => {
              const assignment = course.assignments[0];
              const isAssignmentActive = activeItem?.type === "assignment" && String(activeItem.id) === String(assignment.id);
              return (
                <div 
                  key={`course-assignment-${assignment.id}`}
                  onClick={() => setActiveItem({ type: "assignment", id: assignment.id, data: assignment, isFinal: true })}
                  className={cn(
                    "group/module rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-all border mt-2",
                    isAssignmentActive 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border-indigo-200' 
                      : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-800 font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                    <Award className={cn("shrink-0", isAssignmentActive ? "text-indigo-600" : "text-indigo-500")} size={16} />
                    <span className={cn("text-[11px] font-bold truncate uppercase tracking-wider", isAssignmentActive ? "text-indigo-700" : "text-slate-800")}>
                      {assignment.title || "Final Assessment"}
                    </span>
                  </div>
                </div>
              );
            })()
          ) : null}
        </div>
      </div>
    </aside>
  );
}


