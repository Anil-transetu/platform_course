import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuthHeaders, handleResponse } from "@/lib/api-client";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/tutor-portal/batch`;

export interface BatchAssignmentStats {
  totalStudents?: number;
  total_students?: number;
  submittedAssignments?: number;
  submitted_assignments?: number;
  total_submissions?: number;
  pendingEvaluations?: number;
  pending_evaluations?: number;
}

/**
 * Fetch Assignment Stats by Batch ID
 * Endpoint: GET /api/v1/tutor-portal/batch/:batchId/assignment-stats
 */
export async function fetchBatchAssignmentStats(batchId: string | number): Promise<BatchAssignmentStats> {
  const response = await fetch(`${BASE_URL}/${batchId}/assignment-stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  const data = result.data || result || {};
  return {
    totalStudents: data.totalStudents ?? data.total_students ?? 0,
    submittedAssignments: data.submittedAssignments ?? data.submitted_assignments ?? data.total_submissions ?? 0,
    pendingEvaluations: data.pendingEvaluations ?? data.pending_evaluations ?? 0,
  };
}

/**
 * React Query Hook for assignment stats
 */
export function useBatchAssignmentStats(batchId: string | number) {
  return useQuery({
    queryKey: ["batch-assignment-stats", batchId],
    queryFn: () => fetchBatchAssignmentStats(batchId),
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch Student Assignment List by Batch ID
 * Endpoint: GET /api/v1/tutor-portal/batch/:batchId/assignments
 */
export async function fetchBatchAssignments(
  batchId: number | string,
  page: number = 1,
  limit: number = 5,
  search?: string
) {
  let url = `${BASE_URL}/${batchId}/assignments`;

  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search?.trim()) {
    query.append("search", search.trim());
  }

  url += `?${query.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);

  const data = result?.data?.data || result?.data || [];
  const total = result?.data?.total ?? result?.total ?? result?.pagination?.total_items ?? data.length;

  const mappedData = Array.isArray(data) ? data.map((s: any) => ({
    id: s.id || `${s.studentId || s.student_id}-${s.assignmentId || s.assignment_id || "assignment"}`,
    studentId: s.studentId ?? s.student_id ?? s.id ?? 0,
    studentProfile: s.studentProfile || s.student_profile || s.avatar || null,
    name: s.studentName || s.student_name || s.name || "N/A",
    email: s.studentEmail || s.student_email || s.email || "N/A",
    latestAssignment: s.latestAssignment || s.latest_assignment || s.assignmentTitle || s.assignment_title || "N/A",
    submittedOn: s.submittedOn || s.submitted_on || s.submissionDate || s.submission_date || "N/A",
    submittedAssignmentCount: s.submittedAssignmentCount ?? s.submitted_assignment_count ?? s.submissionCount ?? s.submission_count ?? 0,
  })) : [];

  return {
    data: mappedData,
    total,
  };
}

export function useBatchAssignments(
  batchId: number | string,
  page: number = 1,
  limit: number = 5,
  search?: string
) {
  return useQuery({
    queryKey: ["batchAssignments", batchId, { page, limit, search }],
    queryFn: () => fetchBatchAssignments(batchId, page, limit, search),
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
