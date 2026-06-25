import { useQuery } from "@tanstack/react-query";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/student-portal/enrolled-courses`;

export interface EnrolledCourse {
  id: string | number;
  course_id?: string;
  name: string;
  category?: string;
  instructor?: string;
  thumbnail_url?: string;
  tags?: string[];
  progress?: number;
  updated_at?: string;
  last_accessed?: string;
  batches?: { total: number, completed: number }; // Optional for design matches
}

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
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "mock_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
      }
    }
    throw new Error(messageStr);
  }
  return response.json();
}

/**
 * Fetch Student Enrolled Courses
 */
export async function fetchEnrolledCourses(page: number = 1, limit: number = 10, search?: string) {
  const url = new URL(BASE_URL);
  url.searchParams.append("page", String(page));
  url.searchParams.append("limit", String(limit));
  if (search) {
    url.searchParams.append("search", search);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result;
}

/**
 * React Query hook for Enrolled Courses
 */
export function useEnrolledCourses(page: number = 1, limit: number = 10, search?: string) {
  return useQuery({
    queryKey: ["enrolledCourses", { page, limit, search }],
    queryFn: () => fetchEnrolledCourses(page, limit, search),
  });
}
