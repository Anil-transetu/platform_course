import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAuthHeaders, handleResponse } from "@/lib/api-client";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const STATS_URL = `${API_HOST}/api/v1/tutor-portal/assignments/stats`;
const DASHBOARD_URL = `${API_HOST}/api/v1/tutor-portal/assignments`;

export interface TutorAssignmentStats {
  totalBatches?: number;
  total_batches?: number;
  totalAssignmentSubmissions?: number;
  total_assignment_submissions?: number;
  total_submissions?: number;
  pendingEvaluations?: number;
  pending_evaluations?: number;
}

/**
 * Fetch tutor assignment management stats
 */
export async function fetchTutorAssignmentStats(): Promise<TutorAssignmentStats> {
  const response = await fetch(STATS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  const data = result?.data || result || {};
  return {
    totalBatches: data.totalBatches ?? data.total_batches ?? 0,
    totalAssignmentSubmissions: data.totalAssignmentSubmissions ?? data.total_assignment_submissions ?? data.total_submissions ?? 0,
    pendingEvaluations: data.pendingEvaluations ?? data.pending_evaluations ?? 0,
  };
}

/**
 * Fetch tutor assignment batches with pagination and search
 */
export async function fetchTutorAssignmentBatches(page: number = 1, limit: number = 5, search?: string) {
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

  const mappedData = Array.isArray(data) ? data.map((b: any) => ({
    id: b.batchId || b.batch_id || b.id || 0,
    batch_id: b.batchId || b.batch_id || b.id || 0,
    batch_name: b.batchName || b.batch_name || b.name || "N/A",
    course_name: b.courseName || b.course_name || b.course || "N/A",
    total_assignments: b.totalAssignments ?? b.total_assignments ?? b.assignments_count ?? 0,
  })) : [];

  return {
    data: mappedData,
    total: total,
  };
}

/**
 * TanStack Query Hooks
 */

export function useTutorAssignmentStats() {
  return useQuery({
    queryKey: ["tutorAssignmentStats"],
    queryFn: fetchTutorAssignmentStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTutorAssignmentBatches(page: number = 1, limit: number = 5, search?: string) {
  return useQuery({
    queryKey: ["tutorAssignmentBatches", { page, limit, search }],
    queryFn: () => fetchTutorAssignmentBatches(page, limit, search),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
