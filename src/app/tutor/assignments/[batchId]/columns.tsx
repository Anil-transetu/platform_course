"use client";

import React from "react";
import Link from "next/link";
import { Column } from "@/components/reusable/DataTable";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export interface StudentAssignmentRow {
  id: string | number;
  studentId: string | number;
  studentProfile?: string | null;
  name: string;
  email: string;
  latestAssignment: string;
  submittedOn: string;
  submittedAssignmentCount: number;
}

export function buildStudentAssignmentColumns(batchId: string): Column<StudentAssignmentRow>[] {
  return [
    {
      key: "studentId",
      label: "STUDENT ID",
      render: (_, row) => (
        <div className="font-semibold text-slate-600 text-sm">
          #STU-{row.studentId}
        </div>
      ),
    },
    {
      key: "name",
      label: "STUDENT",
      render: (_, row) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={row.studentProfile}
            name={row.name}
            id={row.studentId}
            sizeClassName="h-9 w-9"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-900 text-sm truncate">
              {row.name}
            </span>
            <span className="text-xs text-slate-500 font-normal truncate">
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "latestAssignment",
      label: "LATEST ASSIGNMENT",
      render: (_, row) => (
        <span className="text-sm font-medium text-slate-700">
          {row.latestAssignment}
        </span>
      ),
    },
    {
      key: "submittedOn",
      label: "SUBMISSION DATE",
      render: (_, row) => (
        <span className="text-sm text-slate-500">
          {row.submittedOn}
        </span>
      ),
    },
    {
      key: "submittedAssignmentCount",
      label: "SUBMISSIONS",
      render: (_, row) => (
        <span className="font-bold text-slate-900 text-sm">
          {row.submittedAssignmentCount}
        </span>
      ),
    },
    {
      key: "id",
      label: "ACTIONS",
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 font-medium"
          asChild
        >
          <Link href={`/tutor/assignments/${batchId}/${row.studentId}`}>
            Review Assignment
          </Link>
        </Button>
      ),
    },
  ];
}
