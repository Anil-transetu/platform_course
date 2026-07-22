import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAssignments,
  fetchAssignmentStats,
  fetchAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  Assignment,
  AssignmentStats,
} from "./assignment-api";

export const ASSIGNMENTS_QUERY_KEY = ["assignments"];
export const ASSIGNMENT_STATS_QUERY_KEY = ["assignmentStats"];

/**
 * Hook to fetch assignments with pagination, search, and status filtering
 */
export function useAssignments(
  page: number = 1,
  limit: number = 10,
  search?: string,
  statusFilter?: string,
  options?: { enabled?: boolean }
) {
  return useQuery<{ data: Assignment[]; total?: number }, Error>({
    queryKey: [...ASSIGNMENTS_QUERY_KEY, page, limit, search, statusFilter],
    queryFn: ({ signal }) => fetchAssignments(page, limit, search, statusFilter, signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch stats
 */
export function useAssignmentStats(options?: { enabled?: boolean }) {
  return useQuery<AssignmentStats, Error>({
    queryKey: ASSIGNMENT_STATS_QUERY_KEY,
    queryFn: ({ signal }) => fetchAssignmentStats(signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch a single assignment by ID
 */
export function useAssignment(id: string | number | undefined, options?: { enabled?: boolean }) {
  const isValidId = id !== undefined && id !== null && String(id).trim() !== "" && String(id) !== "null" && String(id) !== "undefined";
  return useQuery<Assignment, Error>({
    queryKey: [...ASSIGNMENTS_QUERY_KEY, id],
    queryFn: ({ signal }) => fetchAssignmentById(id!, signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    enabled: (options?.enabled ?? true) && isValidId,
  });
}

/**
 * Hook to create a new assignment
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation<Assignment, Error, Partial<Assignment>>({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_STATS_QUERY_KEY });
    },
  });
}

/**
 * Hook to update an assignment
 */
export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation<
    Assignment,
    Error,
    { id: string | number; data: Partial<Assignment> }
  >({
    mutationFn: ({ id, data }) => updateAssignment(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...ASSIGNMENTS_QUERY_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_STATS_QUERY_KEY });
    },
  });
}

/**
 * Hook to delete an assignment
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string | number>({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_STATS_QUERY_KEY });
    },
  });
}
