"use client";

import React from "react";
import Image from "next/image";
import { FileImage } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Column } from "@/components/reusable/DataTable";

export interface EnrolledCourse {
  id: string | number;
  course_id?: string | number;
  type?: string;
  name: string;
  image?: string | null;
  course_image?: string | null;
  tags?: string[];
  tutor?: {
    name?: string;
    image?: string | null;
    tutor_name?: string;
    tutor_profile_image?: string | null;
  };
  completionProgress?: number;
  lastOpened?: string;
  batches?: {
    completed: number;
    total: number;
  };
}

export function getProgressColor(val: number) {
  if (val === 0) return "bg-slate-200";
  if (val <= 20) return "bg-yellow-200";
  if (val <= 40) return "bg-yellow-400";
  if (val <= 60) return "bg-emerald-300";
  if (val < 100) return "bg-emerald-500";
  return "bg-emerald-600";
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

export function buildCourseColumns(): Column<any>[] {
  return [
    {
      key: "id",
      label: "COURSE ID",
      render: (val) => <span className="px-3 py-1   font-bold text-gray-700">{String(val)}</span>
    },
    {
      key: "name",
      label: "COURSE NAME",
      render: (val, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
             {row.course_image || row.image ? (
               <Image src={row.course_image || row.image} alt={row.name} fill className="object-cover" />
             ) : (
               <FileImage size={18} />
             )}
          </div>
          <div>
            <p className="font-bold text-foreground text-sm line-clamp-1">{row.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{row.tags?.length ? row.tags.join(', ') : "General"}</p>
          </div>
        </div>
      )
    },
    {
      key: "tutor",
      label: "TUTOR",
      render: (val: any) => {
        const tutorName = val?.tutor_name || val?.name || "N/A";
        const initial = tutorName !== "N/A" && tutorName.length > 0 ? tutorName.substring(0, 2) : "T";
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase flex-shrink-0">
              {initial}
            </div>
            <span className="text-sm font-medium text-gray-700">{tutorName}</span>
          </div>
        );
      }
    },
    {
      key: "completionProgress",
      label: "PROGRESS",
      width: "w-[200px]",
      render: (val) => {
        const progress = Number(val || 0);
        return (
          <div className="flex flex-col gap-1 w-full max-w-[150px]">
            <Progress value={progress} className="h-2 w-full" indicatorClassName={getProgressColor(progress)} />
            <span className="text-[10px] font-bold text-blue-600 text-right">{progress}% Complete</span>
          </div>
        );
      }
    },
    {
      key: "lastOpened",
      label: "LAST ACCESSED",
      render: (val, row: any) => <span className="text-sm text-gray-500">{formatDate(row.lastOpened)}</span>
    }
  ];
}
