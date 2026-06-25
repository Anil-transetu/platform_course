const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/institutions`;

export interface InstitutionContact {
  id?: string | number;
  name: string;
  email: string;
  phone: string;
  role?: string;
  designation?: string;
}

export interface Institution {
  [key: string]: any;
  id: string | number;
  batch_id?: string | number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  address?: string;
  contacts?: InstitutionContact[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstitutionStats {
  total_institutions: number;
  active_institutions: number;
  average_courses_per_institution: number;
  pending_registrations: number;
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
  return response.json();
}

export function mapInstitution(data: any): Institution {
  let contacts = data.contacts || data.point_of_contacts || data.pointOfContacts || data.institution_contacts || data.InstitutionContacts || [];
  
  if (typeof contacts === 'string') {
    try {
      contacts = JSON.parse(contacts);
    } catch(e) {
      contacts = [];
    }
  }
  
  let status = data.status;
  if (!status && data.is_active !== undefined) {
    status = data.is_active ? "Active" : "Inactive";
  }

  return {
    ...data,
    contacts,
    status,
  };
}

/**
 * Fetch all institutions
 */
export async function fetchInstitutions(
  page: number = 1,
  limit: number = 50,
  search?: string, 
  statusFilter?: string
): Promise<{ data: Institution[], total?: number }> {
  let url = BASE_URL;
  const query = new URLSearchParams();
  
  if (page !== undefined && limit !== undefined) {
    query.append("page", page.toString());
    query.append("limit", limit.toString());
  }

  if (search) {
    query.append("search", search);
  }
  if (statusFilter && statusFilter !== "All Institutions") {
    query.append("status", statusFilter.toLowerCase());
  }
  
  if (query.toString()) {
    url = `${BASE_URL}?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  const items = Array.isArray(data) ? data : data.data || data.institutions || [];
  return {
    data: items.map((i: any) => mapInstitution(i)),
    total: data.total || items.length
  };
}

/**
 * Fetch stats for institutions
 */
export async function fetchInstitutionStats(): Promise<InstitutionStats> {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(response);
  return result.data || {
    total_institutions: 0,
    active_institutions: 0,
    average_courses_per_institution: 0,
    pending_registrations: 0
  };
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
  return mapInstitution(data.data || data);
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
    method: "PUT", // or PATCH based on operation
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

  if (!response.ok && response.status !== 204) {
    await handleResponse(response);
  }
}

/**
 * Lookup institutions for dropdowns
 */
export async function fetchInstitutionsLookup(search?: string): Promise<any[]> {
  let url = `${BASE_URL}/lookup`;
  if (search) {
    const query = new URLSearchParams();
    query.append("search", search);
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return data.data || [];
}
