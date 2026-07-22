import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getAuthHeaders, handleResponse } from "@/lib/api-client";


export interface Course {
  id: number;
  name: string;
  category: string;
  modules: number;
  updated: string;
  status: string;
  description?: string;
}

export interface CourseStats {
  no_of_modules: number;
  total_topics: number;
  total_lessons: number;
  total_duration_minutes: number;
}



export function mapCourse(d: Record<string, any>): Course {
  const rawDate =
    d.updated_at ||
    d.updatedAt ||
    d.updated ||
    d.last_updated ||
    d.lastUpdated ||
    d.last_updated_date ||
    d.created_at ||
    d.createdAt;

  let formattedDate = "N/A";
  if (rawDate) {
    const dateObj = new Date(rawDate);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } else {
      formattedDate = String(rawDate);
    }
  }

  return {
    id: d.id,
    name: d.name || "N/A",
    category: d.description || "N/A",
    modules: Number(d.no_of_modules || (d.modules ? d.modules.length : 0)),
    updated: formattedDate,
    status: d.status && (d.status.toLowerCase() === "published" || d.status.toLowerCase() === "active") ? "Published" : "Draft",
    description: d.description || ""
  };
}

/** Apply a returned course resource to every cached list page without refetching it. */
function updateCachedCourseLists(queryClient: ReturnType<typeof useQueryClient>, id: string | number, resource: Record<string, any>) {
  const mappedCourse = mapCourse(resource);
  queryClient.setQueriesData({ queryKey: ["courses"] }, (old: any) => {
    if (!old?.data || !Array.isArray(old.data)) return old;
    return {
      ...old,
      data: old.data.map((course: Course) =>
        String(course.id) === String(id) ? { ...course, ...mappedCourse } : course
      ),
    };
  });
}

/** Remove a course from every cached table page without causing a list refetch. */
function removeCachedCourseLists(queryClient: ReturnType<typeof useQueryClient>, id: string | number) {
  queryClient.setQueriesData({ queryKey: ["courses"] }, (old: any) => {
    if (!old?.data || !Array.isArray(old.data)) return old;

    const data = old.data.filter((course: Course) => String(course.id) !== String(id));
    const removed = data.length !== old.data.length;
    if (!removed) return old;

    return {
      ...old,
      data,
      pagination: old.pagination
        ? { ...old.pagination, total: Math.max(0, Number(old.pagination.total || 0) - 1) }
        : old.pagination,
    };
  });
}

/**
 * Hook to fetch paginated courses
 */
export function useCourses(
  page: number = 1,
  limit: number = 10,
  search?: string,
  statusFilter?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["courses", { page, limit, search, statusFilter }],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (search) query.append("search", search);
      if (statusFilter && statusFilter !== "All") {
        const backendStatus = statusFilter.toLowerCase() === "published" ? "active" : statusFilter.toLowerCase();
        query.append("status", backendStatus);
      }

      const response = await fetch(`${BASE_URL}?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);

      if (result.data && Array.isArray(result.data)) {
        return {
          ...result,
          data: result.data.map((c: any) => mapCourse(c))
        };
      }
      return { data: [], pagination: { total: 0 } };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch course statistics
 */
export function useCourseStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["courseStats"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/stats`, {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    staleTime: 5 * 60 * 1500,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: options?.enabled,
  });
}

