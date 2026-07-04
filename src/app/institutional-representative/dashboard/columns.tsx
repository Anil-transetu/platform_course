"use client";

import React from "react";
import { MonitoringStudent } from "@/features/institutional-representative/api/rep-api";
import { Column } from "@/components/reusable/DataTable";
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

export function buildMonitoringStudentColumns(): Column<MonitoringStudent>[] {
  return [
    {
      key: "student_name",
      label: "Student Name",
      render: (value, row) => {
        const sId = row.student_id;
        const sName = row.student_name || row.name || "Unknown";
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
                ID: #{String(sId).padStart(4, "0")}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "batch_name",
      label: "Batch",
      render: (value, row) => {
        const allBatches = row.all_batches || [{ id: row.batch_id, name: row.batch_name, status: row.status }];
        
        // Filter to only include critical facing batches
        const criticalBatches = allBatches.filter((b: any) => b.status?.toLowerCase() === "critical");
        
        // Fallback to all batches if none are critical
        const displayBatches = criticalBatches.length > 0 ? criticalBatches : allBatches;
        
        const maxVisible = 3;
        const visibleBatches = displayBatches.slice(0, maxVisible);
        const extraCount = displayBatches.length - maxVisible;
        
        return (
          <div className="flex gap-1.5 flex-wrap items-center max-w-[360px]">
            {visibleBatches.map((b: any, index: number) => (
              <span
                key={b.id || index}
                className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase whitespace-normal break-words inline-block max-w-[180px]"
              >
                {b.name || "N/A"}
              </span>
            ))}
            {extraCount > 0 && (
              <span
                title={displayBatches.slice(maxVisible).map((b: any) => b.name).join(", ")}
                className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase whitespace-nowrap cursor-help font-semibold"
              >
                +{extraCount}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "avg_quiz_score",
      label: "Avg Quiz Score",
      render: (value, row) => {
        const score = typeof row.avg_quiz_score === "number" ? row.avg_quiz_score : 0;
        return (
          <span className="font-semibold text-foreground text-sm">
            {score}%
          </span>
        );
      }
    },
    {
      key: "attendance_percent",
      label: "Attendance %",
      render: (value, row) => {
        const att = typeof row.attendance_percent === "number" ? row.attendance_percent : 0;
        return (
          <span className="font-semibold text-foreground text-sm">
            {att}%
          </span>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => {
        const status = row.status || "Normal";
        const statusLower = status.toLowerCase();
        
        let statusStyles = "";
        if (statusLower === "critical") {
          statusStyles = "bg-[#FEE2E2] text-[#991B1B]";
        } else if (statusLower === "warning") {
          statusStyles = "bg-[#FFEDD5] text-[#9A3412]";
        } else {
          statusStyles = "bg-[#DCFCE7] text-[#166534]";
        }
        
        return (
          <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center justify-center min-w-[90px] text-center",
            statusStyles
          )}>
            {status}
          </span>
        );
      }
    }
  ];
}
