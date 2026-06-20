"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboardStats } from "@/features/admin/dashboard/api/dashboard-api";

const QUERY_KEY = "admin-dashboard";

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: [QUERY_KEY, "stats"],
    queryFn: () => fetchAdminDashboardStats(),
  });
}
