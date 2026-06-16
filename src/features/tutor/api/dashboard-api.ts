import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { TutorBatch } from "@/app/tutor/dashboard/columns";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const STATS_URL = `${API_HOST}/api/v1/tutor-portal/stats`;
const DASHBOARD_URL = `${API_HOST}/api/v1/tutor-portal/dashboard`;

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
 * Fetch tutor dashboard stats
 */
export async function fetchTutorStats() {
  const response = await fetch(STATS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result?.data || result || {};
}

/**
 * Fetch tutor dashboard batches with pagination and search
 */
export async function fetchTutorBatches(page: number = 1, limit: number = 5, search?: string) {
  let url = DASHBOARD_URL;
  const query = new URLSearchParams();

  query.append("page", page.toString());
  query.append("limit", limit.toString());

  if (search) {
    query.append("search", search);
  }

  if (query.toString()) {
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  
  // Normalize the response format if backend returns different structure
  const data = result?.data?.data || result?.data || [];
  const total = result?.data?.total || result?.total || data.length;

  // Map data to match frontend columns structure
  const mappedData = Array.isArray(data) ? data.map((b: any) => ({
    id: b.id || b.batch_id,
    name: b.name || b.batch_name || "N/A",
    course: b.course || b.course_name || "N/A",
    schedule: b.schedule || "N/A",
    allocationTime: b.allocationTime || b.allocation_time || "N/A",
    progress: b.progress || 0,
  })) : [];

  return {
    data: mappedData,
    total: total,
  };
}

/**
 * TanStack Query Hooks
 */

export function useTutorDashboardStats() {
  return useQuery({
    queryKey: ["tutorDashboardStats"],
    queryFn: fetchTutorStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTutorDashboardBatches(page: number = 1, limit: number = 5, search?: string) {
  return useQuery({
    queryKey: ["tutorDashboardBatches", { page, limit, search }],
    queryFn: () => fetchTutorBatches(page, limit, search),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
