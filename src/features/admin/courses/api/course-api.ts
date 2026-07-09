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
  return {
    id: d.id,
    name: d.name || "N/A",
    category: d.description || "N/A",
    modules: Number(d.no_of_modules || (d.modules ? d.modules.length : 0)),
    updated: d.updated_at 
      ? new Date(d.updated_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "N/A",
    status: d.status && (d.status.toLowerCase() === "published" || d.status.toLowerCase() === "active") ? "Published" : "Draft",
    description: d.description || ""
  };
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
    queryFn: async ({ signal }) => {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (search) query.append("search", search);
      if (statusFilter && statusFilter !== "All") {
        const backendStatus = statusFilter.toLowerCase() === "published" ? "active" : statusFilter.toLowerCase();
        query.append("status", backendStatus);
      }

      const response = await fetch(`/api/v1/courses?${query.toString()}`, {
        signal,
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
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch a single course structure by ID
 */
export function useCourse(id: string | number | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const response = await fetch(`/api/v1/courses/${id}`, {
        signal,
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    staleTime: 5 * 60 * 1000,
    enabled: (options?.enabled ?? true) && !!id,
  });
}

/**
 * Hook to fetch course statistics
 */
export function useCourseStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["courseStats"],
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/v1/courses/stats", {
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
 * Mutation to create a new course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; status?: string; thumbnail_url?: string }) => {
      const response = await fetch("/api/v1/courses", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: () => {
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
    mutationFn: async ({ id, data }: { id: string | number; data: { name?: string; description?: string; status?: string; thumbnail_url?: string } }) => {
      const response = await fetch(`/api/v1/courses/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.id] });
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
      const response = await fetch(`/api/v1/courses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok && response.status !== 204) {
        await handleResponse(response);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courseStats"] });
    },
  });
}

/**
 * Mutation to add a module to a course
 */
export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string | number; data: { name: string; description?: string; order_num?: number } }) => {
      const response = await fetch(`/api/v1/courses/${courseId}/modules`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
    },
  });
}

/**
 * Mutation to update a module
 */
export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId, data }: { id: string | number; courseId?: string | number; data: { name?: string; description?: string; order_num?: number } }) => {
      const response = await fetch(`/api/v1/modules/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
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
      const response = await fetch(`/api/v1/modules/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok && response.status !== 204) {
        await handleResponse(response);
      }
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
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
    mutationFn: async ({ lessonId, courseId, data }: { lessonId: string | number; courseId?: string | number; data: { name: string; content_text?: string; text?: string; video_url?: string; order_num?: number } }) => {
      const response = await fetch(`/api/v1/topics`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...data, lesson_id: Number(lessonId) }),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
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
    mutationFn: async ({ id, courseId, data }: { id: string | number; courseId?: string | number; data: { name?: string; content_text?: string; text?: string; video_url?: string; order_num?: number } }) => {
      const response = await fetch(`/api/v1/topics/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
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
      const response = await fetch(`/api/v1/topics/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok && response.status !== 204) {
        await handleResponse(response);
      }
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
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
    mutationFn: async ({ moduleId, courseId, data }: { moduleId: string | number; courseId?: string | number; data: { name: string; type?: string; content_text?: string; text?: string; video_url?: string; duration_minutes?: number; order_num?: number; quizzes?: number[]; assignments?: number[] } }) => {
      const response = await fetch(`/api/v1/lessons`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...data, module_id: Number(moduleId) }),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
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
    mutationFn: async ({ id, courseId, data }: { id: string | number; courseId?: string | number; data: { name?: string; type?: string; content_text?: string; text?: string; video_url?: string; duration_minutes?: number; order_num?: number } }) => {
      const response = await fetch(`/api/v1/lessons/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
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
    mutationFn: async ({ id, courseId }: { id: string | number; courseId?: string | number }) => {
      const response = await fetch(`/api/v1/lessons/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok && response.status !== 204) {
        await handleResponse(response);
      }
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
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

      const response = await fetch(`/api/v1/quizzes?${query.toString()}`, {
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

      const response = await fetch(`/api/v1/assignments?${query.toString()}`, {
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
      const response = await fetch("/api/v1/assignment/lookup", {
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
      const response = await fetch("/api/v1/assignments/lookup", {
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
 * Hook to lookup courses
 */
export function useCourseLookup(search?: string, limit: number = 10, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["courseLookup", { search, limit }],
    queryFn: async ({ signal }) => {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      query.append("limit", limit.toString());

      const response = await fetch(`/api/v1/courses/lookup?${query.toString()}`, {
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
 * Hook to fetch course curriculum
 */
export function useCourseCurriculum(id: string | number | undefined, studentId?: string | number, enrollmentId?: string | number) {
  return useQuery({
    queryKey: ["courseCurriculum", id, { studentId, enrollmentId }],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const query = new URLSearchParams();
      if (studentId) query.append("student_id", studentId.toString());
      if (enrollmentId) query.append("enrollment_id", enrollmentId.toString());

      const response = await fetch(`/api/v1/courses/${id}/curriculum?${query.toString()}`, {
        signal,
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    enabled: !!id,
  });
}

/**
 * Mutation to enroll a student in a course/batch
 */
export function useEnrollCourse() {
  return useMutation({
    mutationFn: async (data: { student_id: number; batch_id: number }) => {
      const response = await fetch(`/api/v1/courses/enroll`, {
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
      const response = await fetch(`/api/v1/modules`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course", variables.course_id] });
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
      const response = await fetch(`/api/v1/modules/${moduleId}/topics`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
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
      const response = await fetch(`/api/v1/topics/${topicId}/lessons`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
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
      const response = await fetch(`/api/v1/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ student_id: studentId, enrollment_id: enrollmentId }),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
      }
    },
  });
}

