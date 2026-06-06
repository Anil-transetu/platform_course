"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, TriangleAlert } from "lucide-react";

interface DeleteDialogProps {
  id: string;
}

export default function DeleteDialog({ id }: DeleteDialogProps) {
  const router = useRouter();
  const [isLinked, setIsLinked] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const handleDelete = () => {
    if (isLinked) {
      setStep(2);
    } else {
      console.log("Mock delete quiz:", id);
      router.push("/admin/quizzes");
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-900/10 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          
          {/* HEADER */}
          <div className="flex justify-between items-center p-6 border-b border-gray-50">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Confirm Delete
            </h2>
            <button 
              onClick={() => router.push("/admin/quizzes")}
              className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-8">
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Are you sure you want to delete quiz <span className="font-bold text-gray-900">Introduction to Algorithms</span> (ID: {id})?
            </p>

            {/* Checked indicator */}
            <div className="bg-slate-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4 mb-4">
              <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <span className="text-sm font-semibold text-gray-700 select-none">
                Is this quiz associated with any active course or module?
              </span>
            </div>

            {/* Blocked warning */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex gap-3 text-red-600">
                <TriangleAlert size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">
                  Deletion Blocked: This quiz is currently linked to an active course or module. Please remove it from the course curriculum before attempting to delete.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-center gap-3 p-6 pt-0">
            <button
              onClick={() => router.push("/admin/quizzes")}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition shadow-sm"
            >
              Cancel
            </button>
            <button 
              disabled
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900/10 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Confirm Delete
          </h2>
          <button 
            onClick={() => router.push("/admin/quizzes")}
            className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8">
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Are you sure you want to delete quiz <span className="font-bold text-gray-900">Introduction to Algorithms</span> (ID: {id})?
          </p>

          <div 
            className="bg-slate-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4 group cursor-pointer hover:border-blue-400 transition-colors" 
            onClick={() => setIsLinked(!isLinked)}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isLinked ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200' : 'border-gray-300'}`}>
              {isLinked && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
            </div>
            <span className="text-sm font-semibold text-gray-700 select-none">
              Is this quiz associated with any active course or module?
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-center gap-3 p-6 pt-0">
          <button
            onClick={() => router.push("/admin/quizzes")}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            className="flex-1 px-6 py-3 bg-red-50 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>

      </div>
    </div>
  );
}
