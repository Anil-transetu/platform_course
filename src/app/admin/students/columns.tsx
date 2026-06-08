"use client";
import React from "react";
import { Column } from "@/components/reusable/DataTable";
import { Student } from "@/types/student";

// Avatar: colored circle with initials
export function StudentAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  
  // Generate consistent color from name
  const colors = ["#4F6EF7", "#2DAF7A", "#E56B4E", "#9B6EE8", "#F5A623", "#E84E8A"];
  const color = name ? colors[name.charCodeAt(0) % colors.length] : "#4F6EF7";
  
  return (
    <span
      style={{ backgroundColor: color }}
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold select-none flex-shrink-0"
    >
      {initials || "?"}
    </span>
  );
}

// Batch badge with color coding by prefix
export function BatchBadge({ batch }: { batch: string }) {
  const colorMap: Record<string, string> = {
    CS: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    DS: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    UX: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    MKT: "bg-green-100 text-green-700 hover:bg-green-200",
  };
  const prefix = batch.split("-")[0]?.toUpperCase();
  const cls = colorMap[prefix] ?? "bg-gray-100 text-gray-700 hover:bg-gray-200";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls} transition-colors whitespace-nowrap`}>
      {batch}
    </span>
  );
}

export const studentColumns: Column<Student>[] = [
  {
    key: "id",
    label: "STUDENT ID",
    render: (value) => (
      <span className="text-sm font-medium text-gray-500">
        #STU-{String(value || "")}
      </span>
    ),
  },
  {
    key: "first_name",
    label: "STUDENT NAME",
    render: (_, student) => {
      const name = `${student.first_name || ""} ${student.last_name || ""}`.trim() || student.name || "";
      return (
        <div className="flex items-center gap-2">
          <StudentAvatar name={name} />
          <span className="text-sm font-semibold text-gray-900">{name}</span>
        </div>
      );
    },
  },
  {
    key: "email",
    label: "EMAIL ADDRESS",
    render: (value) => (
      <span className="text-sm text-gray-600 font-medium">
        {String(value || "")}
      </span>
    ),
  },
  {
    key: "course_name",
    label: "ENROLLED BATCHES",
    render: (value) => {
      const courseStr = String(value || "");
      const batches = courseStr ? courseStr.split(",").map((c) => c.trim()).filter(Boolean) : [];
      return (
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {batches.map((batch) => (
            <BatchBadge key={batch} batch={batch} />
          ))}
          {batches.length === 0 && (
            <span className="text-xs text-gray-400 font-medium">-</span>
          )}
        </div>
      );
    },
  },
  {
    key: "status",
    label: "STATUS",
    render: (value) => {
      const statusStr = String(value || "Inactive");
      const isActive = statusStr.toLowerCase() === "active";
      return (
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all border-none select-none ${
            isActive ? "text-emerald-700 bg-emerald-50" : "text-gray-500 bg-gray-100"
          }`}
        >
          {statusStr}
        </span>
      );
    },
  },
];
