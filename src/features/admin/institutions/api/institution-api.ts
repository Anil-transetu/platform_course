import { getAuthHeaders, handleResponse } from "@/lib/api-client";

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
  totalInstitutions: number;
  activeInstitutions: number;
  avgCoursesPerInstitution: number;
  pendingRegistrations: number;
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
): Promise<{ data: Institution[]; total?: number; meta?: { total: number; page: number; limit: number; totalPages: number } }> {
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

  const rawData = await handleResponse(response);
  const items = Array.isArray(rawData) ? rawData : rawData.data || rawData.institutions || [];
  const meta = rawData.meta || {
    total: rawData.total || items.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil((rawData.total || items.length) / limit)
  };

  return {
    data: items.map((i: any) => mapInstitution(i)),
    total: meta.total,
    meta
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
  const data = result.data || result;
  return {
    totalInstitutions: data.totalInstitutions ?? data.total_institutions ?? 0,
    activeInstitutions: data.activeInstitutions ?? data.active_institutions ?? 0,
    avgCoursesPerInstitution: data.avgCoursesPerInstitution ?? data.average_courses_per_institution ?? 0,
    pendingRegistrations: data.pendingRegistrations ?? data.pending_registrations ?? 0,
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
  const payload = { ...institutionData };
  delete payload.status;
  delete (payload as any).is_active;

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
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
  const payload = { ...institutionData };
  delete payload.status;
  delete (payload as any).is_active;

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(response);
  return data.data || data;
}

/**
 * Update institution status (Enable/Disable)
 */
export async function updateInstitutionStatus(
  id: string | number,
  status: string
): Promise<Institution> {
  const response = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
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
 * Fetch institutions from outlook endpoint (using /api/v1/institutions/lookup)
 */
export async function fetchInstitutionsOutlook(): Promise<Institution[]> {
  const url = `${API_HOST}/api/v1/institutions/lookup`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  const items = Array.isArray(data) ? data : data.data || data.institutions || [];
  return items.map((i: any) => mapInstitution(i));
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


