import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Tutor, TutorStats } from "@/types/tutor";
import { getAuthHeaders, handleResponse } from "@/lib/api-client";


const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/tutors`;



/**
 * Mapping helper: Normalizes tutor data from backend to frontend format
 */
function mapTutor(u: Record<string, unknown>): Tutor {
  return {
    id: u.tutor_id as string | number || u.id as string | number,
    name: (u.tutor_name as string) || (u.full_name as string) || "N/A",
    email: (u.email as string) || "N/A",
    phone: (u.phone as string) || (u.mobile_number as string) || "N/A",
    domains: Array.isArray(u.domains) ? u.domains.map(d => typeof d === 'string' ? d.toUpperCase() : d) : [],
    tags: Array.isArray(u.tags) ? u.tags.map(t => typeof t === 'string' ? t.toUpperCase() : t) : [],
    status: (u.status as string) || "active",
    avatar: (u.profile_image as string) || null,
    assignedBatches: Array.isArray(u.assignedBatches) ? u.assignedBatches : [],
  };
}

/**
 * Fetch all tutors
 */
export async function fetchTutors(
  page: number = 1,
  limit: number = 50,
  search?: string,
  statusFilter?: string,
  domainFilter?: string
) {
  let url = BASE_URL;
  const query = new URLSearchParams();

  if (page !== undefined && limit !== undefined) {
    query.append("page", page.toString());
    query.append("limit", limit.toString());
  }

  if (search) {
    query.append("search", search);
  }

  if (statusFilter && statusFilter !== "All") {
    query.append("status", statusFilter.toLowerCase());
  }

  if (domainFilter && domainFilter !== "All") {
    query.append("domain", domainFilter);
  }

  if (query.toString()) {
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  
  if (result.data && Array.isArray(result.data)) {
    return {
      ...result,
      data: result.data.map((u: Record<string, unknown>) => mapTutor(u))
    };
  }

  return Array.isArray(result) ? result.map((u: Record<string, unknown>) => mapTutor(u)) : result;
}

/**
 * Fetch a single tutor by ID
 */
export async function fetchTutorById(id: string | number) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  const tutor = result.data || result;
  return mapTutor(tutor as Record<string, unknown>);
}

/**
 * Create a new tutor
 */
export async function createTutor(data: Record<string, unknown>) {
  const payload: Record<string, unknown> = {
    full_name: data.name || data.full_name,
    email: data.email,
    mobile_number: data.phone || data.mobile_number,
    domains: Array.isArray(data.domains) ? data.domains.map(d => typeof d === 'string' ? d.toUpperCase() : d) : [],
    tags: Array.isArray(data.tags) ? data.tags.map(t => typeof t === 'string' ? t.toUpperCase() : t) : [],
  };

  if (data.password) {
    payload.password = data.password;
  }

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * Update an existing tutor
 */
export async function updateTutor(id: string | number, data: Record<string, unknown>) {
  const payload: Record<string, unknown> = {
    full_name: data.name || data.full_name,
    email: data.email,
    mobile_number: data.phone || data.mobile_number,
    domains: Array.isArray(data.domains) ? data.domains.map(d => typeof d === 'string' ? d.toUpperCase() : d) : [],
    tags: Array.isArray(data.tags) ? data.tags.map(t => typeof t === 'string' ? t.toUpperCase() : t) : [],
  };

  if (data.password && (data.password as string).trim() !== "") {
    payload.password = data.password;
  }

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * Update tutor status (Enable/Disable)
 */
export async function updateTutorStatus(id: string | number, status: string) {
  const response = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  return handleResponse(response);
}

/**
 * Delete a tutor
 */
export async function deleteTutor(id: string | number, tutor?: Tutor | null) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    return handleResponse(response);
  }
}

/**
 * Fetch tutor stats
 */
export async function fetchTutorStats(): Promise<TutorStats> {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  const stats = result?.data || result || {};
  
  const total = Number(stats.total_tutors ?? stats.total ?? stats.totalTutors ?? 0);
  const active = Number(stats.active_tutors ?? stats.active ?? stats.activeTutors ?? 0);
  const inactive = Number(stats.inactive_tutors ?? stats.inactive ?? stats.inactiveTutors ?? 0);
  const newTutors = Number(stats.newlyAddedTutors ?? stats.new_tutors ?? stats.newTutors ?? 0);
  
  return {
    total: isNaN(total) ? 0 : total,
    active: isNaN(active) ? 0 : active,
    inactive: isNaN(inactive) ? 0 : inactive,
    newTutors: isNaN(newTutors) ? 0 : newTutors,
  };
}

/**
 * TanStack Query Hooks
 */

export function useTutors(page: number = 1, limit: number = 50, search?: string, statusFilter?: string, domainFilter?: string) {
  return useQuery({
    queryKey: ["tutors", "list", { page, limit, search, statusFilter, domainFilter }],
    queryFn: () => fetchTutors(page, limit, search, statusFilter, domainFilter),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useTutor(id: string | number) {
  return useQuery({
    queryKey: ["tutors", "detail", id],
    queryFn: () => fetchTutorById(id),
    enabled: !!id,
  });
}

export function useTutorStats() {
  return useQuery({
    queryKey: ["tutors", "stats"],
    queryFn: () => fetchTutorStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTutor,
    onSuccess: (newTutorRes) => {
      const newTutor = mapTutor(newTutorRes?.data || newTutorRes);
      
      // Update tutors list cache manually
      queryClient.setQueriesData<any>({ queryKey: ["tutors", "list"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: [newTutor, ...oldData.data],
            total: (oldData.total ?? oldData.data.length) + 1,
            pagination: oldData.pagination ? {
              ...oldData.pagination,
              total: (oldData.pagination.total ?? oldData.data.length) + 1
            } : undefined
          };
        } else if (Array.isArray(oldData)) {
          return [newTutor, ...oldData];
        }
        return oldData;
      });

      // Update stats cache manually
      queryClient.setQueriesData<any>({ queryKey: ["tutors", "stats"] }, (oldStats: any) => {
        if (!oldStats) return oldStats;
        const total = (oldStats.total ?? 0) + 1;
        const active = newTutor.status?.toLowerCase() === "active" ? (oldStats.active ?? 0) + 1 : (oldStats.active ?? 0);
        const inactive = newTutor.status?.toLowerCase() !== "active" ? (oldStats.inactive ?? 0) + 1 : (oldStats.inactive ?? 0);
        const newTutors = (oldStats.newTutors ?? 0) + 1;
        return {
          ...oldStats,
          total,
          active,
          inactive,
          newTutors
        };
      });
    },
  });
}

export function useUpdateTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown>; originalTutor?: Tutor | null }) => updateTutor(id, data),
    onSuccess: (updatedTutorRes, variables) => {
      const rawTutor = updatedTutorRes?.data || updatedTutorRes;
      const updatedTutor = mapTutor({
        ...(variables.originalTutor || {}),
        ...rawTutor,
        id: variables.id,
        tutor_id: variables.id,
        tutor_name: variables.data.name || variables.data.full_name,
        email: variables.data.email,
        mobile_number: variables.data.phone || variables.data.mobile_number,
        domains: variables.data.domains,
        tags: variables.data.tags,
        status: variables.data.status
      });

      // Update list cache manually
      queryClient.setQueriesData<any>({ queryKey: ["tutors", "list"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData.data)) {
          const updated = oldData.data.map((t: any) => 
            String(t.id) === String(variables.id) ? updatedTutor : t
          );
          return {
            ...oldData,
            data: updated
          };
        } else if (Array.isArray(oldData)) {
          return oldData.map((t: any) => 
            String(t.id) === String(variables.id) ? updatedTutor : t
          );
        }
        return oldData;
      });

      // Update detail cache manually
      queryClient.setQueryData(["tutors", "detail", variables.id], updatedTutor);

      // Update stats cache if status changed
      if (
        variables.originalTutor &&
        variables.data.status &&
        String(variables.originalTutor.status).toLowerCase() !== String(variables.data.status).toLowerCase()
      ) {
        queryClient.setQueriesData<any>({ queryKey: ["tutors", "stats"] }, (oldStats: any) => {
          if (!oldStats) return oldStats;
          
          const wasActive = variables.originalTutor?.status?.toLowerCase() === "active";
          const isActiveNow = String(variables.data.status).toLowerCase() === "active";
          
          if (wasActive && !isActiveNow) {
            return {
              ...oldStats,
              active: Math.max(0, (oldStats.active ?? 0) - 1),
              inactive: (oldStats.inactive ?? 0) + 1
            };
          } else if (!wasActive && isActiveNow) {
            return {
              ...oldStats,
              active: (oldStats.active ?? 0) + 1,
              inactive: Math.max(0, (oldStats.inactive ?? 0) - 1)
            };
          }
          return oldStats;
        });
      }
    },
  });
}

export function useDeleteTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tutor }: { id: string | number; tutor?: Tutor | null }) => deleteTutor(id, tutor),
    onSuccess: (_, variables) => {
      // Remove from list cache manually
      queryClient.setQueriesData<any>({ queryKey: ["tutors", "list"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData.data)) {
          const filtered = oldData.data.filter((t: any) => String(t.id) !== String(variables.id));
          return {
            ...oldData,
            data: filtered,
            total: Math.max(0, (oldData.total ?? (oldData.data.length + 1)) - 1),
            pagination: oldData.pagination ? {
              ...oldData.pagination,
              total: Math.max(0, (oldData.pagination.total ?? (oldData.data.length + 1)) - 1)
            } : undefined
          };
        } else if (Array.isArray(oldData)) {
          return oldData.filter((t: any) => String(t.id) !== String(variables.id));
        }
        return oldData;
      });

      // Update stats cache manually
      queryClient.setQueriesData<any>({ queryKey: ["tutors", "stats"] }, (oldStats: any) => {
        if (!oldStats) return oldStats;
        
        const isCurrentlyActive = variables.tutor?.status?.toLowerCase() === "active";
        
        const total = Math.max(0, (oldStats.total ?? 0) - 1);
        const active = isCurrentlyActive ? Math.max(0, (oldStats.active ?? 0) - 1) : (oldStats.active ?? 0);
        const inactive = !isCurrentlyActive ? Math.max(0, (oldStats.inactive ?? 0) - 1) : (oldStats.inactive ?? 0);
        const newTutors = Math.max(0, (oldStats.newTutors ?? 0) - 1);
        
        return {
          ...oldStats,
          total,
          active,
          inactive,
          newTutors
        };
      });
    },
  });
}

export function useUpdateTutorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) => updateTutorStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      queryClient.invalidateQueries({ queryKey: ["tutors", "list"] });
      queryClient.invalidateQueries({ queryKey: ["tutors", "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tutors", "stats"] });
    },
  });
}
