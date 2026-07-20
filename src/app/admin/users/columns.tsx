"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import { Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";

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

export function buildUserColumns(activeTab: "accepted" | "pending"): Column<User>[] {
  return [
    {
      key: "id",
      label: "USER ID",
      render: (value, row) => (
        <div className="font-semibold text-slate-600 text-sm">#USR-{row.id}</div>
      ),
    },
    {
      key: "name",
      label: "USER",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.avatar_url ? (
            <img 
              src={row.avatar_url} 
              alt={row.name || "User Avatar"} 
              className="h-9 w-9 rounded-full object-cover shrink-0" 
            />
          ) : (
            <div className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              getAvatarColor(row.id)
            )}>
              {getInitials(row.name)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-sm">
              {row.name}
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
          {row.role}
        </div>
      ),
    },
    {
      key: "joinedDate",
      label: activeTab === "accepted" ? "JOINED DATE" : "REQUESTED DATE",
      render: (value, row) => (
        <div className="text-slate-500 text-sm">
          {row.joinedDate}
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (value, row) => {
        const status = (row.status as string) || "pending";
        const isActive = status.toLowerCase() === "active";
        return (
          <Badge className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold border-none transition-all",
            isActive 
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
  ];
}
