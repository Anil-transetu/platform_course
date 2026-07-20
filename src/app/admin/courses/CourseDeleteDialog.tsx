"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Course } from "./columns";
import { Domain } from "@/types/domain";

interface CourseDeleteDialogProps {
  open: boolean;
  item: Course | Domain | null;
  type: "course" | "domain";
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  loading?: boolean;
}

export default function CourseDeleteDialog({
  open,
  item,
  type,
  onClose,
  onConfirm,
  loading = false,
  loading = false,
}: CourseDeleteDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!loading) onClose(); }}>
      <DialogContent className="max-w-md p-6 bg-white dark:bg-card rounded-2xl shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-foreground">
            Confirm Deletion
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-gray-600 dark:text-muted-foreground mb-6">
          Are you sure you want to delete {type === "course" ? "course" : "domain"} <span className="font-semibold text-gray-900 dark:text-foreground">&quot;{item.name}&quot;</span>? This action cannot be undone.
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-foreground bg-white dark:bg-card border border-gray-300 dark:border-border rounded-lg hover:bg-gray-50 dark:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-foreground bg-white dark:bg-card border border-gray-300 dark:border-border rounded-lg hover:bg-gray-50 dark:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deleting...
              </>
            ) : "Delete"}
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deleting...
              </>
            ) : "Delete"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
