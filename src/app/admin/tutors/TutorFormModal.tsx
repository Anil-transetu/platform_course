"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Eye, EyeOff, X } from "lucide-react";

import { Tutor } from "@/types/tutor";

const PREDEFINED_DOMAINS = [
  "HTML",
  "CSS",
  "JAVASCRIPT",
  "REACT",
  "NEXT.JS",
  "NODE.JS",
  "PYTHON",
  "THREE.JS"
];

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  tutor?: Tutor | null;
  onSave?: (data: any) => void;
}

export default function TutorFormModal({ open, onClose, mode, tutor, onSave }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    domains: [] as string[],
    tags: [] as string[],
    status: "active",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  // Domain input state for custom domains
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  // Tag input state
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && tutor) {
        setForm({
          name: tutor.name || "",
          email: tutor.email || "",
          phone: tutor.phone || "",
          password: "",
          domains: tutor.domains || [],
          tags: tutor.tags || [],
          status: tutor.status?.toLowerCase() === "active" ? "active" : "inactive",
        });
      } else {
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          domains: [],
          tags: [],
          status: "active",
        });
      }
      setErrors({});
      setShowPassword(false);
      setIsCustomDomain(false);
      setDomainInput("");
      setTagInput("");
    }
  }, [mode, tutor, open]);

  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.phone.trim()) {
      e.phone = "Contact number is required";
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      e.phone = "Phone number must be exactly 10 digits";
    }
    if (mode === "add" && !form.password.trim()) {
      e.password = "Password is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const payload = { 
      ...form, 
      domains: [...form.domains], 
      tags: [...form.tags] 
    };

    if (domainInput.trim()) {
      const newDomain = domainInput.trim().toUpperCase();
      if (!payload.domains.some(d => d.toUpperCase() === newDomain)) {
        payload.domains.push(newDomain);
      }
    }

    if (tagInput.trim()) {
      const formattedTag = tagInput.trim().toUpperCase();
      if (!payload.tags.includes(formattedTag)) {
        payload.tags.push(formattedTag);
      }
    }

    if (mode === "edit" && !payload.password) {
      delete (payload as any).password;
    }

    if (onSave) {
      onSave(payload);
    }
    onClose();
  };

  const handleAddDomain = (e: React.KeyboardEvent<HTMLInputElement> | { key: string; preventDefault: () => void }) => {
    if (e.key === 'Enter' && domainInput.trim()) {
      e.preventDefault();
      const newDomain = domainInput.trim().toUpperCase();
      if (!form.domains.some(d => d.toUpperCase() === newDomain)) {
        setForm({ ...form, domains: [...form.domains, newDomain] });
      }
      setDomainInput("");
      setIsCustomDomain(false);
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setForm({ ...form, domains: form.domains.filter(d => d !== domainToRemove) });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim().toUpperCase())) {
        setForm({ ...form, tags: [...form.tags, tagInput.trim().toUpperCase()] });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "add" ? "Register New Tutor" : "Edit Tutor Details"}
      size="xl"
    >
      <div className="space-y-6 mt-4">
        {/* Row 1: Full Name & Email Address */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Dr. John Doe"
              autoComplete="off"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 transition-colors ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john.doe@example.com"
              autoComplete="off"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 transition-colors ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Row 2: Contact Number & Password */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (234) 567-8900"
              autoComplete="off"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 transition-colors ${
                errors.phone ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password {mode === "add" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === "edit" ? "••••••••" : "••••••••"}
                autoComplete="new-password"
                className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 transition-colors ${
                  errors.password ? "border-red-500" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Row 3: Domains */}
        {/* Row 3: Domains & Tags */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Domains
            </label>
            <div className="w-full border border-gray-200 rounded-xl px-2 py-1.5 min-h-[46px] flex flex-wrap items-center gap-2 bg-gray-50/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
              {form.domains.map((domain) => (
                <span key={domain} className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                  {domain}
                  <button type="button" onClick={() => handleRemoveDomain(domain)} className="text-blue-400 hover:text-blue-600 transition-colors">
                    <X size={12} strokeWidth={3} />
                  </button>
                </span>
              ))}
              {isCustomDomain ? (
                <div className="flex-1 flex items-center min-w-[140px]">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={handleAddDomain}
                    placeholder="Enter custom domain..."
                    autoComplete="off"
                    className="w-full bg-transparent border-0 outline-none px-2 py-1 text-sm placeholder-gray-400"
                    autoFocus
                  />
                  {domainInput.trim() && (
                    <button
                      type="button"
                      onClick={(e) => handleAddDomain({ key: 'Enter', preventDefault: () => {} })}
                      className="text-blue-600 hover:text-blue-800 text-xs font-bold px-2 uppercase tracking-wider"
                    >
                      Add
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setIsCustomDomain(false); setDomainInput(""); }}
                    className="text-gray-400 hover:text-gray-600 ml-1 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "CUSTOM") {
                      setIsCustomDomain(true);
                    } else if (val && !form.domains.some(d => d.toLowerCase() === val.toLowerCase())) {
                      setForm({ ...form, domains: [...form.domains, val] });
                    }
                  }}
                  className="flex-1 bg-transparent border-0 outline-none px-2 py-1 text-sm text-gray-700 min-w-[140px] cursor-pointer"
                >
                  <option value="" disabled>Select domain...</option>
                  {PREDEFINED_DOMAINS.filter(d => !form.domains.some(existing => existing.toLowerCase() === d.toLowerCase())).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                  <option value="CUSTOM">+ Add Custom Domain...</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tags
            </label>
          <div className="w-full border border-gray-200 rounded-xl px-2 py-1.5 min-h-[46px] flex flex-wrap items-center gap-2 bg-gray-50/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
            {form.tags.map((tag, i) => (
              <span key={tag} className={`text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${i % 2 === 0 ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="opacity-60 hover:opacity-100 transition-opacity">
                  <X size={12} strokeWidth={3} />
                </button>
              </span>
            ))}
            <div className="flex-1 flex items-center min-w-[140px]">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={form.tags.length === 0 ? "Add tag..." : ""}
                autoComplete="off"
                className="w-full bg-transparent border-0 outline-none px-2 py-1 text-sm placeholder-gray-400"
              />
              {tagInput.trim() && (
                <button
                  type="button"
                  onClick={(e) => handleAddTag({ key: 'Enter', preventDefault: () => {} } as any)}
                  className="text-orange-600 hover:text-orange-800 text-xs font-bold px-2 uppercase tracking-wider"
                >
                  Add
                </button>
              )}
            </div>
            </div>
          </div>
        </div>

        {/* Row 4: Status */}
        <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-200">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Account Status</h4>
            <p className="text-xs text-gray-500 mt-0.5">Determine if this tutor is currently active on the platform.</p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, status: form.status === "active" ? "inactive" : "active" })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
              form.status === "active" ? "bg-green-500" : "bg-gray-300"
            }`}
            role="switch"
            aria-checked={form.status === "active"}
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                form.status === "active" ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm rounded-xl text-gray-600 hover:bg-gray-100 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors shadow-sm"
          >
            {mode === "add" ? "Register Tutor" : "Update Tutor"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
