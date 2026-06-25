import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Domain, DomainStats } from "@/types/domain";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/domains`;

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
    let messageStr = "API request failed";
    if (err.errors) {
      if (Array.isArray(err.errors)) {
        messageStr = err.errors.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(", ");
      } else if (typeof err.errors === "object") {
        messageStr = Object.values(err.errors).flat().join(", ");
      } else {
        messageStr = String(err.errors);
      }
    } else if (Array.isArray(err.message)) {
      messageStr = err.message.join(", ");
    } else if (err.message) {
      messageStr = err.message;
    } else if (err.detail) {
      messageStr = err.detail;
    }

    const isTokenExpired =
      messageStr.toLowerCase().includes("token expired") ||
      response.status === 401;

    if (!isTokenExpired) {
      console.error("API ERROR:", err);
    } else {
      if (typeof document !== "undefined") {
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "mock_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
      }
    }
    throw new Error(messageStr);
  }
  return response.json();
}

/**
 * Mapping helper: Normalizes domain data from backend to frontend format
 */
export function mapDomain(d: Record<string, any>): Domain {
  const statusFormatted = d.status 
    ? (d.status.charAt(0).toUpperCase() + d.status.slice(1).toLowerCase()) 
    : "Active";

  // Category in UI can represent tags or description
  const categoryText = d.tags && d.tags.length > 0 
    ? d.tags.map((t: string) => t.toUpperCase()).join(", ") 
    : (d.description || "N/A");

  const formattedDate = d.last_updated_date 
    ? new Date(d.last_updated_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "N/A";

  return {
    id: d.domain_id,
    name: d.domain_name || "N/A",
    category: categoryText,
    courses: d.total_courses_count !== undefined ? d.total_courses_count : (d.courses ? d.courses.length : 0),
    updated: formattedDate,
    status: statusFormatted,
    description: d.description || "",
    tags: d.tags || [],
    course_ids: d.course_ids || (d.courses ? d.courses.map((c: any) => c.id) : []),
    assignment_ids: d.assignment_ids || (d.assignments ? d.assignments.map((a: any) => a.id) : []),
    courses_list: d.courses || [],
    assignments_list: d.assignments || [],
    view: d.view
  };
}

/**
 * Fetch all domains (with pagination, search, status filters)
 * This covers API #6 and #7
 */
export async function fetchDomains(
  page: number = 1,
  limit: number = 10,
  search?: string,
  statusFilter?: string
) {
  let url = BASE_URL;
  const query = new URLSearchParams();

  query.append("page", page.toString());
  query.append("limit", limit.toString());

  if (search) {
    query.append("search", search);
  }

  if (statusFilter && statusFilter !== "All") {
    query.append("status", statusFilter.toLowerCase());
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
      data: result.data.map((d: Record<string, unknown>) => mapDomain(d))
    };
  }

  return Array.isArray(result) ? result.map((d: Record<string, unknown>) => mapDomain(d)) : result;
}

/**
 * Fetch domain by ID (API #2)
 */
export async function fetchDomainById(id: string | number): Promise<Domain> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  const domain = result.data || result;
  return mapDomain(domain);
}

/**
 * Create a domain (API #1)
 */
export async function createDomain(data: Record<string, any>) {
  const payload = {
    name: data.name,
    description: data.description || "",
    course_ids: data.course_ids || [],
    assignment_ids: data.assignment_ids || [],
    tags: data.tags || [],
    status: data.status ? data.status.toLowerCase() : "active"
  };

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * Edit domain by ID (API #3)
 */
export async function updateDomain(id: string | number, data: Record<string, any>) {
  // If only course_ids and assignment_ids are sent, payload is tailored.
  // Otherwise we send all provided fields.
  const payload: Record<string, any> = {};
  
  if (data.course_ids !== undefined) payload.course_ids = data.course_ids;
  if (data.assignment_ids !== undefined) payload.assignment_ids = data.assignment_ids;
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.tags !== undefined) payload.tags = data.tags;
  if (data.status !== undefined) payload.status = data.status.toLowerCase();

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * Fetch domain courses (API #4)
 */
export async function fetchDomainCourses(
  id: string | number,
  page: number = 1,
  limit: number = 10
) {
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("limit", limit.toString());

  const response = await fetch(`${BASE_URL}/${id}/courses?${query.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * Fetch domain statistics (API #5)
 */
export async function fetchDomainStats(): Promise<DomainStats> {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  const d = result.data || result || {};
  return {
    total: d.total_domains ?? d.total ?? 0,
    active: d.active_domains ?? d.active ?? 0
  };
}

/**
 * Delete domain by ID (API #8)
 */
export async function deleteDomain(id: string | number) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    return handleResponse(response);
  }
}

/**
 * TanStack Query Hooks
 */

export function useDomains(page: number = 1, limit: number = 10, search?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["domains", { page, limit, search, statusFilter }],
    queryFn: () => fetchDomains(page, limit, search, statusFilter),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useDomain(id: string | number) {
  return useQuery({
    queryKey: ["domain", id],
    queryFn: () => fetchDomainById(id),
    enabled: !!id,
  });
}

export function useDomainStats() {
  return useQuery({
    queryKey: ["domainStats"],
    queryFn: () => fetchDomainStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDomain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      queryClient.invalidateQueries({ queryKey: ["domainStats"] });
    },
  });
}

export function useUpdateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, any> }) => updateDomain(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      queryClient.invalidateQueries({ queryKey: ["domain", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["domainStats"] });
    },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDomain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      queryClient.invalidateQueries({ queryKey: ["domainStats"] });
    },
  });
}

export function useDomainCourses(id: string | number, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["domainCourses", id, { page, limit }],
    queryFn: () => fetchDomainCourses(id, page, limit),
    enabled: !!id,
  });
}

