"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCourseStore, Quiz as StoreQuiz, Assignment as StoreAssignment } from "@/store/useCourseStore";
import CourseSidebar from "@/components/admin/courses/CourseSidebar";
import { toast } from "sonner";
import { useCreateCourse, useUpdateCourse, useUpdateModule, useUpdateLesson, useUpdateTopic } from "@/features/admin/courses/api/course-api";
import { useSidebar } from "@/components/ui/sidebar";

const toastApiError = (err: any, fallbackMessage: string) => {
  if (typeof window !== "undefined" && !navigator.onLine) {
    toast.error("Network disconnected. Please check your connection.");
    return;
  }
  toast.error(err.message || fallbackMessage);
};

function getNormalizedIds(items: any[]): number[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item: any) => {
      if (item === null || item === undefined) return null;
      if (typeof item === "object") {
        const idVal = item.id ?? item.assignment_id ?? item.quiz_id;
        return idVal !== null && idVal !== undefined ? Number(idVal) : null;
      }
      const num = Number(item);
      return isNaN(num) ? null : num;
    })
    .filter((id): id is number => typeof id === "number" && !isNaN(id) && id > 0);
}

function mapStoreModulesToBackend(modules: any[]) {
  return modules.map((m: any, mIndex: number) => {
    const isTempModule = String(m.id).startsWith("temp-");
    
    const modulePayload: Record<string, any> = {
      name: m.title || m.name || `Module ${mIndex + 1}`,
      description: m.description || "",
      order_num: mIndex + 1,
      assignment_ids: getNormalizedIds(m.assignments),
      quizzes: getNormalizedIds(m.quizzes),
      image_url: m.image_url || "",
      video_url: m.video_url || "",
      pdf_url: m.pdf_url || "",
      url: m.url || "",
      content_blocks: m.content_blocks || []
    };
    
    if (!isTempModule) {
      modulePayload.id = Number(m.id);
    }
    
    if (m.lessons && Array.isArray(m.lessons)) {
      modulePayload.lessons = m.lessons.map((l: any, lIndex: number) => {
        const isTempLesson = String(l.id).startsWith("temp-");
        
        const lessonPayload: Record<string, any> = {
          name: l.title || l.name || `Lesson ${lIndex + 1}`,
          content_text: l.content || l.content_text || "",
          text: l.content || l.text || "",
          type: l.type || "text",
          order_num: lIndex + 1,
          assignment_ids: getNormalizedIds(l.assignments),
          quizzes: getNormalizedIds(l.quizzes),
          image_url: l.image_url || "",
          video_url: l.video_url || "",
          pdf_url: l.pdf_url || "",
          url: l.url || "",
          content_blocks: l.content_blocks || []
        };
        
        if (!isTempLesson) {
          lessonPayload.id = Number(l.id);
        }
        
        if (l.topics && Array.isArray(l.topics)) {
          lessonPayload.topics = l.topics.map((t: any, tIndex: number) => {
            const isTempTopic = String(t.id).startsWith("temp-");
            
            const topicPayload: Record<string, any> = {
              name: t.title || t.name || `Topic ${tIndex + 1}`,
              content_text: t.content || t.content_text || "",
              text: t.content || t.text || "",
              order_num: tIndex + 1,
              image_url: t.image_url || "",
              video_url: t.video_url || "",
              pdf_url: t.pdf_url || "",
              url: t.url || "",
              content_blocks: t.content_blocks || []
            };
            
            if (!isTempTopic) {
              topicPayload.id = Number(t.id);
            }
            
            return topicPayload;
          });
        }
        
        return lessonPayload;
      });
    }
    
    return modulePayload;
  });
}

function mapTopicToUpdatePayload(topic: any, orderNum: number) {
  return {
    name: topic.title || topic.name || `Topic ${orderNum}`,
    content_text: topic.content || topic.content_text || "",
    text: topic.content || topic.text || "",
    order_num: topic.order_num ?? orderNum,
    image_url: topic.image_url || "",
    video_url: topic.video_url || "",
    pdf_url: topic.pdf_url || "",
    url: topic.url || "",
    content_blocks: topic.content_blocks || [],
  };
}

