"use client";

import { useState } from "react";
import { Bell, Check, Info, FileText, GraduationCap, Calendar, AlertTriangle } from "lucide-react";
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead 
} from "@/features/notifications/api/notification-api";
import { formatDistanceToNow } from "date-fns";

const notificationIcons = {
  announcement_created: <Info className="w-5 h-5 text-blue-500" />,
  assignment_submitted: <FileText className="w-5 h-5 text-emerald-500" />,
  assignment_graded: <GraduationCap className="w-5 h-5 text-purple-500" />,
  quiz_graded: <GraduationCap className="w-5 h-5 text-indigo-500" />,
  attendance_marked: <Calendar className="w-5 h-5 text-cyan-500" />,
  risk_alert: <AlertTriangle className="w-5 h-5 text-rose-500" />,
  system: <Info className="w-5 h-5 text-slate-500" />,
};

export default function NotificationsSettingsPage() {
  const [filterUnread, setFilterUnread] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data: response, isLoading } = useNotifications(page, limit, filterUnread);
  const notifications = response?.data || [];
  const pagination = response?.pagination;
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const totalUnread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Your Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Manage and view alerts regarding assignments, grades, announcements, and system updates.
          </p>
        </div>
        {totalUnread > 0 && (
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
          >
            <Check size={16} /> Mark all read
          </button>
        )}
      </div>

      {/* Filtering tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setFilterUnread(undefined); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-colors ${filterUnread === undefined ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          All
        </button>
        <button
          onClick={() => { setFilterUnread(false); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-colors ${filterUnread === false ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Unread
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/30 border border-border animate-pulse rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="h-64 bg-card border border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No notifications found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Check back later for any course updates, assignments, grades or system announcements.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && markRead(notif.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${!notif.is_read ? 'bg-blue-50/20 dark:bg-blue-950/10 border-blue-100 dark:border-blue-950/50 shadow-sm' : 'bg-card border-border hover:bg-muted/10'}`}
            >
              <div className="p-2 rounded-xl bg-background border border-border">
                {notificationIcons[notif.type] || <Info className="w-5 h-5 text-gray-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm ${!notif.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notif.message}
                </p>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-50 hover:bg-muted/10 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-50 hover:bg-muted/10 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
