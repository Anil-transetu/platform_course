import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/institution-rep/dashboard`;

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

export interface RepDashboardStats {
  avg_quiz_score: {
    value: number;
    trend: string;
    trend_direction: string;
  };
  completion_rate: {
    value: number;
    label: string;
  };
  total_batches: {
    active_count: number;
    pending_graduation: number;
  };
  at_risk_students: {
    count: number;
    today_change: number;
    urgency_label: string;
  };
}

export interface MonitoringStudent {
  student_id: number;
  student_name: string;
  avatar_url?: string | null;
  batch_id: number;
  batch_name: string;
  avg_quiz_score: number;
  attendance_percent: number;
  status: string;
  // Keep support for legacy or optional properties
  id?: string | number;
  name?: string;
  full_name?: string;
  email?: string;
  batch?: string;
  avgQuizScore?: number;
  attendance?: number;
  attendance_percentage?: number;
  [key: string]: any;
}

export interface BatchFilterOption {
  batch_id: number;
  batch_name: string;
  id?: string | number;
  name?: string;
  batchName?: string;
}

export interface RepMonitoringListResponse {
  students: MonitoringStudent[];
  batch_filters: BatchFilterOption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch Stats
 */
export async function fetchRepDashboardStats(): Promise<RepDashboardStats> {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || result;
}

/**
 * Fetch Monitoring List
 */
export async function fetchRepMonitoringList(
  page: number = 1,
  limit: number = 10,
  search?: string,
  batchId?: string
): Promise<RepMonitoringListResponse> {
  let url = `${BASE_URL}/monitoring-list`;
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
export function useRepDashboardStats() {
  return useQuery({
    queryKey: ["repDashboardStats"],
    queryFn: () => fetchRepDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRepMonitoringList(
  page: number = 1,
  limit: number = 10,
  search?: string,
  batchId?: string
) {
  return useQuery({
    queryKey: ["repMonitoringList", { page, limit, search, batchId }],
    queryFn: () => fetchRepMonitoringList(page, limit, search, batchId),
    staleTime: 1 * 60 * 1000, // 1 minute
    placeholderData: keepPreviousData,
  });
}
