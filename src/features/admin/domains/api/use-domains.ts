import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchDomains,
  fetchDomainStats,
  fetchDomainLookup,
  fetchDomainById,
  createDomain,
  updateDomain,
  updateDomainStatus,
  deleteDomain
} from "./domain-api";
import { toast } from "sonner";

export const DOMAINS_QUERY_KEY = ["domains"];
export const DOMAIN_STATS_QUERY_KEY = ["domain-stats"];
export const DOMAIN_LOOKUP_QUERY_KEY = ["domainsLookup"];

export function useDomains(
  page: number = 1,
  limit: number = 10,
  search?: string,
  statusFilter?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...DOMAINS_QUERY_KEY, { page, limit, search, statusFilter }],
    queryFn: ({ signal }) => fetchDomains(page, limit, search, statusFilter, signal),
    staleTime: 0,
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useDomainStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: DOMAIN_STATS_QUERY_KEY,
    queryFn: ({ signal }) => fetchDomainStats(signal),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: options?.enabled ?? true,
  });
}

export function useDomainLookup(search?: string, options?: any) {
  return useQuery<any[]>({
    queryKey: [...DOMAIN_LOOKUP_QUERY_KEY, search],
    queryFn: () => fetchDomainLookup(search),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useDomainById(id: string | number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...DOMAINS_QUERY_KEY, "detail", id],
    queryFn: ({ signal }) => fetchDomainById(id, signal),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCreateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => createDomain(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOMAINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DOMAIN_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DOMAIN_LOOKUP_QUERY_KEY });
      toast.success("Domain created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create domain");
    },
  });
}

export function useUpdateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: { name?: string; description?: string } }) =>
      updateDomain(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOMAINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DOMAIN_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DOMAIN_LOOKUP_QUERY_KEY });
      toast.success("Domain updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update domain");
    },
  });
}

export function useUpdateDomainStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) =>
      updateDomainStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DOMAINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DOMAIN_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DOMAIN_LOOKUP_QUERY_KEY });
      toast.success(`Domain ${variables.status.toLowerCase() === "active" ? "enabled" : "disabled"} successfully`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update domain status");
    },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteDomain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOMAINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DOMAIN_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DOMAIN_LOOKUP_QUERY_KEY });
      toast.success("Domain deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete domain");
    },
  });
}
