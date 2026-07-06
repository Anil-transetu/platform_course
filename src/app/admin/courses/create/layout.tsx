"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCourseStore, Quiz as StoreQuiz, Assignment as StoreAssignment, Module as StoreModule, Lesson as StoreLesson, Topic as StoreTopic } from "@/store/useCourseStore";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface QuizLookupItem {
  id: string | number;
  quiz_title?: string;
  title?: string;
}

interface AssignmentLookupItem {
  id?: string | number;
  assignment_id?: string | number;
  title?: string;
  assignment_name?: string;
}

export default function CourseCreationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const lastSavedPayloadsRef = useRef<Map<string, string>>(new Map());
  const quizzesCacheRef = useRef<QuizLookupItem[] | null>(null);
  const assignmentsCacheRef = useRef<AssignmentLookupItem[] | null>(null);
  const previousIdRef = useRef<string | null>(null);
  const lastSavedCourseJsonRef = useRef<string | null>(null);
  const isComponentMountedRef = useRef(true);
  const isSavingRef = useRef(false);
  
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    course, 
    activeModuleId, 
    activeLessonId, 
    activeTopicId,
    activeQuizId,
    activeAssignmentId 
  } = useCourseStore();

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

  const cleanPayload = (obj: Record<string, unknown>) => {
    const clean: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val === null || val === undefined) {
        continue;
      }
      // Omit empty arrays for optional fields
      if (Array.isArray(val) && val.length === 0) {
        continue;
      }
      clean[key] = val;
    }
    return clean;
  };

  const hasUnsavedChanges = () => {
    const { course, deletedModules, deletedLessons, deletedTopics } = useCourseStore.getState();
    if (deletedModules.length > 0 || deletedLessons.length > 0 || deletedTopics.length > 0) {
      return true;
    }
    if (!lastSavedCourseJsonRef.current) {
      return !!course.title;
    }
    const currentJson = JSON.stringify(course);
    return currentJson !== lastSavedCourseJsonRef.current;
  };

  const handleSave = async (status: "draft" | "published", isSilent = false) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    if (isComponentMountedRef.current) {
      setIsSaving(true);
    }

    const currentCourse = useCourseStore.getState().course;
    if (!currentCourse.title) {
      if (!isSilent) {
        alert("Please enter a course title first.");
      }
      isSavingRef.current = false;
      if (isComponentMountedRef.current) {
        setIsSaving(false);
      }
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
      if (isNewCourse) {
        // Do NOT send assignments in the course POST body.
        // Course.create uses Sequelize's hasMany nested include which INSERTs new assignment
        // records from whatever is in the array — passing numeric IDs causes
        // "Assignment.title cannot be null" Sequelize model validation errors. Instead, we link
        // assignments separately below via PUT /api/v1/assignments/:id { course_id }.
        // Joi now accepts a missing assignments field (schema changed from .required() to .optional()).
        const coursePayload: Record<string, unknown> = {
          name: currentCourse.title,
          description: currentCourse.description || "Platform Course",
          thumbnail_url: currentCourse.thumbnail_url || undefined,
          tags: currentCourse.tags ? currentCourse.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
          quizzes: courseQuizzes,
        };
        const payload = cleanPayload(coursePayload);
        const payloadStr = JSON.stringify(payload);
        


        const res = await secureFetch("/api/v1/courses", {
          method: "POST",
          body: payloadStr,
        });
        const json = await res.json();
        courseId = json.data?.id || json.id;
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

        // After creating the course, link each selected assignment by updating its course_id.
        // This mirrors how courseModule.service and topic.service link assignments:
        // Assignment.update({ course_id }, { where: { id: assignments } })
        if (courseId && courseAssignments.length > 0) {
          for (const aId of courseAssignments) {
            await secureFetch(`/api/v1/assignments/${aId}`, {
              method: "PUT",
              body: JSON.stringify({ course_id: Number(courseId) }),
            }).catch(e => console.warn(`Failed to link assignment ${aId} to course`, e));
          }
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
          const activeCoursePayload: Record<string, unknown> = {
            name: currentCourse.title,
            description: currentCourse.description || "Platform Course",
            thumbnail_url: currentCourse.thumbnail_url || undefined,
            status: "active",
            tags: currentCourse.tags ? currentCourse.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
            quizzes: courseQuizzes,
          };
          const activePayload = cleanPayload(activeCoursePayload);
          const activePayloadStr = JSON.stringify(activePayload);
          

          
          await secureFetch(`/api/v1/courses/${courseId}`, {
            method: "PUT",
            body: activePayloadStr,
          });
          lastSavedPayloadsRef.current.set(`course-${courseId}`, activePayloadStr);
        }
      } else {
        // For existing courses, also omit assignments from the PUT body (updateCourse service
        // ignores them anyway — it just calls course.update(courseData) on table columns).
        // Link assignments separately via PUT /api/v1/assignments/:id.
        const coursePayload: Record<string, unknown> = {
          name: currentCourse.title,
          description: currentCourse.description || "Platform Course",
          thumbnail_url: currentCourse.thumbnail_url || undefined,
          status: backendStatus,
          tags: currentCourse.tags ? currentCourse.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
          quizzes: courseQuizzes,
        };
        const payload = cleanPayload(coursePayload);
        const payloadStr = JSON.stringify(payload);
        
        if (lastSavedPayloadsRef.current.get(`course-${courseId}`) !== payloadStr) {

          
          await secureFetch(`/api/v1/courses/${courseId}`, {
            method: "PUT",
            body: payloadStr,
          });
          lastSavedPayloadsRef.current.set(`course-${courseId}`, payloadStr);
        }

        // Link course-level assignments by updating each assignment's course_id.
        if (courseId && courseAssignments.length > 0) {
          for (const aId of courseAssignments) {
            await secureFetch(`/api/v1/assignments/${aId}`, {
              method: "PUT",
              body: JSON.stringify({ course_id: Number(courseId) }),
            }).catch(e => console.warn(`Failed to link assignment ${aId} to course`, e));
          }
        }
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
    } catch (err) {
      const error = err as Error;
      console.error(error);
      if (error.message === "Token expired") {
        if (!isSilent) {
          if (toastId) {
            toast.error("Your session has expired. Redirecting to login...", { id: toastId });
          } else {
            toast.error("Your session has expired. Redirecting to login...");
          }
          if (typeof document !== "undefined") {
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "mock_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setTimeout(() => {
              window.location.href = "/login";
            }, 1500);
          }
        }
      } else {
        if (!isSilent) {
          if (toastId) {
            toast.error(error.message || "Failed to save course structure", { id: toastId });
          } else {
            toast.error(error.message || "Failed to save course structure");
          }
        }
      }
    } finally {
      isSavingRef.current = false;
      if (isComponentMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const handleSaveRef = useRef(handleSave);
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

  useEffect(() => {
    handleSaveRef.current = handleSave;
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  });

  // 1. Mount & Exit Save Hook
  useEffect(() => {
    setMounted(true);
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      
      // Trigger save on exit if there are unsaved changes
      const currentCourse = useCourseStore.getState().course;
      if (currentCourse.title) {
        const { deletedModules, deletedLessons, deletedTopics } = useCourseStore.getState();
        const hasChanges = deletedModules.length > 0 || deletedLessons.length > 0 || deletedTopics.length > 0 ||
          (lastSavedCourseJsonRef.current && JSON.stringify(currentCourse) !== lastSavedCourseJsonRef.current);
        
        if (hasChanges) {
          handleSaveRef.current("draft", true);
        }
      }
    };
  }, []);

  // 2. Sync the initial saved JSON ref when course details are loaded/initialized
  useEffect(() => {
    if (!mounted) return;

    if (id) {
      // If we are editing an existing course, wait until it's loaded in the store
      if (course.id && String(course.id) === String(id) && !lastSavedCourseJsonRef.current) {
        lastSavedCourseJsonRef.current = JSON.stringify(course);
      }
    } else {
      // If we are creating a new course, set the initial empty state as the baseline
      if (!lastSavedCourseJsonRef.current) {
        lastSavedCourseJsonRef.current = JSON.stringify(course);
      }
    }
  }, [mounted, id, course]);

  // Reset caches and JSON reference when course ID changes
  useEffect(() => {
    if (id !== previousIdRef.current) {
      lastSavedPayloadsRef.current.clear();
      quizzesCacheRef.current = null;
      assignmentsCacheRef.current = null;
      // Only reset the JSON baseline if we are switching to a different course
      if (previousIdRef.current !== null || !id) {
        lastSavedCourseJsonRef.current = null;
      }
      previousIdRef.current = id;
    }
  }, [id]);

  // 3. Background auto-save every 30 seconds, only if there are unsaved changes
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      if (hasUnsavedChangesRef.current()) {
        handleSaveRef.current("draft", true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [mounted]);

  // 4. Auto draft save on step/path navigation, only if there are unsaved changes
  const previousPathnameRef = useRef(pathname);
  useEffect(() => {
    if (pathname !== previousPathnameRef.current) {
      if (hasUnsavedChangesRef.current()) {
        handleSaveRef.current("draft", true);
      }
      previousPathnameRef.current = pathname;
    }
  }, [pathname]);

  const handleBack = async () => {
    if (!course.title) {
      router.push("/admin/courses");
      return;
    }
    if (hasUnsavedChanges()) {
      await handleSave("draft");
    } else {
      router.push("/admin/courses");
    }
  };

  const isRootLevel = pathname === "/admin/courses/create";

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
      <div className="flex justify-between items-center p-6 bg-white border-b border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest leading-none">
          {/* Base Course Breadcrumb */}
          {isRootLevel ? (
            <span className="text-slate-800">Course</span>
          ) : (
            <Link href="/admin/courses/create" className="text-slate-400 hover:text-blue-600 transition-colors">Course</Link>
          )}

          {/* Module Breadcrumb */}
          {!isRootLevel && activeModuleId && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              {activeLessonId || activeTopicId || activeQuizId || activeAssignmentId ? (
                <Link href="/admin/courses/create/module" className="text-slate-400 hover:text-blue-600 transition-colors truncate max-w-[150px]">
                  {activeModule?.title || "Module"}
                </Link>
              ) : (
                <span className="text-slate-800 truncate max-w-[150px]">{activeModule?.title || "New Module"}</span>
              )}
            </>
          )}

          {/* Lesson Breadcrumb */}
          {activeLessonId && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              {activeTopicId || (activeQuizId && activeLessonId) || (activeAssignmentId && activeLessonId) ? (
                <Link href="/admin/courses/create/lesson" className="text-slate-400 hover:text-blue-600 transition-colors truncate max-w-[150px]">
                  {activeLesson?.title || "Lesson"}
                </Link>
              ) : (
                <span className="text-slate-800 truncate max-w-[150px]">{activeLesson?.title || "New Lesson"}</span>
              )}
            </>
          )}

          {/* Topic Breadcrumb */}
          {activeTopicId && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 truncate max-w-[150px]">{activeTopic?.title || "New Topic"}</span>
            </>
          )}

          {/* Quiz Breadcrumb */}
          {activeQuizId && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 truncate max-w-[150px]">{activeQuiz?.title || "New Quiz"}</span>
            </>
          )}

          {/* Assignment Breadcrumb */}
          {activeAssignmentId && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 truncate max-w-[150px]">{activeAssignment?.title || "New Assignment"}</span>
            </>
          )}
        </div>

        {/* CENTRALIZED ACTIONS */}
        <div className="flex gap-3">
          <button 
            onClick={handleBack}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold shadow-xs hover:bg-slate-50 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button 
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-all text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[110px]"
          >
            {isSaving ? "Saving..." : "Save as Draft"}
          </button>
          <button 
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="px-8 py-2 rounded-lg bg-green-600 text-white font-bold shadow-md hover:bg-green-700 transition-all text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
          >
            {isSaving ? "Saving..." : "Publish"}
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