/**
 * Mutation to create a new course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (response) => {
      const createdCourse = response?.data || response;
      if (createdCourse && createdCourse.id) {
        const normalizedId = normalizeId(createdCourse.id);
        queryClient.setQueryData(["courseDetails", normalizedId], createdCourse);
        queryClient.setQueryData(["courseCurriculum", normalizedId], createdCourse);
        queryClient.invalidateQueries({ queryKey: ["courseDetails", normalizedId] });
        queryClient.invalidateQueries({ queryKey: ["courseCurriculum", normalizedId] });
      }
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courseStats"] });
    },
  });
}

/**
 * Mutation to update an existing course
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Record<string, any> }) => {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (response, variables) => {
      const normalizedId = normalizeId(variables.id);
      const updatedCourse = response.data || response;
      // Mutations already return the new server state. Update only the affected
      // caches instead of invalidating every course query (which caused refetch
      // bursts while editing).
      queryClient.setQueryData(["courseDetails", normalizedId], (old: any) =>
        old ? { ...old, ...variables.data, ...updatedCourse } : updatedCourse
      );
      queryClient.setQueryData(["courseCurriculum", normalizedId], (old: any) => {
        if (!old) return updatedCourse;
        return {
          ...old,
          ...variables.data,
          ...updatedCourse,
          final_assessment: updatedCourse.final_assessment ?? updatedCourse.finalAssessment ?? old.final_assessment ?? old.finalAssessment,
          final_assessment_id: updatedCourse.final_assessment_id ?? updatedCourse.finalAssessment?.id ?? variables.data.final_assessment_id ?? old.final_assessment_id,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["courseDetails", normalizedId] });
      queryClient.invalidateQueries({ queryKey: ["courseCurriculum", normalizedId] });
      updateCachedCourseLists(queryClient, variables.id, { ...variables.data, ...updatedCourse, id: updatedCourse.id ?? variables.id });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courseStats"] });
    },
  });
}

/**
 * Mutation to delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      // Consume the completed response before resolving the mutation. This keeps
      // DevTools able to show the server payload and avoids navigation cancelling it.
      return response.status === 204 ? null : handleResponse(response);
    },
    onSuccess: (_, id) => {
      // A delete does not need a page refresh, a table GET, or a stats GET.
      // The visible table is updated directly from the successful mutation.
      removeCachedCourseLists(queryClient, id);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courseStats"] });
      queryClient.removeQueries({ queryKey: ["courseDetails", normalizeId(id)] });
      queryClient.removeQueries({ queryKey: ["courseCurriculum", normalizeId(id)] });
    },
  });
}

/**
 * Mutation to add a module to a course
 */
export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string | number; data: { name: string; description?: string; order_num?: number; image_url?: string; video_url?: string; pdf_url?: string; url?: string } }) => {
      const response = await fetch(`${BASE_URL}/${courseId}/modules`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (data, variables) => {
      const courseId = normalizeId(variables.courseId);
      const newModule = data.data || data;
      if (!courseId) return;
      queryClient.setQueryData(["courseCurriculum", courseId], (oldCurriculum: any) =>
        oldCurriculum ? addCachedCourseItem(oldCurriculum, "module", newModule) : oldCurriculum
      );
    },
  });
}

const addCachedCourseItem = (course: any, type: 'module' | 'lesson' | 'topic', itemData: any, moduleId?: string | number, lessonId?: string | number) => {
  if (!course) return course;
  const newCourse = { ...course };
  
  if (type === 'module') {
    newCourse.modules = [...(newCourse.modules || []), itemData];
  } else if (type === 'lesson') {
    newCourse.modules = (newCourse.modules || []).map((m: any) => {
      if (moduleId && String(m.id) === String(moduleId)) {
        const hasLessons = Array.isArray(m.lessons);
        const itemsKey = hasLessons ? 'lessons' : 'topics';
        
        // Also add to order array if present
        let updatedOrder = m.order;
        if (updatedOrder) {
          updatedOrder = [...updatedOrder, { id: itemData.id, type: 'lesson' }];
        }

        return {
          ...m,
          [itemsKey]: [...(m[itemsKey] || []), itemData],
          ...(updatedOrder !== undefined ? { order: updatedOrder } : {})
        };
      }
      return m;
    });
  } else if (type === 'topic') {
    newCourse.modules = (newCourse.modules || []).map((m: any) => {
      if (moduleId && String(m.id) === String(moduleId)) {
        return {
          ...m,
          lessons: (m.lessons || []).map((l: any) => {
            if (lessonId && String(l.id) === String(lessonId)) {
              // Also add to lesson's order array if present
              let updatedOrder = l.order;
              if (updatedOrder) {
                updatedOrder = [...updatedOrder, { id: itemData.id, type: 'topic' }];
              }

              return {
                ...l,
                topics: [...(l.topics || []), itemData],
                ...(updatedOrder !== undefined ? { order: updatedOrder } : {})
              };
            }
            return l;
          })
        };
      }
      return m;
    });
  }
  
  return newCourse;
};

