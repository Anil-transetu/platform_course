import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/student-portal/assignment`;

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

export async function fetchStudentAssignmentStats() {
  const response = await fetch(`${BASE_URL}/stats`, { headers: getAuthHeaders() });
  const result = await handleResponse(response);
  return result.data;
}

export async function fetchStudentAssignmentTable(page: number = 1, limit: number = 10, search?: string) {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) {
    query.append("search", search);
  }
  const response = await fetch(`${BASE_URL}/table?${query.toString()}`, { headers: getAuthHeaders() });
  const result = await handleResponse(response);
  return result.data;
}

export function useStudentAssignmentStats() {
  return useQuery({
    queryKey: ["student-assignment-stats"],
    queryFn: fetchStudentAssignmentStats,
  });
}

export function useStudentAssignmentTable(page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ["student-assignment-table", { page, limit, search }],
    queryFn: () => fetchStudentAssignmentTable(page, limit, search),
    placeholderData: keepPreviousData,
  });
}
