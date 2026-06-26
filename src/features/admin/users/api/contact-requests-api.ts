import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ContactRequest, ContactRequestStats, ContactRequestsResponse, ContactRequestStatsResponse } from "@/types/contact-request";
import { getAuthHeaders, handleResponse } from "@/lib/api-client";


const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/contact-requests`;



/**
 * Fetch all contact requests with pagination, search, and filtering
 */
export async function fetchContactRequests(
  page: number = 1,
  limit: number = 10,
  search?: string,
  roleFilter?: string
): Promise<ContactRequestsResponse> {
  let url = BASE_URL;
  const query = new URLSearchParams();

  if (page !== undefined && limit !== undefined) {
    query.append("page", page.toString());
    query.append("limit", limit.toString());
  }

  if (search) {
    query.append("search", search);
  }

  if (roleFilter && roleFilter !== "All Roles" && roleFilter !== "All") {
    let apiRole = roleFilter.toLowerCase();
    if (apiRole.includes("institution representative") || apiRole === "institution rep") {
      apiRole = "institution_representative";
    }
    query.append("role", apiRole);
  }

  if (query.toString()) {
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * Fetch contact request stats
 */
export async function fetchContactRequestStats(): Promise<ContactRequestStats> {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = (await handleResponse(response)) as ContactRequestStatsResponse;
  return result.data;
}

/**
 * TanStack Query Hooks
 */

export function useContactRequests(
  page: number = 1,
  limit: number = 10,
  search?: string,
  roleFilter?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["contactRequests", { page, limit, search, roleFilter }],
    queryFn: () => fetchContactRequests(page, limit, search, roleFilter),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

export function useContactRequestStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["contactRequestStats"],
    queryFn: () => fetchContactRequestStats(),
    enabled: options?.enabled !== false,
  });
}
