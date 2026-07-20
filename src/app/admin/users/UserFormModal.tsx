"use client";
import React, { useEffect, useState } from "react";
import { useCreateUser, useUpdateUser } from "@/features/admin/users/api/user-api";
import { User } from "@/types/user";
import { Modal } from "@/components/ui/modal";
import { Eye, EyeOff, Search } from "lucide-react";
import { toast } from "sonner";
import InstitutionSelect from "./InstitutionSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    institution_id: "",
    is_active: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    if (open) {
      if (mode === "edit" && user) {
        let initialRole = user.role || "";
        if (initialRole === "Institution Representative") initialRole = "institution_representative";
        if (initialRole === "Admin") initialRole = "admin";
        if (initialRole === "Tutor") initialRole = "tutor";

        setForm({
          name: user.name || user.full_name || "",
          email: user.email || "",
          password: "",
          role: initialRole,
          institution_id: (user.institution_id as string) || "",
          is_active: user.status === "inactive" ? "false" : "true",
        });
      } else {
        setForm({
          name: "",
          email: "",
          password: "",
          role: "",
          institution_id: "",
          is_active: "",
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
    if (form.is_active === "") e.is_active = "Status is required" as any;
    if (form.role === "institution_representative" && !form.institution_id?.toString().trim()) {
      e.institution_id = "Institution is required";
    }
    if (mode === "add" && !form.password.trim()) {
      e.password = "Password is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const payload: any = { ...form };
    if (payload.is_active === "true") payload.is_active = true;
    else if (payload.is_active === "false") payload.is_active = false;

    if (mode === "edit" && !payload.password) {
      delete payload.password;
    }
    
    // Ensure institution_id is a number if it exists
    if (payload.role === "institution_representative" && payload.institution_id) {
      payload.institution_id = Number(payload.institution_id);
    } else {
      delete payload.institution_id;
    }

    if (mode === "add") {
      createUser.mutate(payload, {
        onSuccess: () => {
          toast.success("User created successfully!");
          onClose();
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to create user");
        }
      });
    } else if (user) {
      updateUser.mutate(
        { id: user.id, data: payload },
        {
          onSuccess: () => {
            toast.success("User updated successfully!");
            onClose();
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to update user");
          }
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
          <p className="text-sm text-gray-500 dark:text-muted-foreground mb-2">Fill in the details to add a new team member.</p>
        )}
        
        <div className="flex flex-col gap-4">
          {/* Full Name & Status Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-card ${
                  errors.name ? "border-red-500" : "border-gray-200 dark:border-border/70"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div className="sm:w-1/3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <Select value={form.is_active} onValueChange={(val) => setForm({ ...form, is_active: val })}>
                <SelectTrigger className={`w-full bg-white dark:bg-card ${
                  (errors as any).is_active ? "border-red-500" : "border-gray-200 dark:border-border/70"
                }`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {(errors as any).is_active && (
                <p className="text-red-500 text-xs mt-1">{(errors as any).is_active}</p>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john.doe@example.com"
              autoComplete="new-email"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-card ${
                errors.email ? "border-red-500" : "border-gray-200 dark:border-border/70"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Initial Password {mode === "add" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === "edit" ? "Leave blank to keep current" : "password123"}
                autoComplete="new-password"
                className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-card ${
                  errors.password ? "border-red-500" : "border-gray-200 dark:border-border/70"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-muted-foreground transition-colors"
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
            <label className="block text-xs font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Select Role <span className="text-red-500">*</span>
            </label>
            <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
              <SelectTrigger className={`w-full bg-white dark:bg-card ${
                errors.role ? "border-red-500" : "border-gray-200 dark:border-border/70"
              }`}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="institution_representative">Institution Representative</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role}</p>
            )}
          </div>

          {/* Conditional Institution Field */}
          {form.role === "institution_representative" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground mb-1.5">
                Select Institution <span className="text-red-500">*</span>
              </label>
              <InstitutionSelect
                value={form.institution_id}
                onChange={(val) => setForm({ ...form, institution_id: val })}
                initialName={user?.institution}
                error={!!errors.institution_id}
              />
              {errors.institution_id && (
                <p className="text-red-500 text-xs mt-1">{errors.institution_id}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm rounded-lg text-gray-700 dark:text-foreground font-semibold transition-colors bg-white dark:bg-card hover:bg-gray-50 dark:bg-muted/50"
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
