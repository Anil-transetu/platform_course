"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderPlus, 
  FileText, 
  Target, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  ClipboardList, 
  ChevronUp, 
  Trash2,
  Folder,
  FolderOpen,
  Book,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { useCourseStore } from "@/store/useCourseStore";
import { useRouter, usePathname } from "next/navigation";

export default function CourseSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    course, 
    activeModuleId, 
    activeLessonId, 
    activeTopicId,
    activeQuizId,
    activeAssignmentId,
    setActiveModule,
    setActiveLesson,
    setActiveTopic,
    setActiveQuiz,
    setActiveAssignment,
    addModule,
    addLesson,
    addTopic,
    addQuiz,
    addAssignment,
    addCourseQuiz,
    addCourseAssignment,
    deleteModule,
    deleteLesson,
    deleteTopic,
    deleteQuiz,
    deleteAssignment,
    deleteCourseQuiz,
    deleteCourseAssignment,
    moveLessonItem,
    moveModuleItem
  } = useCourseStore();

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

  // Auto-expand module and lesson on active change
  useEffect(() => {
    if (activeModuleId) {
      setExpandedModules(prev => ({ ...prev, [activeModuleId]: true }));
    }
  }, [activeModuleId]);

  useEffect(() => {
    if (activeLessonId) {
      setExpandedLessons(prev => ({ ...prev, [activeLessonId]: true }));
    }
  }, [activeLessonId]);

  const handleModuleClick = (id: string) => {
    setActiveModule(id);
    if (pathname !== '/admin/courses/create/module') {
      router.push('/admin/courses/create/module');
    }
  };

  const handleLessonClick = (moduleId: string, lessonId: string) => {
    setActiveModule(moduleId);
    setActiveLesson(lessonId);
    if (pathname !== '/admin/courses/create/lesson') {
      router.push('/admin/courses/create/lesson');
    }
  };

  const handleTopicClick = (moduleId: string, lessonId: string, topicId: string) => {
    setActiveModule(moduleId);
    setActiveLesson(lessonId);
    setActiveTopic(topicId);
    if (pathname !== '/admin/courses/create/topic') {
      router.push('/admin/courses/create/topic');
    }
  };

  const handleQuizClick = (moduleId: string, lessonId: string | undefined | null, quizId: string) => {
    setActiveModule(moduleId);
    if (lessonId) {
      setActiveLesson(lessonId);
    } else {
      setActiveLesson(null);
    }
    setActiveQuiz(quizId);
    if (pathname !== '/admin/courses/create/quiz') {
      router.push('/admin/courses/create/quiz');
    }
  };

  const handleAssignmentClick = (moduleId: string, lessonId: string | undefined | null, assignmentId: string) => {
    setActiveModule(moduleId);
    if (lessonId) {
      setActiveLesson(lessonId);
    } else {
      setActiveLesson(null);
    }
    setActiveAssignment(assignmentId);
    if (pathname !== '/admin/courses/create/assignment') {
      router.push('/admin/courses/create/assignment');
    }
  };

  const handleCourseQuizClick = (quizId: string) => {
    setActiveModule(null);
    setActiveLesson(null);
    setActiveQuiz(quizId);
    if (pathname !== '/admin/courses/create/quiz') {
      router.push('/admin/courses/create/quiz');
    }
  };

  const handleCourseAssignmentClick = (assignmentId: string) => {
    setActiveModule(null);
    setActiveLesson(null);
    setActiveAssignment(assignmentId);
    if (pathname !== '/admin/courses/create/assignment') {
      router.push('/admin/courses/create/assignment');
    }
  };

  const handleAddModule = () => {
    addModule();
    router.push('/admin/courses/create/module');
  };

  const handleAddLesson = () => {
    if (activeModuleId) {
      addLesson(activeModuleId);
      router.push('/admin/courses/create/lesson');
    } else {
      alert("Please select a module first.");
    }
  };

  const handleAddTopic = () => {
    if (activeModuleId && activeLessonId) {
      addTopic(activeModuleId, activeLessonId);
      router.push('/admin/courses/create/topic');
    } else {
      alert("Please select a lesson first.");
    }
  };

  const handleAddQuiz = () => {
    if (activeModuleId && activeLessonId) {
      addQuiz(activeModuleId, activeLessonId);
      router.push('/admin/courses/create/quiz');
    } else if (activeModuleId) {
      addQuiz(activeModuleId);
      router.push('/admin/courses/create/quiz');
    } else {
      addCourseQuiz();
      router.push('/admin/courses/create/quiz');
    }
  };

  const handleAddAssignment = () => {
    if (activeModuleId && activeLessonId) {
      addAssignment(activeModuleId, activeLessonId);
      router.push('/admin/courses/create/assignment');
    } else if (activeModuleId) {
      addAssignment(activeModuleId);
      router.push('/admin/courses/create/assignment');
    } else {
      addCourseAssignment();
      router.push('/admin/courses/create/assignment');
    }
  };

  const hasCourseContent = (course.quizzes && course.quizzes.length > 0) || (course.assignments && course.assignments.length > 0);

  const toggleModuleExpand = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleLessonExpand = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  return (
    <div className="w-[320px] bg-[#f5f8fc] border-r border-slate-200/80 p-6 flex flex-col gap-8 shadow-[2px_0_15px_rgba(0,0,0,0.015)] shrink-0 h-full text-slate-700">
      {/* 1. CURRICULUM HIERARCHY */}
      <div className="flex-1 flex flex-col gap-5 overflow-hidden">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Course Curriculum
        </h3>
        
        <div className="flex-1 overflow-y-auto pr-1 -mr-2 flex flex-col gap-3 no-scrollbar">

          {course.modules.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No modules added yet.</div>
          ) : (
            course.modules.map((module, mIdx) => {
              const isModuleActive = activeModuleId === module.id;
              const isExpanded = !!expandedModules[module.id];
              
              return (
                <div key={`module-${module.id}`} className="flex flex-col gap-1 mb-1">
                  <div 
                    onClick={() => handleModuleClick(module.id)}
                    className={`group/module rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all border ${
                      isModuleActive && !activeLessonId 
                        ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20' 
                        : 'bg-white border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/5 text-slate-800 font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      {/* Expand Arrow */}
                      <button
                        onClick={(e) => toggleModuleExpand(module.id, e)}
                        className={`p-1 rounded-md transition-colors ${
                          isModuleActive && !activeLessonId
                            ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                            : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        {isExpanded ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>

                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        {isExpanded ? (
                          <FolderOpen className={isModuleActive && !activeLessonId ? "text-white" : "text-blue-600"} size={16} />
                        ) : (
                          <Folder className={isModuleActive && !activeLessonId ? "text-white" : "text-blue-600"} size={16} />
                        )}
                        <span className={`text-[11px] font-bold truncate uppercase tracking-wider ${isModuleActive && !activeLessonId ? "text-white" : "text-slate-800"}`}>
                          {module.title || `MODULE ${mIdx + 1}`}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const wasActive = activeModuleId === module.id;
                        const remaining = course.modules.filter(m => m.id !== module.id);
                        deleteModule(module.id);
                        if (wasActive) {
                          if (remaining.length > 0) {
                            router.push('/admin/courses/create/module');
                          } else {
                            router.push('/admin/courses/create');
                          }
                        }
                      }}
                      className={`p-1 rounded-md transition-opacity opacity-0 group-hover/module:opacity-100 ${
                        isModuleActive && !activeLessonId
                          ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                          : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Mixed Content inside Module (Expanded) */}
                  {isExpanded && (() => {
                    const order = module.order || [];
                    const items = order.length > 0 ? order : [
                      ...(module.lessons || []).map(l => ({ id: l.id, type: 'lesson' as const })),
                      ...(module.quizzes || []).map(q => ({ id: q.id, type: 'quiz' as const })),
                      ...(module.assignments || []).map(a => ({ id: a.id, type: 'assignment' as const }))
                    ];

                    return (
                      <div className="flex flex-col pl-5 ml-4 border-l-2 border-slate-200 gap-1.5">
                        {items.map((item, itemIdx) => {
                          if (item.type === 'lesson') {
                            const lesson = module.lessons.find(l => l.id === item.id);
                            if (!lesson) return null;
                            const lIdx = module.lessons.indexOf(lesson);
                            const isLessonActive = activeLessonId === lesson.id;
                            const isLessonExpanded = !!expandedLessons[lesson.id];

                            return (
                              <div key={`lesson-${lesson.id}`} className="flex flex-col gap-1.5">
                                <div 
                                  onClick={() => handleLessonClick(module.id, lesson.id)}
                                  className={`group/lesson rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border ${
                                    isLessonActive && !activeTopicId && !activeQuizId && !activeAssignmentId 
                                      ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20' 
                                      : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-700 hover:text-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                                    {/* Lesson Expand Toggle */}
                                    <button
                                      onClick={(e) => toggleLessonExpand(lesson.id, e)}
                                      className={`p-0.5 rounded-md transition-colors ${
                                        isLessonActive
                                          ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                          : 'hover:bg-slate-250 text-slate-400 hover:text-slate-700'
                                      }`}
                                    >
                                      {isLessonExpanded ? (
                                        <ChevronDown size={12} />
                                      ) : (
                                        <ChevronRight size={12} />
                                      )}
                                    </button>

                                    {isLessonExpanded ? (
                                      <BookOpen className={isLessonActive && !activeTopicId && !activeQuizId && !activeAssignmentId ? "text-white" : "text-blue-500"} size={15} />
                                    ) : (
                                      <Book className={isLessonActive && !activeTopicId && !activeQuizId && !activeAssignmentId ? "text-white" : "text-blue-500"} size={15} />
                                    )}
                                    <span className="text-xs font-semibold truncate flex-1">
                                      {lesson.title || `Lesson ${lIdx + 1}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); moveModuleItem(module.id, lesson.id, 'up'); }}
                                      disabled={itemIdx === 0}
                                      className={`p-0.5 disabled:opacity-20 ${isLessonActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                    >
                                      <ChevronUp size={12} />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); moveModuleItem(module.id, lesson.id, 'down'); }}
                                      disabled={itemIdx === items.length - 1}
                                      className={`p-0.5 disabled:opacity-20 ${isLessonActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                    >
                                      <ChevronDown size={12} />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteLesson(module.id, lesson.id);
                                        if (activeLessonId === lesson.id) {
                                          router.push('/admin/courses/create/module');
                                        }
                                      }}
                                      className={`p-0.5 ${isLessonActive ? 'hover:text-white text-white/70' : 'hover:text-rose-600 text-slate-400'}`}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* Children of Lesson (Expanded) */}
                                {isLessonExpanded && (() => {
                                  const lessonOrder = lesson.order || [];
                                  const lessonItems = lessonOrder.length > 0 ? lessonOrder : [
                                    ...(lesson.topics || []).map(t => ({ id: t.id, type: 'topic' as const })),
                                    ...(lesson.quizzes || []).map(q => ({ id: q.id, type: 'quiz' as const })),
                                    ...(lesson.assignments || []).map(a => ({ id: a.id, type: 'assignment' as const }))
                                  ];
                                  
                                  return (
                                    <div className="flex flex-col pl-6 mt-1 border-l-2 border-indigo-100 gap-1.5 ml-[22px]">
                                      {lessonItems.map((lItem, lItemIdx) => {
                                        if (lItem.type === 'topic') {
                                          const topic = lesson.topics.find(t => t.id === lItem.id);
                                          if (!topic) return null;
                                          const tIdx = lesson.topics.indexOf(topic);
                                          const isTopicActive = activeTopicId === topic.id;
                                          return (
                                            <div 
                                              key={`topic-${topic.id}`}
                                              onClick={() => handleTopicClick(module.id, lesson.id, topic.id)}
                                              className={`group/item rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border ${
                                                isTopicActive 
                                                  ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-xs' 
                                                  : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-600 hover:text-slate-900'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                <Target className={isTopicActive ? "text-white" : "text-slate-400"} size={14} />
                                                <span className="text-xs font-medium truncate flex-1">
                                                  {topic.title || `Topic ${tIdx + 1}`}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); moveLessonItem(module.id, lesson.id, topic.id, 'up'); }}
                                                  disabled={lItemIdx === 0}
                                                  className={`p-0.5 disabled:opacity-20 ${isTopicActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                                >
                                                  <ChevronUp size={12} />
                                                </button>
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); moveLessonItem(module.id, lesson.id, topic.id, 'down'); }}
                                                  disabled={lItemIdx === lessonItems.length - 1}
                                                  className={`p-0.5 disabled:opacity-20 ${isTopicActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                                >
                                                  <ChevronDown size={12} />
                                                </button>
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteTopic(module.id, lesson.id, topic.id);
                                                    if (activeTopicId === topic.id) {
                                                      router.push('/admin/courses/create/lesson');
                                                    }
                                                  }}
                                                  className={`p-0.5 ${isTopicActive ? 'hover:text-white text-white/70' : 'hover:text-rose-600 text-slate-400'}`}
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        }
                                        
                                        if (lItem.type === 'quiz') {
                                          const quiz = lesson.quizzes.find(q => q.id === lItem.id);
                                          if (!quiz) return null;
                                          const qIdx = lesson.quizzes.indexOf(quiz);
                                          const isQuizActive = activeQuizId === quiz.id;
                                          return (
                                            <div 
                                              key={`quiz-${quiz.id}`}
                                              onClick={() => handleQuizClick(module.id, lesson.id, quiz.id)}
                                              className={`group/item rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border ${
                                                isQuizActive 
                                                  ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-xs' 
                                                  : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-600 hover:text-slate-900'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                <GraduationCap className={isQuizActive ? "text-white" : "text-slate-400"} size={14} />
                                                <span className="text-xs font-medium truncate flex-1">
                                                  {quiz.title || `Quiz ${qIdx + 1}`}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); moveLessonItem(module.id, lesson.id, quiz.id, 'up'); }}
                                                  disabled={lItemIdx === 0}
                                                  className={`p-0.5 disabled:opacity-20 ${isQuizActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                                >
                                                  <ChevronUp size={12} />
                                                </button>
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); moveLessonItem(module.id, lesson.id, quiz.id, 'down'); }}
                                                  disabled={lItemIdx === lessonItems.length - 1}
                                                  className={`p-0.5 disabled:opacity-20 ${isQuizActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                                >
                                                  <ChevronDown size={12} />
                                                </button>
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteQuiz(module.id, lesson.id, quiz.id);
                                                    if (activeQuizId === quiz.id) {
                                                      router.push('/admin/courses/create/lesson');
                                                    }
                                                  }}
                                                  className={`p-0.5 ${isQuizActive ? 'hover:text-white text-white/70' : 'hover:text-rose-600 text-slate-400'}`}
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        }
                                        
                                        if (lItem.type === 'assignment') {
                                          const assignment = lesson.assignments.find(a => a.id === lItem.id);
                                          if (!assignment) return null;
                                          const aIdx = lesson.assignments.indexOf(assignment);
                                          const isAssignmentActive = activeAssignmentId === assignment.id;
                                          return (
                                            <div 
                                              key={`assignment-${assignment.id}`}
                                              onClick={() => handleAssignmentClick(module.id, lesson.id, assignment.id)}
                                              className={`group/item rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border ${
                                                isAssignmentActive 
                                                  ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-xs' 
                                                  : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-600 hover:text-slate-900'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                <ClipboardList className={isAssignmentActive ? "text-white" : "text-slate-400"} size={14} />
                                                <span className="text-xs font-medium truncate flex-1">
                                                  {assignment.title || `Assignment ${aIdx + 1}`}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); moveLessonItem(module.id, lesson.id, assignment.id, 'up'); }}
                                                  disabled={lItemIdx === 0}
                                                  className={`p-0.5 disabled:opacity-20 ${isAssignmentActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                                >
                                                  <ChevronUp size={12} />
                                                </button>
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); moveLessonItem(module.id, lesson.id, assignment.id, 'down'); }}
                                                  disabled={lItemIdx === lessonItems.length - 1}
                                                  className={`p-0.5 disabled:opacity-20 ${isAssignmentActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                                >
                                                  <ChevronDown size={12} />
                                                </button>
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteAssignment(module.id, lesson.id, assignment.id);
                                                    if (activeAssignmentId === assignment.id) {
                                                      router.push('/admin/courses/create/lesson');
                                                    }
                                                  }}
                                                  className={`p-0.5 ${isAssignmentActive ? 'hover:text-white text-white/70' : 'hover:text-rose-600 text-slate-400'}`}
                                                >
                                                  <Trash2 size={12} />
                                                </button>
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
                            const quiz = (module.quizzes || []).find(q => q.id === item.id);
                            if (!quiz) return null;
                            const qIdx = (module.quizzes || []).indexOf(quiz);
                            const isQuizActive = activeQuizId === quiz.id;
                             return (
                               <div 
                                 key={`quiz-${quiz.id}`}
                                 onClick={() => handleQuizClick(module.id, undefined, quiz.id)}
                                 className={`group/item rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border ${
                                   isQuizActive 
                                     ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-xs' 
                                     : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-600 hover:text-slate-900'
                                 }`}
                               >
                                 <div className="flex items-center gap-2 overflow-hidden flex-1 pl-5">
                                   <GraduationCap className={isQuizActive ? "text-white" : "text-slate-400"} size={14} />
                                   <span className="text-xs font-semibold truncate flex-1">
                                     {quiz.title || `Module Quiz ${qIdx + 1}`}
                                   </span>
                                 </div>
                                 <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); moveModuleItem(module.id, quiz.id, 'up'); }}
                                     disabled={itemIdx === 0}
                                     className={`p-0.5 disabled:opacity-20 ${isQuizActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                   >
                                     <ChevronUp size={12} />
                                   </button>
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); moveModuleItem(module.id, quiz.id, 'down'); }}
                                     disabled={itemIdx === items.length - 1}
                                     className={`p-0.5 disabled:opacity-20 ${isQuizActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                   >
                                     <ChevronDown size={12} />
                                   </button>
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       deleteQuiz(module.id, undefined, quiz.id);
                                       if (activeQuizId === quiz.id) {
                                         router.push('/admin/courses/create/module');
                                       }
                                     }}
                                     className={`p-0.5 ${isQuizActive ? 'hover:text-white text-white/70' : 'hover:text-rose-600 text-slate-400'}`}
                                   >
                                     <Trash2 size={13} />
                                   </button>
                                 </div>
                               </div>
                            );
                          }

                          if (item.type === 'assignment') {
                            const assignment = (module.assignments || []).find(a => a.id === item.id);
                            if (!assignment) return null;
                            const aIdx = (module.assignments || []).indexOf(assignment);
                            const isAssignmentActive = activeAssignmentId === assignment.id;
                            return (
                              <div 
                                key={`assignment-${assignment.id}`}
                                onClick={() => handleAssignmentClick(module.id, undefined, assignment.id)}
                                className={`group/item rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border ${
                                  isAssignmentActive 
                                    ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-xs' 
                                    : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden flex-1 pl-5">
                                  <ClipboardList className={isAssignmentActive ? "text-white" : "text-slate-400"} size={14} />
                                  <span className="text-xs font-semibold truncate flex-1">
                                    {assignment.title || `Module Assignment ${aIdx + 1}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); moveModuleItem(module.id, assignment.id, 'up'); }}
                                    disabled={itemIdx === 0}
                                    className={`p-0.5 disabled:opacity-20 ${isAssignmentActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); moveModuleItem(module.id, assignment.id, 'down'); }}
                                    disabled={itemIdx === items.length - 1}
                                    className={`p-0.5 disabled:opacity-20 ${isAssignmentActive ? 'hover:text-white text-white/70' : 'hover:text-blue-600 text-slate-400'}`}
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteAssignment(module.id, undefined, assignment.id);
                                      if (activeAssignmentId === assignment.id) {
                                        router.push('/admin/courses/create/module');
                                      }
                                    }}
                                    className={`p-0.5 ${isAssignmentActive ? 'hover:text-white text-white/70' : 'hover:text-rose-600 text-slate-400'}`}
                                  >
                                    <Trash2 size={13} />
                                  </button>
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

          {/* COURSE-LEVEL QUIZZES */}
          {course.quizzes && course.quizzes.length > 0 ? (
            course.quizzes.map((quiz) => {
              const isQuizActive = activeQuizId === quiz.id;
              return (
                <div 
                  key={`course-quiz-${quiz.id}`}
                  onClick={() => handleCourseQuizClick(quiz.id)}
                  className={`group/module rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all border mt-2 ${
                    isQuizActive 
                      ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20' 
                      : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/5 text-slate-800 font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                    <GraduationCap className={isQuizActive ? "text-white" : "text-blue-600"} size={16} />
                    <span className={`text-[11px] font-bold truncate uppercase tracking-wider ${isQuizActive ? "text-white" : "text-slate-800"}`}>
                      {quiz.title || "Course Quiz"}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCourseQuiz(quiz.id);
                      if (activeQuizId === quiz.id) {
                        router.push('/admin/courses/create');
                      }
                    }}
                    className={`p-1 rounded-md transition-opacity opacity-0 group-hover/module:opacity-100 ${
                      isQuizActive
                        ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                        : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          ) : null}

          {/* COURSE-LEVEL ASSIGNMENTS */}
          {course.assignments && course.assignments.length > 0 ? (
            course.assignments.map((assignment) => {
              const isAssignmentActive = activeAssignmentId === assignment.id;
              return (
                <div 
                  key={`course-assignment-${assignment.id}`}
                  onClick={() => handleCourseAssignmentClick(assignment.id)}
                  className={`group/module rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all border mt-2 ${
                    isAssignmentActive 
                      ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20' 
                      : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/5 text-slate-800 font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                    <ClipboardList className={isAssignmentActive ? "text-white" : "text-blue-600"} size={16} />
                    <span className={`text-[11px] font-bold truncate uppercase tracking-wider ${isAssignmentActive ? "text-white" : "text-slate-800"}`}>
                      {assignment.title || "Final Assessment"}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCourseAssignment(assignment.id);
                      if (activeAssignmentId === assignment.id) {
                        router.push('/admin/courses/create');
                      }
                    }}
                    className={`p-1 rounded-md transition-opacity opacity-0 group-hover/module:opacity-100 ${
                      isAssignmentActive
                        ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                        : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          ) : null}

          {/* ADD NEW COURSE-LEVEL CONTENT */}
          {course.modules.length > 0 && (
            <>
              <button 
                onClick={() => {
                  addCourseQuiz();
                  router.push('/admin/courses/create/quiz');
                }}
                className="w-full flex items-center gap-3 border border-dashed border-blue-250 bg-blue-50/10 hover:bg-blue-50/20 px-4 py-3 rounded-xl hover:border-blue-300 transition-all text-left text-blue-600 mt-2"
              >
                <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                  <Plus size={14} strokeWidth={3} />
                </div>
                <span className="text-xs font-semibold">Add Course Quiz</span>
              </button>
              <button 
                onClick={() => {
                  addCourseAssignment();
                  router.push('/admin/courses/create/assignment');
                }}
                className="w-full flex items-center gap-3 border border-dashed border-blue-250 bg-blue-50/10 hover:bg-blue-50/20 px-4 py-3 rounded-xl hover:border-blue-300 transition-all text-left text-blue-600 mt-2"
              >
                <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                  <Plus size={14} strokeWidth={3} />
                </div>
                <span className="text-xs font-semibold">Add Course Assignment</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* 2. ADD CONTENT SECTION */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Add Content
        </h3>
        <div className="flex flex-col gap-3">
          {activeModuleId && activeLessonId && (
            <>
              <button 
                onClick={handleAddTopic}
                className="w-full flex items-center justify-between border border-slate-200 bg-white px-4 py-3.5 rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md text-left"
              >
                <div className="flex items-center gap-3">
                  <Target size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-800">Add Topic</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              
              <button 
                onClick={handleAddQuiz}
                className="w-full flex items-center justify-between border border-slate-200 bg-white px-4 py-3.5 rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-800">Add Lesson Quiz</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <button 
                onClick={handleAddAssignment}
                className="w-full flex items-center justify-between border border-slate-200 bg-white px-4 py-3.5 rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-800">Add Lesson Assignment</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <button 
                onClick={handleAddLesson}
                className="w-full flex items-center gap-3 border border-dashed border-blue-250 bg-blue-50/15 hover:bg-blue-50/30 px-4 py-3.5 rounded-xl hover:border-blue-300 transition-all text-left text-blue-600"
              >
                <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                  <Plus size={12} strokeWidth={3} />
                </div>
                <span className="text-sm font-semibold text-blue-600">Add Lesson</span>
              </button>
            </>
          )}

          {activeModuleId && !activeLessonId && (
            <>
              <button 
                onClick={handleAddQuiz}
                className="w-full flex items-center justify-between border border-slate-200 bg-white px-4 py-3.5 rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-800">Add Module Quiz</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <button 
                onClick={handleAddAssignment}
                className="w-full flex items-center justify-between border border-slate-200 bg-white px-4 py-3.5 rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-800">Add Module Assignment</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <button 
                onClick={handleAddLesson}
                className="w-full flex items-center gap-3 border border-dashed border-blue-250 bg-blue-50/15 hover:bg-blue-50/30 px-4 py-3.5 rounded-xl hover:border-blue-300 transition-all text-left text-blue-600"
              >
                <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                  <Plus size={12} strokeWidth={3} />
                </div>
                <span className="text-sm font-semibold text-blue-600">Add Lesson</span>
              </button>
            </>
          )}

        </div>
      </div>


      {/* FOOTER ADD MODULE BUTTON */}
      <div className="mt-auto pt-8">
        <button 
          onClick={handleAddModule}
          className="w-full flex items-center justify-center gap-2 bg-blue-100/60 text-blue-600 hover:bg-blue-200/85 hover:text-blue-700 py-3.5 rounded-xl transition-all font-bold text-sm shadow-sm"
        >
          <Plus size={16} /> Add Another Module
        </button>
      </div>

    </div>
  );
}
