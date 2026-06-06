import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchInstitutions,
  fetchInstitutionStats,
  fetchInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  Institution,
} from "./institution-api";

/**
 * Fetch all institutions with search and filter
 */
export function useInstitutions(search?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["institutions", { search, statusFilter }],
    queryFn: () => fetchInstitutions(search, statusFilter),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
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
