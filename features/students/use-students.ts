/**
 * Example: Custom hook for managing Students with TanStack Query
 * This pattern should be followed for all features
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PaginationParams, ApiResponse } from "@/types/common";

export interface Student {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number?: string;
  status: "active" | "inactive";
  notes?: string;
  created_at?: string;
}

export interface StudentsResponse {
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const STUDENTS_QUERY_KEY = ["students"];

/**
 * Fetch students with pagination, filtering, and sorting
 */
export const useGetStudents = (params: PaginationParams) => {
  return useQuery({
    queryKey: [...STUDENTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<StudentsResponse>>(
        `/api/v1/students`,
        {
          method: "GET",
        }
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch single student by ID
 */
export const useGetStudent = (id: string | number) => {
  return useQuery({
    queryKey: [...STUDENTS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Student>>(
        `/api/v1/students/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Create a new student
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Student, "id" | "created_at">) => {
      return apiClient.post<ApiResponse<Student>>(`/api/v1/students`, data);
    },
    onSuccess: () => {
      // Invalidate students list to refetch
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
};

/**
 * Update student
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<Student>;
    }) => {
      return apiClient.put<ApiResponse<Student>>(
        `/api/v1/students/${id}`,
        data
      );
    },
    onSuccess: (_, { id }) => {
      // Invalidate both the specific student and the list
      queryClient.invalidateQueries({ queryKey: [...STUDENTS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
};

/**
 * Delete student
 */
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      return apiClient.delete<ApiResponse<void>>(`/api/v1/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
};