const removeCachedCourseItem = (course: any, type: 'module' | 'lesson' | 'topic', id: string | number, moduleId?: string | number) => {
  if (!course) return course;
  const newCourse = { ...course };
  
  if (type === 'module') {
    newCourse.modules = (newCourse.modules || []).filter((m: any) => 
      String(m.id) !== String(id)
    );
  } else if (type === 'lesson') {
    newCourse.modules = (newCourse.modules || []).map((m: any) => {
      if (moduleId !== undefined && String(m.id) !== String(moduleId)) {
        return m;
      }
      const hasLessons = Array.isArray(m.lessons);
      const itemsKey = hasLessons ? 'lessons' : 'topics';
      
      // Also remove from order array if present
      let updatedOrder = m.order;
      if (updatedOrder) {
        updatedOrder = updatedOrder.filter((o: any) => 
          !(String(o.id) === String(id) && (o.type === 'lesson' || o.type === 'topic'))
        );
      }

      return {
        ...m,
        [itemsKey]: (m[itemsKey] || []).filter((l: any) => 
          String(l.id) !== String(id)
        ),
        ...(updatedOrder !== undefined ? { order: updatedOrder } : {})
      };
    });
  } else if (type === 'topic') {
    newCourse.modules = (newCourse.modules || []).map((m: any) => {
      const hasLessons = Array.isArray(m.lessons);
      const itemsKey = hasLessons ? 'lessons' : 'topics';
      return {
        ...m,
        [itemsKey]: (m[itemsKey] || []).map((l: any) => {
          const hasTopics = Array.isArray(l.topics);
          const subItemsKey = hasTopics ? 'topics' : 'lessons';

          // Also remove from order array if present
          let updatedOrder = l.order;
          if (updatedOrder) {
            updatedOrder = updatedOrder.filter((o: any) => 
              !(String(o.id) === String(id) && o.type === 'topic')
            );
          }

          return {
            ...l,
            [subItemsKey]: (l[subItemsKey] || []).filter((t: any) => 
              String(t.id) !== String(id)
            ),
            ...(updatedOrder !== undefined ? { order: updatedOrder } : {})
          };
        })
      };
    });
  }
  
  return newCourse;
};

const updateCachedCourseItem = (course: any, type: 'module' | 'lesson' | 'topic', id: string | number, updatedData: any) => {
  if (!course) return course;
  const newCourse = { ...course };
  
  if (type === 'module') {
    newCourse.modules = (newCourse.modules || []).map((m: any) => 
      String(m.id) === String(id) ? { ...m, ...updatedData } : m
    );
  } else if (type === 'lesson') {
    newCourse.modules = (newCourse.modules || []).map((m: any) => {
      const hasLessons = Array.isArray(m.lessons);
      const itemsKey = hasLessons ? 'lessons' : 'topics';
      return {
        ...m,
        [itemsKey]: (m[itemsKey] || []).map((l: any) => 
          String(l.id) === String(id) ? { ...l, ...updatedData } : l
        )
      };
    });
  } else if (type === 'topic') {
    newCourse.modules = (newCourse.modules || []).map((m: any) => {
      const hasLessons = Array.isArray(m.lessons);
      const itemsKey = hasLessons ? 'lessons' : 'topics';
      return {
        ...m,
        [itemsKey]: (m[itemsKey] || []).map((l: any) => {
          const hasTopics = Array.isArray(l.topics);
          const subItemsKey = hasTopics ? 'topics' : 'lessons';
          return {
            ...l,
            [subItemsKey]: (l[subItemsKey] || []).map((t: any) => 
              String(t.id) === String(id) ? { ...t, ...updatedData } : t
            )
          };
        })
      };
    });
  }
  
  return newCourse;
};

