// File: src/features/notifications/api/notification-api.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getAuthHeaders, handleResponse } from "@/lib/api-client";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/notifications`;

export interface Notification {
  id: string | number;
  recipient_user_id: string | number;
  sender_user_id: string | number | null;
  title: string;
  message: string;
  type: 'assignment_submitted' | 'announcement_created' | 'quiz_graded' | 'assignment_graded' | 'attendance_marked' | 'risk_alert' | 'system';
  is_read: boolean;
  reference_type: string | null;
  reference_id: string | number | null;
  read_at: string | null;
  created_at: string;
  Sender?: {
    id: string | number;
    full_name: string;
    email: string;
    role: string;
  };
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Fetch paginated user notifications
 */
export async function fetchNotifications(
  page: number = 1,
  limit: number = 20,
  isRead?: boolean
): Promise<NotificationsResponse> {
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("limit", limit.toString());
  
  if (isRead !== undefined) {
    query.append("is_read", isRead.toString());
  }

  const response = await fetch(`${BASE_URL}?${query.toString()}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId: string | number) {
  const response = await fetch(`${BASE_URL}/${notificationId}/read`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  const response = await fetch(`${BASE_URL}/read-all`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * React Query Hooks
 */
export function useNotifications(
  page: number = 1,
  limit: number = 20,
  isRead?: boolean,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["notifications", { page, limit, isRead }],
    queryFn: () => fetchNotifications(page, limit, isRead),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes cache to prevent duplicate requests
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => markNotificationRead(id),
    onSuccess: (_, variables) => {
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((n: Notification) =>
            String(n.id) === String(variables)
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((n: Notification) => ({
            ...n,
            is_read: true,
            read_at: new Date().toISOString(),
          })),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useNotificationUnreadCount() {
  const { data } = useNotifications(1, 20);
  const notifications = data?.data;
  return Array.isArray(notifications) ? notifications.filter((n) => !n.is_read).length : 0;
}


