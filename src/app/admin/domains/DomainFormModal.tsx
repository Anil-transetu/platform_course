"use client";

import React, { useEffect, useState } from "react";
import { useCreateDomain, useUpdateDomain } from "@/features/admin/domains/api/use-domains";
import { Domain } from "@/types/domain";
import { Modal } from "@/components/ui/modal";
import { Loader2 } from "lucide-react";

interface DomainFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  domain?: Domain | null;
}

export default function DomainFormModal({ open, onClose, mode, domain }: DomainFormModalProps) {
  const createMutation = useCreateDomain();
  const updateMutation = useUpdateDomain();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (mode === "edit" && domain) {
        setForm({
          name: domain.name || "",
          description: domain.description || "",
        });
      } else {
        setForm({
          name: "",
          description: "",
        });
      }
      setErrors({});
    }
  }, [mode, domain, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    const nameStr = form.name.trim();
    if (!nameStr) {
      e.name = "Domain name is required";
    } else if (nameStr.length < 2) {
      e.name = "Domain name must be at least 2 characters long";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    };

    if (mode === "add") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    } else if (domain?.id) {
      updateMutation.mutate(
        { id: domain.id, data: payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "add" ? "Create New Domain" : "Edit Domain"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Domain Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-foreground mb-1.5">
            Domain Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Computer Science, Healthcare, Finance"
            value={form.name}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            disabled={isPending}
            className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-card text-sm text-slate-900 dark:text-foreground outline-none transition-all ${
              errors.name
                ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-200 dark:border-border/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
          {errors.name && <p className="text-red-500 text-xs font-medium mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-foreground mb-1.5">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Brief description of the domain..."
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            disabled={isPending}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border/70 bg-white dark:bg-card text-sm text-slate-900 dark:text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-border/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "add" ? "Create Domain" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
