import { Bell } from "lucide-react";

export default function NotificationsSettingsPage() {
  return (
    <div className="h-full min-h-[400px] bg-card border border-dashed border-border rounded-xl flex flex-col items-center justify-center p-4 md:p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Bell className="w-5 h-5 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No new notifications</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        You're all caught up! Check back later for new alerts and updates.
      </p>
    </div>
  );
}
