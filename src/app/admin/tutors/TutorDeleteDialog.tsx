"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Tutor } from "@/types/tutor";

interface Props {
  open: boolean;
  onClose: () => void;
  tutor: Tutor | null;
  onConfirm?: () => void;
}

export default function TutorDeleteDialog({ open, onClose, tutor, onConfirm }: Props) {
  const [isAssociatedWithBatch, setIsAssociatedWithBatch] = useState(false);

  useEffect(() => {
    if (open && tutor) {
      const batches = tutor.assignedBatches || tutor.batches || [];
      setIsAssociatedWithBatch(batches.length > 0);
    }
  }, [open, tutor]);

  if (!tutor) return null;

  const handleDelete = () => {
    if (isAssociatedWithBatch) return;
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Delete Tutor" size="sm">
      <div className="space-y-4 mt-2">
        {isAssociatedWithBatch ? (
          <div className="text-sm font-semibold text-red-600 leading-relaxed bg-red-50 dark:bg-red-950/20 p-3.5 rounded-xl border border-red-100 dark:border-red-900/30">
            This tutor cannot be deleted because they are currently assigned to one or more active batches. 
            Please remove this tutor from all batches before attempting to delete.
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-foreground">
            Are you sure you want to delete tutor <strong className="font-semibold text-gray-900 dark:text-foreground">"{tutor.name}"</strong>? This action cannot be undone.
          </p>
        )}

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
            disabled={isAssociatedWithBatch}
            className="px-5 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
