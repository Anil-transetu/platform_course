"use client";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchBatches,
  fetchBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  fetchBatchesDashboardStats,
  fetchBatchStudentsStats,
  fetchBatchStudents,
  uploadBatchStudentsCsv,
  fetchCoursesLookup,
  fetchDomainsLookup,
  fetchStudentLookup,
} from "@/features/admin/batches/api/batch-api";
import { toast } from "sonner";

const QUERY_KEY = "batches";

export function useBatches(page: number = 1, limit: number = 10, search?: string, statusFilter?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "list", { page, limit, search, statusFilter }],
    queryFn: () => fetchBatches(page, limit, search, statusFilter),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBatch(id: string | number) {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => fetchBatchById(id),
    enabled: !!id,
  });
}

export function useBatchesDashboardStats() {
  return useQuery({
    queryKey: [QUERY_KEY, "stats", "dashboard"],
    queryFn: () => fetchBatchesDashboardStats(),
  });
}

export function useBatchStudentsStats(id: string | number) {
  return useQuery({
    queryKey: [QUERY_KEY, "stats", "students", id],
    queryFn: () => fetchBatchStudentsStats(id),
    enabled: !!id,
  });
}

export function useBatchStudents(id: string | number, page: number = 1, limit: number = 10, status?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "students", id, { page, limit, status }],
    queryFn: () => fetchBatchStudents(id, page, limit, status),
    placeholderData: keepPreviousData,
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "list"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "stats", "dashboard"] });
      toast.success("Batch created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create batch");
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown> }) =>
      updateBatch(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "list"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "detail", variables.id] });
      toast.success("Batch updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update batch");
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "list"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "stats", "dashboard"] });
      toast.success("Batch deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete batch");
    },
  });
}

export function useUploadBatchStudentsCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string | number; file: File }) =>
      uploadBatchStudentsCsv(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "list"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "stats", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "students", variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "stats", "students", variables.id] });
      toast.success("Students uploaded successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload CSV");
    },
  });
}

export function useCoursesLookup(search?: string, options?: any) {
  return useQuery<any[], Error>({
    queryKey: ["coursesLookup", search],
    queryFn: () => fetchCoursesLookup(search),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useDomainsLookup(search?: string, options?: any) {
  return useQuery<any[], Error>({
    queryKey: ["domainsLookup", search],
    queryFn: () => fetchDomainsLookup(search),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useStudentLookup(institutionId: string | number, search?: string, options?: any) {
  return useQuery<any[], Error>({
    queryKey: ["studentsLookup", institutionId, search],
    queryFn: () => fetchStudentLookup(institutionId, search),
    staleTime: 5 * 60 * 1000,
    enabled: !!institutionId,
    ...options,
  });
}
