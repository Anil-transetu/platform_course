import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/student-portal/attendance`;

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
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

    if (message.toLowerCase().includes("token expired") || response.status === 401) {
      if (typeof document !== "undefined") {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
      }
    }
    throw new Error(message);
  }
  return response.json();
}

export async function fetchStudentAttendanceStats() {
  const response = await fetch(`${BASE_URL}/stats`, { headers: getAuthHeaders() });
  const result = await handleResponse(response);
  return result.data;
}

export async function fetchStudentAttendanceTable(page: number = 1, limit: number = 10, status?: string) {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status && status !== "Select status" && status !== "All") {
    query.append("status", status);
  }
  const response = await fetch(`${BASE_URL}/table?${query.toString()}`, { headers: getAuthHeaders() });
  const result = await handleResponse(response);
  return result.data;
}

export function useStudentAttendanceStats() {
  return useQuery({
    queryKey: ["student-attendance-stats"],
    queryFn: fetchStudentAttendanceStats,
  });
}

export function useStudentAttendanceTable(page: number, limit: number, status?: string) {
  return useQuery({
    queryKey: ["student-attendance-table", { page, limit, status }],
    queryFn: () => fetchStudentAttendanceTable(page, limit, status),
    placeholderData: keepPreviousData,
  });
}
