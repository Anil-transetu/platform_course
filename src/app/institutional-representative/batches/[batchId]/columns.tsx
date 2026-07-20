"use client";

import React from "react";
import { BatchStudent } from "@/features/institutional-representative/api/batches-api";
import { Column } from "@/components/reusable/DataTable";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const getInitials = (name?: string) => {
  if (!name) return "S";
  const parts = name.trim().split(" ");
  if (parts.length > 1) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

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

export function buildBatchStudentColumns(): Column<BatchStudent>[] {
  return [
    {
      key: "student_name",
      label: "Student Name",
      width: "w-1/4",
      render: (value, row) => {
        const sId = row.student_id;
        const sName = row.student_name || "Unknown";
        const avatar = row.avatar_url || row.profile_image;
        return (
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={sName}
                className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm"
              />
            ) : (
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm transition-transform hover:scale-105",
                getAvatarColor(sId)
              )}>
                {getInitials(sName)}
              </div>
            )}
            <div className="min-w-0">
              <span className="font-semibold text-foreground text-sm truncate block">
                {sName}
              </span>
              <span className="text-xs text-muted-foreground truncate block">
                ID: #{sId}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "attendance_percent",
      label: "Attendance %",
      width: "w-[180px]",
      render: (value, row) => {
        const attendance = row.attendance_percent || 0;
        let barColor = "bg-green-500";
        if (attendance < 70) {
          barColor = "bg-rose-500";
        } else if (attendance < 90) {
          barColor = "bg-blue-600";
        }

        return (
          <div className="flex flex-col gap-1 w-full max-w-[150px]">
            <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
              <span>Attendance</span>
              <span className="text-foreground">{attendance}%</span>
            </div>
            <Progress value={attendance} className="h-1.5" indicatorClassName={barColor} />
          </div>
        );
      },
    },
    {
      key: "quiz_avg",
      label: "Quiz Average",
      render: (value, row) => (
        <span className="font-bold text-slate-800 text-sm">
          {(row.quiz_avg || 0).toFixed(1)}%
        </span>
      ),
    },
    {
      key: "assignments",
      label: "Assignments",
      render: (value, row) => (
        <span className="text-slate-600 font-semibold text-sm">
          {row.assignments_completed || 0} / {row.assignments_total || 0}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => {
        const status = row.status || "active";
        const statusLower = status.toLowerCase();

        let badgeStyles = "bg-blue-50 text-blue-700 hover:bg-blue-100 border-none";
        if (statusLower === "at_risk" || statusLower === "at risk") {
          badgeStyles = "bg-red-50 text-red-700 hover:bg-red-100 border-none";
        } else if (statusLower === "excellent") {
          badgeStyles = "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none";
        }

        return (
          <Badge className={cn("px-3 py-1 text-[10px] font-bold tracking-wider uppercase", badgeStyles)}>
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
  ];
}