/**
 * Mutation to update a module
 */
export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId, data }: { id: string | number; courseId?: string | number; data: { name?: string; description?: string; order_num?: number; image_url?: string; video_url?: string; pdf_url?: string; url?: string; assignment_ids?: Array<string | number>; quizzes?: Array<string | number>; content_blocks?: any[] } }) => {
      const response = await fetch(`${API_HOST}/api/v1/modules/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (data, variables) => {
      const updatedModule = data.data || data;
      // Some update endpoints return a partial object. Keep the submitted values
      // in cache too, otherwise a subsequent view can show stale module content.
      const completeModule = { ...variables.data, ...updatedModule, id: updatedModule.id ?? variables.id };
      queryClient.setQueryData(["moduleDetail", normalizeId(variables.id)], (oldModule: any) =>
        oldModule ? { ...oldModule, ...completeModule } : completeModule
      );
      const courseId = normalizeId(variables.courseId);
      if (courseId) {
        queryClient.setQueryData(["courseCurriculum", courseId], (oldCurriculum: any) => {
          if (!oldCurriculum) return oldCurriculum;
          return updateCachedCourseItem(oldCurriculum, 'module', variables.id, completeModule);
        });
      }
    },
  });
}

/**
 * Mutation to delete a module
 */
export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string | number; courseId?: string | number }) => {
      const response = await fetch(`${API_HOST}/api/v1/modules/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok && response.status !== 204) {
        await handleResponse(response);
      }
    },
    onSuccess: (_, variables) => {
      const courseId = normalizeId(variables.courseId);
      if (courseId) {
        queryClient.setQueryData(["courseCurriculum", courseId], (oldCurriculum: any) => {
          if (!oldCurriculum) return oldCurriculum;
          return removeCachedCourseItem(oldCurriculum, 'module', variables.id);
        });
      }
    },
  });
}

/**
 * Mutation to create a topic (corresponds to UI Topic)
 */
export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, courseId, moduleId, data }: { lessonId: string | number; courseId?: string | number; moduleId?: string | number; data: { name: string; content_text?: string; text?: string; order_num?: number; image_url?: string; video_url?: string; pdf_url?: string; url?: string } }) => {
      const response = await fetch(`${API_HOST}/api/v1/lessons/${lessonId}/topics`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (data, variables) => {
      const newTopic = data.data || data;
      const courseId = normalizeId(variables.courseId);
      if (courseId && variables.moduleId && variables.lessonId) {
        queryClient.setQueryData(["courseCurriculum", courseId], (oldCurriculum: any) => {
          if (!oldCurriculum) return oldCurriculum;
          return addCachedCourseItem(oldCurriculum, 'topic', newTopic, variables.moduleId, variables.lessonId);
        });
      }
    },
  });
}

/**
 * Mutation to update a topic (corresponds to UI Topic)
 */
export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId, data }: { id: string | number; courseId?: string | number; data: { name?: string; content_text?: string; text?: string; order_num?: number; image_url?: string; video_url?: string; pdf_url?: string; url?: string; content_blocks?: any[] } }) => {
      const response = await fetch(`${API_HOST}/api/v1/topics/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (data, variables) => {
      const updatedTopic = data.data || data;
      queryClient.setQueryData(["topicDetail", normalizeId(variables.id)], updatedTopic);
      const courseId = normalizeId(variables.courseId);
      if (courseId) {
        queryClient.setQueryData(["courseCurriculum", courseId], (oldCurriculum: any) => {
          if (!oldCurriculum) return oldCurriculum;
          return updateCachedCourseItem(oldCurriculum, 'topic', variables.id, updatedTopic);
        });
      }
    },
  });
}

/**
 * Mutation to delete a topic (corresponds to UI Topic)
 */
export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string | number; courseId?: string | number }) => {
      const response = await fetch(`${API_HOST}/api/v1/topics/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok && response.status !== 204) {
        await handleResponse(response);
      }
    },
    onSuccess: (_, variables) => {
      const courseId = normalizeId(variables.courseId);
      if (courseId) {
        queryClient.setQueryData(["courseCurriculum", courseId], (oldCurriculum: any) => {
          if (!oldCurriculum) return oldCurriculum;
          return removeCachedCourseItem(oldCurriculum, 'topic', variables.id);
        });
      }
    },
  });
}

