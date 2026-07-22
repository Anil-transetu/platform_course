"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCourseStore, Quiz as StoreQuiz, Assignment as StoreAssignment } from "@/store/useCourseStore";
import CourseSidebar from "@/components/admin/courses/CourseSidebar";
import { toast } from "sonner";
import { useCreateCourse, useUpdateCourse, useUpdateModule, useUpdateLesson, useUpdateTopic, useCreateModule, useCreateLesson, useCreateTopic } from "@/features/admin/courses/api/course-api";
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
    const moduleQuizzes = getNormalizedIds(m.quizzes);
    
    const modulePayload: Record<string, any> = {
      name: m.title || m.name || `Module ${mIndex + 1}`,
      description: m.description || "",
      order_num: mIndex + 1,
      assignment_ids: getNormalizedIds(m.assignments),
      quizzes: moduleQuizzes,
      quiz_ids: moduleQuizzes,
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
        const lessonQuizzes = getNormalizedIds(l.quizzes);
        
        const lessonPayload: Record<string, any> = {
          name: l.title || l.name || `Lesson ${lIndex + 1}`,
          content_text: l.content || l.content_text || "",
          text: l.content || l.text || "",
          type: l.type || "text",
          order_num: lIndex + 1,
          assignment_ids: getNormalizedIds(l.assignments),
          quizzes: lessonQuizzes,
          quiz_ids: lessonQuizzes,
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
  const quizIds = getNormalizedIds(module.quizzes);
  return {
    name: module.title || module.name || `Module ${orderNum}`,
    description: module.description || module.content_text || "",
    order_num: module.order_num ?? orderNum,
    assignment_ids: getNormalizedIds(module.assignments),
    quizzes: quizIds,
    quiz_ids: quizIds,
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
  const quizIds = getNormalizedIds(lesson.quizzes);
  return {
    name: lesson.title || lesson.name || `Lesson ${orderNum}`,
    content_text: lesson.content || lesson.content_text || "",
    text: lesson.content || lesson.text || "",
    type: lesson.type || "text",
    order_num: lesson.order_num ?? orderNum,
    duration_minutes: lesson.duration_minutes,
    quizzes: quizIds,
    quiz_ids: quizIds,
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
  const isSavingRef = useRef(false);

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
  const createModuleMutation = useCreateModule();
  const createLessonMutation = useCreateLesson();
  const createTopicMutation = useCreateTopic();
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

  const getBreadcrumbTitle = (type: 'module' | 'lesson' | 'topic' | 'quiz' | 'assignment', item: any) => {
    if (!item) return '';
    const itemId = String(item.id);
    if (itemId.startsWith('temp-')) {
      return item.title || item.name || '';
    }
    if (type === 'module') {
      const cleanMod = cleanCourse?.modules?.find((m: any) => String(m.id) === itemId) as any;
      return cleanMod?.title || cleanMod?.name || item.title || item.name || '';
    }
    if (type === 'lesson') {
      const cleanMod = cleanCourse?.modules?.find((m: any) => String(m.id) === String(activeModuleId)) as any;
      const cleanLes = cleanMod?.lessons?.find((l: any) => String(l.id) === itemId) as any;
      return cleanLes?.title || cleanLes?.name || item.title || item.name || '';
    }
    if (type === 'topic') {
      const cleanMod = cleanCourse?.modules?.find((m: any) => String(m.id) === String(activeModuleId)) as any;
      const cleanLes = cleanMod?.lessons?.find((l: any) => String(l.id) === String(activeLessonId)) as any;
      const cleanTop = cleanLes?.topics?.find((t: any) => String(t.id) === itemId) as any;
      return cleanTop?.title || cleanTop?.name || item.title || item.name || '';
    }
    return item.title || item.name || '';
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

    // Session validation before attempting API save
    let tokenExists = false;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(^| )token=([^;]+)/);
      if (match && match[2]) {
        headers["Authorization"] = `Bearer ${match[2]}`;
        tokenExists = true;
      }
    }

    if (!tokenExists) {
      if (!isSilent) {
        toast.error("Your session has expired. Redirecting to login...");
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }
      }
      isSavingRef.current = false;
      if (isComponentMountedRef.current) {
        setIsSaving(false);
      }
      return;
    }

    let toastId: string | number | undefined = undefined;
    if (!isSilent) {
      toastId = toast.loading(
        status === "published" 
          ? "Publishing course structure hierarchically..." 
          : "Saving course structure hierarchically..."
      );
    }

    try {
      let courseId = currentCourse.id;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^| )token=([^;]+)/);
        if (match) {
          headers["Authorization"] = `Bearer ${match[2]}`;
        }
      }

      const secureFetch = async (url: string, options: RequestInit = {}) => {
        const res = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });
        if (!res.ok) {
          let messageStr = "";
          const errData = await res.json().catch(() => null);
          
          if (errData) {
            if (errData.errors) {
              if (Array.isArray(errData.errors)) {
                messageStr = errData.errors.map((e: unknown) => typeof e === 'string' ? e : (e && typeof e === 'object' && 'message' in e ? String((e as { message?: string }).message) : JSON.stringify(e))).join(", ");
              } else if (typeof errData.errors === "object") {
                messageStr = Object.values(errData.errors).flat().map((e: unknown) => typeof e === 'string' ? e : (e && typeof e === 'object' && 'message' in e ? String((e as { message?: string }).message) : JSON.stringify(e))).join(", ");
              } else {
                messageStr = String(errData.errors);
              }
            } else if (Array.isArray(errData.message)) {
              messageStr = errData.message.join(", ");
            } else if (errData.message) {
              messageStr = errData.message;
            } else if (errData.error) {
              messageStr = errData.error;
            } else if (errData.detail) {
              messageStr = errData.detail;
            }
          }

          if (!messageStr) {
            if (res.status === 400) messageStr = "Validation or bad request error.";
            else if (res.status === 401) messageStr = "Token expired";
            else if (res.status === 403) messageStr = "Access denied. You do not have permission to perform this action.";
            else if (res.status === 404) messageStr = "The requested resource was not found on the server.";
            else if (res.status === 500) messageStr = "Internal Server Error. Please contact support or try again later.";
            else messageStr = `API request failed with status ${res.status}`;
          }

          if (res.status === 401 || messageStr.toLowerCase().includes("token expired")) {
            throw new Error("Token expired");
          }
          throw new Error(messageStr);
        }
        return res;
      };

      // Process deleted items
      const { deletedModules, deletedLessons, deletedTopics, clearDeletedItems } = useCourseStore.getState();
      
      for (const mId of deletedModules) {
        if (!mId.startsWith('temp-')) {
          await secureFetch(`/api/v1/modules/${mId}`, { method: 'DELETE' }).catch(e => console.warn('Failed to delete module', e));
        }
      }
      for (const lId of deletedLessons) {
        if (!lId.startsWith('temp-')) {
          await secureFetch(`/api/v1/lessons/${lId}`, { method: 'DELETE' }).catch(e => console.warn('Failed to delete UI lesson', e));
        }
      }
      for (const tId of deletedTopics) {
        if (!tId.startsWith('temp-')) {
          await secureFetch(`/api/v1/topics/${tId}`, { method: 'DELETE' }).catch(e => console.warn('Failed to delete UI topic', e));
        }
      }
      
      clearDeletedItems();

      // Fetch all quizzes and assignments to build title-to-ID lookup maps
      let quizzesList: QuizLookupItem[] | null = quizzesCacheRef.current;
      if (!quizzesList) {
        try {
          const quizzesRes = await secureFetch("/api/v1/quizzes");
          const quizzesJson = await quizzesRes.json();
          quizzesList = quizzesJson.data || quizzesJson || [];
          quizzesCacheRef.current = quizzesList;
        } catch (err) {
          const error = err as Error;
          if (error.message === "Token expired") throw error;
          console.warn("Failed to fetch quizzes list, fallback to empty", error);
          quizzesList = [];
        }
      }

      const quizTitleToIdMap = new Map<string, number>();
      if (Array.isArray(quizzesList)) {
        for (const q of quizzesList) {
          const title = q.quiz_title || q.title || "";
          if (title && q.id) {
            quizTitleToIdMap.set(title.trim().toLowerCase(), Number(q.id));
          }
        }
      }

      let assignmentsList: AssignmentLookupItem[] | null = assignmentsCacheRef.current;
      if (!assignmentsList) {
        try {
          const assignmentsRes = await secureFetch("/api/v1/assignments");
          const assignmentsJson = await assignmentsRes.json();
          assignmentsList = assignmentsJson.data || assignmentsJson || [];
          assignmentsCacheRef.current = assignmentsList;
        } catch (err) {
          const error = err as Error;
          if (error.message === "Token expired") throw error;
          console.warn("Failed to fetch assignments list, fallback to empty", error);
          assignmentsList = [];
        }
      }

      const assignmentTitleToIdMap = new Map<string, number>();
      if (Array.isArray(assignmentsList)) {
        for (const a of assignmentsList) {
          const title = a.assignment_name || a.title || "";
          const aId = a.assignment_id || a.id;
          if (title && aId) {
            assignmentTitleToIdMap.set(title.trim().toLowerCase(), Number(aId));
          }
        }
      }

      const getQuizId = (quiz: { id: string | number; title?: string }) => {
        if (!isNaN(Number(quiz.id))) return Number(quiz.id);
        const titleKey = (quiz.title || "").trim().toLowerCase();
        return quizTitleToIdMap.get(titleKey) || null;
      };

      const getAssignmentId = (assignment: { id: string | number; title?: string }) => {
        if (!isNaN(Number(assignment.id))) return Number(assignment.id);
        const titleKey = (assignment.title || "").trim().toLowerCase();
        return assignmentTitleToIdMap.get(titleKey) || null;
      };

      const courseQuizzes = (currentCourse.quizzes || [])
        .map(getQuizId)
        .filter((id): id is number => id !== null);
      const courseAssignments = (currentCourse.assignments || [])
        .map(getAssignmentId)
        .filter((id): id is number => id !== null);

      let isNewCourse = !courseId || String(courseId).startsWith("temp-");

      const backendStatus = status === "published" ? "active" : "draft";

      const updatedCourse = JSON.parse(JSON.stringify(currentCourse));
      let newActiveModuleId = useCourseStore.getState().activeModuleId;
      let newActiveLessonId = useCourseStore.getState().activeLessonId;
      let newActiveTopicId = useCourseStore.getState().activeTopicId;



      // 1. Create or Update Course
      if (!courseId || String(courseId).startsWith("temp-")) {
        const res = await secureFetch("/api/v1/courses", {
          method: "POST",
          body: JSON.stringify(cleanPayload({
            name: currentCourse.title,
            description: currentCourse.description || "Platform Course",
            thumbnail_url: currentCourse.thumbnail_url || undefined,
            tags: currentCourse.tags ? currentCourse.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
            quizzes: courseQuizzes,
            assignments: courseAssignments,
          })),
        });
        const json = await res.json();
        const courseData = json.data || json;
        courseId = courseData?.id;
        const placeholderAssignmentId = courseData?.assignments?.[0]?.id || courseData?.assignments?.[0]?.assignment_id;

        updatedCourse.id = courseId;
        isNewCourse = false;

        // Immediately update store ID to prevent concurrent triggers from seeing a temp ID
        useCourseStore.setState((state) => ({
          course: {
            ...state.course,
            id: courseId,
          }
        }));
        // Reset baseline reference to prevent exit cleanup autosave duplicates
        lastSavedCourseJsonRef.current = JSON.stringify(useCourseStore.getState().course);
        lastSavedPayloadsRef.current.set(`course-${courseId}`, payloadStr);

        // Link the selected assignment if there is one
        if (courseId && courseAssignments.length > 0) {
          for (const aId of courseAssignments) {
            await secureFetch(`/api/v1/assignments/${aId}`, {
              method: "PUT",
              body: JSON.stringify({ course_id: Number(courseId) }),
            }).catch(e => console.warn(`Failed to link assignment ${aId} to course`, e));
          }
          
          // Delete the placeholder assignment
          if (placeholderAssignmentId) {
            await secureFetch(`/api/v1/assignments/${placeholderAssignmentId}`, {
              method: "DELETE",
            }).catch(e => console.warn(`Failed to delete placeholder assignment ${placeholderAssignmentId}`, e));
          }
        } else if (courseId && placeholderAssignmentId) {
          // If no selected assignment, update store to keep placeholder assignment as final assignment
          updatedCourse.assignments = [{
            id: String(placeholderAssignmentId),
            title: placeholderAssignment.title
          }];
        }

        // Update search parameter in window URL using Next.js router
        if (courseId) {
          const url = new URL(window.location.href);
          if (url.searchParams.get("id") !== String(courseId)) {
            url.searchParams.set("id", String(courseId));
            router.replace(url.pathname + url.search, { scroll: false });
          }
        }

        if (backendStatus === "active") {
          await secureFetch(`/api/v1/courses/${courseId}`, {
            method: "PUT",
            body: JSON.stringify(cleanPayload({
              name: currentCourse.title,
              description: currentCourse.description || "Platform Course",
              thumbnail_url: currentCourse.thumbnail_url || undefined,
              status: "active",
              tags: currentCourse.tags ? currentCourse.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
              quizzes: courseQuizzes,
              assignments: courseAssignments,
            })),
          });
          lastSavedPayloadsRef.current.set(`course-${courseId}`, activePayloadStr);
        }
      } else {
        await secureFetch(`/api/v1/courses/${courseId}`, {
          method: "PUT",
          body: JSON.stringify(cleanPayload({
            name: currentCourse.title,
            description: currentCourse.description || "Platform Course",
            thumbnail_url: currentCourse.thumbnail_url || undefined,
            status: backendStatus,
            tags: currentCourse.tags ? currentCourse.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
            quizzes: courseQuizzes,
            assignments: courseAssignments,
          })),
        });
      }

      // 2. Modules Loop
      for (let mIdx = 0; mIdx < currentCourse.modules.length; mIdx++) {
        const m = currentCourse.modules[mIdx];
        const isNewModule = String(m.id).startsWith("temp-");
        let moduleId = m.id;

        const mQuizzes = (m.quizzes || [])
          .map(getQuizId)
          .filter((id): id is number => id !== null);
        const mAssignments = (m.assignments || [])
          .map(getAssignmentId)
          .filter((id): id is number => id !== null);

        if (isNewModule) {
          const payload = cleanPayload({
            name: m.title || `Module ${mIdx + 1}`,
            description: m.description || "",
            order_num: mIdx + 1,
            quizzes: mQuizzes,
            assignments: mAssignments,
          });
          const payloadStr = JSON.stringify(payload);
          

          
          const res = await secureFetch(`/api/v1/courses/${courseId}/modules`, {
            method: "POST",
            body: payloadStr,
          });
          const json = await res.json();
          moduleId = String(json.data?.id || json.id);
          
          const targetModule = updatedCourse.modules.find((mod: StoreModule) => String(mod.id) === String(m.id));
          if (targetModule) {
            targetModule.id = moduleId;
          }
          
          lastSavedPayloadsRef.current.set(`module-${moduleId}`, payloadStr);
          if (m.id === newActiveModuleId) {
            newActiveModuleId = moduleId;
          }
        } else {
          const payload = cleanPayload({
            name: m.title || `Module ${mIdx + 1}`,
            description: m.description || "",
            order_num: mIdx + 1,
            quizzes: mQuizzes,
            assignments: mAssignments,
          });
          const payloadStr = JSON.stringify(payload);
          
          if (lastSavedPayloadsRef.current.get(`module-${moduleId}`) !== payloadStr) {

            
            await secureFetch(`/api/v1/modules/${moduleId}`, {
              method: "PUT",
              body: payloadStr,
            });
            lastSavedPayloadsRef.current.set(`module-${moduleId}`, payloadStr);
          }
        }
               // 3. Lessons (UI Lessons) Loop
        for (let lIdx = 0; lIdx < m.lessons.length; lIdx++) {
          const l = m.lessons[lIdx];
          const isNewLesson = String(l.id).startsWith("temp-");
          let lessonId = l.id;

          const order = l.order || [];
          const quizOrderMap = new Map(order.filter(o => o.type === 'quiz').map((o, idx) => [o.id, idx]));
          const sortedQuizzes = [...(l.quizzes || [])].sort((a, b) => {
            const idxA = quizOrderMap.has(a.id) ? quizOrderMap.get(a.id)! : 999;
            const idxB = quizOrderMap.has(b.id) ? quizOrderMap.get(b.id)! : 999;
            return idxA - idxB;
          });
          const lQuizzes = sortedQuizzes.map(getQuizId).filter((id): id is number => id !== null);

          const assignmentOrderMap = new Map(order.filter(o => o.type === 'assignment').map((o, idx) => [o.id, idx]));
          const sortedAssignments = [...(l.assignments || [])].sort((a, b) => {
            const idxA = assignmentOrderMap.has(a.id) ? assignmentOrderMap.get(a.id)! : 999;
            const idxB = assignmentOrderMap.has(b.id) ? assignmentOrderMap.get(b.id)! : 999;
            return idxA - idxB;
          });
          const lAssignments = sortedAssignments.map(getAssignmentId).filter((id): id is number => id !== null);

          const topicOrderMap = new Map(order.filter(o => o.type === 'topic').map((o, idx) => [o.id, idx]));
          const sortedTopics = [...(l.topics || [])].sort((a, b) => {
            const idxA = topicOrderMap.has(a.id) ? topicOrderMap.get(a.id)! : 999;
            const idxB = topicOrderMap.has(b.id) ? topicOrderMap.get(b.id)! : 999;
            return idxA - idxB;
          });

          if (isNewLesson) {
            const payload = cleanPayload({
              module_id: Number(moduleId),
              name: l.title || `Lesson ${lIdx + 1}`,
              type: "text",
              content_text: l.content || "",
              text: l.content || "",
              order_num: lIdx + 1,
              quizzes: lQuizzes,
              assignments: lAssignments,
            });
            const payloadStr = JSON.stringify(payload);
            
            const res = await secureFetch("/api/v1/lessons", {
              method: "POST",
              body: payloadStr,
            });
            const json = await res.json();
            lessonId = String(json.data?.id || json.id);
            
            const targetModule = updatedCourse.modules.find((mod: StoreModule) => String(mod.id) === String(m.id));
            if (targetModule) {
              const targetLesson = targetModule.lessons.find((les: StoreLesson) => String(les.id) === String(l.id));
              if (targetLesson) targetLesson.id = lessonId;
              if (targetModule.order) {
                targetModule.order = targetModule.order.map((o: { type: string; id: string | number }) => 
                  o.id === l.id ? { ...o, id: lessonId } : o
                );
              }
            }
            
            lastSavedPayloadsRef.current.set(`lesson-${lessonId}`, payloadStr);
            if (l.id === newActiveLessonId) newActiveLessonId = lessonId;
          } else {
            const payload = cleanPayload({
              name: l.title || `Lesson ${lIdx + 1}`,
              type: "text",
              content_text: l.content || "",
              text: l.content || "",
              order_num: lIdx + 1,
              quizzes: lQuizzes,
              assignments: lAssignments,
            });
            const payloadStr = JSON.stringify(payload);
            
            if (lastSavedPayloadsRef.current.get(`lesson-${lessonId}`) !== payloadStr) {
              await secureFetch(`/api/v1/lessons/${lessonId}`, {
                method: "PUT",
                body: payloadStr,
              });
              lastSavedPayloadsRef.current.set(`lesson-${lessonId}`, payloadStr);
            }
          }

          // 4. Topics (UI Topics) Loop
          for (let tIdx = 0; tIdx < sortedTopics.length; tIdx++) {
            const t = sortedTopics[tIdx];
            const isNewTopic = String(t.id).startsWith("temp-");
            let topicId = t.id;

            const tQuizzes = (t.quizzes || []).map(getQuizId).filter((id): id is number => id !== null);
            const tAssignments = (t.assignments || []).map(getAssignmentId).filter((id): id is number => id !== null);

            if (isNewTopic) {
              const payload = cleanPayload({
                lesson_id: Number(lessonId),
                name: t.title || `Topic ${tIdx + 1}`,
                content_text: t.content || "",
                text: t.content || "",
                order_num: tIdx + 1,
                quizzes: tQuizzes,
                assignments: tAssignments,
              });
              const payloadStr = JSON.stringify(payload);
              
              const res = await secureFetch("/api/v1/topics", {
                method: "POST",
                body: payloadStr,
              });
              const json = await res.json();
              topicId = String(json.data?.id || json.id);
              
              const targetModule = updatedCourse.modules.find((mod: StoreModule) => String(mod.id) === String(m.id));
              if (targetModule) {
                const targetLesson = targetModule.lessons.find((les: StoreLesson) => String(les.id) === String(l.id));
                if (targetLesson) {
                  const targetTopic = targetLesson.topics.find((top: StoreTopic) => String(top.id) === String(t.id));
                  if (targetTopic) targetTopic.id = topicId;
                  if (targetLesson.order) {
                    targetLesson.order = targetLesson.order.map((o: { type: string; id: string | number }) => 
                      o.id === t.id ? { ...o, id: topicId } : o
                    );
                  }
                }
              }
              
              lastSavedPayloadsRef.current.set(`topic-${topicId}`, payloadStr);
              if (t.id === newActiveTopicId) newActiveTopicId = topicId;
            } else {
              const payload = cleanPayload({
                name: t.title || `Topic ${tIdx + 1}`,
                content_text: t.content || "",
                text: t.content || "",
                order_num: tIdx + 1,
                quizzes: tQuizzes,
                assignments: tAssignments,
              });
              const payloadStr = JSON.stringify(payload);
              
              if (lastSavedPayloadsRef.current.get(`topic-${topicId}`) !== payloadStr) {
                await secureFetch(`/api/v1/topics/${topicId}`, {
                  method: "PUT",
                  body: payloadStr,
                });
                lastSavedPayloadsRef.current.set(`topic-${topicId}`, payloadStr);
              }
            }
          }
        }
      }

      // Update the Zustand store with final saved details and backend-generated IDs
      useCourseStore.setState((state) => ({
        course: {
          ...state.course,
          id: courseId,
          modules: updatedCourse.modules,
          assignments: updatedCourse.assignments || state.course.assignments,
        },
        activeModuleId: newActiveModuleId,
        activeLessonId: newActiveLessonId,
        activeTopicId: newActiveTopicId,
      }));

      // Reset baseline reference to prevent exit cleanup autosave duplicates
      lastSavedCourseJsonRef.current = JSON.stringify(useCourseStore.getState().course);

      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courseStats"] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      queryClient.invalidateQueries({ queryKey: ["domain"] });
      queryClient.invalidateQueries({ queryKey: ["domainStats"] });

      if (!isSilent) {
        toast.success(
          status === "published" 
            ? "Course published successfully!" 
            : "Course saved successfully!",
          { id: toastId }
        );
        router.push("/admin/courses");
      }
      return true;
    } catch (err: any) {
      toastApiError(err, "Failed to save course");
      return false;
    } finally {
      isSavingRef.current = false;
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
  }, [mounted]);

  // Save active selection state to sessionStorage
  useEffect(() => {
    if (!mounted) return;
    const currentId = id ? String(id) : "create";
    const key = `course-active-items-${currentId}`;
    const data = {
      activeModuleId,
      activeLessonId,
      activeTopicId,
      activeQuizId,
      activeAssignmentId
    };
    sessionStorage.setItem(key, JSON.stringify(data));
  }, [mounted, id, activeModuleId, activeLessonId, activeTopicId, activeQuizId, activeAssignmentId]);

  // Restore active selection state from sessionStorage once curriculum is loaded
  useEffect(() => {
    if (!mounted) return;
    
    const storeState = useCourseStore.getState();
    const hasActiveSelection = storeState.activeModuleId || storeState.activeLessonId || storeState.activeTopicId || storeState.activeQuizId || storeState.activeAssignmentId;
    
    const currentId = id ? String(id) : "create";
    const sessionKey = `course-active-items-${currentId}`;
    const stored = sessionStorage.getItem(sessionKey);
    
    if (stored && !hasActiveSelection) {
      try {
        const parsed = JSON.parse(stored);
        const curriculum = storeState.course;

        let validatedModuleId = null;
        let validatedLessonId = null;
        let validatedTopicId = null;
        let validatedQuizId = null;
        let validatedAssignmentId = null;

        if (parsed.activeModuleId) {
          const mod = curriculum.modules?.find((m: any) => String(m.id) === String(parsed.activeModuleId));
          if (mod) {
            validatedModuleId = String(parsed.activeModuleId);
            
            if (parsed.activeLessonId) {
              const les = mod.lessons?.find((l: any) => String(l.id) === String(parsed.activeLessonId));
              if (les) {
                validatedLessonId = String(parsed.activeLessonId);
                
                if (parsed.activeTopicId) {
                  const top = les.topics?.find((t: any) => String(t.id) === String(parsed.activeTopicId));
                  if (top) validatedTopicId = String(parsed.activeTopicId);
                }
                if (parsed.activeQuizId) {
                  const quiz = les.quizzes?.find((q: any) => String(q.id) === String(parsed.activeQuizId));
                  if (quiz) validatedQuizId = String(parsed.activeQuizId);
                }
                if (parsed.activeAssignmentId) {
                  const ass = les.assignments?.find((a: any) => String(a.id) === String(parsed.activeAssignmentId));
                  if (ass) validatedAssignmentId = String(parsed.activeAssignmentId);
                }
              }
            }
            
            if (!validatedLessonId) {
              if (parsed.activeQuizId) {
                const quiz = mod.quizzes?.find((q: any) => String(q.id) === String(parsed.activeQuizId));
                if (quiz) validatedQuizId = String(parsed.activeQuizId);
              }
              if (parsed.activeAssignmentId) {
                const ass = mod.assignments?.find((a: any) => String(a.id) === String(parsed.activeAssignmentId));
                if (ass) validatedAssignmentId = String(parsed.activeAssignmentId);
              }
            }
          }
        }

        if (!validatedModuleId) {
          if (parsed.activeQuizId) {
            const quiz = curriculum.quizzes?.find((q: any) => String(q.id) === String(parsed.activeQuizId));
            if (quiz) validatedQuizId = String(parsed.activeQuizId);
          }
          if (parsed.activeAssignmentId) {
            const ass = curriculum.assignments?.find((a: any) => String(a.id) === String(parsed.activeAssignmentId));
            if (ass) {
              validatedAssignmentId = String(parsed.activeAssignmentId);
            } else {
              const faId = curriculum.final_assessment_id ?? (curriculum.final_assessment as any)?.id;
              if (faId && String(faId) === String(parsed.activeAssignmentId)) {
                validatedAssignmentId = String(parsed.activeAssignmentId);
              }
            }
          }
        }

        useCourseStore.setState({
          activeModuleId: validatedModuleId,
          activeLessonId: validatedLessonId,
          activeTopicId: validatedTopicId,
          activeQuizId: validatedQuizId,
          activeAssignmentId: validatedAssignmentId
        });
      } catch (e) {
        console.error("Failed to restore active selection", e);
      }
    }
  }, [mounted, id, course.modules]);



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
                  <button type="button" onClick={() => handleBreadcrumbNavigate(`${builderBasePath}/module`)} className="text-slate-400 hover:text-blue-600 transition-colors truncate max-w-[80px] sm:max-w-[120px] md:max-w-[140px] text-left" title={getBreadcrumbTitle('module', activeModule) || "Module"}>
                    {getBreadcrumbTitle('module', activeModule) || "Module"}
                  </button>
                ) : (
                  <span className="text-slate-800 truncate max-w-[300px] sm:max-w-[400px] text-left" title={getBreadcrumbTitle('module', activeModule) || "New Module"}>{getBreadcrumbTitle('module', activeModule) || "New Module"}</span>
                )}
              </>
            )}

            {activeLessonId && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                {activeTopicId || (activeQuizId && activeLessonId) || (activeAssignmentId && activeLessonId) ? (
                  <button type="button" onClick={() => handleBreadcrumbNavigate(`${builderBasePath}/lesson`)} className="text-slate-400 hover:text-blue-600 transition-colors truncate max-w-[80px] sm:max-w-[120px] md:max-w-[140px] text-left" title={getBreadcrumbTitle('lesson', activeLesson) || "Lesson"}>
                    {getBreadcrumbTitle('lesson', activeLesson) || "Lesson"}
                  </button>
                ) : (
                  <span className="text-slate-800 truncate max-w-[300px] sm:max-w-[400px] text-left" title={getBreadcrumbTitle('lesson', activeLesson) || "New Lesson"}>{getBreadcrumbTitle('lesson', activeLesson) || "New Lesson"}</span>
                )}
              </>
            )}

            {activeTopicId && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="text-slate-800 truncate max-w-[300px] sm:max-w-[400px] text-left" title={getBreadcrumbTitle('topic', activeTopic) || "New Topic"}>{getBreadcrumbTitle('topic', activeTopic) || "New Topic"}</span>
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