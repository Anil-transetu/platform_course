"use client";

import React, { useState } from "react";
import { FolderPlus, FileText, Target, Plus, ChevronDown, Check, ClipboardList } from "lucide-react";
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
    addAssignment
  } = useCourseStore();

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

  const handleQuizClick = (moduleId: string, lessonId: string | null | undefined, quizId: string) => {
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

  const handleAssignmentClick = (moduleId: string, lessonId: string | null | undefined, assignmentId: string) => {
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
    if (activeModuleId) {
      addQuiz(activeModuleId, activeLessonId || undefined);
      router.push('/admin/courses/create/quiz');
    } else {
      alert("Please select a module first.");
    }
  };

  const handleAddAssignment = () => {
    if (activeModuleId) {
      addAssignment(activeModuleId, activeLessonId || undefined);
      router.push('/admin/courses/create/assignment');
    } else {
      alert("Please select a module first.");
    }
  };

  const getSidebarTitle = () => {
    if (activeTopicId) return "TOPIC STRUCTURE";
    if (activeQuizId) return "QUIZ STRUCTURE";
    if (activeAssignmentId) return "ASSIGNMENT STRUCTURE";
    if (activeLessonId) return "LESSON STRUCTURE";
    return "MODULE STRUCTURE";
  };

  return (
    <div className="w-80 flex flex-col gap-8 shrink-0 pb-10">
      
      {/* 1. STRUCTURE SECTION */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex justify-between items-center">
          {getSidebarTitle()}
        </h3>
        
        <div className="flex flex-col gap-1">
          {course.modules.length === 0 ? (
            <div className="text-xs text-gray-400 italic">No modules added yet.</div>
          ) : (
            course.modules.map((module, mIdx) => {
              const isModuleActive = activeModuleId === module.id;
              // If we are strictly following the contextual view, we could ONLY show the active module.
              // But to allow navigation, we show all, but style the active ones clearly.
              
              return (
                <div key={module.id} className="flex flex-col gap-1 mb-2">
                  <div 
                    onClick={() => handleModuleClick(module.id)}
                    className={`rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                      isModuleActive && !activeLessonId ? 'bg-card shadow-sm border-l-4 border-blue-600' : 'hover:bg-muted text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FolderPlus className={isModuleActive && !activeLessonId ? "text-blue-600" : "text-gray-400"} size={16} />
                      <span className={`text-sm font-bold truncate uppercase tracking-widest text-[11px] ${isModuleActive && !activeLessonId ? "text-foreground" : "text-gray-500"}`}>
                        {module.title || `MODULE ${mIdx + 1}`}
                      </span>
                    </div>
                  </div>

                  {/* Children of Module (Quizzes, Assignments) */}
                  {isModuleActive && (
                    <div className="flex flex-col pl-4 gap-1">
                      {module.quizzes?.map((quiz, qIdx) => (
                        <div 
                          key={quiz.id}
                          onClick={() => handleQuizClick(module.id, null, quiz.id)}
                          className={`rounded-xl p-2 flex items-center gap-3 cursor-pointer transition-all ${
                            activeQuizId === quiz.id && !activeLessonId ? 'bg-card shadow-sm text-foreground border-l-4 border-blue-600' : 'hover:bg-muted text-gray-500'
                          }`}
                        >
                          <FileText className={activeQuizId === quiz.id && !activeLessonId ? "text-blue-600" : "text-gray-400"} size={14} />
                          <span className="text-xs font-bold truncate">
                            {quiz.title || `Module Quiz ${qIdx + 1}`}
                          </span>
                        </div>
                      ))}
                      {module.assignments?.map((assignment, aIdx) => (
                        <div 
                          key={assignment.id}
                          onClick={() => handleAssignmentClick(module.id, null, assignment.id)}
                          className={`rounded-xl p-2 flex items-center gap-3 cursor-pointer transition-all ${
                            activeAssignmentId === assignment.id && !activeLessonId ? 'bg-card shadow-sm text-foreground border-l-4 border-blue-600' : 'hover:bg-muted text-gray-500'
                          }`}
                        >
                          <ClipboardList className={activeAssignmentId === assignment.id && !activeLessonId ? "text-blue-600" : "text-gray-400"} size={14} />
                          <span className="text-xs font-bold truncate">
                            {assignment.title || `Module Assignment ${aIdx + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lessons inside Module */}
                  {isModuleActive && module.lessons.map((lesson, lIdx) => {
                    const isLessonActive = activeLessonId === lesson.id;
                    return (
                      <div key={lesson.id} className="flex flex-col pl-4 gap-1">
                        <div 
                          onClick={() => handleLessonClick(module.id, lesson.id)}
                          className={`rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                            isLessonActive && !activeTopicId && !activeQuizId && !activeAssignmentId ? 'bg-card shadow-sm border-l-4 border-blue-600 text-foreground' : 'hover:bg-muted text-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className={isLessonActive && !activeTopicId && !activeQuizId && !activeAssignmentId ? "text-blue-600" : "text-gray-400"} size={16} />
                            <span className="text-sm font-bold truncate">
                              {lesson.title || `Lesson ${lIdx + 1}`}
                            </span>
                          </div>
                        </div>

                        {/* Children of Lesson */}
                        {isLessonActive && (
                          <div className="flex flex-col pl-4 mt-1 border-l-2 border-gray-100 gap-1 ml-4">
                            {lesson.topics?.map((topic, tIdx) => (
                              <div 
                                key={topic.id}
                                onClick={() => handleTopicClick(module.id, lesson.id, topic.id)}
                                className={`rounded-xl p-2 flex items-center gap-3 cursor-pointer transition-all ${
                                  activeTopicId === topic.id ? 'bg-card shadow-sm text-foreground border-l-4 border-blue-600' : 'hover:bg-muted text-gray-500'
                                }`}
                              >
                                <Target className={activeTopicId === topic.id ? "text-blue-600" : "text-gray-400"} size={14} />
                                <span className="text-xs font-bold truncate">
                                  {topic.title || `Topic ${tIdx + 1}`}
                                </span>
                              </div>
                            ))}
                            {lesson.quizzes?.map((quiz, qIdx) => (
                              <div 
                                key={quiz.id}
                                onClick={() => handleQuizClick(module.id, lesson.id, quiz.id)}
                                className={`rounded-xl p-2 flex items-center gap-3 cursor-pointer transition-all ${
                                  activeQuizId === quiz.id ? 'bg-card shadow-sm text-foreground border-l-4 border-blue-600' : 'hover:bg-muted text-gray-500'
                                }`}
                              >
                                <FileText className={activeQuizId === quiz.id ? "text-blue-600" : "text-gray-400"} size={14} />
                                <span className="text-xs font-bold truncate">
                                  {quiz.title || `Quiz ${qIdx + 1}`}
                                </span>
                              </div>
                            ))}
                            {lesson.assignments?.map((assignment, aIdx) => (
                              <div 
                                key={assignment.id}
                                onClick={() => handleAssignmentClick(module.id, lesson.id, assignment.id)}
                                className={`rounded-xl p-2 flex items-center gap-3 cursor-pointer transition-all ${
                                  activeAssignmentId === assignment.id ? 'bg-card shadow-sm text-foreground border-l-4 border-blue-600' : 'hover:bg-muted text-gray-500'
                                }`}
                              >
                                <ClipboardList className={activeAssignmentId === assignment.id ? "text-blue-600" : "text-gray-400"} size={14} />
                                <span className="text-xs font-bold truncate">
                                  {assignment.title || `Assignment ${aIdx + 1}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* 2. ADD CONTENT SECTION */}
      {activeModuleId && (
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Add Content
          </h3>
          <div className="flex flex-col gap-3">
            {activeLessonId && (
                <button 
                  onClick={handleAddTopic}
                  className="w-full flex items-center gap-3 border border-gray-200 bg-card px-4 py-3 rounded-2xl hover:bg-muted transition-all shadow-sm"
                >
                  <Plus size={16} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600">Add Topic</span>
                </button>
            )}

            <button 
              onClick={handleAddQuiz}
              className="w-full flex items-center gap-3 border border-gray-200 bg-card px-4 py-3 rounded-2xl hover:bg-muted transition-all shadow-sm"
            >
              <FileText size={16} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-600">Add Quiz</span>
            </button>

            <button 
              onClick={handleAddAssignment}
              className="w-full flex items-center gap-3 border border-gray-200 bg-card px-4 py-3 rounded-2xl hover:bg-muted transition-all shadow-sm"
            >
              <ClipboardList size={16} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-600">Add Assignment</span>
            </button>

            <button 
              onClick={handleAddLesson}
              className="w-full flex items-center gap-3 border border-gray-200 bg-card px-4 py-3 rounded-2xl hover:bg-muted transition-all shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plus size={12} strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold text-gray-600">Add Another Lesson</span>
            </button>
          </div>
        </div>
      )}

      {/* FOOTER ADD MODULE BUTTON */}
      <div className="mt-auto pt-8">
        <button 
          onClick={handleAddModule}
          className="w-full flex items-center justify-center gap-2 border border-blue-100 bg-blue-50/50 text-blue-600 py-3 rounded-2xl hover:bg-blue-50 transition-all font-bold text-sm shadow-sm"
        >
          <Plus size={16} /> Add Another Module
        </button>
      </div>

    </div>
  );
}
