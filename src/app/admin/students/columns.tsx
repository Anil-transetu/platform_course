"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/features/admin/students/api/student-api";
import { Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";

const getInitials = (firstName: string, lastName?: string) => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
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

export function buildStudentColumns(): Column<Student>[] {
  return [
    {
      key: "id",
      label: "Student ID",
      render: (value, row) => (
        <div className="font-semibold text-slate-600 text-sm">#STU-{row.id}</div>
      ),
    },
    {
      key: "first_name",
      label: "Student Name",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold",
            getAvatarColor(row.id)
          )}>
            {getInitials(row.first_name, row.last_name)}
          </div>
          <span className="font-semibold text-slate-900 text-sm">
            {row.first_name} {row.last_name}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email Address",
      render: (value, row) => (
        <div className="text-slate-600 font-medium text-sm truncate max-w-[180px]">
          {row.email}
        </div>
      ),
    },
    {
      key: "course_name",
      label: "Enrolled Batches",
      render: (value, row) => {
        const course = row.course_name as string;
        if (!course) return <span className="text-slate-400 text-sm">-</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {course.split(",").map((c, i) => (
              <Badge key={i} className="bg-blue-100 text-blue-700 border-none rounded-lg px-2.5 py-1 text-xs font-semibold hover:bg-blue-200 transition-colors">
                {c.trim()}
              </Badge>
            ))}
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
          <Badge className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold border-none transition-all",
            isActive 
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}>
            {status}
          </Badge>
        );
      },
    },
  ];
}
