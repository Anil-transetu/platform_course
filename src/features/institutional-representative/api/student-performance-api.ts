import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/institution-rep/student-performance`;

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

export interface StudentPerformer {
  student_id: number;
  student_name: string;
  score_percent: number;
}

export interface ClassAverage {
  average_percent: number;
}

export interface StudentPerformanceKPI {
  highest_performer: StudentPerformer;
  class_average: ClassAverage;
  most_improved: {
    student_id: number;
    student_name: string;
    improvement_percent: number;
  } | null;
}

export interface DistributionTier {
  tier_key: "high" | "average" | "below_average" | "at_risk" | string;
  label: string;
  student_count: number;
  percentage: number;
}

export interface StudentPerformanceSummary {
  term: string;
  kpi: StudentPerformanceKPI;
  distribution_tiers: DistributionTier[];
  total_students: number;
}

export interface TopStudent extends Record<string, any> {
  student_id: number;
  student_name: string;
  avatar_url: string | null;
  batch_name: string;
  avg_quiz_score: number;
  assignments_completed: number;
  assignments_total: number;
  overall_grade: string;
}

export interface TopStudentsResponse {
  students: TopStudent[];
  total_returned: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch Student Performance Summary
 */
export async function fetchStudentPerformanceSummary(): Promise<StudentPerformanceSummary> {
  const response = await fetch(`${BASE_URL}/summary`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * Fetch Top Students
 */
export async function fetchTopStudents(
  page: number = 1,
  limit: number = 10,
  search?: string,
  batchId?: string
): Promise<TopStudentsResponse> {
  let url = `${BASE_URL}/top-students`;
  const query = new URLSearchParams();

  query.append("page", page.toString());
  query.append("limit", limit.toString());

  if (search && search.trim() !== "") {
    query.append("search", search);
  }

  if (batchId && batchId !== "All") {
    query.append("batch_id", batchId);
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
 * Query Hooks
 */
export function useStudentPerformanceSummary() {
  return useQuery({
    queryKey: ["studentPerformanceSummary"],
    queryFn: () => fetchStudentPerformanceSummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTopStudents(
  page: number = 1,
  limit: number = 10,
  search?: string,
  batchId?: string
) {
  return useQuery({
    queryKey: ["topStudents", { page, limit, search, batchId }],
    queryFn: () => fetchTopStudents(page, limit, search, batchId),
    staleTime: 1 * 60 * 1000, // 1 minute
    placeholderData: keepPreviousData,
  });
}
