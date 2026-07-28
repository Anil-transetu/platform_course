"use client";

import React, { useState, useRef } from "react";
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
  GraduationCap,
  Award
} from "lucide-react";
import { useCourseStore } from "@/store/useCourseStore";
import { useRouter, usePathname } from "next/navigation";
import { useCreateModule, useUpdateModule, useDeleteModule, useCreateLesson, useUpdateLesson, useDeleteLesson, useCreateTopic, useDeleteTopic } from "@/features/admin/courses/api/course-api";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const toastApiError = (err: any, fallbackMessage: string) => {
  if (typeof window !== "undefined" && !navigator.onLine) {
    toast.error("Network disconnected. Please check your connection.");
    return;
  }
  toast.error(err?.message || fallbackMessage);
};

interface CourseSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onItemSelect?: () => void;
}

export default function CourseSidebar({ isCollapsed = false, onItemSelect }: CourseSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    course, 
    cleanCourse,
    activeModuleId, 
    activeLessonId, 
    activeTopicId,
    activeQuizId,
    activeAssignmentId,
    expandedModules,
    expandedLessons,
    toggleModuleExpand,
    toggleLessonExpand,
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
    setPendingNavigation,
  } = useCourseStore();

  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();
  const createTopicMutation = useCreateTopic();
  const deleteTopicMutation = useDeleteTopic();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetType, setDeleteTargetType] = useState<string | null>(null);
  const [deleteTargetModuleId, setDeleteTargetModuleId] = useState<string | null>(null);
  const [deleteTargetLessonId, setDeleteTargetLessonId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    sessionStorage.setItem("course-builder-sidebar-scroll", String(e.currentTarget.scrollTop));
  };

  React.useEffect(() => {
    const savedScroll = sessionStorage.getItem("course-builder-sidebar-scroll");
    if (savedScroll && scrollRef.current) {
      scrollRef.current.scrollTop = Number(savedScroll);
    }
  }, []);

  const navigateTo = (subPath: string) => {
    const basePath = course.id ? `/admin/courses/edit/${course.id}` : '/admin/courses/create';
    const target = subPath ? `${basePath}/${subPath}` : basePath;
    if (pathname !== target) {
      router.push(target);
    }
  };

  const hasUnsavedChanges = () => {
    const { course: currentCourse, deletedModules, deletedLessons, deletedTopics, lastSavedCourseJson: savedJson } = useCourseStore.getState();
    if (deletedModules.length > 0 || deletedLessons.length > 0 || deletedTopics.length > 0) {
      return true;
    }
    if (!savedJson) {
      return !!currentCourse.title;
    }
    const currentJson = JSON.stringify(currentCourse);
    return currentJson !== savedJson;
  };

  const confirmNavigation = (
    type: "module" | "lesson" | "topic" | "quiz" | "assignment" | "route",
    subPath: string,
    activeStates: {
      activeModuleId: string | null;
      activeLessonId: string | null;
      activeTopicId: string | null;
      activeQuizId: string | null;
      activeAssignmentId: string | null;
    }
  ) => {
    const basePath = course.id ? `/admin/courses/edit/${course.id}` : '/admin/courses/create';
    const target = subPath ? `${basePath}/${subPath}` : basePath;

    if (hasUnsavedChanges()) {
      setPendingNavigation({
        type: "route",
        targetUrl: target,
        ...activeStates
      });
      return;
    }

    onItemSelect?.();
    useCourseStore.setState({
      ...activeStates
    });
    if (pathname !== target) {
      router.push(target);
    }
  };

  const handleModuleClick = (id: string) => {
    toggleModuleExpand(id);
    confirmNavigation("module", "module", {
      activeModuleId: id,
      activeLessonId: null,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: null
    });
  };

  const handleLessonClick = (moduleId: string, lessonId: string) => {
    toggleLessonExpand(lessonId);
    confirmNavigation("lesson", "lesson", {
      activeModuleId: moduleId,
      activeLessonId: lessonId,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: null
    });
  };

  const handleTopicClick = (moduleId: string, lessonId: string, topicId: string) => {
    onItemSelect?.();
    confirmNavigation("topic", "topic", {
      activeModuleId: moduleId,
      activeLessonId: lessonId,
      activeTopicId: topicId,
      activeQuizId: null,
      activeAssignmentId: null
    });
  };

  const handleQuizClick = (moduleId: string, lessonId: string | undefined | null, quizId: string) => {
    onItemSelect?.();
    confirmNavigation("quiz", "quiz", {
      activeModuleId: moduleId,
      activeLessonId: lessonId || null,
      activeTopicId: null,
      activeQuizId: quizId,
      activeAssignmentId: null
    });
  };

  const handleAssignmentClick = (moduleId: string, lessonId: string | undefined | null, assignmentId: string) => {
    onItemSelect?.();
    confirmNavigation("assignment", "assignment", {
      activeModuleId: moduleId,
      activeLessonId: lessonId || null,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: assignmentId
    });
  };

  const handleCourseQuizClick = (quizId: string) => {
    onItemSelect?.();
    confirmNavigation("quiz", "quiz", {
      activeModuleId: null,
      activeLessonId: null,
      activeTopicId: null,
      activeQuizId: quizId,
      activeAssignmentId: null
    });
  };

  const handleCourseAssignmentClick = (assignmentId: string | null) => {
    onItemSelect?.();
    useCourseStore.setState({
      activeModuleId: null,
      activeLessonId: null,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: assignmentId || null
    });
    confirmNavigation("assignment", "assignment", {
      activeModuleId: null,
      activeLessonId: null,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: assignmentId || null
    });
  };

  const handleAddModule = () => {
    if (!course.id) {
      toast.error("Please save the course details first.");
      return;
    }
    addModule();
    navigateTo("module");
  };

  const handleDeleteModuleClick = (moduleId: string) => {
    setDeleteTargetId(moduleId);
    setDeleteTargetType('module');
  };

  const handleDeleteLessonClick = (moduleId: string, lessonId: string) => {
    setDeleteTargetId(lessonId);
    setDeleteTargetModuleId(moduleId);
    setDeleteTargetType('lesson');
  };

  const handleDeleteTopicClick = (moduleId: string, lessonId: string, topicId: string) => {
    setDeleteTargetId(topicId);
    setDeleteTargetModuleId(moduleId);
    setDeleteTargetLessonId(lessonId);
    setDeleteTargetType('topic');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      if (deleteTargetType === 'module') {
        const wasActive = activeModuleId === deleteTargetId;
        
        let nextActiveId = activeModuleId;
        if (wasActive) {
          const remaining = course.modules.filter(m => m.id !== deleteTargetId);
          if (remaining.length > 0) {
            const deletedIndex = course.modules.findIndex(m => m.id === deleteTargetId);
            if (deletedIndex < remaining.length) {
              nextActiveId = remaining[deletedIndex].id;
            } else {
              nextActiveId = remaining[deletedIndex - 1].id;
            }
          } else {
            nextActiveId = null;
          }
        }

        if (!String(deleteTargetId).startsWith("temp-")) {
          await deleteModuleMutation.mutateAsync({
            id: deleteTargetId,
            courseId: course.id
          });
        }

        deleteModule(deleteTargetId);
        useCourseStore.getState().clearDeletedItems();
        
        if (wasActive) {
          if (nextActiveId) {
            setActiveModule(nextActiveId);
            navigateTo("module");
          } else {
            setActiveModule(null);
            router.push(course.id ? `/admin/courses/edit/${course.id}` : '/admin/courses/create');
          }
        }
        toast.success("Module deleted successfully");
      } else if (deleteTargetType === 'lesson') {
        if (!deleteTargetModuleId) return;
        const wasActive = activeLessonId === deleteTargetId;
        const targetModule = course.modules.find(m => m.id === deleteTargetModuleId);
        
        let nextActiveLessonId = activeLessonId;
        if (wasActive && targetModule) {
          const remaining = targetModule.lessons.filter(l => l.id !== deleteTargetId);
          if (remaining.length > 0) {
            const deletedIndex = targetModule.lessons.findIndex(l => l.id === deleteTargetId);
            if (deletedIndex < remaining.length) {
              nextActiveLessonId = remaining[deletedIndex].id;
            } else {
              nextActiveLessonId = remaining[deletedIndex - 1].id;
            }
          } else {
            nextActiveLessonId = null;
          }
        }

        if (!String(deleteTargetId).startsWith("temp-")) {
          await deleteLessonMutation.mutateAsync({
            id: deleteTargetId,
            courseId: course.id,
            moduleId: deleteTargetModuleId
          });
        }

        deleteLesson(deleteTargetModuleId, deleteTargetId);
        useCourseStore.getState().clearDeletedItems();
        
        if (wasActive) {
          if (nextActiveLessonId) {
            setActiveLesson(nextActiveLessonId);
            navigateTo("lesson");
          } else {
            setActiveLesson(null);
            navigateTo("module");
          }
        }
        toast.success("Lesson deleted successfully");
      } else if (deleteTargetType === 'topic') {
        if (!deleteTargetModuleId || !deleteTargetLessonId) return;
        const wasActive = activeTopicId === deleteTargetId;
        const targetModule = course.modules.find(m => m.id === deleteTargetModuleId);
        const targetLesson = targetModule?.lessons.find(l => l.id === deleteTargetLessonId);
        
        let nextActiveTopicId = activeTopicId;
        if (wasActive && targetLesson) {
          const remaining = targetLesson.topics.filter(t => t.id !== deleteTargetId);
          if (remaining.length > 0) {
            const deletedIndex = targetLesson.topics.findIndex(t => t.id === deleteTargetId);
            if (deletedIndex < remaining.length) {
              nextActiveTopicId = remaining[deletedIndex].id;
            } else {
              nextActiveTopicId = remaining[deletedIndex - 1].id;
            }
          } else {
            nextActiveTopicId = null;
          }
        }

        if (!String(deleteTargetId).startsWith("temp-")) {
          await deleteTopicMutation.mutateAsync({
            id: deleteTargetId,
            courseId: course.id
          });
        }

        deleteTopic(deleteTargetModuleId, deleteTargetLessonId, deleteTargetId);
        useCourseStore.getState().clearDeletedItems();
        
        if (wasActive) {
          if (nextActiveTopicId) {
            setActiveTopic(nextActiveTopicId);
            navigateTo("topic");
          } else {
            setActiveTopic(null);
            navigateTo("lesson");
          }
        }
        toast.success("Topic deleted successfully");
      }
    } catch (err: any) {
      if (deleteTargetType === 'module') {
        toastApiError(err, "Failed to delete module");
      } else if (deleteTargetType === 'lesson') {
        toastApiError(err, "Failed to delete lesson");
      } else if (deleteTargetType === 'topic') {
        toastApiError(err, "Failed to delete topic");
      }
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
      setDeleteTargetType(null);
      setDeleteTargetModuleId(null);
      setDeleteTargetLessonId(null);
    }
  };

  const handleAddLesson = () => {
    const currentActiveModuleId = useCourseStore.getState().activeModuleId || activeModuleId;
    if (!currentActiveModuleId) {
      toast.error("Please select a module first.");
      return;
    }
    if (!course.id) {
      toast.error("Please save the course details first.");
      return;
    }
    addLesson(currentActiveModuleId);
    navigateTo("lesson");
  };

  const handleAddTopic = () => {
    const currentActiveModuleId = useCourseStore.getState().activeModuleId || activeModuleId;
    const currentActiveLessonId = useCourseStore.getState().activeLessonId || activeLessonId;
    if (!currentActiveModuleId || !currentActiveLessonId) {
      toast.error("Please select a lesson first.");
      return;
    }
    if (!course.id) {
      toast.error("Please save the course details first.");
      return;
    }
    addTopic(currentActiveModuleId, currentActiveLessonId);
    navigateTo("topic");
  };

  const handleAddQuiz = () => {
    const execute = () => {
      const currentActiveModuleId = useCourseStore.getState().activeModuleId;
      const currentActiveLessonId = useCourseStore.getState().activeLessonId;
      if (currentActiveModuleId && currentActiveLessonId) {
        addQuiz(currentActiveModuleId, currentActiveLessonId);
      } else if (currentActiveModuleId) {
        addQuiz(currentActiveModuleId);
      } else {
        addCourseQuiz();
      }
      navigateTo("quiz");
    };

    if (hasUnsavedChanges()) {
      setPendingNavigation({
        type: "action",
        action: execute
      });
      return;
    }

    execute();
  };

  const handleAddAssignment = () => {
    const execute = () => {
      const currentActiveModuleId = useCourseStore.getState().activeModuleId;
      const currentActiveLessonId = useCourseStore.getState().activeLessonId;
      if (currentActiveModuleId && currentActiveLessonId) {
        addAssignment(currentActiveModuleId, currentActiveLessonId);
      } else if (currentActiveModuleId) {
        addAssignment(currentActiveModuleId);
      } else {
        addCourseAssignment();
      }
      navigateTo("assignment");
    };

    if (hasUnsavedChanges()) {
      setPendingNavigation({
        type: "action",
        action: execute
      });
      return;
    }

    execute();
  };

  return (
    <div
      className={`bg-[#f5f8fc] border-r border-slate-200/80 flex flex-col shadow-[2px_0_15px_rgba(0,0,0,0.015)] shrink-0 h-full text-slate-700 overflow-hidden transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[52px]' : 'w-[320px]'
      }`}
    >
      {/* COLLAPSED ICON STRIP */}
      {isCollapsed && (
        <div className="flex flex-col items-center py-4 gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500" title="Add Module">
            <FolderPlus size={16} />
          </div>
          {course.modules.length > 0 && (
            <div className="flex flex-col gap-2 items-center mt-1">
              {course.modules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModuleClick(m.id)}
                  title={m.title || "Module"}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    activeModuleId === m.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-blue-600 border border-slate-200 hover:bg-blue-50'
                  }`}
                >
                  <Folder size={14} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXPANDED FULL SIDEBAR */}
      {!isCollapsed && (
        <div ref={scrollRef} onScroll={handleScroll} className="p-6 flex flex-col gap-6 overflow-y-auto flex-1 bg-[#f5f8fc] no-scrollbar">
          {/* 1. COURSE CURRICULUM HEADER */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Course Curriculum
            </h3>

            {/* MODULES LIST */}
            <div className="flex flex-col gap-3">
              {course.modules.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No modules added yet.</div>
              ) : (
                course.modules.map((module, mIdx) => {
                  const isModuleActive = activeModuleId === module.id && !activeLessonId && !activeQuizId && !activeAssignmentId;
                  const isExpanded = !!expandedModules[module.id];

                  return (
                    <div key={`module-${module.id}`} className="flex flex-col gap-1.5">
                      {/* Module Card */}
                      <div
                        onClick={() => handleModuleClick(module.id)}
                        className={`group/module rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all border ${
                          isModuleActive
                            ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20'
                            : 'bg-white border-slate-200/90 hover:border-blue-200 hover:bg-blue-50/5 text-slate-800 font-bold shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModuleExpand(module.id);
                            }}
                            className={`p-1 rounded-md transition-colors ${
                              isModuleActive
                                ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>

                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            {isExpanded ? (
                              <FolderOpen className={isModuleActive ? "text-white" : "text-blue-600"} size={16} />
                            ) : (
                              <Folder className={isModuleActive ? "text-white" : "text-blue-600"} size={16} />
                            )}
                            <span className={`text-xs font-bold truncate uppercase tracking-wider ${isModuleActive ? "text-white" : "text-slate-800"}`}>
                              {(() => {
                                const cleanModule = cleanCourse?.modules?.find((m: any) => String(m.id) === String(module.id)) as any;
                                return (cleanModule && !String(module.id).startsWith("temp-"))
                                  ? (cleanModule.title || cleanModule.name || `MODULE ${mIdx + 1}`)
                                  : (module.title || `MODULE ${mIdx + 1}`);
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 opacity-0 group-hover/module:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteModuleClick(module.id);
                            }}
                            className={`p-1 rounded-md transition-opacity ${
                              isModuleActive
                                ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                            }`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* LESSONS UNDER MODULE */}
                      {isExpanded && (
                        <div className="pl-3 flex flex-col gap-1.5 border-l-2 border-slate-200/80 ml-3 my-1">
                          {module.lessons.map((lesson, lIdx) => {
                            const isLessonActive = activeModuleId === module.id && activeLessonId === lesson.id && !activeTopicId && !activeQuizId && !activeAssignmentId;
                            const isLessonExpanded = !!expandedLessons[lesson.id];

                            return (
                              <div key={`lesson-${lesson.id}`} className="flex flex-col gap-1">
                                <div
                                  onClick={() => handleLessonClick(module.id, lesson.id)}
                                  className={`group/module rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-all border ${
                                    isLessonActive
                                      ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20'
                                      : 'bg-white border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/5 text-slate-700 font-semibold'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden flex-1 pl-0.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLessonExpand(lesson.id);
                                      }}
                                      className={`p-1 rounded-md transition-colors ${
                                        isLessonActive
                                          ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                          : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                                      }`}
                                    >
                                      {isLessonExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    </button>

                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                      {isLessonExpanded ? (
                                        <BookOpen className={isLessonActive ? "text-white" : "text-blue-500"} size={14} />
                                      ) : (
                                        <Book className={isLessonActive ? "text-white" : "text-blue-500"} size={14} />
                                      )}
                                      <span className={`text-[11px] font-semibold truncate ${isLessonActive ? "text-white" : "text-slate-700"}`}>
                                        {lesson.title || `Lesson ${lIdx + 1}`}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteLessonClick(module.id, lesson.id);
                                    }}
                                    className={`p-1 rounded-md transition-opacity opacity-0 group-hover/module:opacity-100 ${
                                      isLessonActive
                                        ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                        : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                                    }`}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                                {/* TOPICS, QUIZZES, ASSIGNMENTS UNDER LESSON */}
                                {isLessonExpanded && (
                                  <div className="pl-3 flex flex-col gap-1 border-l-2 border-slate-200 ml-3 my-1">
                                    {lesson.topics.map((topic, tIdx) => {
                                      const isTopicActive = activeModuleId === module.id && activeLessonId === lesson.id && activeTopicId === topic.id;
                                      return (
                                        <div
                                          key={`topic-${topic.id}`}
                                          onClick={() => handleTopicClick(module.id, lesson.id, topic.id)}
                                          className={`group/module rounded-md p-1.5 pl-2 flex items-center justify-between cursor-pointer transition-all border ${
                                            isTopicActive
                                              ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-sm'
                                              : 'bg-white border-slate-200/60 hover:border-blue-200 hover:bg-blue-50/5 text-slate-600 font-medium'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                                            <Target className={isTopicActive ? "text-white" : "text-slate-400"} size={13} />
                                            <span className={`text-[11px] truncate ${isTopicActive ? "text-white font-bold" : "text-slate-600"}`}>
                                              {topic.title || `Topic ${tIdx + 1}`}
                                            </span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteTopicClick(module.id, lesson.id, topic.id);
                                            }}
                                            className={`p-1 rounded-md transition-opacity opacity-0 group-hover/module:opacity-100 ${
                                              isTopicActive
                                                ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                                : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                                            }`}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      );
                                    })}

                                    {lesson.quizzes?.map((quiz) => {
                                      const isQuizActive = activeModuleId === module.id && activeLessonId === lesson.id && activeQuizId === quiz.id;
                                      return (
                                        <div
                                          key={`quiz-${quiz.id}`}
                                          onClick={() => handleQuizClick(module.id, lesson.id, quiz.id)}
                                          className={`group/module rounded-md p-1.5 pl-2 flex items-center justify-between cursor-pointer transition-all border ${
                                            isQuizActive
                                              ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-sm'
                                              : 'bg-white border-slate-200/60 hover:border-blue-200 hover:bg-blue-50/5 text-slate-600 font-medium'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                                            <GraduationCap className={isQuizActive ? "text-white" : "text-slate-400"} size={13} />
                                            <span className={`text-[11px] truncate ${isQuizActive ? "text-white font-bold" : "text-slate-600"}`}>
                                              {quiz.title || "Quiz"}
                                            </span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteQuiz(module.id, lesson.id, quiz.id);
                                              if (activeQuizId === quiz.id) {
                                                navigateTo("quiz");
                                              }
                                            }}
                                            className={`p-1 rounded-md transition-opacity opacity-0 group-hover/module:opacity-100 ${
                                              isQuizActive
                                                ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                                : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                                            }`}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      );
                                    })}

                                    {lesson.assignments?.map((assignment) => {
                                      const isAssignmentActive = activeModuleId === module.id && activeLessonId === lesson.id && activeAssignmentId === assignment.id;
                                      return (
                                        <div
                                          key={`assignment-${assignment.id}`}
                                          onClick={() => handleAssignmentClick(module.id, lesson.id, assignment.id)}
                                          className={`group/module rounded-md p-1.5 pl-2 flex items-center justify-between cursor-pointer transition-all border ${
                                            isAssignmentActive
                                              ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-sm'
                                              : 'bg-white border-slate-200/60 hover:border-blue-200 hover:bg-blue-50/5 text-slate-600 font-medium'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                                            <ClipboardList className={isAssignmentActive ? "text-white" : "text-slate-400"} size={13} />
                                            <span className={`text-[11px] truncate ${isAssignmentActive ? "text-white font-bold" : "text-slate-600"}`}>
                                              {assignment.title || "Assignment"}
                                            </span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteAssignment(module.id, lesson.id, assignment.id);
                                              if (activeAssignmentId === assignment.id) {
                                                navigateTo("assignment");
                                              }
                                            }}
                                            className={`p-1 rounded-md transition-opacity opacity-0 group-hover/module:opacity-100 ${
                                              isAssignmentActive
                                                ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                                : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                                            }`}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {module.quizzes?.map((quiz) => {
                            const isQuizActive = activeModuleId === module.id && !activeLessonId && activeQuizId === quiz.id;
                            return (
                              <div
                                key={`mod-quiz-${quiz.id}`}
                                onClick={() => handleQuizClick(module.id, null, quiz.id)}
                                className={`group/module rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border ${
                                  isQuizActive
                                    ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20'
                                    : 'bg-white border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/5 text-slate-700 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                                  <GraduationCap className={isQuizActive ? "text-white" : "text-slate-500"} size={14} />
                                  <span className={`text-[11px] font-semibold truncate ${isQuizActive ? "text-white" : "text-slate-700"}`}>
                                    {quiz.title || "Module Quiz"}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteQuiz(module.id, null, quiz.id);
                                    if (activeQuizId === quiz.id) {
                                      navigateTo("quiz");
                                    }
                                  }}
                                  className={`p-1 rounded-md transition-opacity opacity-0 group-hover/module:opacity-100 ${
                                    isQuizActive
                                      ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                      : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                                  }`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            );
                          })}

                          {module.assignments?.map((assignment) => {
                            const isAssignmentActive = activeModuleId === module.id && !activeLessonId && activeAssignmentId === assignment.id;
                            return (
                              <div
                                key={`mod-assignment-${assignment.id}`}
                                onClick={() => handleAssignmentClick(module.id, null, assignment.id)}
                                className={`group/module rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border ${
                                  isAssignmentActive
                                    ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20'
                                    : 'bg-white border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/5 text-slate-700 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                                  <ClipboardList className={isAssignmentActive ? "text-white" : "text-slate-500"} size={14} />
                                  <span className={`text-[11px] font-semibold truncate ${isAssignmentActive ? "text-white" : "text-slate-700"}`}>
                                    {assignment.title || "Module Assignment"}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteAssignment(module.id, null, assignment.id);
                                    if (activeAssignmentId === assignment.id) {
                                      navigateTo("assignment");
                                    }
                                  }}
                                  className={`p-1 rounded-md transition-opacity opacity-0 group-hover/module:opacity-100 ${
                                    isAssignmentActive
                                      ? 'hover:bg-blue-700/50 text-white/80 hover:text-white'
                                      : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                                  }`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* DIVIDER */}
            <div className="my-5 border-t border-slate-200/80" />

            {/* FINAL ASSESSMENT */}
            {(() => {
              const finalAssessment = (course as any).final_assessment || (course as any).finalAssessment || (course as any).final_assignment;
              const rawFaId = (course as any).final_assessment_id ?? (course as any).finalAssessmentId ?? finalAssessment?.assignment_id ?? finalAssessment?.assignment?.id ?? finalAssessment?.id;
              const finalAssessmentIdStr = rawFaId !== null && rawFaId !== undefined && String(rawFaId) !== "" ? String(rawFaId) : null;
              const isFinalAssessmentActive = !activeModuleId && !activeLessonId && !activeTopicId && !activeQuizId && (
                (finalAssessmentIdStr && String(activeAssignmentId) === finalAssessmentIdStr) ||
                (!finalAssessmentIdStr && (activeAssignmentId === null || activeAssignmentId === "") && pathname.includes("/assignment"))
              );
              const title = finalAssessment?.title || finalAssessment?.assignment_title || (course as any).final_assessment_title || "FINAL ASSESSMENT";
              return (
                <div
                  onClick={() => handleCourseAssignmentClick(finalAssessmentIdStr)}
                  className={`group/module rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all border ${
                    isFinalAssessmentActive
                      ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20'
                      : 'bg-white border-slate-200/90 hover:border-blue-200 hover:bg-blue-50/5 text-slate-800 font-bold shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-1">
                    <Award className={isFinalAssessmentActive ? "text-white" : "text-slate-500"} size={16} />
                    <span className={`text-xs font-bold truncate uppercase tracking-wider ${isFinalAssessmentActive ? "text-white" : "text-slate-800"}`}>
                      {title}
                    </span>
                  </div>
                  {!finalAssessmentIdStr && (
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isFinalAssessmentActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      Not Attached
                    </span>
                  )}
                </div>
              );
            })()}

            {/* DIVIDER */}
            <div className="my-5 border-t border-slate-200/80" />

            {/* 2. ADD CONTENT SECTION (DYNAMIC) */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Add Content
              </h3>

              <div className="flex flex-col gap-3">
                {activeModuleId && activeLessonId ? (
                  /* When Lesson is Selected */
                  <>
                    <button
                      onClick={handleAddTopic}
                      className="w-full flex items-center justify-between bg-white border border-slate-200/90 rounded-xl px-4 py-3.5 hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.02)] text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Target size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-slate-800">Add Topic</span>
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    <button
                      onClick={handleAddQuiz}
                      className="w-full flex items-center justify-between bg-white border border-slate-200/90 rounded-xl px-4 py-3.5 hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.02)] text-left"
                    >
                      <div className="flex items-center gap-3">
                        <GraduationCap size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-slate-800">Add Lesson Quiz</span>
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    <button
                      onClick={handleAddAssignment}
                      className="w-full flex items-center justify-between bg-white border border-slate-200/90 rounded-xl px-4 py-3.5 hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.02)] text-left"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-slate-800">Add Lesson Assignment</span>
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    <button
                      onClick={handleAddLesson}
                      className="w-full flex items-center gap-3 border border-dashed border-blue-200 bg-[#f0f6ff]/40 hover:bg-[#f0f6ff] px-4 py-3.5 rounded-xl hover:border-blue-300 transition-all text-left text-blue-600 font-semibold"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600">
                        <Plus size={14} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-semibold text-blue-600">Add Lesson</span>
                    </button>
                  </>
                ) : activeModuleId ? (
                  /* When Module is Selected */
                  <>
                    <button
                      onClick={handleAddQuiz}
                      className="w-full flex items-center justify-between bg-white border border-slate-200/90 rounded-xl px-4 py-3.5 hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.02)] text-left"
                    >
                      <div className="flex items-center gap-3">
                        <GraduationCap size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-slate-800">Add Module Quiz</span>
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    <button
                      onClick={handleAddAssignment}
                      className="w-full flex items-center justify-between bg-white border border-slate-200/90 rounded-xl px-4 py-3.5 hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.02)] text-left"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-slate-800">Add Module Assignment</span>
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    <button
                      onClick={handleAddLesson}
                      className="w-full flex items-center gap-3 border border-dashed border-blue-200 bg-[#f0f6ff]/40 hover:bg-[#f0f6ff] px-4 py-3.5 rounded-xl hover:border-blue-300 transition-all text-left text-blue-600 font-semibold"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600">
                        <Plus size={14} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-semibold text-blue-600">Add Lesson</span>
                    </button>
                  </>
                ) : (
                  /* Default / Course Level */
                  <>
                    <button
                      onClick={handleAddQuiz}
                      className="w-full flex items-center justify-between bg-white border border-slate-200/90 rounded-xl px-4 py-3.5 hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.02)] text-left"
                    >
                      <div className="flex items-center gap-3">
                        <GraduationCap size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-slate-800">Add Course Quiz</span>
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    <button
                      onClick={handleAddAssignment}
                      className="w-full flex items-center justify-between bg-white border border-slate-200/90 rounded-xl px-4 py-3.5 hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.02)] text-left"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-slate-800">Add Course Assignment</span>
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    <button
                      onClick={handleAddLesson}
                      className="w-full flex items-center gap-3 border border-dashed border-blue-200 bg-[#f0f6ff]/40 hover:bg-[#f0f6ff] px-4 py-3.5 rounded-xl hover:border-blue-300 transition-all text-left text-blue-600 font-semibold"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600">
                        <Plus size={14} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-semibold text-blue-600">Add Lesson</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 3. ADD ANOTHER MODULE BUTTON */}
            <button
              onClick={handleAddModule}
              disabled={createModuleMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] py-3.5 rounded-xl transition-all font-bold text-sm shadow-sm disabled:opacity-50 mt-6"
            >
              {createModuleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {createModuleMutation.isPending ? "Adding Module..." : "Add Another Module"}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteTargetId !== null} 
        onClose={() => !isDeleting && (setDeleteTargetId(null), setDeleteTargetType(null), setDeleteTargetModuleId(null))}
        title={deleteTargetType === 'module' ? "Delete Module" : "Delete Lesson"}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-650 leading-relaxed">
            {deleteTargetType === 'module' 
              ? "Are you sure you want to delete this module? This will permanently remove all lessons, topics, quizzes, and assignments under it."
              : "Are you sure you want to delete this lesson? This will permanently remove all topics, quizzes, and assignments under it."
            }
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setDeleteTargetId(null);
                setDeleteTargetType(null);
                setDeleteTargetModuleId(null);
              }}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md shadow-rose-600/10 flex items-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}