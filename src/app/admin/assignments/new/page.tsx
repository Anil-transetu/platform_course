import React from "react";
import AssignmentForm from "../AssignmentForm";

export default function NewAssignmentPage() {
  return (
    <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen">
      <AssignmentForm mode="add" />
    </div>
  );
}
