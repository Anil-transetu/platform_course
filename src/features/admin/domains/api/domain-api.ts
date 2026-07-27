import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Domain, DomainStats } from "@/types/domain";
import { getAuthHeaders, handleResponse } from "@/lib/api-client";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/domains`;

/**
 * Mapping helper: Normalizes domain data from backend to frontend format
 */
export function mapDomain(d: Record<string, any>): Domain {
  const statusRaw = (d.status || "active").toLowerCase();
  const statusFormatted = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1);

  const rawDate = d.created_at || d.created_date || d.last_updated_date;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "N/A";

  const totalCourses = d.total_courses !== undefined 
    ? Number(d.total_courses) 
    : (d.total_courses_count !== undefined ? Number(d.total_courses_count) : (d.courses ? d.courses.length : 0));

  return {
    id: d.id || d.domain_id,
    name: d.name || d.domain_name || "N/A",
    category: d.description || "N/A",
    courses: totalCourses,
    total_courses: totalCourses,
    updated: formattedDate,
    created_at: rawDate || "",
    created_date: formattedDate,
    updated_at: d.updated_at || rawDate || "",
    status: statusRaw, // lowercase for internal consistency
    statusFormatted: statusFormatted,
    description: d.description || "",
    tags: d.tags || [],
    course_ids: d.course_ids || [],
    assignment_ids: d.assignment_ids || [],
    courses_list: d.courses || [],
    assignments_list: d.assignments || [],
  };
}

/**
 * Fetch all domains (with pagination, search, status filters)
 */
export async function fetchDomains(
  page: number = 1,
  limit: number = 10,
  search?: string,
  statusFilter?: string,
  signal?: AbortSignal
) {
  let url = BASE_URL;
  const query = new URLSearchParams();

  query.append("page", page.toString());
  query.append("limit", limit.toString());

  if (search) {
    query.append("search", search);
  }

  if (statusFilter && statusFilter !== "All" && statusFilter !== "All Domains" && statusFilter !== "All Institutions") {
    query.append("status", statusFilter.toLowerCase());
  }

  if (query.toString()) {
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
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
 * Fetch domain by ID
 */
export async function fetchDomainById(id: string | number, signal?: AbortSignal): Promise<Domain> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  const result = await handleResponse(response);
  const domain = result.data || result;
  return mapDomain(domain);
}

/**
 * Fetch domain lookup (only active domains for Create/Edit forms)
 */
export async function fetchDomainLookup(search?: string): Promise<any[]> {
  let url = `${BASE_URL}/lookup`;
  if (search) {
    const query = new URLSearchParams();
    query.append("search", search);
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result.data || result || [];
}

/**
 * Fetch domain filter options (active + inactive domains for Course Management filter)
 */
export async function fetchDomainsFilter(): Promise<any[]> {
  const url = `${BASE_URL}/filter`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result.data || result || [];
}

/**
 * Create a domain (Name & Description only)
 */
export async function createDomain(data: { name: string; description?: string }) {
  const payload = {
    name: data.name,
    description: data.description || "",
  };

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * Edit domain by ID (Name & Description only)
 */
export async function updateDomain(id: string | number, data: { name?: string; description?: string }) {
  const payload: Record<string, any> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * Update domain status (PATCH /api/v1/domains/:id/status)
 */
export async function updateDomainStatus(id: string | number, status: string) {
  const response = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: status.toLowerCase() }),
  });

  return handleResponse(response);
}

/**
 * Fetch domain statistics
 */
export async function fetchDomainStats(signal?: AbortSignal): Promise<DomainStats> {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  const result = await handleResponse(response);
  const d = result.data || result || {};
  return {
    total_domains: d.total_domains ?? d.total ?? 0,
    active_domains: d.active_domains ?? d.active ?? 0,
    inactive_domains: d.inactive_domains ?? d.inactive ?? 0,
    total: d.total_domains ?? d.total ?? 0,
    active: d.active_domains ?? d.active ?? 0,
  };
}

/**
 * Delete domain by ID
 */
export async function deleteDomain(id: string | number) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * TanStack Query Hook for fetching domains
 */
export function useDomains(
  page: number = 1,
  limit: number = 10,
  search?: string,
  statusFilter?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["domains", { page, limit, search, statusFilter }],
    queryFn: ({ signal }) => fetchDomains(page, limit, search, statusFilter, signal),
    staleTime: 0,
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}
