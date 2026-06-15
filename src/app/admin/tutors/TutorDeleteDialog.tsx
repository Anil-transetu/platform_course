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
      setIsAssociatedWithBatch(!!(tutor.assignedBatches && tutor.assignedBatches.length > 0));
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
    <Modal isOpen={open} onClose={onClose} title="Confirm Delete" size="sm">
      <div className="space-y-4">
        {/* Warning — only shown when batch is associated */}
        {isAssociatedWithBatch ? (
          <div className="text-sm font-semibold text-red-600 leading-relaxed bg-red-50/50 p-3 rounded-lg border border-red-100">
            The tutor cannot be deleted while they are still associated with an active batch.
            Please remove them from all batches first.
          </div>
        ) : (
          <p className="text-sm text-gray-700">
            Are you sure you want to delete tutor <strong>{tutor.name}</strong>?
          </p>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
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
