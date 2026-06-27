"use client";
import React, { useEffect, useState } from "react";
import { useCreateInstitution, useUpdateInstitution } from "@/features/admin/institutions/api/use-institutions";
import { Institution, InstitutionContact } from "@/features/admin/institutions/api/institution-api";
import { Modal } from "@/components/ui/modal";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  institution?: Institution | null;
}

export default function InstitutionFormModal({ open, onClose, mode, institution }: Props) {
  const createMutation = useCreateInstitution();
  const updateMutation = useUpdateInstitution();

  const [form, setForm] = useState<{
    name: string;
    email: string;
    location: string;
    contacts: InstitutionContact[];
    status: string;
  }>({
    name: "",
    email: "",
    location: "",
    contacts: [{ name: "", role: "", email: "", phone: "" }],
    status: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (mode === "edit" && institution) {
        setForm({
          name: institution.name || "",
          email: institution.email || "",
          location: institution.location || institution.address || "",
          contacts: institution.contacts && institution.contacts.length > 0 
            ? institution.contacts 
            : [{ name: "", role: "", email: "", phone: "" }],
          status: institution.status?.toLowerCase() === "inactive" ? "false" : "true",
        });
      } else {
        setForm({
          name: "",
          email: "",
          location: "",
          contacts: [{ name: "", role: "", email: "", phone: "" }],
          status: "",
        });
      }
      setErrors({});
    }
  }, [mode, institution, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    const nameStr = form.name.trim();
    if (!nameStr) {
      e.name = "Institution name is required";
    } else if (nameStr.length < 3) {
      e.name = "Institution name must be at least 3 characters long";
    } else if (!/^[a-zA-Z0-9\s.,&'-]+$/.test(nameStr)) {
      e.name = "Name can only contain letters, numbers, and basic punctuation";
    }

    const emailStr = form.email.trim();
    if (!emailStr) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      e.email = "Please enter a valid email address";
    }

    const locStr = form.location.trim();
    if (!locStr) {
      e.location = "Location is required";
    } else if (locStr.length < 3) {
      e.location = "Location must be at least 3 characters long";
    } else if (!/^[a-zA-Z0-9\s.,&'-]+$/.test(locStr)) {
      e.location = "Location can only contain letters, numbers, and basic punctuation";
    }
    
    if (form.status === "") e.status = "Status is required";

    // Optional basic validation for contacts could be added here
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddContact = () => {
    if (form.contacts.length < 3) {
      setForm(prev => ({
        ...prev,
        contacts: [...prev.contacts, { name: "", role: "", email: "", phone: "" }]
      }));
    }
  };

  const handleRemoveContact = (index: number) => {
    setForm(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const handleContactChange = (index: number, field: keyof InstitutionContact, value: string) => {
    setForm(prev => {
      const newContacts = [...prev.contacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      return { ...prev, contacts: newContacts };
    });
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const payload: any = { ...form };
    payload.address = form.location;
    delete payload.location;

    if (payload.status === "true") payload.status = "active";
    else if (payload.status === "false") payload.status = "inactive";

    if (mode === "add") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Institution registered successfully!");
          onClose();
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to register institution");
        }
      });
    } else if (institution) {
      updateMutation.mutate(
        { id: institution.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Institution updated successfully!");
            onClose();
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to update institution");
          }
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "add" ? "Register New Institution" : "Edit Institution Details"}
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 tracking-wider uppercase">
                INSTITUTION NAME <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Oxford Technical Institute"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-card ${
                  errors.name ? "border-red-500" : "border-gray-200 dark:border-border/70"
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="sm:w-1/3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 tracking-wider uppercase">
                STATUS <span className="text-red-500">*</span>
              </label>
              <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                <SelectTrigger className={`w-full bg-white dark:bg-card ${errors.status ? "border-red-500" : "border-gray-200 dark:border-border/70"}`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 tracking-wider uppercase">
                OFFICIAL EMAIL ADDRESS <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. admin@oxford.edu"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-card ${
                  errors.email ? "border-red-500" : "border-gray-200 dark:border-border/70"
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1.5 tracking-wider uppercase">
                LOCATION <span className="text-red-500">*</span>
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. London, UK"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-card ${
                  errors.location ? "border-red-500" : "border-gray-200 dark:border-border/70"
                }`}
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
          </div>
        </div>

        {/* Point of Contacts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Point of Contacts</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Max 03 point of contacts only</span>
              <button
                type="button"
                onClick={handleAddContact}
                disabled={form.contacts.length >= 3}
                className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {form.contacts.map((contact, index) => (
              <div key={index} className="bg-slate-50/50 border border-gray-100 dark:border-border/50 rounded-xl p-4 relative">
                {/* We can always allow removing contact if there's more than one, or even the only one if needed, but usually we keep at least one. However the image shows a delete icon for the second contact. We'll show it for all except maybe index 0, or show for all if > 1 */}
                {form.contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(index)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-muted-foreground mb-1 tracking-wider uppercase">
                      NAME
                    </label>
                    <input
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, "name", e.target.value)}
                      placeholder="e.g. Dr. Helena Vance"
                      className="w-full border border-gray-200 dark:border-border/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-card"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-muted-foreground mb-1 tracking-wider uppercase">
                      ROLE
                    </label>
                    <input
                      value={contact.role || contact.designation || ""}
                      onChange={(e) => handleContactChange(index, "role", e.target.value)}
                      placeholder="e.g. Dean of Academics"
                      className="w-full border border-gray-200 dark:border-border/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-card"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-muted-foreground mb-1 tracking-wider uppercase">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => handleContactChange(index, "email", e.target.value)}
                      placeholder="e.g. h.vance@oxford.edu"
                      className="w-full border border-gray-200 dark:border-border/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-card"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-muted-foreground mb-1 tracking-wider uppercase">
                      PHONE
                    </label>
                    <input
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                      placeholder="+44 20 7946 0958"
                      className="w-full border border-gray-200 dark:border-border/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-card"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow-sm"
          >
            {isPending
              ? "Saving..."
              : mode === "add"
              ? "Register Institution"
              : "Update Institution"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
