"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Course, Domain } from "./columns";

interface CourseDeleteDialogProps {
  open: boolean;
  item: Course | Domain | null;
  type: "course" | "domain";
  onClose: () => void;
  onConfirm: () => void;
}

export default function CourseDeleteDialog({
  open,
  item,
  type,
  onClose,
  onConfirm,
}: CourseDeleteDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white dark:bg-card rounded-2xl shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-foreground">
            Confirm Deletion
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-gray-600 dark:text-muted-foreground mb-6">
          Are you sure you want to delete {type === "course" ? "course" : "domain"} <span className="font-semibold text-gray-900 dark:text-foreground">"{item.name}"</span>? This action cannot be undone.
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-foreground bg-white dark:bg-card border border-gray-300 dark:border-border rounded-lg hover:bg-gray-50 dark:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
