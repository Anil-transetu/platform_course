import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/institution-rep/reports`;

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

export interface ReportItem extends Record<string, any> {
  report_type: "attendance" | "performance" | "progress" | "at_risk" | string;
  title: string;
  category: string;
  description: string;
  date_generated: string;
}

export interface ReportsResponse {
  reports: ReportItem[];
}

/**
 * Fetch Recent Reports
 */
export async function fetchRecentReports(
  page: number = 1,
  limit: number = 10,
  search?: string,
  category?: string
): Promise<ReportsResponse> {
  let url = `${BASE_URL}/recent`;
  const query = new URLSearchParams();

  query.append("page", page.toString());
  query.append("limit", limit.toString());

  if (search && search.trim() !== "") {
    query.append("search", search);
  }

  if (category && category !== "All") {
    query.append("category", category);
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
 * Download Report PDF
 */
export async function downloadReportPdf(type: string, filename: string): Promise<void> {
  const headers = getAuthHeaders();
  const url = `${BASE_URL}/${type}/download`;
  
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

/**
 * Query Hooks
 */
export function useRecentReports(
  page: number = 1,
  limit: number = 10,
  search?: string,
  category?: string
) {
  return useQuery({
    queryKey: ["recentReports", { page, limit, search, category }],
    queryFn: () => fetchRecentReports(page, limit, search, category),
    staleTime: 1 * 60 * 1000, // 1 minute
    placeholderData: keepPreviousData,
  });
}
