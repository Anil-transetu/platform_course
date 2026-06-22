import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchInstitutions,
  fetchInstitutionStats,
  fetchInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  Institution,
  fetchInstitutionsOutlook,
} from "./institution-api";

/**
 * Fetch all institutions with search and filter
 */
export function useInstitutions(page: number = 1, limit: number = 50, search?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["institutions", { page, limit, search, statusFilter }],
    queryFn: () => fetchInstitutions(page, limit, search, statusFilter),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch all institutions from outlook endpoint (no pagination)
 */
export function useInstitutionsOutlook() {
  return useQuery({
    queryKey: ["institutions", "outlook"],
    queryFn: () => fetchInstitutionsOutlook(),
    staleTime: 5 * 60 * 1000,
  });
}


/**
 * Fetch a single institution by ID
 */
export function useInstitution(id: string | number) {
  return useQuery({
    queryKey: ["institution", id],
    queryFn: () => fetchInstitutionById(id),
    enabled: !!id,
  });
}

/**
 * Fetch institution statistics
 */
export function useInstitutionStats() {
  return useQuery({
    queryKey: ["institutionStats"],
    queryFn: () => fetchInstitutionStats(),
  });
}

/**
 * Create a new institution
 */
export function useCreateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      queryClient.invalidateQueries({ queryKey: ["institutionStats"] });
    },
  });
}

/**
 * Update an institution
 */
export function useUpdateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Institution> }) => updateInstitution(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      queryClient.invalidateQueries({ queryKey: ["institution", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["institutionStats"] });
    },
  });
}

/**
 * Delete an institution
 */
export function useDeleteInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      queryClient.invalidateQueries({ queryKey: ["institutionStats"] });
    },
  });
}
