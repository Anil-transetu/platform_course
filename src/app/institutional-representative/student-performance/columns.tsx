"use client";

import React from "react";
import { TopStudent } from "@/features/institutional-representative/api/student-performance-api";
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

export function buildTopStudentColumns(): Column<TopStudent>[] {
  return [
    {
      key: "student_name",
      label: "Student Name",
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
        const allBatches = row.all_batches || [{ id: row.batch_id, name: row.batch_name || value }];
        return (
          <div className="flex gap-1.5 flex-wrap items-center max-w-[220px]">
            {allBatches.map((b: any, index: number) => {
              // Generate consistent color for each batch
              const batchColorIndex = (b.id || index) % avatarColors.length;
              const batchColor = avatarColors[batchColorIndex];
              return (
                <span
                  key={b.id || index}
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase whitespace-normal break-words inline-block",
                    batchColor
                  )}
                >
                  {b.name || "N/A"}
                </span>
              );
            })}
          </div>
        );
      }
    },
    {
      key: "avg_quiz_score",
      label: "Avg. Quiz Score",
      render: (value) => {
        const score = typeof value === "number" ? value : 0;
        return (
          <span className="font-semibold text-foreground text-sm">
            {score}%
          </span>
        );
      }
    },
    {
      key: "assignments_completed",
      label: "Assignments Completed",
      render: (value, row) => (
        <span className="font-medium text-slate-600 text-sm">
          {row.assignments_completed}/{row.assignments_total}
        </span>
      ),
    },
    {
      key: "overall_grade",
      label: "Overall Grade",
      render: (value) => {
        const grade = String(value || "F");
        let badgeStyles = "bg-red-50 text-red-600 border-red-100";
        if (grade.startsWith("A")) {
          badgeStyles = "bg-emerald-50 text-emerald-600 border-emerald-100";
        } else if (grade.startsWith("B")) {
          badgeStyles = "bg-blue-50 text-blue-600 border-blue-100";
        } else if (grade.startsWith("C")) {
          badgeStyles = "bg-amber-50 text-amber-600 border-amber-100";
        } else if (grade.startsWith("D")) {
          badgeStyles = "bg-orange-50 text-orange-600 border-orange-100";
        }
        return (
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-bold border",
            badgeStyles
          )}>
            {grade}
          </span>
        );
      }
    }
  ];
}
