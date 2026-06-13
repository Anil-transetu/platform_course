"use client";
import React, { useEffect, useState } from "react";
import { Batch } from "@/types/batch";
import { Modal } from "@/components/ui/modal";
import { FileText, Download, UploadCloud, Search, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
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
          status: batch.status?.toLowerCase() === "inactive" ? "inactive" : "active",
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
          status: "active",
        });
      }
      setErrors({});
    }
  }, [mode, batch, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Batch Name is required";
    if (!form.institution.trim()) newErrors.institution = "Institution is required";
    if (!form.course.trim()) newErrors.course = "Course is required";
    if (!form.instructor.trim()) newErrors.instructor = "Instructor is required";
    if (!form.enroll_students.trim()) newErrors.enroll_students = "Enroll Students is required";
    if (!form.start_date.trim()) newErrors.start_date = "Start Date is required";
    if (!form.end_date.trim()) newErrors.end_date = "End Date is required";
    if (!form.status.trim()) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
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
            BATCH NAME <span className="text-red-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Computer Science - 2024 - Section A"
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 ${errors.name ? "border-red-500" : "border-gray-200"}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Row 2: Institution & Course */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              SELECT INSTITUTION <span className="text-red-500">*</span>
            </label>
            <Select value={form.institution} onValueChange={(val) => setForm({...form, institution: val})}>
              <SelectTrigger className={`w-full h-[42px] px-3 py-2.5 rounded-lg border ${errors.institution ? "border-red-500" : "border-gray-200"} bg-gray-50/50`}>
                <SelectValue placeholder="Select Institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Global Tech Institute">Global Tech Institute</SelectItem>
                <SelectItem value="National University">National University</SelectItem>
              </SelectContent>
            </Select>
            {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              SELECT COURSE <span className="text-red-500">*</span>
            </label>
            <Select value={form.course} onValueChange={(val) => setForm({...form, course: val})}>
              <SelectTrigger className={`w-full h-[42px] px-3 py-2.5 rounded-lg border ${errors.course ? "border-red-500" : "border-gray-200"} bg-gray-50/50`}>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Java Development">Java Development</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
              </SelectContent>
            </Select>
            {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
          </div>
        </div>

        {/* Row 3: Instructor & Enroll Students */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              INSTRUCTOR <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                placeholder="Search and select instructor..."
                className={`w-full border rounded-lg pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 ${errors.instructor ? "border-red-500" : "border-gray-200"}`}
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {errors.instructor && <p className="text-red-500 text-xs mt-1">{errors.instructor}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              ENROLL STUDENTS <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={form.enroll_students}
                onChange={(e) => setForm({ ...form, enroll_students: e.target.value })}
                placeholder="Search by name or ID..."
                className={`w-full border rounded-lg pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 ${errors.enroll_students ? "border-red-500" : "border-gray-200"}`}
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {errors.enroll_students && <p className="text-red-500 text-xs mt-1">{errors.enroll_students}</p>}
          </div>
        </div>

        {/* Row 4: Start Date & End Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              START DATE <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-gray-700 ${errors.start_date ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              END DATE <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-gray-700 ${errors.end_date ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
          </div>
        </div>

        {/* Row 5: Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
            STATUS <span className="text-red-500">*</span>
          </label>
          <Select value={form.status} onValueChange={(val) => setForm({...form, status: val})}>
            <SelectTrigger className={`w-full h-[42px] px-3 py-2.5 rounded-lg border ${errors.status ? "border-red-500" : "border-gray-200"} bg-gray-50/50`}>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
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
