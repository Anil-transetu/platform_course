"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/features/admin/students/api/student-api";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const getInitials = (firstName: string, lastName?: string) => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
};

const avatarColors = [
  "bg-blue-100 text-blue-600 rounded-full",
  "bg-orange-200 text-orange-600 rounded-full",
  "bg-purple-100 text-purple-600 rounded-full",
  "bg-pink-100 text-pink-600 rounded-full",
  "bg-green-100 text-green-600 rounded-full",
];

const getAvatarColor = (id: string | number) => {
  const index = typeof id === "number" ? id % avatarColors.length : String(id).length % avatarColors.length;
  return avatarColors[index];
};

/**
 * Factory function to build student columns with callbacks
 * 
 * USAGE:
 * const columns = useMemo(
 *   () => buildStudentColumns({
 *     onEdit: handleEdit,
 *     onDelete: handleDelete,
 *   }),
 *   []
 * );
 */
export function buildStudentColumns(args: {
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}): ColumnDef<Student>[] {
  const { onEdit, onDelete } = args;

  return [
    {
      accessorKey: "id",
      header: () => <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Student ID</span>,
      cell: ({ row }) => <div className="font-semibold text-muted-foreground text-sm">#STU-{row.getValue("id")}</div>,
    },
    {
      header: () => <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Student Name</span>,
      id: "student_info",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold text-white",
              getAvatarColor(student.id)
            )}>
              {getInitials(student.first_name, student.last_name)}
            </div>
            <span className="font-semibold text-foreground text-sm">
              {student.first_name} {student.last_name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: () => <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</span>,
      cell: ({ row }) => (
        <div className="text-muted-foreground font-medium text-sm truncate max-w-[180px]">
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "course_name",
      header: () => <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Enrolled Batches</span>,
      cell: ({ row }) => {
        const course = row.getValue("course_name") as string;
        if (!course) return <span className="text-muted-foreground text-sm">-</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {course.split(",").map((c, i) => (
              <Badge key={i} className="bg-blue-100 text-blue-700 border-none rounded-lg px-2.5 py-1 text-xs font-semibold hover:bg-blue-200 transition-colors">
                {c.trim()}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</span>,
      cell: ({ row }) => {
        const status = (row.getValue("status") as string) || "Inactive";
        const isActive = status.toLowerCase() === "active";
        return (
          <Badge className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold border-none transition-all",
            isActive 
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
              : "bg-slate-100 text-muted-foreground hover:bg-slate-200"
          )}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</span></div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent rounded-full text-muted-foreground">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] rounded-2xl shadow-xl border-slate-100 p-2">
              <DropdownMenuItem 
                onClick={() => onEdit(row.original)}
                className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-muted py-2.5"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" /> 
                <span className="font-medium text-card-foreground">Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(row.original)}
                className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-red-50 text-red-600 py-2.5"
              >
                <Trash2 className="h-4 w-4" /> 
                <span className="font-medium">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
