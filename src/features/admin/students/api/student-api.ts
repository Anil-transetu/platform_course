import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

// Students API - fetches directly from backend to avoid server-to-localhost proxy issues on Vercel
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/students`;
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

import { Student, StudentStats } from "@/types/student";

/**
 * Mapping helper: Splits a full name into first and last name
 */
export function splitName(fullName: string) {
  if (!fullName) return { first_name: "", last_name: "" };
  const parts = fullName.trim().split(/\s+/);
  const first_name = parts[0] || "";
  const last_name = parts.slice(1).join(" ") || "";
  return { first_name, last_name };
}

/**
 * Mapping helper: Normalizes student data from backend to frontend format
 */
function mapStudent(s: Record<string, unknown>): Student {
  // Handle both backend format (first_name/last_name) and local format (student_name/name)
  const firstName = (s.first_name as string) || splitName((s.student_name as string) || (s.name as string) || "").first_name;
  const lastName = (s.last_name as string) || splitName((s.student_name as string) || (s.name as string) || "").last_name;

  // Clean up ID to be a pure number - remove all non-digits
  const rawId = s.student_id || s.id;
  let cleanId = rawId as string | number;
  if (rawId !== undefined && rawId !== null) {
    const strippedId = String(rawId).replace(/[^0-9]/g, "");
    if (strippedId) {
      cleanId = parseInt(strippedId, 10);
    }
  }

  return {
    ...(s as Record<string, unknown>), // Type assertion to keep existing properties
    id: cleanId,
    first_name: firstName,
    last_name: lastName,
    name: (s.student_name as string) || (s.name as string) || `${firstName} ${lastName}`.trim(),
    course_name: (s.course_name as string) || (s.course as Record<string, unknown>)?.name as string || "",
    email: (s.email as string) || "",
    status: s.status ? ((s.status as string).charAt(0).toUpperCase() + (s.status as string).slice(1).toLowerCase()) : "Active",
  };
}

/**
 * Fetch all students
 */
export async function fetchStudents(page: number = 1, limit: number = 50, search?: string, statusFilter?: string, courseId?: string) {
  let url = BASE_URL;
  const query = new URLSearchParams();
  if (page !== undefined && limit !== undefined) {
    query.append("page", page.toString());
    query.append("limit", limit.toString());
  }
  if (search) {
    query.append("search", search);
  }
  if (statusFilter && statusFilter !== "All") {
    query.append("status", statusFilter.toLowerCase()); // Sends 'active' or 'inactive'
  }
  if (courseId && courseId.trim() !== "") {
    query.append("course_id", courseId);
  }

  if (query.toString()) {
    url = `${BASE_URL}?${query.toString()}`;
  }

  const response = await fetch(url, { headers: getAuthHeaders() });
  const result = await handleResponse(response);

  // Map backend response to Student interface
  if (result.data && Array.isArray(result.data)) {
    return {
      ...result,
      data: result.data.map((s: Record<string, unknown>) => mapStudent(s))
    };
  }

  return Array.isArray(result) ? result.map((s: Record<string, unknown>) => mapStudent(s)) : result;
}

/**
 * Fetch a single student by ID
 */
export async function fetchStudent(id: string | number) {
  const response = await fetch(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
  const result = await handleResponse(response);
  const student = result.data || result;
  return mapStudent(student as Record<string, unknown>);
}

/**
 * Fetch student statistics
 */


export interface StudentStatsResponse {
  success: boolean;
  message: string;
  data: StudentStats;
}

export async function fetchStudentStats(): Promise<StudentStats> {
  const response = await fetch(`${BASE_URL}/stats`, { headers: getAuthHeaders() });
  const result: StudentStatsResponse = await handleResponse(response);
  return result.data;
}

/**
 * Fetch total students count
 */
export async function fetchStudentCount() {
  const response = await fetch(`${BASE_URL}/count`, { headers: getAuthHeaders() });
  const result = await handleResponse(response);
  return result.data?.total_students || 0;
}

/**
 * Fetch active students count
 */
export async function fetchActiveStudentCount() {
  const response = await fetch(`${BASE_URL}/active-count`, { headers: getAuthHeaders() });
  const result = await handleResponse(response);
  return result.data?.active_students || 0;
}

export async function createStudent(data: Record<string, unknown>) {
  const payload = {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    mobile_number: data.mobile_number,
    password: data.password,
    notes: data.notes,
    status: data.status,
    institution_id: data.institution_id,
  };

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Update a student with mapping
 */
export async function updateStudent(id: string | number, data: Record<string, unknown>) {
  // Extract or split the name if only a single name field was provided
  const { first_name, last_name } = splitName((data.name as string) || "");

  const payload: Record<string, unknown> = {
    first_name: data.firstName || data.first_name || first_name,
    last_name: data.lastName || data.last_name || last_name,
    email: data.email,
    mobile_number: data.mobile || data.mobile_number,
    password: data.password || undefined,
    notes: data.notes || undefined,
    status: data.status ? (data.status as string).toLowerCase() : undefined,
    course_id: data.courseId || data.course_id || data.course, // Support both
    institution_id: data.institution_id || data.institutionId || undefined,
  };

  // Remove undefined fields to prevent backend rejection
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * TanStack Query Hooks
 */

export function useStudents(page: number = 1, limit: number = 50, search?: string, statusFilter?: string, courseId?: string) {
  return useQuery({
    queryKey: ["students", { page, limit, search, statusFilter, courseId }],
    queryFn: () => fetchStudents(page, limit, search, statusFilter, courseId),
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes to reduce API calls
    placeholderData: keepPreviousData, // Keep previous data visible while fetching the next page for smooth pagination
  });
}

export function useStudent(id: string | number) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: () => fetchStudent(id),
    enabled: !!id,
  });
}

export function useStudentCounts() {
  return useQuery({
    queryKey: ["studentCounts"],
    queryFn: async () => {
      const [total, active] = await Promise.all([
        fetchStudentCount(),
        fetchActiveStudentCount(),
      ]);
      return { total, active };
    },
  });
}

export function useStudentStats() {
  return useQuery({
    queryKey: ["studentStats"],
    queryFn: () => fetchStudentStats(),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["studentCounts"] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown> }) => updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["studentCounts"] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["studentCounts"] });
    },
  });
}

export function useBulkUploadStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkUploadStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["studentCounts"] });
    },
  });
}

/**
 * Delete a student
 */
export async function deleteStudent(id: string | number) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  if (!response.ok && response.status !== 204) {
    return handleResponse(response);
  }
}

/**
 * Bulk upload students via CSV
 */
export async function bulkUploadStudents(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = getAuthHeaders();
  // Remove Content-Type so browser sets it with boundary for multipart/form-data
  delete headers["Content-Type"];

  const response = await fetch(`${BASE_URL}/bulk-upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to bulk upload students");
  }

  return response.json();
}
