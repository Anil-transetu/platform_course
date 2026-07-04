"use client";

import React from "react";
import { Submission } from "@/features/institutional-representative/api/batches-api";
import { Column } from "@/components/reusable/DataTable";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function buildSubmissionColumns(): Column<Submission>[] {
  return [
    {
      key: "title",
      label: "Title",
      width: "w-2/5",
      render: (value, row) => {
        const moduleName = row.moduleName || row.module_name;
        return (
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-sm truncate block">
              {row.title}
            </span>
            {moduleName && (
              <span className="text-xs text-muted-foreground truncate block mt-0.5">
                {moduleName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      width: "w-[12%]",
      render: (value, row) => {
        const isQuiz = String(row.type).toLowerCase() === "quiz";
        return (
          <Badge className={cn(
            "px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border-none",
            isQuiz 
              ? "bg-purple-50 text-purple-700 hover:bg-purple-100" 
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          )}>
            {row.type}
          </Badge>
        );
      },
    },
    {
      key: "submissionDate",
      label: "Submission Date",
      width: "w-1/4",
      render: (value, row) => {
        const dateStr = row.submissionDate || row.submission_date || "N/A";
        // Format if it's ISO date
        let formattedDate = dateStr;
        if (dateStr.includes("T")) {
          formattedDate = new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
        }
        return (
          <span className="text-slate-600 font-medium text-sm">
            {formattedDate}
          </span>
        );
      },
    },
    {
      key: "score",
      label: "Score / Marks",
      width: "w-1/5",
      render: (value, row) => {
        const score = row.score || 0;
        const maxScore = row.maxScore ?? row.max_score ?? 100;
        const percent = row.percentage ?? (maxScore > 0 ? Math.round((score / maxScore) * 100) : 0);
        return (
          <span className="font-bold text-slate-800 text-sm">
            {score}/{maxScore} <span className="text-xs text-muted-foreground font-normal">({percent}%)</span>
          </span>
        );
      },
    },
  ];
}
