import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reusable/DataTable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface AttendanceRow {
  id: number | string;
  date: string;
  day: string;
  course: string;
  batch: string;
  status: string;
  notes?: string;
}

export function buildAttendanceColumns(): Column<AttendanceRow>[] {
  return [
    {
      key: "date",
      label: "Date",
      render: (value) => (
        <span className="font-medium text-foreground">{value as string}</span>
      )
    },
    {
      key: "day",
      label: "Day",
      render: (value) => (
        <span className="text-muted-foreground">{value as string}</span>
      )
    },
    {
      key: "course",
      label: "Course",
      render: (value) => (
        <span className="text-muted-foreground">{value as string}</span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const status = value as string;
        let variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" = "default";
        
        if (status === "Present") variant = "default";
        else if (status === "Absent") variant = "destructive";
        else if (status === "Late") variant = "secondary";
        
        return (
          <Badge variant={variant} className="rounded-full">
            {status}
          </Badge>
        );
      }
    },
    {
      key: "notes",
      label: "Notes",
      render: (value) => {
        const notes = value as string;
        if (!notes) return <span className="text-muted-foreground">-</span>;
        
        if (notes.length > 30) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-muted-foreground truncate max-w-[200px] inline-block">
                    {notes.substring(0, 30)}...
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{notes}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        
        return <span className="text-muted-foreground">{notes}</span>;
      }
    }
  ];
}
