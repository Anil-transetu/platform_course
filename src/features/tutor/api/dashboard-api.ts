import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAuthHeaders, handleResponse } from "@/lib/api-client";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const STATS_URL = `${API_HOST}/api/v1/tutor-portal/stats`;
const DASHBOARD_URL = `${API_HOST}/api/v1/tutor-portal/dashboard`;

export interface TutorDashboardStats {
  totalAssignedBatches?: number;
  total_assigned_batches?: number;
  totalStudents?: number;
  total_students?: number;
  pendingAssignmentEvaluations?: number;
  pending_evaluations?: number;
  pending_assignment_evaluations?: number;
}

/**
 * Fetch tutor dashboard stats
 */
export async function fetchTutorStats(): Promise<TutorDashboardStats> {
  const response = await fetch(STATS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  const data = result?.data || result || {};
  return {
    totalAssignedBatches: data.totalAssignedBatches ?? data.total_assigned_batches ?? data.total_batches ?? 0,
    totalStudents: data.totalStudents ?? data.total_students ?? 0,
    pendingAssignmentEvaluations: data.pendingAssignmentEvaluations ?? data.pending_evaluations ?? data.pending_assignment_evaluations ?? 0,
  };
}

/**
 * Fetch tutor dashboard batches with pagination and search
 */
export async function fetchTutorBatches(page: number = 1, limit: number = 5, search?: string) {
  let url = DASHBOARD_URL;
  const query = new URLSearchParams();

  query.append("page", page.toString());
  query.append("limit", limit.toString());

  if (search?.trim()) {
    query.append("search", search.trim());
  }

  if (query.toString()) {
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  
  const data = result?.data?.data || result?.data || [];
  const total = result?.data?.total ?? result?.total ?? data.length;

  const mappedData = Array.isArray(data) ? data.map((b: any) => {
    let courseName = "N/A";
    if (typeof b.course === "string") {
      courseName = b.course;
    } else if (typeof b.course === "object" && b.course !== null) {
      courseName = b.course.name || b.course.title || "N/A";
    } else if (typeof b.course_name === "string") {
      courseName = b.course_name;
    } else if (typeof b.course_name === "object" && b.course_name !== null) {
      courseName = b.course_name.name || b.course_name.title || "N/A";
    } else if (typeof b.courseName === "string") {
      courseName = b.courseName;
    }

    let batchName = "N/A";
    if (typeof b.name === "string") {
      batchName = b.name;
    } else if (typeof b.batch_name === "string") {
      batchName = b.batch_name;
    } else if (typeof b.batchName === "string") {
      batchName = b.batchName;
    }

    return {
      id: b.id || b.batch_id || b.batchId,
      name: batchName,
      course: courseName,
      progress: typeof b.progress === "number" ? b.progress : 0,
    };
  }) : [];

  return {
    data: mappedData,
    total: total,
  };
}

/**
 * TanStack Query Hooks
 */

export function useTutorDashboardStats() {
  return useQuery({
    queryKey: ["tutorDashboardStats"],
    queryFn: fetchTutorStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTutorDashboardBatches(page: number = 1, limit: number = 5, search?: string) {
  return useQuery({
    queryKey: ["tutorDashboardBatches", { page, limit, search }],
    queryFn: () => fetchTutorBatches(page, limit, search),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
