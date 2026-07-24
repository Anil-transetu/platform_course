import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { User, UserStats } from "@/types/user";
import { getAuthHeaders, handleResponse } from "@/lib/api-client";


const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/users`;



/**
 * Mapping helper: Normalizes user data from backend to frontend format
 */
function mapUser(u: Record<string, unknown>): User {
  let status = u.status as string;
  if (!status) {
    if (u.is_active !== undefined) {
      status = u.is_active ? "active" : "inactive";
    } else {
      const idStr = String(u.id || "");
      status = idStr.startsWith("REQ-") ? "pending" : "active";
    }
  }

  let role = (u.role as string) || "N/A";
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes("institution rep") || lowerRole === "institution_rep" || lowerRole === "institution_representative") {
    role = "Institution Representative";
  } else if (lowerRole === "admin") {
    role = "Admin";
  } else if (lowerRole === "tutor") {
    role = "Tutor";
  }

  const cleanId = u.id !== undefined && u.id !== null ? u.id : "N/A";

  let instName = "N/A";
  let instId = "";
  if (u.institution && typeof u.institution === "object") {
    instName = (u.institution as any).name || "N/A";
    instId = (u.institution as any).id || "";
  } else if (typeof u.institution === "string") {
    instName = u.institution;
  }
  
  if (u.institution_id) {
    instId = u.institution_id as string;
  }

  return {
    id: cleanId as string | number,
    name: (u.full_name as string) || (u.name as string) || "N/A",
    email: (u.email as string) || "N/A",
    role: role,
    institution: instName,
    institution_id: instId,
    joinedDate: u.created_at ? new Date(u.created_at as string).toLocaleDateString() : "N/A",
    avatar: `https://i.pravatar.cc/150?u=${cleanId}`,
    avatar_url: (u.avatar_url as string) || undefined,
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
      apiRole = "institution_representative";
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
  if (apiRole.includes("institution representative") || apiRole === "institution_rep") {
    apiRole = "institution_representative";
  }

  const payload: Record<string, unknown> = {
    full_name: data.name,
    email: data.email,
    role: apiRole,
  };

  if (data.password) {
    payload.password = data.password;
  }

  if (apiRole === "institution_representative" && data.institution_id) {
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
  if (apiRole.includes("institution representative") || apiRole === "institution_rep") {
    apiRole = "institution_representative";
  }

  const payload: Record<string, unknown> = {
    full_name: data.name,
    email: data.email,
    role: apiRole,
  };

  if (apiRole === "institution_representative" && data.institution_id) {
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
 * Update user status (Enable/Disable)
 */
export async function updateUserStatus(id: string | number, status: string) {
  const response = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
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

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) => updateUserStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}