function mapModuleToUpdatePayload(module: any, orderNum: number) {
  return {
    name: module.title || module.name || `Module ${orderNum}`,
    description: module.description || module.content_text || "",
    order_num: module.order_num ?? orderNum,
    assignment_ids: getNormalizedIds(module.assignments),
    quizzes: getNormalizedIds(module.quizzes),
    image_url: module.image_url || "",
    video_url: module.video_url || "",
    pdf_url: module.pdf_url || "",
    url: module.url || "",
    content_blocks: module.content_blocks || [],
  };
}

function getChangedModules(course: any, cleanCourse: any) {
  return (course.modules || []).flatMap((module: any, index: number) => {
    if (String(module.id).startsWith("temp-")) return [];
    const cleanModule = (cleanCourse?.modules || []).find((item: any) => String(item.id) === String(module.id));
    const payload = mapModuleToUpdatePayload(module, index + 1);
    const cleanPayload = cleanModule ? mapModuleToUpdatePayload(cleanModule, index + 1) : null;
    return JSON.stringify(payload) === JSON.stringify(cleanPayload) ? [] : [{ moduleId: module.id, payload }];
  });
}

function mapLessonToUpdatePayload(lesson: any, orderNum: number) {
  return {
    name: lesson.title || lesson.name || `Lesson ${orderNum}`,
    content_text: lesson.content || lesson.content_text || "",
    text: lesson.content || lesson.text || "",
    type: lesson.type || "text",
    order_num: lesson.order_num ?? orderNum,
    duration_minutes: lesson.duration_minutes,
    quizzes: getNormalizedIds(lesson.quizzes),
    assignment_ids: getNormalizedIds(lesson.assignments),
    image_url: lesson.image_url || "",
    video_url: lesson.video_url || "",
    pdf_url: lesson.pdf_url || "",
    url: lesson.url || "",
    images: lesson.images || [],
    videos: lesson.videos || [],
    pdfs: lesson.pdfs || [],
    urls: lesson.urls || [],
    content_blocks: lesson.content_blocks || [],
  };
}

function getChangedLessons(course: any, cleanCourse: any) {
  return course.modules.flatMap((module: any) =>
    (module.lessons || []).flatMap((lesson: any, index: number) => {
      if (String(lesson.id).startsWith("temp-")) return [];
      const cleanModule = (cleanCourse?.modules || []).find((item: any) => String(item.id) === String(module.id));
      const cleanLesson = (cleanModule?.lessons || []).find((item: any) => String(item.id) === String(lesson.id));
      const payload = mapLessonToUpdatePayload(lesson, index + 1);
      const cleanPayload = cleanLesson ? mapLessonToUpdatePayload(cleanLesson, index + 1) : null;

      return JSON.stringify(payload) === JSON.stringify(cleanPayload)
        ? []
        : [{ moduleId: module.id, lessonId: lesson.id, payload }];
    })
  );
}

function getChangedTopics(course: any, cleanCourse: any) {
  return course.modules.flatMap((module: any) =>
    (module.lessons || []).flatMap((lesson: any) =>
      (lesson.topics || []).flatMap((topic: any, index: number) => {
        if (String(topic.id).startsWith("temp-")) return [];
        const cleanModule = (cleanCourse?.modules || []).find((item: any) => String(item.id) === String(module.id));
        const cleanLesson = (cleanModule?.lessons || []).find((item: any) => String(item.id) === String(lesson.id));
        const cleanTopic = (cleanLesson?.topics || []).find((item: any) => String(item.id) === String(topic.id));
        const payload = mapTopicToUpdatePayload(topic, index + 1);
        const cleanPayload = cleanTopic ? mapTopicToUpdatePayload(cleanTopic, index + 1) : null;

        return JSON.stringify(payload) === JSON.stringify(cleanPayload)
          ? []
          : [{ moduleId: module.id, lessonId: lesson.id, topicId: topic.id, payload }];
      })
    )
  );
}

function modulesChangedOutsideLessons(course: any, cleanCourse: any) {
  const withoutLessonsAndTopics = (modules: any[]) =>
    modules.map(({ lessons, ...module }: any) => ({
      ...module,
      lessons: lessons?.map(({ topics, ...lesson }: any) => lesson) || [],
    }));
  return JSON.stringify(withoutLessonsAndTopics(course.modules || [])) !== JSON.stringify(withoutLessonsAndTopics(cleanCourse?.modules || []));
}

