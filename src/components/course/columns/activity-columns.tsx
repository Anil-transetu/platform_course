import React from "react";
import { Column } from "@/components/reusable/DataTable";
import { CourseActivityItem } from "@/types/course-activity";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const activityColumns: Column<CourseActivityItem>[] = [
  {
    key: "id",
    label: "ID",
    width: "w-[80px]",
    sortable: true,
  },
  {
    key: "name",
    label: "Name",
    sortable: true,
    render: (value) => (
      <span className="font-medium text-foreground">{String(value)}</span>
    )
  },
  {
    key: "completed_at",
    label: "Completed Date",
    sortable: true,
    render: (value, row) => {
      const status = String(row.status || "").toLowerCase();
      if (!value && status !== "completed") {
        return <span className="text-muted-foreground italic">In Progress</span>;
      }
      if (!value) return <span>-</span>;
      return <span>{new Date(String(value)).toLocaleDateString()}</span>;
    }
  },
  {
    key: "progress",
    label: "Progress",
    sortable: true,
    width: "w-[250px]",
    render: (value) => {
      const progress = Number(value) || 0;
      let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "secondary";
      
      if (progress === 100) {
        badgeVariant = "default";
      } else if (progress > 0) {
        badgeVariant = "outline";
      }

      return (
        <div className="flex items-center gap-4">
          <Progress value={progress} className="h-2 w-full max-w-[120px]" />
          <Badge variant={badgeVariant} className="min-w-[4rem] justify-center">
            {progress}%
          </Badge>
        </div>
      );
    }
  }
];
