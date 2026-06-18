"use client";

import React from "react";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="p-8 h-full min-h-[70vh] flex flex-col justify-center items-center">
      <div className="max-w-md w-full border-2 border-dashed border-slate-200 dark:border-border/60 rounded-[32px] p-12 text-center flex flex-col items-center justify-center gap-4 bg-white dark:bg-card/40 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2">
          <FileText size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">Reports</h2>
        <p className="text-sm text-slate-500 dark:text-muted-foreground max-w-xs leading-relaxed">
          The Reports module is coming soon. Features are currently under development.
        </p>
      </div>
    </div>
  );
}
