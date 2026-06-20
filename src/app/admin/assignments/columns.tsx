"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Assignment } from "@/features/admin/assignments/api/assignment-api";
import { Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";
import { FileUp, Link as LinkIcon } from "lucide-react";

function CourseBadge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-amber-50 text-amber-600",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold ${map[color] || "bg-slate-100 text-slate-600"}`}>
      {label}
    </span>
  );
}

export function buildAssignmentColumns(): Column<Assignment>[] {
  return [
    {
      key: "title",
      label: "Assignment Title",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground leading-tight text-sm truncate max-w-[250px]" title={row.title}>
            {row.title}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 font-semibold">
            ID: {row.id}
          </span>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      render: (value, row) => (
        <CourseBadge label={row.course || "General"} color={row.courseColor || "blue"} />
      ),
    },
    {
      key: "domain",
      label: "Domain",
      render: (value, row) => (
        <span className="text-muted-foreground font-semibold tracking-wide text-xs">
          {row.domain || "GENERAL"}
        </span>
      ),
    },
    {
      key: "tags",
      label: "Tags",
      render: (value, row) => {
        const tags = row.tags || [];
        if (tags.length === 0) return <span className="text-slate-400 text-sm">-</span>;
        return (
          <div className="flex gap-1.5 flex-wrap">
            {tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-md tracking-widest uppercase">
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-md tracking-widest uppercase">
                +{tags.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "marks",
      label: "Marks",
      render: (value, row) => (
        <span className="font-bold text-foreground text-sm">
          {row.marks || 100}
        </span>
      ),
    },
    {
      key: "submissionType",
      label: "Submission Type",
      render: (value, row) => {
        const type = (row.submissionType || row.submission_type || "FILE UPLOAD").toUpperCase();
        const isFile = type === "FILE UPLOAD" || type === "FILE";
        return (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 tracking-wider bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg w-max">
            {isFile ? <FileUp size={14} className="text-blue-500" /> : <LinkIcon size={14} className="text-purple-500" />}
            {type}
          </div>
        );
      },
    },
  ];
}
