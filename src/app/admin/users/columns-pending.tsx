"use client";

import React from "react";
import { ContactRequest } from "@/types/contact-request";
import { Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.split(" ");
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

const formatRole = (role: string) => {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes("institution") || lowerRole === "institution_rep") {
    return "Institution Representative";
  } else if (lowerRole === "admin") {
    return "Admin";
  } else if (lowerRole === "tutor") {
    return "Tutor";
  }
  return role;
};

export function buildPendingColumns(): Column<ContactRequest>[] {
  return [
    {
      key: "id",
      label: "USER ID",
      render: (value, row) => (
        <div className="font-semibold text-slate-600 text-sm">#REQ-{row.id.substring(0, 8)}</div>
      ),
    },
    {
      key: "name",
      label: "NAME",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
            getAvatarColor(row.id)
          )}>
            {getInitials(row.full_name)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-sm">
              {row.full_name}
            </span>
            <span className="text-gray-400 text-xs">
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "ROLE",
      render: (value, row) => (
        <div className="text-slate-700 font-medium text-sm">
          {formatRole(row.role)}
        </div>
      ),
    },
    {
      key: "requestedDate",
      label: "REQUESTED DATE",
      render: (value, row) => (
        <div className="text-slate-500 text-sm">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A"}
        </div>
      ),
    },
    {
      key: "message",
      label: "MESSAGE",
      render: (value, row) => (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger className="max-w-[200px] truncate block text-left text-slate-600 text-sm cursor-help outline-none bg-transparent border-none p-0 m-0">
              {row.message}
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="max-w-[350px] p-3 text-sm text-slate-700 bg-white shadow-lg border border-gray-200 z-50 rounded-lg">
              <p className="whitespace-pre-wrap">{row.message}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ];
}
