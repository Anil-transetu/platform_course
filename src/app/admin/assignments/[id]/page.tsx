"use client";

import React, { use } from "react";
import AssignmentForm from "../AssignmentForm";
import { useAssignment } from "@/features/admin/assignments/api/use-assignments";

export default function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { data: assignment, isLoading } = useAssignment(id);

  if (isLoading) {
    return (
      <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen flex items-center justify-center">
        <div className="text-slate-500 font-medium animate-pulse">Loading assignment details...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen flex items-center justify-center">
        <div className="text-red-500 font-medium">Assignment not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen">
      <AssignmentForm mode="edit" initialData={assignment} />
    </div>
  );
}
