import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/institution-rep/batches`;

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
        document.cookie =
          "mock_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
      }
    }
    throw new Error(message);
  }
  return response.json();
}

// Interfaces based on API Responses

export interface BatchItem extends Record<string, any> {
  id: number;
  batch_id: string;
  batch_name: string;
  institution_name: string;
  tutor: string;
  course: string;
  department: string;
  start_date: string;
  status: string;
  total_students: number;
  progress_percentage: number;
  progress_status: string;
}

export interface BatchListResponse {
  batches: BatchItem[];
  filters: {
    departments: string[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BatchStats {
  total_batches: number;
  active_students: number;
  avg_progress_percent: number;
  at_risk_students: number;
}

export interface BatchOverview {
  batch_id: string;
  batch_name: string;
  course_name: string;
  tutor: string;
  total_active_students: number;
  batch_avg_score: number;
  assignment_completion_percent: number;
  at_risk_count: number;
}

export interface BatchStudent extends Record<string, any> {
  student_id: number;
  student_name: string;
  avatar_url: string | null;
  attendance_percent: number;
  quiz_avg: number;
  assignments_completed: number;
  assignments_total: number;
  status: string;
}

export interface BatchStudentsResponse {
  students: BatchStudent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentStats {
  student_info: {
    student_id: string;
    student_name: string;
    email: string;
    avatar_url: string | null;
    status: string;
    batch_name: string;
  };
  attendance: {
    attendance_percent: number;
    days_present: number;
    total_working_days: number;
    attendance_label: string;
  };
  assessments: {
    assignments_submitted: number;
    assignments_total: number;
    submission_rate_percent: number;
  };
  quizzes: {
    quizzes_submitted: number;
    quizzes_total: number;
    quiz_proficiency_percent: number;
    proficiency_label: string;
  };
}

export interface Submission extends Record<string, any> {
  id: number | string;
  title: string;
  type: "Quiz" | "Assignment";
  moduleName?: string;
  module_name?: string;
  submissionDate: string;
  submission_date?: string;
  score: number;
  maxScore: number;
  max_score?: number;
  percentage: number;
}

export interface AcademicPerformanceResponse {
  submissions: Submission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CalendarDay {
  date: string;
  day_of_week: string;
  status: "present" | "absent" | "late" | "no_class" | "no_session" | string;
}

export interface AttendanceCalendarResponse {
  student_name: string;
  student_id: string;
  batch_name: string;
  month: string;
  calendar_days: CalendarDay[];
  monthly_stats: {
    total_working_days: number;
    days_present: number;
    absences: number;
    late_occurrences: number;
    attendance_rate_percent: number;
  };
}

/**
 * 1. Fetch Batch List
 */
export async function fetchRepBatches(
  page: number = 1,
  limit: number = 10,
  search?: string,
  filterField?: string,
  filterValue?: string
): Promise<BatchListResponse> {
  let url = `${BASE_URL}`;
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("limit", limit.toString());

  if (search && search.trim() !== "") {
    query.append("search", search);
  }

  if (filterField && filterValue && filterValue !== "All" && filterValue.trim() !== "") {
    query.append("filter_field", filterField);
    query.append("filter_value", filterValue);
  }

  url += `?${query.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * 1.5 Fetch Batch Stats
 */
export async function fetchRepBatchStats(): Promise<BatchStats> {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * 2. Get Download Batch List URL
 */
export function getDownloadBatchListUrl(format: "pdf" | "csv" = "pdf"): string {
  return `${BASE_URL}/download?format=${format}`;
}

/**
 * 3. Fetch Batch Overview
 */
export async function fetchRepBatchOverview(batchId: string | number): Promise<BatchOverview> {
  const response = await fetch(`${BASE_URL}/${batchId}/overview`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * 4. Get Export Batch Report URL
 */
export function getExportBatchReportUrl(batchId: string | number): string {
  return `${BASE_URL}/${batchId}/export-report`;
}

/**
 * 5. Fetch Batch Students Table
 */
export async function fetchRepBatchStudents(
  batchId: string | number,
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
): Promise<BatchStudentsResponse> {
  let url = `${BASE_URL}/${batchId}/students`;
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("limit", limit.toString());

  if (search && search.trim() !== "") {
    query.append("search", search);
  }

  if (status && status !== "All" && status.trim() !== "") {
    query.append("status", status.toLowerCase());
  }

  url += `?${query.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * 6. Fetch Student Stats
 */
export async function fetchRepStudentStats(
  batchId: string | number,
  studentId: string | number
): Promise<StudentStats> {
  const response = await fetch(`${BASE_URL}/${batchId}/students/${studentId}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * 7. Fetch Academic Performance
 */
export async function fetchRepStudentAcademicPerformance(
  batchId: string | number,
  studentId: string | number,
  page: number = 1,
  limit: number = 10,
  type: string = "all",
  search?: string
): Promise<AcademicPerformanceResponse> {
  let url = `${BASE_URL}/${batchId}/students/${studentId}/academic-performance`;
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("limit", limit.toString());
  query.append("type", type.toLowerCase());

  if (search && search.trim() !== "") {
    query.append("search", search);
  }

  url += `?${query.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * 8. Fetch Attendance Calendar
 */
export async function fetchRepAttendanceCalendar(
  batchId: string | number,
  studentId: string | number,
  month?: string
): Promise<AttendanceCalendarResponse> {
  let url = `${BASE_URL}/${batchId}/students/${studentId}/attendance-calendar`;
  if (month) {
    url += `?month=${month}`;
  }
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * Query Hooks
 */

export function useRepBatches(
  page: number = 1,
  limit: number = 10,
  search?: string,
  filterField?: string,
  filterValue?: string
) {
  return useQuery({
    queryKey: ["repBatches", { page, limit, search, filterField, filterValue }],
    queryFn: () => fetchRepBatches(page, limit, search, filterField, filterValue),
    staleTime: 1 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useRepBatchStats() {
  return useQuery({
    queryKey: ["repBatchStats"],
    queryFn: () => fetchRepBatchStats(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRepBatchOverview(batchId: string | number) {
  return useQuery({
    queryKey: ["repBatchOverview", batchId],
    queryFn: () => fetchRepBatchOverview(batchId),
    staleTime: 2 * 60 * 1000,
    enabled: !!batchId,
    refetchOnWindowFocus: false,
  });
}

export function useRepBatchStudents(
  batchId: string | number,
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
) {
  return useQuery({
    queryKey: ["repBatchStudents", { batchId, page, limit, search, status }],
    queryFn: () => fetchRepBatchStudents(batchId, page, limit, search, status),
    staleTime: 1 * 60 * 1000,
    enabled: !!batchId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useRepStudentStats(batchId: string | number, studentId: string | number) {
  return useQuery({
    queryKey: ["repStudentStats", { batchId, studentId }],
    queryFn: () => fetchRepStudentStats(batchId, studentId),
    staleTime: 2 * 60 * 1000,
    enabled: !!batchId && !!studentId,
    refetchOnWindowFocus: false,
  });
}

export function useRepStudentAcademicPerformance(
  batchId: string | number,
  studentId: string | number,
  page: number = 1,
  limit: number = 10,
  type: string = "all",
  search?: string
) {
  return useQuery({
    queryKey: ["repStudentAcademicPerformance", { batchId, studentId, page, limit, type, search }],
    queryFn: () => fetchRepStudentAcademicPerformance(batchId, studentId, page, limit, type, search),
    staleTime: 1 * 60 * 1000,
    enabled: !!batchId && !!studentId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useRepAttendanceCalendar(
  batchId: string | number,
  studentId: string | number,
  month?: string
) {
  return useQuery({
    queryKey: ["repAttendanceCalendar", { batchId, studentId, month }],
    queryFn: () => fetchRepAttendanceCalendar(batchId, studentId, month),
    staleTime: 1 * 60 * 1000,
    enabled: !!batchId && !!studentId,
    refetchOnWindowFocus: false,
  });
}

/**
 * Downloads an authenticated file using active JWT token
 */
export async function downloadAuthenticatedFile(url: string, filename: string) {
  const headers = getAuthHeaders();
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}
