"use client";

import { Bell, Check, Info, FileText, GraduationCap, Calendar, AlertTriangle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead 
} from "@/features/notifications/api/notification-api";
import { useUserDetails } from "@/features/profile/api/profile-api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const notificationIcons = {
  announcement_created: <Info className="w-4 h-4 text-blue-500" />,
  assignment_submitted: <FileText className="w-4 h-4 text-emerald-500" />,
  assignment_graded: <GraduationCap className="w-4 h-4 text-purple-500" />,
  quiz_graded: <GraduationCap className="w-4 h-4 text-indigo-500" />,
  attendance_marked: <Calendar className="w-4 h-4 text-cyan-500" />,
  risk_alert: <AlertTriangle className="w-4 h-4 text-rose-500" />,
  system: <Info className="w-4 h-4 text-slate-500" />,
};

export default function StudentHeader() {
  const { data: userDetails } = useUserDetails();
  const userData = userDetails?.data || userDetails;
  const displayName = userData?.name || userData?.full_name || "Alex Thompson";
  const displayId = userData?.student_code || "ST-2024-001";
  const avatarUrl = userData?.avatar || userData?.profile_image || `https://ui-avatars.com/api/?name=${displayName.replace(/\s+/g, '+')}&background=random`;

  // Fetch only unread notifications (up to 5 for dropdown preview)
  const { data: notificationData } = useNotifications(1, 5);
  const notifications = notificationData?.data || [];
  
  // Calculate unread count dynamically
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between bg-card border-b border-gray-100 dark:border-border/50 shrink-0 lg:pl-8">
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        {/* Placeholder for search or breadcrumbs if needed */}
      </div>
      
      <div className="flex items-center gap-6">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 bg-card border border-border rounded-2xl p-2 shadow-xl" align="end">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-slate-800 mb-1">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllRead()}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No new notifications
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                    onClick={() => !notif.is_read && markRead(notif.id)}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-background border border-border">
                      {notificationIcons[notif.type] || <Info className="w-4 h-4 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${!notif.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-1 mt-1">
              <Link 
                href="/settings/notifications" 
                className="w-full block py-2 text-center text-xs text-blue-600 hover:underline font-medium"
              >
                View all notifications
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100 dark:border-border/50">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{displayName}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">ID: {displayId}</p>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-border">
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
