"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchInstitutionById, deleteInstitution, type Institution } from "@/features/admin/institutions/api/institution-api";

interface DeleteDialogProps {
  id: string;
}

export default function DeleteDialog({ id }: DeleteDialogProps) {
  const router = useRouter();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [checked, setChecked] = useState(false);
  const [hasActiveBatches, setHasActiveBatches] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInstitution = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const inst = await fetchInstitutionById(id);
        setInstitution(inst);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Failed to load institution:", message);
        setError(message || "Failed to load institution");
        
        // Fallback to localStorage
        const storedInstitutions = JSON.parse(localStorage.getItem("institutions") || "[]");
        const inst = storedInstitutions.find((i: Record<string, unknown>) => i.id === id);
        setInstitution(inst as Institution);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstitution();
  }, [id]);

  const handleCheck = () => {
    setChecked(true);
    const batches = JSON.parse(localStorage.getItem("batches") || "[]");
    const activeBatchExists = batches.some(
      (b: Record<string, unknown>) =>
        b.institutionId === id &&
        b.status === "Active"
    );
    setHasActiveBatches(activeBatchExists);
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      setError(null);
      await deleteInstitution(id);

      // Success - sync local storage fallback
      const storedInstitutions = JSON.parse(localStorage.getItem("institutions") || "[]");
      const updatedInstitutions = storedInstitutions.filter((i: Record<string, unknown>) => i.id !== id);
      localStorage.setItem("institutions", JSON.stringify(updatedInstitutions));

      router.push("/admin/institutions");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to delete institution:", message);
      setError(message || "Failed to delete institution. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center text-gray-500 italic">
          Loading institution details...
        </div>
      </div>
    );
  }

  if (!institution && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center text-gray-800">
           Institution not found
           <div className="mt-4">
             <Link href="/admin/institutions" className="text-blue-600 hover:underline">Back to Institutions</Link>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Delete Institution
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
             {error}
          </div>
        )}

        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          You are about to delete
          <span className="font-semibold text-gray-900">
            {" "} {institution?.name || "this institution"}
          </span>. This action cannot be undone.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <input
                id="batch-check"
                type="checkbox"
                onChange={handleCheck}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="batch-check" className="text-sm text-gray-700 font-medium cursor-pointer">
                Confirm: I have checked that there are no active batches for this institution.
              </label>
            </div>
        </div>

        {checked && hasActiveBatches && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 border border-red-200">
             <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
             Deletion blocked: Active batches detected.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/institutions"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>

          <button
            onClick={handleDelete}
            disabled={!checked || hasActiveBatches || isDeleting}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all ${
              !checked || hasActiveBatches || isDeleting
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-100"
            }`}
          >
            {isDeleting ? "Deleting..." : "Delete Institution"}
          </button>
        </div>
      </div>
    </div>
  );
}
