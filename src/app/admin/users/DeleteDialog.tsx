"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Loader2 } from "lucide-react";
import { fetchUserById, deleteUser, User } from "@/features/admin/users/api/user-api";

interface DeleteDialogProps {
  id: string;
}

export default function DeleteDialog({ id }: DeleteDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsFetching(true);
        const data = await fetchUserById(id);
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      } finally {
        setIsFetching(false);
      }
    };
    loadUser();
  }, [id]);

  const handleDeleteSubmit = async () => {
    setIsLoading(true);
    try {
      await deleteUser(id);
      alert("User deleted successfully!");
      router.push("/admin/users");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete user";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.push("/admin/users");
  };

  if (isFetching) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 font-medium">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 pt-0">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete user <span className="font-semibold text-gray-800">{user?.full_name || user?.name || "this user"}</span>?
          </p>
        </div>
        <div className="flex justify-center gap-3 p-6 pt-0">
          <button onClick={handleClose} className="px-6 py-2 border border-gray-200 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleDeleteSubmit} 
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
