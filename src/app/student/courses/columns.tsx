"use client";

import React from "react";
import Image from "next/image";
import { FileImage } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Column } from "@/components/reusable/DataTable";

export interface EnrolledCourse {
  id: string | number;
  course_id?: string;
  name: string;
  category?: string;
  instructor?: string;
  thumbnail_url?: string;
  tags?: string[];
  progress?: number;
  updated_at?: string;
  last_accessed?: string;
  batches?: { total: number, completed: number };
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
      key: "courseId",
      label: "COURSE ID",
      render: (val) => <span className="px-3 py-1   font-bold text-gray-700">{String(val)}</span>
    },
    {
      key: "name",
      label: "COURSE NAME",
      render: (val, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
             {row.thumbnail_url ? (
               <Image src={row.thumbnail_url} alt={row.name} fill className="object-cover" />
             ) : (
               <FileImage size={18} />
             )}
          </div>
          <div>
            <p className="font-bold text-foreground text-sm line-clamp-1">{row.courseName}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{row.category || "General"}</p>
          </div>
        </div>
      )
    },
    {
      key: "instructor",
      label: "TUTOR",
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase flex-shrink-0">
            {typeof val === 'string' && val.length > 0 ? val.substring(0, 2) : "T"}
          </div>
          <span className="text-sm font-medium text-gray-700">{String(val || "N/A")}</span>
        </div>
      )
    },
    {
      key: "progress",
      label: "PROGRESS",
      width: "w-[200px]",
      render: (val) => {
        const progress = Number(val || 0);
        return (
          <div className="flex flex-col gap-1 w-full max-w-[150px]">
            <Progress value={progress} className="h-2 w-full" />
            <span className="text-[10px] font-bold text-blue-600 text-right">{progress}% Complete</span>
          </div>
        );
      }
    },
    {
      key: "last_accessed",
      label: "LAST ACCESSED",
      render: (val, row: any) => <span className="text-sm text-gray-500">{formatDate(row.last_accessed || row.updated_at)}</span>
    }
  ];
}
