"use client";

import React from "react";
import { BatchItem } from "@/features/institutional-representative/api/batches-api";
import { Column } from "@/components/reusable/DataTable";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getAvatarColorClass } from "@/lib/avatar";

export function buildRepBatchColumns(): Column<BatchItem>[] {
  return [
    {
      key: "batch_id",
      label: "Batch ID",
      render: (value, row) => (
        <span className="font-semibold text-slate-600 text-sm">{row.batch_id || `#${row.id}`}</span>
      ),
    },
    {
      key: "batch_name",
      label: "Batch & Course Name",
      width: "w-1/3",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm",
            getAvatarColorClass(row.id)
          )}>
            {row.batch_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-sm truncate block">
              {row.batch_name}
            </span>
            <span className="text-xs text-muted-foreground truncate block">
              {row.course || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "tutor",
      label: "Assigned Tutor",
      render: (value, row) => (
        <span className="text-slate-600 font-medium text-sm">{row.tutor || "N/A"}</span>
      ),
    },
    {
      key: "total_students",
      label: "Total Students",
      render: (value, row) => (
        <span className="text-slate-600 font-medium text-sm">{row.total_students} Students</span>
      ),
    },
    {
      key: "progress_percentage",
      label: "Average Progress",
      width: "w-[180px]",
      render: (value, row) => (
        <div className="flex flex-col gap-1 w-full max-w-[150px]">
          <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
            <span>Progress</span>
            <span className="text-blue-600">{row.progress_percentage || 0}%</span>
          </div>
          <Progress value={row.progress_percentage || 0} className="h-1.5" indicatorClassName="bg-blue-600" />
        </div>
      ),
    },
  ];
}
