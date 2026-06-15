"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reusable/DataTable";
import { EnrolledStudent } from "./dummyData";
import { cn } from "@/lib/utils";

export function buildEnrolledStudentColumns(): Column<EnrolledStudent>[] {
  return [
    {
      key: "id",
      label: "ID",
      render: (value, row) => (
        <div className="font-semibold text-slate-500 text-sm">{row.id}</div>
      ),
    },
    {
      key: "name",
      label: "STUDENT NAME",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {row.avatar ? (
              <img src={row.avatar} alt={row.name} className="object-cover w-full h-full" />
            ) : (
              <span className="text-xs font-bold text-gray-500">{row.name.charAt(0)}</span>
            )}
          </div>
          <span className="font-semibold text-slate-900 text-sm">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "STUDENT EMAIL",
      render: (value, row) => (
        <div className="text-slate-500 font-medium text-sm truncate max-w-[200px]">
          {row.email}
        </div>
      ),
    },
    {
      key: "enrollmentDate",
      label: "ENROLLMENT DATE",
      render: (value, row) => (
        <div className="text-slate-500 font-medium text-sm">
          {row.enrollmentDate}
        </div>
      ),
    },
    {
      key: "completionPercentage",
      label: "COMPLETION %",
      render: (value, row) => {
        const percentage = row.completionPercentage;
        // The color seems to change based on the value: 100% blue, other values green or orange.
        // I will match the image:
        // 85% green, 100% green (wait, in image 100% progress bar is green, text is blue?), 
        // actually let's just make it dynamic
        let barColor = "bg-green-500";
        if (percentage < 50) barColor = "bg-orange-400";
        else if (percentage === 100) barColor = "bg-blue-600";
        else if (percentage >= 80) barColor = "bg-green-500";
        else barColor = "bg-green-400";

        return (
          <div className="flex flex-col gap-1 w-32">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">Progress</span>
              <span className="text-blue-600">{percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", barColor)}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "STATUS",
      render: (value, row) => {
        const isCompleted = row.status === "COMPLETED";
        return (
          <Badge className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold border-none transition-all uppercase tracking-wider",
            isCompleted 
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200" 
              : "bg-green-100 text-green-600 hover:bg-green-200"
          )}>
            {row.status}
          </Badge>
        );
      },
    },
  ];
}
