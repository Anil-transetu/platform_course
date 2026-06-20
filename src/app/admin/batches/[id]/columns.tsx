"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reusable/DataTable";
import { EnrolledStudent } from "@/types/batch";
import { cn } from "@/lib/utils";
import { ProgressWithLabel } from "@/components/ui/progress";

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

export function buildEnrolledStudentColumns(): Column<EnrolledStudent>[] {
  return [
    {
      key: "id",
      label: "ID",
      render: (value, row) => (
        <div className="font-semibold text-slate-500 text-sm">{row.id}</div>
      ),
    },
    {
      key: "name",
      label: "STUDENT NAME",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <div className="relative h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
              <img src={row.avatar} alt={row.name} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
              getAvatarColor(row.id)
            )}>
              <span>{row.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <span className="font-semibold text-slate-900 text-sm">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "STUDENT EMAIL",
      render: (value, row) => (
        <div className="text-slate-500 font-medium text-sm truncate max-w-[200px]">
          {row.email}
        </div>
      ),
    },
    {
      key: "enrollmentDate",
      label: "ENROLLMENT DATE",
      render: (value, row) => (
        <div className="text-slate-500 font-medium text-sm">
          {row.enrollmentDate}
        </div>
      ),
    },
    {
      key: "completionPercentage",
      label: "COMPLETION %",
      render: (value, row) => {
        const percentage = row.completionPercentage;
        let barColor = "bg-green-500";
        if (percentage < 50) barColor = "bg-orange-400";
        else if (percentage === 100) barColor = "bg-blue-600";
        else if (percentage >= 80) barColor = "bg-green-500";
        else barColor = "bg-green-400";

        return (
          <div className="w-32">
            <ProgressWithLabel 
              value={percentage} 
              label="Progress"
              id={`progress-${row.id}`}
              className="max-w-full"
              indicatorClassName={barColor}
              labelClassName="text-[11px] font-bold text-slate-400"
              valueClassName="text-blue-600 font-bold"
            />
          </div>
        );
      },
    },
    {
      key: "status",
      label: "STATUS",
      render: (value, row) => {
        const isCompleted = row.status === "COMPLETED";
        return (
          <Badge className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold border-none transition-all uppercase tracking-wider",
            isCompleted 
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200" 
              : "bg-green-100 text-green-600 hover:bg-green-200"
          )}>
            {row.status}
          </Badge>
        );
      },
    },
  ];
}
