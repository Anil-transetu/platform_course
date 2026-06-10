"use client";
import React, { useEffect, useState } from "react";
import { useCreateStudent, useUpdateStudent } from "@/hooks/use-students";
import { Student } from "@/types/student";
import { Modal } from "@/components/ui/modal";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  student?: Student | null; // only provided in edit mode
}

export default function StudentFormModal({ open, onClose, mode, student }: Props) {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    password: "",
    notes: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  // Pre-populate in edit mode
  useEffect(() => {
    if (open) {
      if (mode === "edit" && student) {
        setForm({
          first_name: student.first_name || "",
          last_name: student.last_name || "",
          email: student.email || "",
          mobile_number: student.mobile_number || "",
          password: "", // Leave blank on edit
          notes: student.notes || "",
        });
      } else {
        setForm({
          first_name: "",
          last_name: "",
          email: "",
          mobile_number: "",
          password: "",
          notes: "",
        });
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [mode, student, open]);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.mobile_number.trim()) e.mobile_number = "Mobile number is required";
    if (mode === "add" && !form.password.trim()) {
      e.password = "Password is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    // In edit mode, we do not want to send password if it's empty
    const payload = { ...form };
    if (mode === "edit" && !payload.password) {
      delete (payload as any).password;
    }

    if (mode === "add") {
      createStudent.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    } else if (student) {
      updateStudent.mutate(
        { id: student.id, data: payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const isPending = createStudent.isPending || updateStudent.isPending;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "add" ? "Add Student" : "Edit Student"}
      size="lg"
    >
      <div className="space-y-4">
        {/* Row 1: First + Last name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              FIRST NAME
            </label>
            <input
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              placeholder="e.g. John"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 ${
                errors.first_name ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              LAST NAME
            </label>
            <input
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              placeholder="e.g. Doe"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 ${
                errors.last_name ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
            )}
          </div>
        </div>

        {/* Row 2: Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john.doe@example.com"
            autoComplete="new-email"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Row 3: Mobile + Password */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              MOBILE NUMBER
            </label>
            <input
              value={form.mobile_number}
              onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
              placeholder="+1 (555) 000-0000"
              autoComplete="new-phone"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 ${
                errors.mobile_number ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.mobile_number && (
              <p className="text-red-500 text-xs mt-1">{errors.mobile_number}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === "edit" ? "••••••••" : "Create password"}
                autoComplete="new-password"
                className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 ${
                  errors.password ? "border-red-500" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Row 4: Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-500 tracking-wider uppercase">
              NOTES
            </label>
            <span className="text-xs text-gray-400 font-medium italic">Optional</span>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Add any relevant student notes here..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none bg-gray-50/50"
          />
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
              ? "Add Student"
              : "Update Student"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
