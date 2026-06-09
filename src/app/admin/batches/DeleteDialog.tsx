"use client";

import { useRouter } from "next/navigation";

interface DeleteDialogProps {
  id: string;
}

export default function DeleteDialog({ id }: DeleteDialogProps) {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/admin/batches");
  };

  const handleDelete = () => {
    // 👉 Here you will call API in future
    console.log("Deleted batch:", id);

    // Redirect after delete
    router.push("/admin/batches");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">

      {/* MODAL */}
      <div className="bg-card rounded-xl shadow-xl w-[400px] p-6">

        {/* TITLE */}
        <h2 className="text-lg font-semibold text-card-foreground mb-2">
          Confirm Delete
        </h2>

        {/* DESCRIPTION */}
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete batch{" "}
          <span className="font-medium text-card-foreground">
            CS-2024-01
          </span>
          ?
        </p>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3">

          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm rounded-lg border text-card-foreground hover:bg-accent"
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
