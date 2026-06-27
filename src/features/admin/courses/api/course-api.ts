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
  statusFilter?: string
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

      const response = await fetch(`/api/v1/courses?${query.toString()}`, {
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
  });
}

/**
 * Hook to fetch a single course structure by ID
 */
export function useCourse(id: string | number | undefined) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/v1/courses/${id}`, {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch course statistics
 */
export function useCourseStats() {
  return useQuery({
    queryKey: ["courseStats"],
    queryFn: async () => {
      const response = await fetch("/api/v1/courses/stats", {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
    staleTime: 5 * 60 * 1000,
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
 * Mutation to create a topic under a module (corresponds to UI Lesson)
 */
export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, courseId, data }: { moduleId: string | number; courseId?: string | number; data: { name: string; content_text?: string; text?: string; video_url?: string; order_num?: number } }) => {
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
 * Mutation to update a topic (corresponds to UI Lesson)
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
 * Mutation to delete a topic (corresponds to UI Lesson)
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
 * Mutation to add a lesson to a topic (corresponds to UI Topic)
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ topicId, courseId, data }: { topicId: string | number; courseId?: string | number; data: { name: string; type?: string; content_text?: string; text?: string; video_url?: string; duration_minutes?: number; order_num?: number } }) => {
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
export function useQuizzes(page: number = 1, limit: number = 100, search?: string) {
  return useQuery({
    queryKey: ["quizzesList", { page, limit, search }],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (search) query.append("search", search);

      const response = await fetch(`/api/v1/quizzes?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
  });
}

/**
 * Hook to fetch all assignments
 */
export function useAssignmentsList(page: number = 1, limit: number = 100, search?: string) {
  return useQuery({
    queryKey: ["assignmentsList", { page, limit, search }],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (search) query.append("search", search);

      const response = await fetch(`/api/v1/assignments?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
  });
}

/**
 * Hook to lookup capstone assignments for domains
 */
export function useAssignmentLookup() {
  return useQuery({
    queryKey: ["assignmentLookup"],
    queryFn: async () => {
      const response = await fetch("/api/v1/assignment/lookup", {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
  });
}

/**
 * Hook to lookup assignments (plural)
 */
export function useAssignmentsLookup() {
  return useQuery({
    queryKey: ["assignmentsLookup"],
    queryFn: async () => {
      const response = await fetch("/api/v1/assignments/lookup", {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    },
  });
}

