"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isEmpty, inputErrorClass, errorTextClass } from "@/lib/validation";

interface EditFormProps {
  id: string;
}

export default function EditForm({ id }: EditFormProps) {
  const router = useRouter();
  const [batchName, setBatchName] = useState("Computer Science - 2024 - Section A");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateBatchName = (value: string): string => {
    let error = "";
    if (isEmpty(value)) error = "Batch name is required";
    setErrors(prev => {
      if (error) return { ...prev, batchName: error };
      const n = { ...prev }; delete n.batchName; return n;
    });
    return error;
  };

  const handleSave = () => {
    setTouched(prev => ({ ...prev, batchName: true }));
    if (validateBatchName(batchName)) return;
    // Save logic here
    console.log("Saving batch ID:", id, "Name:", batchName);
    router.push("/admin/batches");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white w-[850px] rounded-xl shadow-xl p-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit Batch (ID: {id})
          </h2>
          <Link
            href="/admin/batches"
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </Link>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          {/* BATCH NAME */}
          <div>
            <label className="text-sm text-gray-600 font-medium">
              Batch Name <span className="text-red-400">*</span>
            </label>

            <input
              type="text"
              value={batchName}
              onChange={(e)=>{setBatchName(e.target.value); if(errors.batchName){setErrors(prev=>{const n={...prev};delete n.batchName;return n;});}}}
              onBlur={()=>{setTouched(prev=>({...prev,batchName:true}));validateBatchName(batchName);}}
              className={`w-full mt-1 border rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${touched.batchName && errors.batchName ? inputErrorClass : ""}`}
            />
            {touched.batchName && errors.batchName && (
              <p className={errorTextClass}>
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {errors.batchName}
              </p>
            )}
          </div>

          {/* SELECT ROW */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Select Institution
              </label>

              <select className="w-full mt-1 border rounded-lg p-3 text-gray-800">
                <option>Global Tech Institute</option>
                <option>ABC University</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Select Course
              </label>

              <select className="w-full mt-1 border rounded-lg p-3 text-gray-800">
                <option>Java Development</option>
                <option>React Development</option>
              </select>
            </div>
          </div>

          {/* INSTRUCTOR + STUDENTS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Instructor
              </label>

              <input
                type="text"
                defaultValue="Dr. Robert Wilson"
                className="w-full mt-1 border rounded-lg p-3 text-gray-800"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Enroll Students
              </label>

              <input
                type="text"
                placeholder="Search by name or ID..."
                className="w-full mt-1 border rounded-lg p-3 text-gray-800"
              />
            </div>
          </div>

          {/* DATE ROW */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Start Date
              </label>

              <input
                type="date"
                defaultValue="2024-01-15"
                className="w-full mt-1 border rounded-lg p-3 text-gray-800"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                End Date
              </label>

              <input
                type="date"
                defaultValue="2024-06-15"
                className="w-full mt-1 border rounded-lg p-3 text-gray-800"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/admin/batches"
              className="px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Link>

            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
