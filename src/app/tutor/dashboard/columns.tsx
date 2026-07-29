"use client";

import React from "react";
import { Column } from "@/components/reusable/DataTable";
import { Progress } from "@/components/ui/progress";

import { Avatar } from "@/components/ui/avatar";

export interface TutorBatch {
  id: string | number;
  name: string;
  course: string | { id?: string | number; name?: string; title?: string };
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
      render: (value, row) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            name={row.name}
            id={row.id}
            sizeClassName="w-10 h-10"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground text-sm truncate">
              {row.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      label: "COURSE NAME",
      render: (value, row) => {
        const courseName =
          typeof row.course === "object" && row.course !== null
            ? (row.course as any).name || (row.course as any).title || "N/A"
            : row.course || "N/A";
        return (
          <div className="font-semibold text-slate-600 text-sm">
            {courseName}
          </div>
        );
      },
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
