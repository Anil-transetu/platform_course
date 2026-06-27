"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Bell, Palette, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SettingsNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "General", href: "/settings/general", icon: User },
    { name: "Appearance", href: "/settings/appearance", icon: Palette },
    { name: "Notifications", href: "/settings/notifications", icon: Bell },
  ];

  return (
    <div className="w-64 shrink-0 flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border",
              isActive 
                ? "bg-accent text-accent-foreground border-border" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        );
      })}
      <div className="my-4 border-t border-border" />
      <button 
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border border-transparent"
        onClick={() => {
          document.cookie = "mock_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.replace("/login?msg=logout_success");
        }}
      >
        <LogOut className="w-4 h-4" />
        Log out
      </button>
    </div>
  );
}
