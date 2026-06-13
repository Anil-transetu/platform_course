import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Tutor, TutorStats } from "@/types/tutor";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/tutors`;

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    if (match) {
      headers["Authorization"] = `Bearer ${match[2]}`;
    }
  }
  return headers;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message = err.message || err.detail || "API request failed";

    if (
      message.toLowerCase().includes("token expired") ||
      response.status === 401
    ) {
      if (typeof document !== "undefined") {
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
      }
    }
    throw new Error(message);
  }
  return response.json();
}

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
    status: data.status || "active"
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
    status: data.status || "active"
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
 * Delete a tutor
 */
export async function deleteTutor(id: string | number) {
  try {
    const tutor = await fetchTutorById(id);
    if (tutor && tutor.email) {
      const payload: Record<string, unknown> = {
        full_name: tutor.name,
        email: `deleted_${Date.now()}_${tutor.email}`,
        mobile_number: tutor.phone,
        domains: tutor.domains,
        tags: tutor.tags,
        status: "inactive"
      };
      await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
    }
  } catch (err) {
    console.error("Failed to rename email before deletion", err);
  }

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
    queryKey: ["tutors", { page, limit, search, statusFilter, domainFilter }],
    queryFn: () => fetchTutors(page, limit, search, statusFilter, domainFilter),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useTutor(id: string | number) {
  return useQuery({
    queryKey: ["tutor", id],
    queryFn: () => fetchTutorById(id),
    enabled: !!id,
  });
}

export function useTutorStats() {
  return useQuery({
    queryKey: ["tutorStats"],
    queryFn: () => fetchTutorStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTutor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      queryClient.invalidateQueries({ queryKey: ["tutorStats"] });
    },
  });
}

export function useUpdateTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown> }) => updateTutor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      queryClient.invalidateQueries({ queryKey: ["tutor", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tutorStats"] });
    },
  });
}

export function useDeleteTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTutor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      queryClient.invalidateQueries({ queryKey: ["tutorStats"] });
    },
  });
}
