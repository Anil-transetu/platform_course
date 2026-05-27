const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/institutions`;

export interface InstitutionContact {
  id?: string | number;
  name: string;
  email: string;
  phone: string;
  designation?: string;
}

export interface Institution {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  location?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  contacts?: InstitutionContact[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  website?: string;
  logo?: string;
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
 * Fetch all institutions
 */
export async function fetchInstitutions(search?: string): Promise<Institution[]> {
  let url = BASE_URL;

  if (search) {
    url += `?search=${encodeURIComponent(search)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return Array.isArray(data) ? data : data.data || data.institutions || [];
}

/**
 * Fetch a single institution by ID
 */
export async function fetchInstitutionById(
  id: string | number
): Promise<Institution> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return data.data || data;
}

/**
 * Create a new institution
 */
export async function createInstitution(
  institutionData: Partial<Institution>
): Promise<Institution> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(institutionData),
  });

  const data = await handleResponse(response);
  return data.data || data;
}

/**
 * Update an existing institution
 */
export async function updateInstitution(
  id: string | number,
  institutionData: Partial<Institution>
): Promise<Institution> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(institutionData),
  });

  const data = await handleResponse(response);
  return data.data || data;
}

/**
 * Delete an institution
 */
export async function deleteInstitution(id: string | number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleResponse(response);
}
