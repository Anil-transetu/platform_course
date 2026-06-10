"use client";
import React, { useEffect, useState } from "react";
import { useCreateUser, useUpdateUser } from "@/features/admin/users/api/user-api";
import { User } from "@/types/user";
import { Modal } from "@/components/ui/modal";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  user?: User | null;
}

export default function UserFormModal({ open, onClose, mode, user }: Props) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    if (open) {
      if (mode === "edit" && user) {
        setForm({
          name: user.name || user.full_name || "",
          email: user.email || "",
          password: "",
          role: user.role || "",
        });
      } else {
        setForm({
          name: "",
          email: "",
          password: "",
          role: "",
        });
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [mode, user, open]);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.role.trim()) e.role = "Role is required";
    if (mode === "add" && !form.password.trim()) {
      e.password = "Password is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const payload = { ...form };
    if (mode === "edit" && !payload.password) {
      delete (payload as any).password;
    }

    if (mode === "add") {
      createUser.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    } else if (user) {
      updateUser.mutate(
        { id: user.id, data: payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const isPending = createUser.isPending || updateUser.isPending;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "add" ? "Create New User" : "Edit User"}
      size="md"
    >
      <div className="space-y-4">
        {mode === "add" && (
          <p className="text-sm text-gray-500 mb-2">Fill in the details to add a new team member.</p>
        )}
        
        <div className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. John Doe"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john.doe@example.com"
              autoComplete="new-email"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Initial Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === "edit" ? "Leave blank to keep current" : "password123"}
                autoComplete="new-password"
                className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white ${
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

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Select Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={`w-full border bg-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 ${
                errors.role ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="">Select a role</option>
              <option value="Admin">Admin</option>
              <option value="Institution Representative">Institution Representative</option>
              <option value="Tutor">Tutor</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role}</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm rounded-lg text-gray-700 font-semibold transition-colors bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow-sm"
          >
            {isPending
              ? "Saving..."
              : mode === "add"
              ? "Create User"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
