"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Institution, InstitutionContact } from "@/features/admin/institutions/api/institution-api";
import { Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";
import { Eye, ChevronDown, ChevronUp } from "lucide-react";

const getInitials = (name: string) => {
  return name?.charAt(0).toUpperCase() || "I";
};

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-orange-200 text-orange-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
  "bg-green-100 text-green-600",
];

const getAvatarColor = (id: string | number) => {
  if (typeof id === "number") return avatarColors[Math.abs(id) % avatarColors.length];
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

export function buildInstitutionColumns(): Column<Institution>[] {
  return [
    {
      key: "id",
      label: "Institution ID",
      render: (value, row) => (
        <div className="font-semibold text-slate-600 text-sm">{row.batch_id || row.id}</div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
            getAvatarColor(row.id)
          )}>
            {getInitials(row.name)}
          </div>
          <span className="font-semibold text-slate-900 text-sm truncate max-w-[200px]" title={row.name}>
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email Address",
      render: (value, row) => (
        <div className="text-slate-600 font-medium text-sm truncate max-w-[180px]" title={row.email}>
          {row.email}
        </div>
      ),
    },
    {
      key: "contacts",
      label: "Point of Contact",
      render: (value, row, isExpanded, toggleExpand) => {
        const contacts = row.contacts || [];
        if (contacts.length === 0) return <span className="text-slate-400 text-sm">-</span>;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand?.();
            }}
            className="flex items-center justify-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Eye size={14} />
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        );
      },
    },
    {
      key: "location",
      label: "Location",
      render: (value, row) => {
        const loc = (row.address || row.location || "").trim();
        return (
          <div className="text-slate-600 font-medium text-sm truncate max-w-[150px]" title={loc || "N/A"}>
            {loc || "N/A"}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => {
        const status = (row.status as string) || "Active";
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
