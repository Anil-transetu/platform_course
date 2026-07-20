"use client";

import React from "react";
import { Batch } from "@/types/batch";
import { Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-orange-200 text-orange-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
  "bg-green-100 text-green-600",
];

const getAvatarColor = (id: string | number) => {
  const index = typeof id === "number" ? id % avatarColors.length : String(id).length % avatarColors.length;
  return avatarColors[index];
};

export function buildBatchColumns(): Column<Batch>[] {
  return [
    {
      key: "id",
      label: "Batch ID",
      render: (value, row) => (
        <div className="font-semibold text-slate-600 text-sm">#BAT-{row.id}</div>
      ),
    },
    {
      key: "name",
      label: "Batch Info",
      width: "w-1/4",
      render: (value, row) => {
        return (
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
              getAvatarColor(row.id)
            )}>
              <span className="text-xs font-bold">
                {row.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {row.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {row.course && row.course !== "N/A"
                  ? `Course: ${row.course}`
                  : row.domain && row.domain !== "N/A"
                  ? `Domain: ${row.domain}`
                  : "N/A"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "instructor",
      label: "Instructor",
      render: (value, row) => (
        <div className="text-slate-600 font-medium text-sm">
          {row.instructor || "-"}
        </div>
      ),
    },
    {
      key: "students",
      label: "Students Enrolled",
      render: (value, row) => (
        <div className="text-slate-600 font-medium text-sm">
          {row.students}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => {
        const status = (row.status as string) || "Inactive";
        const isActive = status.toLowerCase() === "active";
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
            isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            {status}
          </span>
        );
      },
    },
  ];
}
