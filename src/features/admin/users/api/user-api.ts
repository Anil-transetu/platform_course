import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { User, UserStats } from "@/types/user";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/users`;

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
        window.location.href = "/login";
      }
    }
    throw new Error(message);
  }
  return response.json();
}

/**
 * Mapping helper: Normalizes user data from backend to frontend format
 */
function mapUser(u: Record<string, unknown>): User {
  let status = u.status as string;
  if (!status) {
    const idStr = String(u.id || "");
    status = idStr.startsWith("REQ-") ? "pending" : "active";
  }

  let role = (u.role as string) || "N/A";
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes("institution rep") || lowerRole === "institution_rep") {
    role = "Institution Representative";
  } else if (lowerRole === "admin") {
    role = "Admin";
  } else if (lowerRole === "tutor") {
    role = "Tutor";
  }

  const cleanId = u.id !== undefined && u.id !== null ? u.id : "N/A";

  return {
    id: cleanId as string | number,
    name: (u.full_name as string) || (u.name as string) || "N/A",
    email: (u.email as string) || "N/A",
    role: role,
    institution: (u.institution as string) || "N/A",
    joinedDate: u.created_at ? new Date(u.created_at as string).toLocaleDateString() : "N/A",
    avatar: `https://i.pravatar.cc/150?u=${cleanId}`,
    status: status,
  };
}

/**
 * Fetch all users
 */
export async function fetchUsers(
  page: number = 1,
  limit: number = 50,
  search?: string,
  roleFilter?: string,
  statusFilter?: string
) {
  let url = BASE_URL;
  const query = new URLSearchParams();

  if (page !== undefined && limit !== undefined) {
    query.append("page", page.toString());
    query.append("limit", limit.toString());
  }

  if (search) {
    query.append("search", search);
  }

  if (roleFilter && roleFilter !== "All Roles" && roleFilter !== "All") {
    let apiRole = roleFilter.toLowerCase();
    if (apiRole.includes("institution representative") || apiRole === "institution rep") {
      apiRole = "institution_rep";
    }
    query.append("role", apiRole);
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
      data: result.data.map((u: Record<string, unknown>) => mapUser(u))
    };
  }

  return Array.isArray(result) ? result.map((u: Record<string, unknown>) => mapUser(u)) : result;
}

/**
 * Fetch a single user by ID
 */
export async function fetchUserById(id: string | number) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  const user = result.data || result;
  return mapUser(user as Record<string, unknown>);
}

/**
 * Create a new user
 */
export async function createUser(data: Record<string, unknown>) {
  let apiRole = (data.role as string).toLowerCase();
  if (apiRole.includes("institution representative")) {
    apiRole = "institution_rep";
  }

  const payload: Record<string, unknown> = {
    full_name: data.name,
    email: data.email,
    role: apiRole,
  };

  if (data.password) {
    payload.password = data.password;
  }

  if (apiRole === "institution_rep" && data.institution_id) {
    payload.institution_id = data.institution_id;
  }

  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * Update an existing user
 */
export async function updateUser(id: string | number, data: Record<string, unknown>) {
  let apiRole = (data.role as string).toLowerCase();
  if (apiRole.includes("institution representative")) {
    apiRole = "institution_rep";
  }

  const payload: Record<string, unknown> = {
    full_name: data.name,
    email: data.email,
    role: apiRole,
  };

  if (apiRole === "institution_rep" && data.institution_id) {
    payload.institution_id = data.institution_id;
  }

  if (data.password && (data.password as string).trim() !== "") {
    payload.password = data.password;
  }

  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * Delete a user
 */
export async function deleteUser(id: string | number) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    return handleResponse(response);
  }
}

/**
 * Fetch user stats (counts)
 */
export async function fetchUserStats(): Promise<UserStats> {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  const stats = result?.data || result || {};
  return {
    admins: stats.total_admins || stats.admins || stats.admin_count || 0,
    representatives: stats.total_representatives || stats.representatives || stats.representative_count || 0,
    institutions: stats.total_institutions || stats.institutions || stats.institution_count || 0,
  };
}

/**
 * TanStack Query Hooks
 */

export function useUsers(page: number = 1, limit: number = 50, search?: string, roleFilter?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["users", { page, limit, search, roleFilter, statusFilter }],
    queryFn: () => fetchUsers(page, limit, search, roleFilter, statusFilter),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string | number) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ["userStats"],
    queryFn: () => fetchUserStats(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown> }) => updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}