/**
 * Mutation to create a lesson (corresponds to UI Lesson)
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, courseId, data }: { moduleId: string | number; courseId?: string | number; data: { name: string; type?: string; content_text?: string; text?: string; duration_minutes?: number; order_num?: number; quizzes?: number[]; assignments?: number[]; image_url?: string; video_url?: string; pdf_url?: string; url?: string } }) => {
      const response = await fetch(`${API_HOST}/api/v1/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (data, variables) => {
      const newLesson = data.data || data;
      const courseId = normalizeId(variables.courseId);
      if (courseId) {
        queryClient.setQueryData(["courseCurriculum", courseId], (oldCurriculum: any) => {
          if (!oldCurriculum) return oldCurriculum;
          return addCachedCourseItem(oldCurriculum, 'lesson', newLesson, variables.moduleId);
        });
      }
    },
  });
}

/**
 * Mutation to update a lesson (corresponds to UI Topic)
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId, data }: { id: string | number; courseId?: string | number; data: { name?: string; type?: string; content_text?: string; text?: string; duration_minutes?: number; order_num?: number; quizzes?: Array<string | number>; assignment_ids?: Array<string | number>; image_url?: string; video_url?: string; pdf_url?: string; url?: string; images?: string[]; videos?: string[]; pdfs?: string[]; urls?: string[]; content_blocks?: any[] } }) => {
      // Resource arrays remain in local state for the editor/viewer, but the lesson API
      // accepts their persisted URLs and content_blocks rather than these UI-only fields.
      const { images, videos, pdfs, urls, ...payload } = data;
      const response = await fetch(`${API_HOST}/api/v1/lessons/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(response);
    },
    onSuccess: (data, variables) => {
      const updatedLesson = data.data || data;
      const completeLesson = { ...variables.data, ...updatedLesson, id: updatedLesson.id ?? variables.id };
      // The PUT response is authoritative. Seed/update the detail cache even if
      // it was not previously visited, so the editor has no reason to issue a GET.
      queryClient.setQueryData(["lessonDetail", normalizeId(variables.id)], (oldLesson: any) =>
        ({ ...oldLesson, ...completeLesson })
      );
      queryClient.setQueriesData({ queryKey: ["moduleDetail"] }, (oldModule: any) => {
        if (!oldModule?.lessons || !Array.isArray(oldModule.lessons)) return oldModule;
        return {
          ...oldModule,
          lessons: oldModule.lessons.map((lesson: any) =>
            String(lesson.id) === String(variables.id) ? { ...lesson, ...completeLesson } : lesson
          ),
        };
      });
      const courseId = normalizeId(variables.courseId);
      if (courseId) {
        queryClient.setQueryData(["courseCurriculum", courseId], (oldCurriculum: any) => {
          if (!oldCurriculum) return oldCurriculum;
          return updateCachedCourseItem(oldCurriculum, 'lesson', variables.id, completeLesson);
        });
      }
    },
  });
}

/**
 * Mutation to delete a lesson (corresponds to UI Topic)
 */
