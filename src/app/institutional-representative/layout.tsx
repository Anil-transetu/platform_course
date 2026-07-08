"use client";

import { useEffect, useState } from "react";
import RolesSidebar from "@/components/sidebar/roles-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { fetchNotifications } from "@/features/notifications/api/notification-api";

export default function InstitutionalRepresentativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetchNotifications(1, 1, false);
      const count = (res as any).unread_count !== undefined 
        ? (res as any).unread_count 
        : (res.data as any)?.unread_count !== undefined 
          ? (res.data as any).unread_count 
          : res.pagination?.total ?? 0;
      setUnreadCount(count);
      setNotifications(res.data || []);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const handleDropdownOpen = async () => {
    try {
      const res = await fetchNotifications(1, 20);
      setNotifications(res.data || []);
      const count = (res as any).unread_count !== undefined 
        ? (res as any).unread_count 
        : (res.data as any)?.unread_count !== undefined 
          ? (res.data as any).unread_count 
          : res.pagination?.total ?? 0;
      setUnreadCount(count);
    } catch (err) {
      // silent
    }
  };

  const handleNotificationsClick = async () => {
    setUnreadCount(0);
    try {
      const tokenMatch = typeof document !== 'undefined' ? document.cookie.match(/(^| )token=([^;]+)/) : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (tokenMatch) {
        headers["Authorization"] = `Bearer ${tokenMatch[2]}`;
      }
      const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
      await fetch(`${API_HOST}/api/v1/notifications/read-all`, {
        method: "PATCH",
        headers,
      });
    } catch (err) {
      // silent
    }
  };

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <RolesSidebar 
        role="INSTITUTION_REP" 
        unreadCount={unreadCount}
        notifications={notifications}
        onDropdownOpen={handleDropdownOpen}
        onNotificationsClick={handleNotificationsClick}
      />
      <SidebarInset className="flex flex-col overflow-hidden bg-muted">
        <main className="flex-1 overflow-hidden flex flex-col h-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

