"use client";
import React from "react";
import { useDeleteUser } from "@/features/admin/users/api/user-api";
import { User } from "@/types/user";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

export default function UserDeleteDialog({ open, onClose, user }: Props) {
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    if (!user) return;
    deleteUser.mutate(user.id, {
      onSuccess: () => {
        toast.success("User deleted successfully!");
        onClose();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete user");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete user <span className="font-semibold text-slate-800">{user?.name}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 flex sm:justify-center gap-3">
          <AlertDialogCancel onClick={onClose} className="rounded-xl px-6">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteUser.isPending}
            className="rounded-xl px-6 bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 gap-2 flex items-center"
          >
            <Trash2 className="w-4 h-4" />
            {deleteUser.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
