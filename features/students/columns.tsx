"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Student } from "./api";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudentColumnActionsProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onView: (student: Student) => void;
}

const StudentColumnActions = ({ student, onEdit, onDelete, onView }: StudentColumnActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(student)}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(student)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit Student
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(student)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Student
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getStudentColumns = (
  onEdit: (student: Student) => void,
  onDelete: (student: Student) => void,
  onView: (student: Student) => void,
): ColumnDef<Student>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-mono text-xs text-muted-foreground w-[60px]">{row.getValue("id")}</div>,
  },
  {
    header: "Student",
    id: "student_info",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {student.first_name} {student.last_name}
          </span>
          <span className="text-xs text-gray-500">{student.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "course_name",
    header: "Course",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("course_name")}>
        {row.getValue("course_name") || "No Course"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("status") as string) || "Inactive";
      const variant = status.toLowerCase() === "active" ? "success" : "secondary";
      return (
        <Badge variant={variant as any} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
      const dateStr = row.getValue("created_at") as string;
      if (!dateStr) return "-";
      return <div className="text-gray-500">{new Date(dateStr).toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <StudentColumnActions 
        student={row.original} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        onView={onView} 
      />
    ),
  },
];
