"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff } from "lucide-react";
import { useStudent, useUpdateStudent } from "@/features/admin/students/api/student-api";

interface EditFormProps {
  id: string;
}

export default function EditForm({ id }: EditFormProps) {
  const router = useRouter();
  const studentId = id;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    notes: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const { data: student, isLoading, error: queryError } = useStudent(studentId);
  const { mutateAsync: updateStudent, isPending: isUpdating } = useUpdateStudent();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student && studentId) {
      setFormData({
        firstName: student.first_name || "",
        lastName: student.last_name || "",
        email: student.email || "",
        mobile: student.mobile_number || "",
        password: "",
        notes: student.notes || "",
      });
    }
  }, [student, studentId]);

  useEffect(() => {
    if (queryError) {
      setError((queryError as unknown as Error).message || "Failed to load student data");
    }
  }, [queryError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      await updateStudent({ id: studentId, data: formData });
      router.push("/admin/students");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message);
      setError(message || "Something went wrong updating the student");
    }
  };

  const handleClose = () => {
    router.push("/admin/students");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-[560px] overflow-hidden transform transition-all duration-300 scale-100 flex flex-col">

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-[#1E293B]">Edit Student</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-2 rounded-full border-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8 bg-white overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading student details...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <form id="edit-student-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Ethan"
                      className="w-full bg-[#F8FAFC] border-none rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Richards"
                      className="w-full bg-[#F8FAFC] border-none rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 font-medium"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ethan.r@example.com"
                    className="w-full bg-[#F8FAFC] border-none rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 font-medium"
                  />
                </div>

                {/* Mobile & Password Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mobile Number</label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="+1 (234) 567-8900"
                      className="w-full bg-[#F8FAFC] border-none rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 font-medium"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="secretpassword"
                        className="w-full bg-[#F8FAFC] border-none rounded-xl pl-4 pr-12 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notes</label>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Optional</span>
                  </div>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any relevant student notes here..."
                    rows={4}
                    className="w-full bg-[#F8FAFC] border-none rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 font-medium resize-none"
                  />
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white border-t border-gray-50 flex justify-end gap-3 mt-auto rounded-b-[24px]">
          <button
            type="button"
            onClick={handleClose}
            className="px-8 py-3 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-student-form"
            disabled={isUpdating || isLoading}
            className="px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 focus:outline-none"
          >
            {isUpdating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            Update Student
          </button>
        </div>
      </div>
    </div>
  );
}
