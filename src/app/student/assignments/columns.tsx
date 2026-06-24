import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reusable/DataTable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type AssignmentRow = {
  assignment_id: number | string;
  assignment_name: string;
  course: string;
  due_date: string | null;
  status: string;
  [key: string]: any;
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

export function buildAssignmentColumns(): Column<AssignmentRow>[] {
  return [
    {
      key: "assignment_id",
      label: "Assignment ID",
      render: (value) => (
        <span className="font-medium text-foreground">{value as string}</span>
      )
    },
    {
      key: "assignment_name",
      label: "Assignment Name",
      render: (value) => {
        const name = value as string;
        if (!name) return <span className="text-muted-foreground">-</span>;
        
        if (name.length > 30) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-muted-foreground truncate max-w-[200px] inline-block">
                    {name.substring(0, 30)}...
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        
        return <span className="font-medium text-foreground">{name}</span>;
      }
    },
    {
      key: "course",
      label: "Course",
      render: (value) => (
        <span className="text-muted-foreground">{value as string}</span>
      )
    },
    {
      key: "due_date",
      label: "Due Date",
      render: (value) => (
        <span className="text-muted-foreground">{formatDate(value as string)}</span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const status = value as string;
        let variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" = "default";
        
        const lowerStatus = status?.toLowerCase() || "";
        if (lowerStatus === "completed" || lowerStatus === "submitted") variant = "default";
        else if (lowerStatus === "overdue") variant = "destructive";
        else if (lowerStatus === "pending") variant = "secondary";
        
        return (
          <Badge variant={variant} className="rounded-full">
            {status || "N/A"}
          </Badge>
        );
      }
    }
  ];
}
