"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reusable/DataTable";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface TutorBatch {
  id: string | number;
  name: string;
  course: string;
  schedule: string;
  allocationTime: string;
  progress: number;
}

export function buildTutorBatchColumns(): Column<TutorBatch>[] {
  return [
     {
      key: "id",
      label: "BATCH ID",
      render: (value, row) => (
        <div className="font-semibold text-slate-600 text-sm">#BAT-{row.id}</div>
      ),
    },
    {
      key: "name",
      label: "BATCH NAME",
      width: "w-1/4",
      render: (value, row) => {
        // Different colors for different batches
        const colors = [
          "bg-blue-600",
          "bg-purple-600",
          "bg-green-600",
          "bg-indigo-600",
        ];
        const colorIndex = String(row.id).length % colors.length;
        const colorClass = colors[colorIndex];

        return (
          
          <div className="flex items-center gap-3">
            {/* <div className={`w-1 h-10 rounded-full flex-shrink-0 ${colorClass}`} /> */}
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {row.name}
              </p>
              {/* <p className="text-xs text-muted-foreground truncate">
                {row.schedule || "No Schedule"}
              </p> */}
            </div>
          </div>
        );
      },
    },
    {
      key: "course",
      label: "ALLOCATED COURSE",
<<<<<<< HEAD
      render: (value, row) => (
        <div className="font-semibold text-slate-600 text-sm">
          {row.course || "N/A"}
        </div>
      ),
=======
      render: (value, row) => {
        const courseName = typeof row.course === "object" && row.course !== null ? (row.course as any).name : row.course;
        return (
          <div className="font-semibold text-slate-600 text-sm">
            {courseName || "N/A"}
          </div>
        );
      },
>>>>>>> d02bf19c3bd1a348437e5c29da4bc8e1e13f0700
    },
    {
      key: "allocationTime",
      label: "ALLOCATION TIME",
      render: (value, row) => (
        <div className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {row.allocationTime || "-"}
        </div>
      ),
    },
    {
      key: "progress",
      label: "PROGRESS",
      render: (value, row) => {
        const progress = row.progress || 0;
        let progressColor = "bg-blue-600";
        if (progress >= 80) progressColor = "bg-green-600";
        else if (progress <= 50) progressColor = "bg-purple-600";
        
        return (
          <div className="w-full max-w-[150px] flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>{progress}% COMPLETE</span>
            </div>
            <Progress value={progress} className="h-1.5" indicatorClassName={progressColor} />
          </div>
        );
      },
    },
  ];
}
