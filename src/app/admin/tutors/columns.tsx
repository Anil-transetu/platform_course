"use client";
import React from "react";
import { Column } from "@/components/reusable/DataTable";
import { Tutor } from "@/types/tutor";
import { cn } from "@/lib/utils";

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

export function buildTutorColumns(): Column<Tutor>[] {
  return [
    {
      key: "name",
      label: "Tutor Info",
      width: "w-[20%]",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
            getAvatarColor(row.id)
          )}>
            <span>
              {row.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {row.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              ID: #{String(row.id).padStart(4, "0")}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "domains",
      label: "Domain",
      width: "w-[30%]",
      render: (_, row) => {
        const domains = row.domains || [];
        const maxVisible = 2;
        const visibleDomains = domains.slice(0, maxVisible);
        const extraCount = domains.length - maxVisible;
        return (
          <div className="flex gap-1.5 flex-wrap max-w-[220px]">
            {visibleDomains.map((d: string) => (
              <span
                key={d}
                className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase whitespace-normal break-words inline-block max-w-[180px]"
              >
                {d}
              </span>
            ))}
            {extraCount > 0 && (
              <span
                title={domains.slice(maxVisible).join(", ")}
                className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase whitespace-nowrap cursor-help"
              >
                +{extraCount}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Contact",
      width: "w-[25%]",
      render: (_, row) => (
        <div>
          <p className="text-foreground font-medium text-sm">{row.email}</p>
          <p className="text-xs text-gray-500 mt-0.5">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "assignedBatches",
      label: "Batches",
      width: "w-[15%]",
      render: (_, row) => {
        const batches = row.assignedBatches || [];
        const maxVisible = 2;
        const visibleBatches = batches.slice(0, maxVisible);
        const extraCount = batches.length - maxVisible;
        return (
          <div className="flex gap-1.5 flex-wrap max-w-[220px]">
            {visibleBatches.map((b: any, i: number) => (
              <span
                key={b?._id || b?.id || b?.batchName || i}
                className="bg-gray-100 text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase whitespace-normal break-words inline-block max-w-[180px]"
              >
                {typeof b === 'object' ? (b.batchName || b.name || 'Unknown') : b}
              </span>
            ))}
            {extraCount > 0 && (
              <span
                title={batches.map((b: any) => typeof b === 'object' ? (b.batchName || b.name || 'Unknown') : b).slice(maxVisible).join(", ")}
                className="bg-gray-200 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase whitespace-nowrap cursor-help"
              >
                +{extraCount}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      width: "w-[10%]",
      render: (_, row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
            row.status?.toLowerCase() === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </span>
      ),
    },
  ];
}