export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId, moduleId }: { id: string | number; courseId?: string | number; moduleId?: string | number }) => {
      const response = await fetch(`${API_HOST}/api/v1/lessons/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok && response.status !== 204) {
        await handleResponse(response);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.removeQueries({ queryKey: ["lessonDetail", normalizeId(variables.id)] });
      const courseId = normalizeId(variables.courseId);
      if (courseId) {
        queryClient.setQueryData(["courseCurriculum", courseId], (oldCurriculum: any) => {
          if (!oldCurriculum) return oldCurriculum;
          return removeCachedCourseItem(oldCurriculum, 'lesson', variables.id, variables.moduleId);
        });
      }
    },
  });
}

/**
 * Hook to fetch all quizzes
 */
export function useQuizzes(page: number = 1, limit: number = 100, search?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["quizzesList", { page, limit, search }],
    queryFn: async ({ signal }) => {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (search) query.append("search", search);

      const response = await fetch(`${API_HOST}/api/v1/quizzes?${query.toString()}`, {
        signal,
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch all assignments
 */
export function useAssignmentsList(page: number = 1, limit: number = 100, search?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["assignmentsList", { page, limit, search }],
    queryFn: async ({ signal }) => {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (search) query.append("search", search);

      const response = await fetch(`${API_HOST}/api/v1/assignments?${query.toString()}`, {
        signal,
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to lookup capstone assignments for domains
 */
export function useAssignmentLookup(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["assignmentLookup"],
    queryFn: async ({ signal }) => {
      const response = await fetch(`${API_HOST}/api/v1/assignment/lookup`, {
        signal,
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to lookup assignments (plural)
 */
export function useAssignmentsLookup(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["assignmentsLookup"],
    queryFn: async ({ signal }) => {
      const response = await fetch(`${API_HOST}/api/v1/assignments/lookup`, {
        signal,
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/**
 * Mutation to unlink a quiz from a module or lesson (does not delete quiz)
 */
const removeCurriculumAssignmentReferences = (course: any, assignmentId: string | number, level: 'course' | 'module' | 'lesson', moduleId?: string | number, lessonId?: string | number) => {
  const newCourse = JSON.parse(JSON.stringify(course));

  if (level === 'course') {
    newCourse.assignments = (newCourse.assignments || []).filter((a: any) => String(a.id) !== String(assignmentId));
    if (newCourse.final_assessment && String(newCourse.final_assessment.id) === String(assignmentId)) {
      newCourse.final_assessment = null;
      newCourse.final_assessment_id = null;
    }
    return newCourse;
  }

  if (level === 'module') {
    newCourse.modules = (newCourse.modules || []).map((m: any) =>
      String(m.id) !== String(moduleId) ? m : { ...m, assignments: (m.assignments || []).filter((a: any) => String(a.id) !== String(assignmentId)) }
    );
    return newCourse;
  }

  newCourse.modules = (newCourse.modules || []).map((m: any) => ({
    ...m,
    lessons: (m.lessons || []).map((l: any) =>
      String(m.id) !== String(moduleId) || String(l.id) !== String(lessonId) ? l : { ...l, assignments: (l.assignments || []).filter((a: any) => String(a.id) !== String(assignmentId)) }
    ),
  }));
  return newCourse;
};

const removeCurriculumQuizReferences = (course: any, quizId: string | number, level: 'module' | 'lesson', moduleId?: string | number, lessonId?: string | number) => {
  const newCourse = JSON.parse(JSON.stringify(course));

  if (level === 'module') {
    newCourse.modules = (newCourse.modules || []).map((m: any) =>
      String(m.id) !== String(moduleId) ? m : { ...m, quizzes: (m.quizzes || []).filter((q: any) => String(q.id) !== String(quizId)) }
    );
    return newCourse;
  }

  newCourse.modules = (newCourse.modules || []).map((m: any) => ({
    ...m,
    lessons: (m.lessons || []).map((l: any) =>
      String(m.id) !== String(moduleId) || String(l.id) !== String(lessonId) ? l : { ...l, quizzes: (l.quizzes || []).filter((q: any) => String(q.id) !== String(quizId)) }
    ),
  }));
  return newCourse;
};

export function useUnlinkQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quizId, level, courseId, moduleId, lessonId }: { quizId: string | number; level: 'module' | 'lesson'; courseId?: string | number; moduleId?: string | number; lessonId?: string | number }) => {
      const response = await fetch(`${API_HOST}/api/v1/quizzes/${quizId}/unlink`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ level }),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      const courseId = normalizeId(variables.courseId);
      if (!courseId) return;
      queryClient.setQueryData(["courseCurriculum", courseId], (old: any) => {
        if (!old) return old;
        try {
          return removeCurriculumQuizReferences(old, variables.quizId, variables.level, variables.moduleId, variables.lessonId);
        } catch {
          return old;
        }
      });
    },
  });
}

/**
 * Mutation to unlink an assignment from course/module/lesson (does not delete assignment)
 */
export function useUnlinkAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId, level, courseId, moduleId, lessonId }: { assignmentId: string | number; level: 'course' | 'module' | 'lesson'; courseId?: string | number; moduleId?: string | number; lessonId?: string | number }) => {
      const response = await fetch(`${API_HOST}/api/v1/assignments/${assignmentId}/unlink`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ level }),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      const courseId = normalizeId(variables.courseId);
      if (!courseId) return;
      queryClient.setQueryData(["courseCurriculum", courseId], (old: any) => {
        if (!old) return old;
        try {
          return removeCurriculumAssignmentReferences(old, variables.assignmentId, variables.level, variables.moduleId, variables.lessonId);
        } catch {
          return old;
        }
      });
    },
  });
}

/**
 * Hook to lookup courses
 */
export function useCourseLookup(search?: string, limit: number = 10, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["courseLookup", { search, limit }],
    queryFn: async ({ signal }) => {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      query.append("limit", limit.toString());

      const response = await fetch(`${BASE_URL}/lookup?${query.toString()}`, {
        signal,
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch course details for the configuration page (metadata only)
 */
export function useCourseDetails(id: string | number | undefined, options?: { enabled?: boolean }) {
  const normalizedId = normalizeId(id);
  const isValidId = normalizedId !== undefined && normalizedId.trim() !== "" && normalizedId !== "null" && normalizedId !== "undefined";
  return useQuery({
    queryKey: ["courseDetails", normalizedId],
    queryFn: async () => {
      if (!isValidId) return null;
      const response = await fetch(`${API_HOST}/api/v1/courses/${normalizedId}`, {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: (options?.enabled ?? true) && isValidId,
  });
}

/**
 * Hook to fetch course curriculum
 */
export function useCourseCurriculum(
  id: string | number | undefined,
  studentId?: string | number,
  enrollmentId?: string | number,
  options?: { enabled?: boolean }
) {
  const normalizedId = normalizeId(id);
  const isValidId = normalizedId !== undefined && normalizedId.trim() !== "" && normalizedId !== "null" && normalizedId !== "undefined";
  const queryKey = studentId || enrollmentId
    ? ["courseCurriculum", normalizedId, { studentId, enrollmentId }]
    : ["courseCurriculum", normalizedId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!isValidId) return null;
      const query = new URLSearchParams();
      if (studentId) query.append("student_id", studentId.toString());
      if (enrollmentId) query.append("enrollment_id", enrollmentId.toString());

      const endpoint = `${API_HOST}/api/v1/courses/${normalizedId}/curriculum${query.toString() ? `?${query.toString()}` : ""}`;
      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: (options?.enabled ?? true) && isValidId,
  });
}

/**
 * Mutation to enroll a student in a course/batch
 */
export function useEnrollCourse() {
  return useMutation({
    mutationFn: async (data: { student_id: number; batch_id: number }) => {
      const response = await fetch(`${BASE_URL}/enroll`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  });
}

/**
 * Mutation to create a module at root level
 */
export function useCreateModuleRoot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { course_id: number; name: string; description?: string; order_num?: number }) => {
      const response = await fetch(`${API_HOST}/api/v1/modules`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courseCurriculum", normalizeId(variables.course_id)] });
    },
  });
}

/**
 * Mutation to create a topic under a module
 */
export function useCreateModuleTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, courseId, data }: { moduleId: string | number; courseId?: string | number; data: { name: string; content_text?: string; order_num?: number } }) => {
      const response = await fetch(`${API_HOST}/api/v1/modules/${moduleId}/topics`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["courseCurriculum", normalizeId(variables.courseId)] });
      }
    },
  });
}

/**
 * Mutation to create a lesson under a topic
 */
export function useCreateTopicLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ topicId, courseId, data }: { topicId: string | number; courseId?: string | number; data: { name: string; type: string; content_text?: string; order_num?: number } }) => {
      const response = await fetch(`${API_HOST}/api/v1/topics/${topicId}/lessons`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["courseCurriculum", normalizeId(variables.courseId)] });
      }
    },
  });
}

/**
 * Mutation to mark a lesson complete
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, courseId, studentId, enrollmentId }: { lessonId: string | number; courseId?: string | number; studentId: number; enrollmentId: number }) => {
      const response = await fetch(`${API_HOST}/api/v1/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ student_id: studentId, enrollment_id: enrollmentId }),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["courseCurriculum", normalizeId(variables.courseId)] });
      }
    },
  });
}

