import { getAuthHeaders, handleResponse } from "@/lib/api-client";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/admin/dashboard`;



/**
 * Fetch Admin Dashboard Stats
 */
export async function fetchAdminDashboardStats() {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result.data || result;
}