export default function CourseCreationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const isComponentMountedRef = useRef(true);

  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingNavigationKind, setPendingNavigationKind] = useState<"save" | "discard" | "cancel" | null>(null);

  const {
    course,
    cleanCourse,
    activeModuleId,
    activeLessonId,
    activeTopicId,
    activeQuizId,
    activeAssignmentId,
    isSidebarCollapsed,
    setSidebarCollapsed,
    lastSavedCourseJson,
    setLastSavedCourseJson,
    pendingNavigation,
    setPendingNavigation,
  } = useCourseStore();

  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const updateModuleMutation = useUpdateModule();
  const updateLessonMutation = useUpdateLesson();
  const updateTopicMutation = useUpdateTopic();
  const { setOpen: setAdminSidebarOpen } = useSidebar();

  const activeModule = activeModuleId ? course.modules.find(m => String(m.id) === String(activeModuleId)) : undefined;
  const activeLesson = activeLessonId && activeModule ? activeModule.lessons.find(l => String(l.id) === String(activeLessonId)) : undefined;
  const activeTopic = activeTopicId && activeLesson ? activeLesson.topics.find(t => String(t.id) === String(activeTopicId)) : undefined;

  let activeQuiz: StoreQuiz | undefined = undefined;
  if (activeQuizId) {
    if (activeLesson) {
      activeQuiz = activeLesson.quizzes?.find(q => String(q.id) === String(activeQuizId));
    } else if (activeModule) {
      activeQuiz = activeModule.quizzes?.find(q => String(q.id) === String(activeQuizId));
    } else {
      activeQuiz = course.quizzes?.find(q => String(q.id) === String(activeQuizId));
    }
  }

  let activeAssignment: StoreAssignment | undefined = undefined;
  if (activeAssignmentId) {
    if (activeLesson) {
      activeAssignment = activeLesson.assignments?.find(a => String(a.id) === String(activeAssignmentId));
    } else if (activeModule) {
      activeAssignment = activeModule.assignments?.find(a => String(a.id) === String(activeAssignmentId));
    } else {
      activeAssignment = course.assignments?.find(a => String(a.id) === String(activeAssignmentId));
    }
  }

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
    type: "module" | "lesson" | "topic" | "quiz" | "assignment" | "back" | "route",
    target: string,
    activeStates?: {
      activeModuleId?: string | null;
      activeLessonId?: string | null;
      activeTopicId?: string | null;
      activeQuizId?: string | null;
      activeAssignmentId?: string | null;
    }
  ) => {
    if (!hasUnsavedChanges()) {
      if (activeStates) {
        useCourseStore.setState(activeStates);
      }
      router.push(target);
      return;
    }

    setPendingNavigation({
      type,
      targetUrl: target,
      activeModuleId: activeStates?.activeModuleId !== undefined ? activeStates.activeModuleId : useCourseStore.getState().activeModuleId,
      activeLessonId: activeStates?.activeLessonId !== undefined ? activeStates.activeLessonId : useCourseStore.getState().activeLessonId,
      activeTopicId: activeStates?.activeTopicId !== undefined ? activeStates.activeTopicId : useCourseStore.getState().activeTopicId,
      activeQuizId: activeStates?.activeQuizId !== undefined ? activeStates.activeQuizId : useCourseStore.getState().activeQuizId,
      activeAssignmentId: activeStates?.activeAssignmentId !== undefined ? activeStates.activeAssignmentId : useCourseStore.getState().activeAssignmentId,
    });
  };

  const handleDirtyGuardSave = async () => {
    try {
      setPendingNavigationKind("save");
      const success = await handleSave("draft");
      if (!success) return;

      const currentPending = useCourseStore.getState().pendingNavigation;
      if (currentPending?.action) {
        await currentPending.action();
      } else if (currentPending?.targetUrl) {
        const activeStates: Record<string, any> = {};
        if (currentPending.activeModuleId !== undefined) activeStates.activeModuleId = currentPending.activeModuleId;
        if (currentPending.activeLessonId !== undefined) activeStates.activeLessonId = currentPending.activeLessonId;
        if (currentPending.activeTopicId !== undefined) activeStates.activeTopicId = currentPending.activeTopicId;
        if (currentPending.activeQuizId !== undefined) activeStates.activeQuizId = currentPending.activeQuizId;
        if (currentPending.activeAssignmentId !== undefined) activeStates.activeAssignmentId = currentPending.activeAssignmentId;
        
        if (Object.keys(activeStates).length > 0) {
          useCourseStore.setState(activeStates);
        }
        router.push(currentPending.targetUrl);
      }
    } finally {
      setPendingNavigation(null);
      setPendingNavigationKind(null);
    }
  };

  const handleDirtyGuardDiscard = () => {
    const currentPending = useCourseStore.getState().pendingNavigation;
    const currentCourse = useCourseStore.getState().course;
    const resetCourseState = JSON.parse(JSON.stringify(cleanCourse || currentCourse));
    
    const activeStates: Record<string, any> = {
      course: resetCourseState,
      cleanCourse: resetCourseState,
      deletedModules: [],
      deletedLessons: [],
      deletedTopics: [],
    };
    
    if (currentPending) {
      if (currentPending.activeModuleId !== undefined) activeStates.activeModuleId = currentPending.activeModuleId;
      if (currentPending.activeLessonId !== undefined) activeStates.activeLessonId = currentPending.activeLessonId;
      if (currentPending.activeTopicId !== undefined) activeStates.activeTopicId = currentPending.activeTopicId;
      if (currentPending.activeQuizId !== undefined) activeStates.activeQuizId = currentPending.activeQuizId;
      if (currentPending.activeAssignmentId !== undefined) activeStates.activeAssignmentId = currentPending.activeAssignmentId;
    }
    
    useCourseStore.setState(activeStates);
    useCourseStore.setState({
      lastSavedCourseJson: JSON.stringify(useCourseStore.getState().course)
    });
    
    if (currentPending?.action) {
      currentPending.action();
    } else if (currentPending?.targetUrl) {
      router.push(currentPending.targetUrl);
    }
    setPendingNavigation(null);
    setPendingNavigationKind(null);
  };

  const handleDirtyGuardCancel = () => {
    setPendingNavigation(null);
    setPendingNavigationKind(null);
  };

  const handleSave = async (status: "draft" | "published"): Promise<boolean> => {
    if (isSaving) return false;

    const currentCourse = useCourseStore.getState().course;

    // Publish/Draft validation
    if (!currentCourse.title || currentCourse.title.trim().length < 3) {
      toast.error("Course title must be at least 3 characters long.");
      return false;
    }

    if (isComponentMountedRef.current) setIsSaving(true);

    try {
      const backendStatus = status === "published" ? "active" : "draft";

      if (currentCourse.id) {
        // Edit mode: Calculate fields to update (metadata & modules)
        const updatePayload: Record<string, any> = {};
        if (currentCourse.title !== cleanCourse?.title) updatePayload.name = currentCourse.title;
        if (currentCourse.description !== cleanCourse?.description) updatePayload.description = currentCourse.description;
        if (currentCourse.thumbnail_url !== cleanCourse?.thumbnail_url) updatePayload.thumbnail_url = currentCourse.thumbnail_url;

        const initialStatusMapped = (cleanCourse?.status === "active" || cleanCourse?.status === "published") ? "active" : "draft";
        if (backendStatus !== initialStatusMapped) {
          updatePayload.status = backendStatus;
        }

        const deletedModules = useCourseStore.getState().deletedModules;
        const deletedLessons = useCourseStore.getState().deletedLessons;
        const deletedTopics = useCourseStore.getState().deletedTopics;

        const changedModules = getChangedModules(currentCourse, cleanCourse);
        const changedLessons = getChangedLessons(currentCourse, cleanCourse);
        const changedTopics = getChangedTopics(currentCourse, cleanCourse);
        if (Object.keys(updatePayload).length > 0) {
          await updateMutation.mutateAsync({ id: currentCourse.id, data: updatePayload });
        }

        // Save Draft/Publish must persist the editor currently being worked on.
        // Module updates use their own PUT endpoint; course PUT does not replace it.
        for (const changedModule of changedModules) {
          const response = await updateModuleMutation.mutateAsync({
            id: changedModule.moduleId,
            courseId: currentCourse.id,
            data: changedModule.payload,
          });
          const savedModule = { ...changedModule.payload, ...(response.data || response) };
          useCourseStore.getState().hydrateModuleFromDetail(String(changedModule.moduleId), savedModule);
        }

        for (const changedLesson of changedLessons) {
          const response = await updateLessonMutation.mutateAsync({
            id: changedLesson.lessonId,
            courseId: currentCourse.id,
            data: changedLesson.payload,
          });
          const savedLesson = { ...changedLesson.payload, ...(response.data || response) };
          useCourseStore.getState().hydrateLessonFromDetail(
            String(changedLesson.moduleId),
            String(changedLesson.lessonId),
            savedLesson,
          );
        }

        for (const changedTopic of changedTopics) {
          const response = await updateTopicMutation.mutateAsync({
            id: changedTopic.topicId,
            courseId: currentCourse.id,
            data: changedTopic.payload,
          });
          const savedTopic = { ...changedTopic.payload, ...(response.data || response) };
          useCourseStore.getState().hydrateTopicFromDetail(
            String(changedTopic.moduleId),
            String(changedTopic.lessonId),
            String(changedTopic.topicId),
            savedTopic,
          );
        }

        if (Object.keys(updatePayload).length > 0 || changedModules.length > 0 || changedLessons.length > 0 || changedTopics.length > 0) {
          useCourseStore.getState().clearDeletedItems();
          toast.success(status === "published" ? "Course published!" : "Draft saved.");
        } else {
          toast.info("No changes to save.");
        }
      } else {
        // Create mode
        const rawFaId = (currentCourse as any).final_assessment_id || (currentCourse as any).finalAssessment?.id || (currentCourse as any).final_assessment?.id;
        const faIdNum = rawFaId ? Number(rawFaId) : null;

        const payload: Record<string, any> = {
          name: currentCourse.title,
          description: currentCourse.description || "",
          thumbnail_url: currentCourse.thumbnail_url || "",
          status: backendStatus,
          modules: []
        };
        if (faIdNum !== null && !isNaN(faIdNum)) {
          payload.final_assessment_id = faIdNum;
        }
        if (currentCourse.tags && currentCourse.tags.length > 0) {
          payload.tags = currentCourse.tags;
        }
        if (currentCourse.domain) {
          payload.domain = currentCourse.domain;
        }
        const response = await createMutation.mutateAsync(payload);
        const newId = response.data?.id || response.id;
        toast.success("Course created successfully!");
        router.push(`/admin/courses/edit/${newId}`);
      }

      setLastSavedCourseJson(JSON.stringify(useCourseStore.getState().course));
      useCourseStore.getState().clearDeletedItems();
      
      if (status === "published") {
        router.push("/admin/courses");
      }
      return true;
    } catch (err: any) {
      toastApiError(err, "Failed to save course");
      return false;
    } finally {
      if (isComponentMountedRef.current) setIsSaving(false);
    }
  };

  const handleBack = () => {
    confirmNavigation("back", "/admin/courses");
  };

  // Mount effect
  useEffect(() => {
    setMounted(true);
    isComponentMountedRef.current = true;
    setAdminSidebarOpen(false);
    return () => {
      isComponentMountedRef.current = false;
    };
  }, [setAdminSidebarOpen]);

  const initialBaselineSetRef = useRef<string | null>(null);

  // Synchronize route and active state
  useEffect(() => {
    if (!mounted) return;
    
    // Sync active item types with the visible editor route to align tree highlighting
    if (pathname.endsWith("/module")) {
      useCourseStore.setState({
        activeLessonId: null,
        activeTopicId: null,
        activeQuizId: null,
        activeAssignmentId: null
      });
    } else if (pathname.endsWith("/lesson")) {
      useCourseStore.setState({
        activeTopicId: null,
        activeQuizId: null,
        activeAssignmentId: null
      });
    } else if (pathname.endsWith("/topic")) {
      useCourseStore.setState({
        activeQuizId: null,
        activeAssignmentId: null
      });
    } else if (pathname.endsWith("/quiz")) {
      useCourseStore.setState({
        activeTopicId: null,
        activeAssignmentId: null
      });
    } else if (pathname.endsWith("/assignment")) {
      useCourseStore.setState({
        activeTopicId: null,
        activeQuizId: null
      });
    }
  }, [pathname, mounted]);

  // Sync the initial saved JSON baseline once per mount/course initialization
  useEffect(() => {
    if (!mounted) return;
    const currentId = id ? String(id) : "create";
    if (initialBaselineSetRef.current !== currentId) {
      initialBaselineSetRef.current = currentId;
      const storeState = useCourseStore.getState();
      if (!storeState.lastSavedCourseJson) {
        storeState.setLastSavedCourseJson(JSON.stringify(storeState.course));
      }
    }
  }, [mounted, id, setLastSavedCourseJson]);

  // Protect browser navigation/reloads as well as in-app saves. The editor keeps
  // its draft locally, but a user should never lose an unsaved backend change
  // without a warning.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  // hasUnsavedChanges intentionally reads the current Zustand state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isRootLevel = pathname === "/admin/courses/create" || /^\/admin\/courses\/edit\/[^/]+$/.test(pathname);
  const builderBasePath = course.id ? `/admin/courses/edit/${course.id}` : "/admin/courses/create";

  const handleBreadcrumbNavigate = (target: string) => {
    confirmNavigation("route", target);
  };

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
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Sidebar Toggle — hidden on root config page */}
          {!isRootLevel && (
            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest leading-none">
            {isRootLevel ? (
              <span className="text-slate-800">Course</span>
            ) : (
              <button type="button" onClick={() => handleBreadcrumbNavigate(builderBasePath)} className="text-slate-400 hover:text-blue-600 transition-colors truncate max-w-[80px] sm:max-w-[120px] md:max-w-[140px] text-left" title="Course">Course</button>
            )}

            {!isRootLevel && activeModuleId && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                {activeLessonId || activeTopicId || activeQuizId || activeAssignmentId ? (
                  <button type="button" onClick={() => handleBreadcrumbNavigate(`${builderBasePath}/module`)} className="text-slate-400 hover:text-blue-600 transition-colors truncate max-w-[80px] sm:max-w-[120px] md:max-w-[140px] text-left" title={activeModule?.title || "Module"}>
                    {activeModule?.title || "Module"}
                  </button>
                ) : (
                  <span className="text-slate-800 truncate max-w-[300px] sm:max-w-[400px] text-left" title={activeModule?.title || "New Module"}>{activeModule?.title || "New Module"}</span>
                )}
              </>
            )}

            {activeLessonId && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                {activeTopicId || (activeQuizId && activeLessonId) || (activeAssignmentId && activeLessonId) ? (
                  <button type="button" onClick={() => handleBreadcrumbNavigate(`${builderBasePath}/lesson`)} className="text-slate-400 hover:text-blue-600 transition-colors truncate max-w-[80px] sm:max-w-[120px] md:max-w-[140px] text-left" title={activeLesson?.title || "Lesson"}>
                    {activeLesson?.title || "Lesson"}
                  </button>
                ) : (
                  <span className="text-slate-800 truncate max-w-[300px] sm:max-w-[400px] text-left" title={activeLesson?.title || "New Lesson"}>{activeLesson?.title || "New Lesson"}</span>
                )}
              </>
            )}

            {activeTopicId && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="text-slate-800 truncate max-w-[300px] sm:max-w-[400px] text-left" title={activeTopic?.title || "New Topic"}>{activeTopic?.title || "New Topic"}</span>
              </>
            )}

            {activeQuizId && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="text-slate-800 truncate max-w-[300px] sm:max-w-[400px] text-left" title={activeQuiz?.title || "New Quiz"}>{activeQuiz?.title || "New Quiz"}</span>
              </>
            )}

            {activeAssignmentId && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="text-slate-800 truncate max-w-[300px] sm:max-w-[400px] text-left" title={activeAssignment?.title || "New Assignment"}>{activeAssignment?.title || "New Assignment"}</span>
              </>
            )}
          </div>
        </div>

        {/* CENTRALIZED ACTIONS */}
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleBack}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold shadow-xs hover:bg-slate-50 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {(!isRootLevel || course.id) && (
            <button
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-all text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[110px]"
            >
              Save as Draft
            </button>
          )}
          {(!isRootLevel || course.id) && (
            <button
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="px-8 py-2 rounded-lg bg-green-600 text-white font-bold shadow-md hover:bg-green-700 transition-all text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
            >
              {isSaving ? "Saving..." : "Publish"}
            </button>
          )}
        </div>
      </div>

      {pendingNavigation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">You have unsaved changes.</h3>
                <p className="mt-2 text-sm text-slate-600">Save your changes before continuing?</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleDirtyGuardCancel}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDirtyGuardDiscard}
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-750 hover:bg-rose-100 transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleDirtyGuardSave}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BODY: SIDEBAR + CHILDREN */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar hidden on root Course Configuration page */}
        {!isRootLevel && (
          <CourseSidebar isCollapsed={isSidebarCollapsed} onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)} />
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
