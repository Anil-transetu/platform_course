"use client";
import React, { useState } from "react";
import { Batch } from "@/types/batch";
import { Modal } from "@/components/ui/modal";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  batch: Batch | null;
}

export default function BatchDeleteDialog({ open, onClose, batch }: Props) {
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!batch) return null;

  const handleDelete = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for deletion.");
      return;
    }
    
    setIsDeleting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Batch deleted successfully");
      setIsDeleting(false);
      setReason("");
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Delete Batch" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Are you sure you want to delete the batch <strong>{batch.name}</strong>?
          This action cannot be undone.
        </p>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
            Reason for Deletion <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you are deleting this batch..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none bg-gray-50/50"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || !reason.trim()}
            className="px-5 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
          >
            {isDeleting ? "Deleting..." : "Delete Batch"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
