"use client";

import { useRouter } from "next/navigation";

interface DeleteDialogProps {
  id: string;
}

export default function DeleteDialog({ id }: DeleteDialogProps) {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/admin/courses");
  };

  const handleDelete = () => {
    console.log("Deleted course:", id);
    router.push("/admin/courses");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Confirm Delete
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete course (ID: {id})?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
