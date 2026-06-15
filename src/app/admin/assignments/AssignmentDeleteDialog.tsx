"use client";
import React, { useState, useEffect } from "react";
import { useDeleteAssignment } from "@/features/admin/assignments/api/use-assignments";
import { Assignment } from "@/features/admin/assignments/api/assignment-api";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

export default function AssignmentDeleteDialog({ open, onClose, assignment }: Props) {
  const [isAssociatedWithActiveCourse, setIsAssociatedWithActiveCourse] = useState(false);
  const deleteMutation = useDeleteAssignment();

  // Reset when open/assignment changes
  useEffect(() => {
    if (open && assignment) {
      setIsAssociatedWithActiveCourse(false);
    }
  }, [open, assignment]);

  if (!assignment) return null;

  const assignmentTitle = assignment.title || assignment.assignment_title || "";
  const hasActiveCourse = isAssociatedWithActiveCourse;

  const handleDelete = () => {
    if (hasActiveCourse) return;
    deleteMutation.mutate(assignment.id, {
      onSuccess: () => {
        toast.success("Assignment deleted successfully");
        onClose();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete assignment");
      }
    });
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Confirm Delete" size="sm">
      <div className="space-y-4">
        {/* Warning — only shown when course is associated */}
        {hasActiveCourse ? (
          <div className="text-sm font-semibold text-red-600 leading-relaxed bg-red-50/50 p-3 rounded-lg border border-red-100">
            Deletion blocked: The assignment cannot be deleted while it is still associated with active courses.
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-foreground">
            Are you sure you want to delete assignment <strong>{assignmentTitle}</strong>? This action cannot be undone.
          </p>
        )}

        {/* Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none py-1.5 px-1 hover:bg-slate-50 rounded transition-colors">
          <input
            type="checkbox"
            checked={isAssociatedWithActiveCourse}
            onChange={(e) => setIsAssociatedWithActiveCourse(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-border accent-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="text-xs font-semibold text-gray-600 dark:text-muted-foreground leading-relaxed">
            Confirm: Is the Assignment associated with any active courses or student submissions?
          </span>
        </label>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-border/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-border/70 text-gray-700 dark:text-foreground hover:bg-gray-50 dark:bg-muted/50 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={hasActiveCourse || deleteMutation.isPending}
            className="px-5 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
