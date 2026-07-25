"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { Domain } from "@/types/domain";

const getInitials = (name: string) => {
  return name?.charAt(0).toUpperCase() || "D";
};

const avatarColors = [
  "bg-green-100 text-green-600",
  "bg-pink-100 text-pink-600",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
  "bg-blue-100 text-blue-600",
];

const getAvatarColor = (id: string | number) => {
  const index = typeof id === "number" ? id % avatarColors.length : String(id).length % avatarColors.length;
  return avatarColors[index];
};

export function buildDomainColumns(): Column<Domain>[] {
  return [
    {
      key: "id",
      label: "ID",
      render: (value, row) => (
        <div className="font-semibold text-slate-600 dark:text-muted-foreground text-sm">#DOM-{row.id}</div>
      ),
    },
    {
      key: "name",
      label: "Domain Name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              getAvatarColor(row.id)
            )}
          >
            {getInitials(row.name)}
          </div>
          <span className="font-bold text-slate-900 dark:text-foreground text-sm truncate max-w-[220px]" title={row.name}>
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value, row) => (
        <div
          className="text-slate-600 dark:text-muted-foreground font-medium text-sm truncate max-w-[280px]"
          title={row.description || "No description provided"}
        >
          {row.description || "-"}
        </div>
      ),
    },
    {
      key: "total_courses",
      label: "Total Courses",
      render: (value, row) => {
        const count = row.total_courses !== undefined ? row.total_courses : (row.courses || 0);
        return (
          <span className="text-sm font-semibold text-slate-700 dark:text-foreground">
            {count} {count === 1 ? "course" : "courses"}
          </span>
        );
      },
    },
    {
      key: "created_date",
      label: "Created Date",
      render: (value, row) => {
        const dateStr = row.created_date || row.updated || (row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A");
        return (
          <div className="text-slate-600 dark:text-muted-foreground font-medium text-sm">
            {dateStr}
          </div>
        );
      },
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
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];
}