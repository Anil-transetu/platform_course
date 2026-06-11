"use client";
import React, { useEffect, useState } from "react";
import { Batch } from "@/types/batch";
import { Modal } from "@/components/ui/modal";
import { FileText, Download, UploadCloud, Search, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  batch?: Batch | null;
}

export default function BatchFormModal({ open, onClose, mode, batch }: Props) {
  const [form, setForm] = useState({
    name: "",
    institution: "",
    course: "",
    instructor: "",
    enroll_students: "",
    start_date: "",
    end_date: "",
  });

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && batch) {
        setForm({
          name: batch.name || "",
          institution: batch.institution || "Global Tech Institute",
          course: batch.course || "Java Development",
          instructor: batch.instructor || "Dr. Robert Wilson",
          enroll_students: "",
          start_date: batch.start_date || "2024-01-15",
          end_date: batch.end_date || "2024-06-15",
        });
      } else {
        setForm({
          name: "",
          institution: "",
          course: "",
          instructor: "",
          enroll_students: "",
          start_date: "",
          end_date: "",
        });
      }
    }
  }, [mode, batch, open]);

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Batch Name is required");
      return;
    }
    
    setIsPending(true);
    setTimeout(() => {
      toast.success(mode === "add" ? "Batch created successfully" : "Batch updated successfully");
      setIsPending(false);
      onClose();
    }, 800);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "add" ? "Create New Batch" : "Edit Batch"}
      size="xl"
    >
      <div className="space-y-6">
        
        {/* Batch Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
            BATCH NAME
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Computer Science - 2024 - Section A"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
          />
        </div>

        {/* Row 2: Institution & Course */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              SELECT INSTITUTION
            </label>
            <div className="relative">
              <select
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 appearance-none text-gray-700"
              >
                <option value="" disabled>Select Institution</option>
                <option value="Global Tech Institute">Global Tech Institute</option>
                <option value="National University">National University</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              SELECT COURSE
            </label>
            <div className="relative">
              <select
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 appearance-none text-gray-700"
              >
                <option value="" disabled>Select Course</option>
                <option value="Java Development">Java Development</option>
                <option value="Web Development">Web Development</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Row 3: Instructor & Enroll Students */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              INSTRUCTOR
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                placeholder="Search and select instructor..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              ENROLL STUDENTS
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={form.enroll_students}
                onChange={(e) => setForm({ ...form, enroll_students: e.target.value })}
                placeholder="Search by name or ID..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Row 4: Start Date & End Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              START DATE
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              END DATE
            </label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-gray-700"
            />
          </div>
        </div>

        {/* Bulk Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
            BULK UPLOAD
          </label>
          <div className="border border-dashed border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center bg-blue-50/30">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
              <FileText size={20} />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Drag and drop CSV file here
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Maximum file size: 10MB
            </p>
            <button className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white bg-white shadow-sm transition-colors">
              Select File
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3 bg-blue-50/50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full border border-blue-200 text-blue-500 flex items-center justify-center text-xs font-bold bg-white">i</div>
              <span>Make sure your file follows the standard template format.</span>
            </div>
            <button className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
              <Download size={16} />
              Download Template
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow-sm"
          >
            {isPending
              ? "Saving..."
              : mode === "add"
              ? "Create Batch"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
