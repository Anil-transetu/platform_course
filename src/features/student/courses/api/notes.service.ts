import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ActiveSidebarItem } from "@/types/student-course";
import { CourseNote } from "@/components/course-notes/types";

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
    if (response.status === 404) {
      return null; // Return null instead of throwing an error to signify "empty notes"
    }
    const err = await response.json().catch(() => ({}));
    let messageStr = "API request failed";
    if (err.message) messageStr = err.message;

    if (response.status === 401 && typeof document !== "undefined") {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
    }
    throw new Error(messageStr);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return null;
}

export function resolveNotesEndpoint(courseId: string, activeItem: ActiveSidebarItem | null) {
  let url = `${API_HOST}/api/v1/student-portal/course/${courseId}`;

  if (!activeItem || activeItem.type === "course") {
    url += `/notes`;
  } else if (activeItem.type === "module") {
    url += `/module/${activeItem.id}/notes`;
  } else if (activeItem.type === "lesson") {
    url += `/lesson/${activeItem.id}/notes`;
  } else if (activeItem.type === "topic") {
    url += `/topic/${activeItem.id}/notes`;
  } else {
    url += `/notes`;
  }

  return url;
}

export async function fetchNotes(courseId: string, activeItem: ActiveSidebarItem | null): Promise<CourseNote | null> {
  if (!courseId) return null;
  const url = resolveNotesEndpoint(courseId, activeItem);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  if (!result) return null;
  return result.data || result;
}

export async function saveNotesApi(courseId: string, activeItem: ActiveSidebarItem | null, payload: { title: string; content: string }) {
  if (!courseId) throw new Error("Course ID is required to save notes.");
  const url = resolveNotesEndpoint(courseId, activeItem);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await handleResponse(response);
  return result?.data || result;
}
