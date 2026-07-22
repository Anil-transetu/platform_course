"use client";

import React, { useState, useRef } from "react";
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
}
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
}

export default function CourseSidebar({ isCollapsed = false }: CourseSidebarProps) {
export default function CourseSidebar({ isCollapsed = false }: CourseSidebarProps) {
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
    moveLessonItem,
    moveModuleItem,
    reorderModules,
    reorderModuleItems,
    reorderLessonItems,
    mapTemporaryModuleId,
    lastSavedCourseJson,
    setPendingNavigation,
    moveModuleItem,
    reorderModules,
    reorderModuleItems,
    reorderLessonItems,
    mapTemporaryModuleId,
    lastSavedCourseJson,
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

    if (!hasUnsavedChanges()) {
      useCourseStore.setState(activeStates);
      if (pathname !== target) {
        router.push(target);
      }
      return;
    }

    setPendingNavigation({
      type,
      targetUrl: target,
      ...activeStates
    });
  };

  const handleModuleClick = (id: string) => {
    confirmNavigation("module", "module", {
      activeModuleId: id,
      activeLessonId: null,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: null
    });
  };

  const handleLessonClick = (moduleId: string, lessonId: string) => {
    confirmNavigation("lesson", "lesson", {
      activeModuleId: moduleId,
      activeLessonId: lessonId,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: null
    });
    confirmNavigation("lesson", "lesson", {
      activeModuleId: moduleId,
      activeLessonId: lessonId,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: null
    });
  };

  const handleTopicClick = (moduleId: string, lessonId: string, topicId: string) => {
    confirmNavigation("topic", "topic", {
      activeModuleId: moduleId,
      activeLessonId: lessonId,
      activeTopicId: topicId,
      activeQuizId: null,
      activeAssignmentId: null
    });
    confirmNavigation("topic", "topic", {
      activeModuleId: moduleId,
      activeLessonId: lessonId,
      activeTopicId: topicId,
      activeQuizId: null,
      activeAssignmentId: null
    });
  };

  const handleQuizClick = (moduleId: string, lessonId: string | undefined | null, quizId: string) => {
    confirmNavigation("quiz", "quiz", {
      activeModuleId: moduleId,
      activeLessonId: lessonId || null,
      activeTopicId: null,
      activeQuizId: quizId,
      activeAssignmentId: null
    });
  };

  const handleAssignmentClick = (moduleId: string, lessonId: string | undefined | null, assignmentId: string) => {
    confirmNavigation("assignment", "assignment", {
      activeModuleId: moduleId,
      activeLessonId: lessonId || null,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: assignmentId
    });
  };

  const handleCourseQuizClick = (quizId: string) => {
    confirmNavigation("quiz", "quiz", {
      activeModuleId: null,
      activeLessonId: null,
      activeTopicId: null,
      activeQuizId: quizId,
      activeAssignmentId: null
    });
  };

  const handleCourseAssignmentClick = (assignmentId: string) => {
    confirmNavigation("assignment", "assignment", {
      activeModuleId: null,
      activeLessonId: null,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: assignmentId
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
        const targetModule = course.modules.find(m => m.id === deleteTargetId);
        
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
        useCourseStore.getState().clearDeletedItems(); // Commit deletion baseline
        
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
        const targetLesson = targetModule?.lessons.find(l => l.id === deleteTargetId);
        
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
        useCourseStore.getState().clearDeletedItems(); // Commit deletion baseline
        
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
        const targetTopic = targetLesson?.topics.find(t => t.id === deleteTargetId);
        
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
        useCourseStore.getState().clearDeletedItems(); // Commit deletion baseline
        
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

  const handleModuleReorder = async (startIndex: number, endIndex: number) => {
    const previousModules = [...course.modules];
    reorderModules(startIndex, endIndex);

    if (!course.id) return;

    const updatedModules = useCourseStore.getState().course.modules;
    const updates = updatedModules
      .map((m, index) => ({ id: m.id, newOrderNum: index + 1, oldOrderNum: m.order_num }))
      .filter(u => !String(u.id).startsWith("temp-") && u.newOrderNum !== u.oldOrderNum);

    if (updates.length === 0) return;

    try {
      for (const update of updates) {
        await updateModuleMutation.mutateAsync({
          id: update.id,
          // Omit courseId to prevent duplicate invalidations on each step of the loop
          data: { order_num: update.newOrderNum }
        });
      }
      useCourseStore.getState().clearDeletedItems(); // Commit reordering baseline
    } catch (err: any) {
      toastApiError(err, "Reordering failed. Resetting module positions.");
      
      useCourseStore.setState((state) => ({
        course: { ...state.course, modules: previousModules }
      }));


      const currentModules = useCourseStore.getState().course.modules;
      const activeExists = currentModules.some(m => String(m.id) === String(activeModuleId));
      if (!activeExists) {
        if (currentModules.length > 0) {
          setActiveModule(currentModules[0].id);
        } else {
          setActiveModule(null);
        }
      }
    }
  };

  const handleModuleItemReorder = async (moduleId: string, startIndex: number, endIndex: number) => {
    // Save previous state
    const targetModule = course.modules.find(m => m.id === moduleId);
    if (!targetModule) return;

    const previousOrder = targetModule.order ? [...targetModule.order] : undefined;
    const previousLessons = [...targetModule.lessons];

    reorderModuleItems(moduleId, startIndex, endIndex);

    if (!course.id) return;

    // Find updated module and lessons to update order_num
    const updatedModule = useCourseStore.getState().course.modules.find(m => m.id === moduleId);
    if (!updatedModule) return;

    // Collect lessons that need order_num updated
    const lessonUpdates: Array<{ id: string; newOrderNum: number }> = [];
    // The order array has items in order, for lessons, assign order_num based on their position in the order array
    const itemsOrder = updatedModule.order || [];
    let lessonOrder = 1;
    for (const item of itemsOrder) {
      if (item.type === 'lesson') {
        const lesson = updatedModule.lessons.find(l => l.id === item.id);
        if (lesson && !String(lesson.id).startsWith("temp-")) {
          lessonUpdates.push({ id: lesson.id, newOrderNum: lessonOrder });
        }
        lessonOrder++;
      }
    }

    if (lessonUpdates.length === 0) return;

    try {
      for (const update of lessonUpdates) {
        await updateLessonMutation.mutateAsync({
          id: update.id,
          courseId: course.id,
          data: { order_num: update.newOrderNum }
        });
      }
      useCourseStore.getState().clearDeletedItems();
    } catch (err: any) {
      toastApiError(err, "Reordering failed. Resetting lesson positions.");
      
      // Revert Zustand store
      useCourseStore.setState((state) => {
        const revertModules = state.course.modules.map(m => {
          if (m.id === moduleId) {
            return { ...m, order: previousOrder, lessons: previousLessons };
          }
          return m;
        });
        return { course: { ...state.course, modules: revertModules } };
      });

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

  const hasCourseContent = (course.quizzes && course.quizzes.length > 0) || (course.assignments && course.assignments.length > 0);
  const hasCourseContent = (course.quizzes && course.quizzes.length > 0) || (course.assignments && course.assignments.length > 0);

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
        <div className="p-6 flex flex-col gap-8 overflow-y-auto flex-1">
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
        <div className="p-6 flex flex-col gap-8 overflow-y-auto flex-1">
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
                <div
                  key={`module-${module.id}`}
                  className="flex flex-col gap-1 mb-1"
                >
                  <div 
                    onClick={() => handleModuleClick(module.id)}
                    className={`group/module rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all border ${isModuleActive && !activeLessonId 
                        ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20' 
                        : 'bg-white border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/5 text-slate-800 font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                      {/* Expand Arrow */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleModuleExpand(module.id); }}
                        onClick={(e) => { e.stopPropagation(); toggleModuleExpand(module.id); }}
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
                          {(() => {
                            const cleanModule = cleanCourse?.modules?.find((m: any) => String(m.id) === String(module.id)) as any;
                            return (cleanModule && !String(module.id).startsWith("temp-")) ? (cleanModule.title || cleanModule.name || `MODULE ${mIdx + 1}`) : (module.title || `MODULE ${mIdx + 1}`);
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
                        className={`p-0.5 ${isModuleActive && !activeLessonId ? 'hover:text-white text-white/70' : 'hover:text-rose-600 text-slate-455'}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
                      <div className="flex flex-col pl-5 ml-4 border-l-2 border-slate-200 gap-1.5">
                        {items.map((item, itemIdx) => {
                          if (item.type === 'lesson') {
                            const lesson = module.lessons.find(l => l.id === item.id);
                            if (!lesson) return null;
                            const lIdx = module.lessons.indexOf(lesson);
                            const isLessonActive = activeLessonId === lesson.id;
                            const isLessonExpanded = !!expandedLessons[lesson.id];

                            return (
                              <div
                                key={`lesson-${lesson.id}`}
                                className="flex flex-col gap-1"
                              >
                                <div
                                  onClick={() => handleLessonClick(module.id, lesson.id)}
                                  className={`group/lesson rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all border ${isLessonActive && !activeTopicId && !activeQuizId && !activeAssignmentId
                                      ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20'
                                      : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-700 hover:text-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                                    {/* Lesson Expand Toggle */}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleLessonExpand(lesson.id); }}
                                      onClick={(e) => { e.stopPropagation(); toggleLessonExpand(lesson.id); }}
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
                                      {(() => {
                                        const cleanModule = cleanCourse?.modules?.find((m: any) => String(m.id) === String(module.id)) as any;
                                        const cleanLesson = cleanModule?.lessons?.find((l: any) => String(l.id) === String(lesson.id)) as any;
                                        return (cleanLesson && !String(lesson.id).startsWith("temp-")) ? (cleanLesson.title || cleanLesson.name || `Lesson ${lIdx + 1}`) : (lesson.title || `Lesson ${lIdx + 1}`);
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteLessonClick(module.id, lesson.id);
                                        handleDeleteLessonClick(module.id, lesson.id);
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
                                              <div className="flex items-center gap-2 overflow-hidden flex-1 pl-2">
                                                <Target className={isTopicActive ? "text-white" : "text-slate-400"} size={14} />
                                                <span className="text-xs font-medium truncate flex-1">
                                                  {(() => {
                                                    const cleanModule = cleanCourse?.modules?.find((m: any) => String(m.id) === String(module.id)) as any;
                                                    const cleanLesson = cleanModule?.lessons?.find((l: any) => String(l.id) === String(lesson.id)) as any;
                                                    const cleanTopic = cleanLesson?.topics?.find((t: any) => String(t.id) === String(topic.id)) as any;
                                                    return (cleanTopic && !String(topic.id).startsWith("temp-")) ? (cleanTopic.title || cleanTopic.name || `Topic ${tIdx + 1}`) : (topic.title || `Topic ${tIdx + 1}`);
                                                  })()}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTopicClick(module.id, lesson.id, topic.id);
                                                    handleDeleteTopicClick(module.id, lesson.id, topic.id);
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
                                              <div className="flex items-center gap-2 overflow-hidden flex-1 pl-2">
                                                <GraduationCap className={isQuizActive ? "text-white" : "text-slate-400"} size={14} />
                                                <span className="text-xs font-semibold truncate flex-1">
                                                <span className="text-xs font-semibold truncate flex-1">
                                                  {quiz.title || `Quiz ${qIdx + 1}`}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteQuiz(module.id, lesson.id, quiz.id);
                                                    if (activeQuizId === quiz.id) {
                                                      navigateTo("lesson");
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
                                              <div className="flex items-center gap-2 overflow-hidden flex-1 pl-2">
                                                <ClipboardList className={isAssignmentActive ? "text-white" : "text-slate-400"} size={14} />
                                                <span className="text-xs font-medium truncate flex-1">
                                                  {assignment.title || `Assignment ${aIdx + 1}`}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteAssignment(module.id, lesson.id, assignment.id);
                                                     if (activeAssignmentId === assignment.id) {
                                                       navigateTo("lesson");
                                                     }
                                                     if (activeAssignmentId === assignment.id) {
                                                       navigateTo("lesson");
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
                                 <div className="flex items-center gap-2 overflow-hidden flex-1 pl-2">
                                   <GraduationCap className={isQuizActive ? "text-white" : "text-slate-400"} size={14} />
                                   <span className="text-xs font-semibold truncate flex-1">
                                     {quiz.title || `Module Quiz ${qIdx + 1}`}
                                   </span>
                                 </div>
                                 <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       deleteQuiz(module.id, undefined, quiz.id);
                                        if (activeQuizId === quiz.id) {
                                          navigateTo("module");
                                        }
                                        if (activeQuizId === quiz.id) {
                                          navigateTo("module");
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
                                <div className="flex items-center gap-2 overflow-hidden flex-1 pl-2">
                                  <ClipboardList className={isAssignmentActive ? "text-white" : "text-slate-400"} size={14} />
                                  <span className="text-xs font-semibold truncate flex-1">
                                    {assignment.title || `Module Assignment ${aIdx + 1}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteAssignment(module.id, undefined, assignment.id);
                                       if (activeAssignmentId === assignment.id) {
                                         navigateTo("module");
                                       }
                                       if (activeAssignmentId === assignment.id) {
                                         navigateTo("module");
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
                        navigateTo("quiz");
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
          {(course as any).final_assessment ? (
            (() => {
              const finalAssessment = (course as any).final_assessment;
              const finalAssessmentId = String(finalAssessment.id ?? "");
              const isAssignmentActive = activeAssignmentId === finalAssessmentId;
              const title = finalAssessment.title || finalAssessment.assignment_title || "Final Assessment";
              return (
                <React.Fragment key={`course-final-assessment-wrapper-${finalAssessmentId}`}>
                  <div className="my-4 border-t border-slate-200/80" />
                  <div 
                    onClick={() => handleCourseAssignmentClick(finalAssessmentId)}
                    className={`group/module rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all border ${
                      isAssignmentActive 
                        ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20' 
                        : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/5 text-slate-800 font-bold shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1 pl-1">
                      <Award className={isAssignmentActive ? "text-white" : "text-slate-500"} size={16} />
                      <span className={`text-[11px] font-bold truncate uppercase tracking-wider ${isAssignmentActive ? "text-white" : "text-slate-800"}`}>
                        {title}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })()
          ) : null}

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
          disabled={createModuleMutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-blue-100/60 text-blue-600 hover:bg-blue-200/85 hover:text-blue-700 py-3.5 rounded-xl transition-all font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={createModuleMutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-blue-100/60 text-blue-600 hover:bg-blue-200/85 hover:text-blue-700 py-3.5 rounded-xl transition-all font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createModuleMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          {createModuleMutation.isPending ? "Adding Module..." : "Add Another Module"}
          {createModuleMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          {createModuleMutation.isPending ? "Adding Module..." : "Add Another Module"}
        </button>
      </div>

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
      )}
    </div>
  );
}