/**
 * Helper to fetch module details based on role (student vs admin/tutor)
 */
export async function getModuleDetail(courseId: string | number | undefined, moduleId: string | number | undefined) {
  const role = useAuthStore.getState().role;
  const url = role === "student"
    ? `${API_HOST}/api/v1/student-portal/course/${courseId}/module/${moduleId}`
    : `${API_HOST}/api/v1/modules/${moduleId}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * Helper to fetch lesson details based on role (student vs admin/tutor)
 */
export async function getLessonDetail(courseId: string | number | undefined, lessonId: string | number | undefined) {
  const role = useAuthStore.getState().role;
  const url = role === "student"
    ? `${API_HOST}/api/v1/student-portal/course/${courseId}/lesson/${lessonId}`
    : `${API_HOST}/api/v1/lessons/${lessonId}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * Helper to fetch topic details based on role (student vs admin/tutor)
 */
export async function getTopicDetail(courseId: string | number | undefined, topicId: string | number | undefined) {
  const role = useAuthStore.getState().role;
  const url = role === "student"
    ? `${API_HOST}/api/v1/student-portal/course/${courseId}/topic/${topicId}`
    : `${API_HOST}/api/v1/topics/${topicId}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

export function useCourseModuleDetail(courseId: string | number | undefined, moduleId: string | number | undefined, options?: { enabled?: boolean }) {
  const isValidId = moduleId !== undefined && moduleId !== null && String(moduleId).trim() !== "" && String(moduleId) !== "null" && String(moduleId) !== "undefined";
  return useQuery({
    queryKey: ["moduleDetail", normalizeId(moduleId)],
    queryFn: () => getModuleDetail(courseId, moduleId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: (options?.enabled ?? true) && isValidId,
  });
}

export function useCourseLessonDetail(courseId: string | number | undefined, lessonId: string | number | undefined, options?: { enabled?: boolean }) {
  const isValidId = lessonId !== undefined && lessonId !== null && String(lessonId).trim() !== "" && String(lessonId) !== "null" && String(lessonId) !== "undefined";
  return useQuery({
    queryKey: ["lessonDetail", normalizeId(lessonId)],
    queryFn: () => getLessonDetail(courseId, lessonId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!lessonId && (options?.enabled ?? true) && isValidId,
  });
}

export function useCourseTopicDetail(courseId: string | number | undefined, topicId: string | number | undefined, options?: { enabled?: boolean }) {
  const isValidId = topicId !== undefined && topicId !== null && String(topicId).trim() !== "" && String(topicId) !== "null" && String(topicId) !== "undefined";
  return useQuery({
    queryKey: ["topicDetail", normalizeId(topicId)],
    queryFn: () => getTopicDetail(courseId, topicId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: (options?.enabled ?? true) && isValidId,
  });
}