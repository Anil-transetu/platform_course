import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";

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
 * Fetch attendance stats
 */
export async function fetchBatchAttendanceStats(batchId: string) {
  const response = await fetch(`${API_HOST}/api/v1/tutor-portal/batch/${batchId}/attendance-stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result?.data || result || {};
}

/**
 * Fetch batch students with pagination and search
 */
export async function fetchBatchStudents(batchId: string, page: number = 1, limit: number = 5, search?: string) {
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("limit", limit.toString());

  if (search) {
    query.append("search", search);
  }

  const response = await fetch(`${API_HOST}/api/v1/tutor-portal/batch/${batchId}/students?${query.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  
  const data = result?.data?.data || result?.data || [];
  const total = result?.data?.total || result?.total || data.length;

  return {
    data: Array.isArray(data) ? data : [],
    total: total,
  };
}

/**
 * Submit attendance
 */
export async function submitBatchAttendance(batchId: string, payload: { date: string, attendance: any[] }) {
  const response = await fetch(`${API_HOST}/api/v1/tutor-portal/batch/${batchId}/attendance`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await handleResponse(response);
  return result;
}

/**
 * TanStack Query Hooks
 */

export function useTutorBatchAttendanceStats(batchId: string) {
  return useQuery({
    queryKey: ["tutorBatchAttendanceStats", batchId],
    queryFn: () => fetchBatchAttendanceStats(batchId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTutorBatchStudents(batchId: string, page: number = 1, limit: number = 5, search?: string) {
  return useQuery({
    queryKey: ["tutorBatchStudents", batchId, { page, limit, search }],
    queryFn: () => fetchBatchStudents(batchId, page, limit, search),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ batchId, payload }: { batchId: string, payload: { date: string, attendance: any[] } }) => 
      submitBatchAttendance(batchId, payload),
    onSuccess: (_, { batchId }) => {
      // Invalidate relevant queries to fetch fresh data after submission
      queryClient.invalidateQueries({ queryKey: ["tutorBatchAttendanceStats", batchId] });
      queryClient.invalidateQueries({ queryKey: ["tutorBatchStudents", batchId] });
    },
  });
}
