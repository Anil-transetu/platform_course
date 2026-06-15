"use client";
import React, { useState, useEffect } from "react";
import { useDeleteStudent } from "@/hooks/use-students";
import { Student } from "@/types/student";
import { Modal } from "@/components/ui/modal";

interface Props {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function StudentDeleteDialog({ open, onClose, student }: Props) {
  const [isAssociatedWithBatch, setIsAssociatedWithBatch] = useState(false);
  const deleteMutation = useDeleteStudent();

  // Reset when open/student changes
  useEffect(() => {
    if (open && student) {
      const hasBatch = !!student.course_id || !!student.course_name;
      setIsAssociatedWithBatch(hasBatch);
    }
  }, [open, student]);

  if (!student) return null;

  const studentName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || student.name || "";
  const hasActiveBatch = isAssociatedWithBatch;

  const handleDelete = () => {
    if (hasActiveBatch) return;
    deleteMutation.mutate(student.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Confirm Delete" size="sm">
      <div className="space-y-4">
        {/* Warning — only shown when batch is associated */}
        {hasActiveBatch ? (
          <div className="text-sm font-semibold text-red-600 leading-relaxed bg-red-50/50 p-3 rounded-lg border border-red-100">
            The student cannot be deleted while they are still associated with an active batch.
            Please remove them from all batches first.
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-foreground">
            Are you sure you want to delete student <strong>{studentName}</strong>?
          </p>
        )}

        {/* Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none py-1.5 px-1 hover:bg-slate-50 rounded transition-colors">
          <input
            type="checkbox"
            checked={isAssociatedWithBatch}
            onChange={(e) => setIsAssociatedWithBatch(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-border accent-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="text-xs font-semibold text-gray-600 dark:text-muted-foreground">
            Is the student associated with any batch?
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
            disabled={hasActiveBatch || deleteMutation.isPending}
            className="px-5 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
