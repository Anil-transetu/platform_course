"use client";

import { useSearchParams, useParams } from "next/navigation";
import EditForm from "@/app/admin/batches/EditForm";
import DeleteDialog from "@/app/admin/batches/DeleteDialog";

export default function ManagePage() {
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // "edit" | "delete"

  if (mode === "delete") {
    return <DeleteDialog id={id} />;
  }

  return <EditForm id={id} />;
}
