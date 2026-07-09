const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/assignments`;

export interface EvaluationCriteria {
  name: string;
  marks: number | string;
}

export interface Assignment {
  [key: string]: any;
  id: string | number;
  title?: string;
  assignment_title?: string; // fallback
  course?: string;
  courseColor?: string;
  domain?: string;
  domains?: string[];
  tags?: string[];
  marks?: number;
  total_marks?: number;
  submissionType?: string;
  submission_type?: string;
  description?: string;
  evaluation_matrix?: EvaluationCriteria[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentStats {
  total_assignments: number;
  active_assignments: number;
  submissions_pending: number;
  average_score: number | string;
}

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
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const err = data;
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
  return data;
}

export function mapAssignment(data: any): Assignment {
  return {
    ...data,
    id: data.id || data.assignment_id,
    title: data.title || data.assignment_title || data.assignment_name,
    marks: data.marks || data.total_marks || data.max_score,
    submissionType: data.submissionType || data.submission_type,
    domain: data.domain || (data.domains && data.domains.length > 0 ? data.domains[0] : "GENERAL"),
    domains: data.domains || (data.domain ? [data.domain] : []),
  };
}

/**
 * Fetch all assignments
 */
export async function fetchAssignments(
  page: number = 1,
  limit: number = 50,
  search?: string, 
  statusFilter?: string,
  signal?: AbortSignal
): Promise<{ data: Assignment[], total?: number }> {
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
    query.append("status", statusFilter.toLowerCase());
  }
  
  if (query.toString()) {
    url = `${BASE_URL}?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  const data = await handleResponse(response);
  const items = Array.isArray(data) ? data : data.data || data.assignments || [];
  return {
    data: items.map((i: any) => mapAssignment(i)),
    total: data.total || items.length
  };
}

/**
 * Fetch stats for assignments
 */
export async function fetchAssignmentStats(signal?: AbortSignal): Promise<AssignmentStats> {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });
  const result = await handleResponse(response);
  const d = result.data || {};
  return {
    total_assignments: d.totalAssignments ?? d.total_assignments ?? 0,
    active_assignments: d.activeAssignments ?? d.active_assignments ?? 0,
    submissions_pending: d.submissionPendingAssignments ?? d.submissions_pending ?? 0,
    average_score: d.averageScore ?? d.average_score ?? 0
  };
}

/**
 * Fetch a single assignment by ID
 */
export async function fetchAssignmentById(
  id: string | number,
  signal?: AbortSignal
): Promise<Assignment> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  const data = await handleResponse(response);
  const item = Array.isArray(data.data) ? data.data[0] : (data.data || data);
  return mapAssignment(item);
}

/**
 * Create a new assignment
 */
export async function createAssignment(
  assignmentData: Partial<Assignment>
): Promise<Assignment> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(assignmentData),
  });

  const data = await handleResponse(response);
  const item = Array.isArray(data.data) ? data.data[0] : (data.data || data);
  return item;
}

/**
 * Update an existing assignment
 */
export async function updateAssignment(
  id: string | number,
  assignmentData: Partial<Assignment>
): Promise<Assignment> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(assignmentData),
  });

  const data = await handleResponse(response);
  const item = Array.isArray(data.data) ? data.data[0] : (data.data || data);
  return item;
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(id: string | number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    await handleResponse(response);
  }
}
