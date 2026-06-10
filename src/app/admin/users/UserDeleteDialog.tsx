"use client";
import React from "react";
import { useDeleteUser } from "@/features/admin/users/api/user-api";
import { User } from "@/types/user";
import { Modal } from "@/components/ui/modal";
import { AlertTriangle } from "lucide-react";

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
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Confirm Delete" size="md">
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle className="text-red-600 w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{user?.name}</span>? 
          This action cannot be undone and will permanently remove this user from the system.
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteUser.isPending}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleteUser.isPending ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
