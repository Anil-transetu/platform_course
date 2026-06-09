"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Tutor {
  id: string | number;
  name: string;
}

interface DeleteDialogProps {
  id: string;
}

export default function DeleteDialog({ id }: DeleteDialogProps) {
  const router = useRouter();
  const tutorId = id;

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [associatedBatch, setAssociatedBatch] = useState(false); // controls Delete button
  const [checkboxChecked, setCheckboxChecked] = useState(false); // checkbox state

  useEffect(() => {
    // Get tutor from localStorage
    const tutors = JSON.parse(localStorage.getItem("tutors") || "[]");
    const found = tutors.find((t: Tutor) => t.id == tutorId);
    if (found) setTutor(found);

    // By default checkbox is UNMARKED, admin can choose
    setCheckboxChecked(false);
    setAssociatedBatch(false);
  }, [tutorId]);

  const handleCheckboxChange = () => {
    setCheckboxChecked(!checkboxChecked);
    setAssociatedBatch(!checkboxChecked); // Disable delete if checked
  };

  const handleDelete = () => {
    if (!tutor || associatedBatch) return;
    let tutors = JSON.parse(localStorage.getItem("tutors") || "[]");
    tutors = tutors.filter((t: Tutor) => t.id != tutor.id);
    localStorage.setItem("tutors", JSON.stringify(tutors));
    router.push("/admin/tutors");
  };

  if (!tutor) return <p className="p-6 text-card-foreground">Loading tutor...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="bg-card rounded-lg shadow-md p-6 w-full max-w-md text-center space-y-6">
        {/* Header */}
        <h1 className="text-xl font-semibold text-foreground">
          Are you sure you want to delete{" "}
          <span className="text-red-600">{tutor.name}</span>?
        </h1>

        {/* Batch checkbox */}
        <label className="flex items-center justify-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={checkboxChecked}
            onChange={handleCheckboxChange}
            className="w-4 h-4"
          />
          <span className="text-card-foreground text-sm">
            Tutor is associated with any batch
          </span>
        </label>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => router.push("/admin/tutors")}
            className="flex-1 mr-2 px-6 py-2 rounded-lg font-medium border border-border text-foreground hover:bg-accent"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={associatedBatch}
            className={`flex-1 ml-2 px-6 py-2 rounded-lg font-medium text-white ${
              associatedBatch
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
