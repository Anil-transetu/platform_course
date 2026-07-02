import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, handleResponse } from "@/lib/api-client";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1`;

/**
 * Fetch unified user details (lightweight)
 */
export async function fetchUserDetails() {
  const response = await fetch(`${BASE_URL}/profile/basic`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Fetch unified user profile (role-based)
 */
export async function fetchProfile() {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Update unified user profile
 */
export async function updateProfile(data: Record<string, any> | FormData) {
  const headers = getAuthHeaders();
  const isFormData = data instanceof FormData;
  
  if (isFormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  return handleResponse(response);
}

/**
 * React Query Hooks
 */

export function useUserDetails() {
  return useQuery({
    queryKey: ["user", "details"],
    queryFn: fetchUserDetails,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Invalidate both profile and details to ensure sidebar and profile page update
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["user", "details"] });
    },
  });
}
