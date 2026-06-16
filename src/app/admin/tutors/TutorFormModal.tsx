"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Eye, EyeOff, X } from "lucide-react";

import { Tutor } from "@/types/tutor";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  tutor?: Tutor | null;
  onSave?: (data: any) => void;
}

// Emoji detection
const hasEmoji = (str: string) => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
};

// Emoji stripping
const stripEmojis = (str: string) => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  return str.replace(emojiRegex, "");
};

export default function TutorFormModal({ open, onClose, mode, tutor, onSave }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    domains: [] as string[],
    tags: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  // Domain input state
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
          tags: ["REACT", "PYTHON"], // Mocking tags as they don't exist on tutor directly in our mock data
        });
      } else {
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          domains: [],
          tags: [],
        });
      }
      setErrors({});
      setShowPassword(false);
      setDomainInput("");
      setTagInput("");
    }
  }, [mode, tutor, open]);

  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) {
      e.name = "Name is required";
    } else if (hasEmoji(form.name)) {
      e.name = "Emojis are not allowed in name";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (hasEmoji(form.email)) {
      e.email = "Emojis are not allowed in email";
    }

    if (!form.phone.trim()) {
      e.phone = "Contact number is required";
    } else if (form.phone.length !== 10) {
      e.phone = "Contact number must be exactly 10 digits";
    }

    if (mode === "add" && !form.password.trim()) {
      e.password = "Password is required";
    } else if (form.password && hasEmoji(form.password)) {
      e.password = "Emojis are not allowed in password";
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

    if (onSave) {
      onSave(payload);
    }
    onClose();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, ""); // Keep only numbers
    if (val.length <= 10) {
      setForm({ ...form, phone: val });
      if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  const handleAddDomain = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && domainInput.trim()) {
      e.preventDefault();
      const cleanedDomain = stripEmojis(domainInput.trim().toUpperCase());
      if (cleanedDomain && !form.domains.includes(cleanedDomain)) {
        setForm({ ...form, domains: [...form.domains, cleanedDomain] });
      }
      setDomainInput("");
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setForm({ ...form, domains: form.domains.filter(d => d !== domainToRemove) });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const cleanedTag = stripEmojis(tagInput.trim().toUpperCase());
      if (cleanedTag && !form.tags.includes(cleanedTag)) {
        setForm({ ...form, tags: [...form.tags, cleanedTag] });
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
      size="lg"
    >
      <div className="space-y-6 mt-4">
        {/* Row 1: Full Name & Email Address */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => {
                const cleanedVal = stripEmojis(e.target.value);
                setForm({ ...form, name: cleanedVal });
                if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Dr. John Doe"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors ${
                errors.name ? "border-red-500" : "border-gray-200 dark:border-border/70"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                const cleanedVal = stripEmojis(e.target.value);
                setForm({ ...form, email: cleanedVal });
                if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
              }}
              placeholder="john.doe@example.com"
              autoComplete="new-email"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors ${
                errors.email ? "border-red-500" : "border-gray-200 dark:border-border/70"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Row 2: Contact Number & Password */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              value={form.phone}
              onChange={handlePhoneChange}
              placeholder="10-digit number"
              autoComplete="new-phone"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors ${
                errors.phone ? "border-red-500" : "border-gray-200 dark:border-border/70"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Password {mode === "add" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => {
                  const cleanedVal = stripEmojis(e.target.value);
                  setForm({ ...form, password: cleanedVal });
                  if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                }}
                placeholder={mode === "edit" ? "••••••••" : "••••••••"}
                autoComplete="new-password"
                className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors ${
                  errors.password ? "border-red-500" : "border-gray-200 dark:border-border/70"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-muted-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Row 3: Domains */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
            Domains
          </label>
          <div className="w-full border border-gray-200 dark:border-border/70 rounded-xl px-2 py-1.5 min-h-[46px] flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-muted/50/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
            {form.domains.map((domain) => (
              <span key={domain} className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                {domain}
                <button onClick={() => handleRemoveDomain(domain)} className="text-blue-400 hover:text-blue-600 transition-colors">
                  <X size={12} strokeWidth={3} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(stripEmojis(e.target.value))}
              onKeyDown={handleAddDomain}
              placeholder={form.domains.length === 0 ? "Add domain..." : ""}
              className="flex-1 bg-transparent border-0 outline-none px-2 py-1 text-sm placeholder-gray-400 min-w-[120px]"
            />
          </div>
        </div>

        {/* Row 4: Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
            Tags
          </label>
          <div className="w-full border border-gray-200 dark:border-border/70 rounded-xl px-2 py-1.5 min-h-[46px] flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-muted/50/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
            {form.tags.map((tag, i) => (
              <span key={tag} className={`text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${i % 2 === 0 ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="opacity-60 hover:opacity-100 transition-opacity">
                  <X size={12} strokeWidth={3} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(stripEmojis(e.target.value))}
              onKeyDown={handleAddTag}
              placeholder={form.tags.length === 0 ? "Add tag..." : ""}
              className="flex-1 bg-transparent border-0 outline-none px-2 py-1 text-sm placeholder-gray-400 min-w-[120px]"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm rounded-xl text-gray-600 dark:text-muted-foreground hover:bg-gray-100 dark:bg-muted font-semibold transition-colors"
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
