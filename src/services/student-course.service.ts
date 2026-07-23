import { CourseSidebarResponse, CourseHomeResponse, CourseContent } from "@/types/student-course";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";

export function getAuthHeaders(): Record<string, string> {
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

export async function handleResponse<T>(response: Response): Promise<T> {
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

export const studentCourseService = {
  /**
   * Get the full sidebar hierarchy for a specific course
   */
  async getSidebar(courseId: string): Promise<CourseSidebarResponse> {
    const url = `${API_HOST}/api/v1/student-portal/course/${courseId}/sidebar`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse<any>(response);
    return data?.data || data;
  },

  /**
   * Get the Course Home Overview Data
   */
  async getCourseHome(courseId: string): Promise<CourseHomeResponse> {
    const url = `${API_HOST}/api/v1/student-portal/course/${courseId}/home`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse<any>(response);
    return data?.data || data;
  },

  /**
   * Get specific view content (Topic, Lesson, Assignment)
   */
  async getCourseView(courseId: string, itemId: string, itemType: string): Promise<CourseContent> {
    const url = `${API_HOST}/api/v1/student-portal/course/${courseId}/${itemType}/${itemId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    try {
      const data = await handleResponse<any>(response);
      return data?.data || data;
    } catch (e: any) {
      console.warn("View API failed, returning mock generic content", e);
      return {
        id: itemId,
        type: itemType as any,
        title: `Mock Content for ${itemType} ${itemId}`,
        description: "This is fallback content because the View API endpoint failed or is not yet implemented on the backend.",
        content_text: `<p>Please ensure the endpoint <code>/api/v1/student-portal/course/${courseId}/view</code> is implemented on the backend.</p>`,
      };
    }
  },

  /**
   * Get activity data for a specific type (modules, lessons, topics, quizzes, assignments)
   */
  async getCourseActivity(courseId: string, activityType: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(`${API_HOST}/api/v1/student-portal/course/${courseId}/${activityType}/activity`);
    
    // Append any query parameters for search/pagination if needed
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        url.searchParams.append(key, String(params[key]));
      }
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    try {
      const data = await handleResponse<any>(response);
      return data;
    } catch (e: any) {
      console.error(`Activity API failed for ${activityType}`, e);
      throw e;
    }
  }
};

