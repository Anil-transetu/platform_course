import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Batch } from "@/types/batch";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/batches`;

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
    console.error("API ERROR:", err);
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

    if (
      messageStr.toLowerCase().includes("token expired") ||
      response.status === 401
    ) {
      if (typeof document !== "undefined") {
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
      }
    }
    throw new Error(messageStr);
  }
  return response.json();
}

/**
 * Mapping helper: Normalizes batch data from backend to frontend format
 */
export function mapBatch(b: Record<string, any>): Batch {
  const tutorName = b.tutor || (b.batchTutors && b.batchTutors[0]?.Tutor?.full_name) || "N/A";
  const enrollmentsCount = b.students !== undefined ? b.students : (b.Enrollments ? b.Enrollments.length : 0);
  
  return {
    ...b,
    id: b.id,
    name: b.batch_name || b.name || "N/A",
    institution: b.institution_name || b.Institution?.name || "N/A",
    course: b.course || b.Course?.name || "N/A",
    instructor: tutorName,
    start_date: b.start_date ? b.start_date.split("T")[0] : "",
    end_date: b.end_date ? b.end_date.split("T")[0] : "",
    students: enrollmentsCount,
    status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase()) : "Inactive",
    completion_percentage: b.completion_percentage || 0,
    institution_id: b.institution_id || b.Institution?.id,
    tutor_id: b.tutor_id || (b.batchTutors && b.batchTutors[0]?.tutor_id),
    course_id: b.course_id
  };
}

/**
 * Fetch all batches
 */
export async function fetchBatches(
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
      data: result.data.map((b: Record<string, unknown>) => mapBatch(b))
    };
  }

  return Array.isArray(result) ? result.map((b: Record<string, unknown>) => mapBatch(b)) : result;
}

/**
 * Fetch a single batch by ID
 */
export async function fetchBatchById(id: string | number) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  const batch = result.data || result;
  return mapBatch(batch as Record<string, unknown>);
}

/**
 * Create a new batch
 */
export async function createBatch(data: Record<string, unknown>) {
  const payload = {
    name: data.name,
    course_id: data.course_id ? Number(data.course_id) : null,
    institution_id: data.institution_id ? Number(data.institution_id) : null,
    tutor_id: data.tutor_id ? Number(data.tutor_id) : null,
    start_date: data.start_date,
    end_date: data.end_date,
    enroll_students: Array.isArray(data.enroll_students) ? data.enroll_students.map(Number) : [],
    status: data.status || "active"
  };

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * Update an existing batch
 */
export async function updateBatch(id: string | number, data: Record<string, unknown>) {
  const payload = {
    name: data.name,
    course_id: data.course_id ? Number(data.course_id) : null,
    institution_id: data.institution_id ? Number(data.institution_id) : null,
    tutor_id: data.tutor_id ? Number(data.tutor_id) : null,
    start_date: data.start_date,
    end_date: data.end_date,
    enroll_students: Array.isArray(data.enroll_students) ? data.enroll_students.map(Number) : [],
    status: data.status || "active"
  };

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * Delete a batch
 */
export async function deleteBatch(id: string | number) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    return handleResponse(response);
  }
}

/**
 * Fetch batch stats (dashboard overview stats)
 */
export async function fetchBatchesDashboardStats() {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * Fetch stats for a specific batch (students page stats)
 */
export async function fetchBatchStudentsStats(id: string | number) {
  const response = await fetch(`${BASE_URL}/${id}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * Mapping helper: Normalizes student data from backend to frontend format
 */
export function mapEnrolledStudent(s: Record<string, any>): any {
  return {
    ...s,
    id: s.id,
    name: s.full_name || s.name || "N/A",
    email: s.email || "N/A",
    enrollmentDate: (s.enrollment_date || s.enrollmentDate) ? new Date(s.enrollment_date || s.enrollmentDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }) : "N/A",
    completionPercentage: s.completion_percentage !== undefined ? s.completion_percentage : (s.completionPercentage || 0),
    status: s.status ? s.status.toUpperCase() : "ACTIVE"
  };
}

/**
 * Fetch students enrolled in a specific batch
 */
export async function fetchBatchStudents(
  id: string | number,
  page: number = 1,
  limit: number = 10,
  status?: string
) {
  let url = `${BASE_URL}/${id}/students`;
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("limit", limit.toString());
  if (status && status !== "All") {
    query.append("status", status.toLowerCase());
  }

  url += `?${query.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  
  if (result.data && Array.isArray(result.data)) {
    return {
      ...result,
      data: result.data.map((s: Record<string, unknown>) => mapEnrolledStudent(s))
    };
  }
  
  return result;
}

/**
 * Bulk upload students CSV to a batch
 */
export async function uploadBatchStudentsCsv(id: string | number, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = getAuthHeaders();
  delete headers["Content-Type"]; // let the browser set boundary

  const response = await fetch(`${BASE_URL}/${id}/students/bulk-upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  return handleResponse(response);
}

/**
 * Export batch students PDF URL
 */
export function getBatchStudentsExportPdfUrl(id: string | number): string {
  return `${API_HOST}/api/v1/batches/${id}/students/export-pdf`;
}
