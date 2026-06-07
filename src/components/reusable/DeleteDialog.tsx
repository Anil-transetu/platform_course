"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;

  /**
   * Callback to close the dialog
   */
  onClose: () => void;

  /**
   * Callback when delete is confirmed
   */
  onSubmit: () => void | Promise<void>;

  /**
   * Item name or identifier being deleted (for confirmation message)
   */
  itemName?: string;

  /**
   * Whether delete is in progress (shows loading state)
   */
  isLoading?: boolean;

  /**
   * Custom title for the dialog
   */
  title?: string;

  /**
   * Custom description/message
   */
  description?: string;
}

/**
 * Reusable delete confirmation dialog
 * Used across all features for consistent delete behavior
 *
 * USAGE:
 * const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
 * const [itemToDelete, setItemToDelete] = useState(null);
 *
 * <DeleteDialog
 *   isOpen={deleteDialogOpen}
 *   onClose={() => setDeleteDialogOpen(false)}
 *   onSubmit={() => handleDelete(itemToDelete)}
 *   itemName={itemToDelete?.name}
 *   isLoading={isDeleting}
 * />
 */
export default function DeleteDialog({
  isOpen,
  onClose,
  onSubmit,
  itemName = "this item",
  isLoading = false,
  title = "Delete Item",
  description,
}: DeleteDialogProps) {
  const defaultDescription = `Are you sure you want to delete ${itemName}? This action cannot be undone.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-border shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-bold">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground mt-3">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-lg border-border text-card-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="rounded-lg bg-red-600 hover:bg-red-700 text-white gap-2 flex items-center"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
