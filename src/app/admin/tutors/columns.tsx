"use client";
import React from "react";
import { Column } from "@/components/reusable/DataTable";
import { Tutor } from "@/types/tutor";

export function buildTutorColumns(): Column<Tutor>[] {
  return [
    {
      key: "name",
      label: "Tutor Info",
      width: "w-1/5",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-blue-600">
              {row.name.charAt(0)}
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
      render: (_, row) => (
        <div className="flex gap-1.5 flex-wrap">
          {row.domains?.map((d: string) => (
            <span
              key={d}
              className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase"
            >
              {d}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (_, row) => (
        <div>
          <p className="text-foreground font-medium text-sm">{row.email}</p>
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "assignedBatches",
      label: "Batches",
      render: (_, row) => (
        <div className="flex gap-1.5 flex-wrap">
          {row.assignedBatches?.map((b: any) => {
            const batchId = typeof b === 'object' ? (b._id || b.id || Math.random()) : b;
            const batchName = typeof b === 'object' ? (b.batchName || b.name || JSON.stringify(b)) : b;
            return (
              <span
                key={batchId}
                className="bg-gray-100 dark:bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase"
              >
                {batchName}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
            row.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];
}
