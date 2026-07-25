"use client";

import React, { useEffect, useState } from "react";
import { SettingsNav } from "@/components/settings/settings-nav";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [backTarget, setBackTarget] = useState<string>("/admin/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("last_app_page");
      if (stored && !stored.startsWith("/settings")) {
        setBackTarget(stored);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 pt-6">
        {/* Back Button Header */}
        <div className="flex items-center justify-between mb-2 pb-4 border-b border-border/50">
          <button
            onClick={() => router.push(backTarget)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-border text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-accent transition-colors shadow-xs"
          >
            <ArrowLeft size={15} />
            Back to Application
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 mt-4 pb-16">
          {/* Settings Sidebar - Hidden on mobile */}
          <div className="hidden md:block">
            <SettingsNav />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
