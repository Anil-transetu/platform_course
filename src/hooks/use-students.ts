"use client";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchStudents,
  fetchStudent,
  fetchStudentStats,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkUploadStudents,
} from "@/features/admin/students/api/student-api";
import { Student } from "@/types/student";
import toast from "react-hot-toast";

const QUERY_KEY = "students";

export function useStudents(page: number = 1, limit: number = 10, search?: string, statusFilter?: string, courseId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, { page, limit, search, statusFilter, courseId }],
    queryFn: () => fetchStudents(page, limit, search, statusFilter, courseId),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudent(id: string | number) {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => fetchStudent(id),
    enabled: !!id,
  });
}

export function useStudentStats() {
  return useQuery({
    queryKey: [QUERY_KEY, "stats"],
    queryFn: () => fetchStudentStats(),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Student added successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add student");
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown> }) =>
      updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "detail", variables.id] });
      toast.success("Student updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update student");
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Student deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete student");
    },
  });
}

export function useBulkUploadStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => bulkUploadStudents(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Students uploaded successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload CSV");
    },
  });
}
