"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudent, useDeleteStudent } from "@/features/admin/students/api/student-api";

interface DeleteDialogProps {
  id: string;
}

export default function DeleteDialog({ id }: DeleteDialogProps) {
  const router = useRouter();
  const studentId = id;

  const [associatedBatch, setAssociatedBatch] = useState(false); // controls Delete button
  const [checkboxChecked, setCheckboxChecked] = useState(false); // checkbox state

  const { data: student, isLoading, error: queryError } = useStudent(studentId);
  const { mutateAsync: deleteStudentMutation, isPending: isDeleting } = useDeleteStudent();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (queryError) {
      setError((queryError as unknown as Error).message || "Failed to load student data");
    }
  }, [queryError]);

  const handleCheckboxChange = () => {
    setCheckboxChecked(!checkboxChecked);
    setAssociatedBatch(!checkboxChecked); // Disable delete if checked
  };

  const handleDelete = async () => {
    if (!student || associatedBatch) return;
    
    try {
      setError(null);
      await deleteStudentMutation(studentId);
      router.push("/admin/students");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error deleting student:", message);
      setError(message || "Failed to delete student. Please try again.");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3 text-gray-500 font-medium">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p>Loading student details...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center space-y-6">

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {/* Header */}
        <h1 className="text-xl font-semibold text-gray-900">
          Are you sure you want to delete{" "}
          <span className="text-red-600">{student?.name || "this student"}</span>?
        </h1>

        {/* Batch checkbox */}
        <label className="flex items-center justify-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={checkboxChecked}
            onChange={handleCheckboxChange}
            className="w-4 h-4"
          />
          <span className="text-gray-700 text-sm">
            Student is associated with any batch
          </span>
        </label>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => router.push("/admin/students")}
            disabled={isDeleting}
            className="flex-1 mr-2 px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-900 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={associatedBatch || isDeleting}
            className={`flex-1 ml-2 px-6 py-2 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
              associatedBatch || isDeleting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
