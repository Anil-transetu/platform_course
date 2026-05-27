const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/users`;

export interface User {
  id: string | number;
  name?: string;
  full_name?: string;
  email: string;
  role: string;
  institution?: string;
  status?: string;
  joinedDate?: string;
  created_at?: string;
  avatar?: string;
  password?: string;
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
 * Fetch all users
 */
export async function fetchUsers(
  page: number = 1,
  limit: number = 50,
  search?: string,
  roleFilter?: string
): Promise<User[]> {
  let url = BASE_URL;
  const query = new URLSearchParams();

  if (page !== undefined && limit !== undefined) {
    query.append("page", page.toString());
    query.append("limit", limit.toString());
  }

  if (search) {
    query.append("search", search);
  }

  if (roleFilter && roleFilter !== "All Roles") {
    query.append("role", roleFilter);
  }

  if (query.toString()) {
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return Array.isArray(data) ? data : data.data || data.users || [];
}

/**
 * Fetch a single user by ID
 */
export async function fetchUserById(id: string | number): Promise<User> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return data.data || data;
}

/**
 * Create a new user
 */
export async function createUser(userData: Partial<User>): Promise<User> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  const data = await handleResponse(response);
  return data.data || data;
}

/**
 * Update an existing user
 */
export async function updateUser(
  id: string | number,
  userData: Partial<User>
): Promise<User> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  const data = await handleResponse(response);
  return data.data || data;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string | number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleResponse(response);
}

/**
 * Fetch admin count
 */
export async function fetchAdminCount(): Promise<number> {
  const response = await fetch("/api/v1/users/count/admins", {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  // Handle response structure: { success, message, data: { count } }
  if (data?.data?.count !== undefined) {
    return data.data.count;
  }
  if (typeof data === "number") {
    return data;
  }
  if (data?.count !== undefined) {
    return data.count;
  }
  return 0;
}

/**
 * Fetch representative count
 */
export async function fetchRepresentativeCount(): Promise<number> {
  const response = await fetch("/api/v1/users/count/representatives", {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  // Handle response structure: { success, message, data: { count } }
  if (data?.data?.count !== undefined) {
    return data.data.count;
  }
  if (typeof data === "number") {
    return data;
  }
  if (data?.count !== undefined) {
    return data.count;
  }
  return 0;
}

/**
 * Fetch institution count
 */
export async function fetchInstitutionCount(): Promise<number> {
  const response = await fetch("/api/v1/users/count/institutions", {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  // Handle response structure: { success, message, data: { count } }
  if (data?.data?.count !== undefined) {
    return data.data.count;
  }
  if (typeof data === "number") {
    return data;
  }
  if (data?.count !== undefined) {
    return data.count;
  }
  return 0;
}
