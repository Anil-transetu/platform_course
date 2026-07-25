"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Eye, EyeOff, X } from "lucide-react";
import { Tutor } from "@/types/tutor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDomains } from "@/features/admin/domains/api/domain-api";
import DomainSelect from "@/components/reusable/DomainSelect";
import TagsInput from "@/components/reusable/TagsInput";
import Chip from "@/components/reusable/Chip";
import { toSentenceCase } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  tutor?: Tutor | null;
  onSave?: (data: any) => void;
}

// Predefined domains fallback
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

// Emoji detection
const hasEmoji = (str: string) => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
};

export default function TutorFormModal({ open, onClose, mode, tutor, onSave }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    domains: [] as string[],
    tags: [] as string[],
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form | "confirmPassword" | "domains" | "tags", string>>>({});

  // Custom Domain input state
  const [isAddingCustomDomain, setIsAddingCustomDomain] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState("");

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Lazy loading state for domains API call
  const [loadDomains, setLoadDomains] = useState(false);

  // Fetch available domains from API
  const { data: domainsRes } = useDomains(1, 100, undefined, undefined, { enabled: loadDomains });
  const apiDomains = Array.isArray(domainsRes) ? domainsRes : domainsRes?.data || [];
  const apiDomainNames = apiDomains.map((d: any) => d.name || d.domain_name).filter(Boolean);
  
  // Combine predefined domains and API domains, removing duplicates
  const availableDomains = Array.from(new Set([
    ...PREDEFINED_DOMAINS,
    ...apiDomainNames.map((name: string) => name.toUpperCase())
  ]));

  useEffect(() => {
    if (open) {
      if (mode === "edit" && tutor) {
        setForm({
          name: tutor.name || "",
          email: tutor.email || "",
          phone: tutor.phone || "",
          password: "",
          confirmPassword: "",
          domains: tutor.domains || [],
          tags: tutor.tags || [],
        });
      } else {
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          domains: [],
          tags: [],
        });
      }
      setIsUpdatingPassword(false);
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsAddingCustomDomain(false);
      setCustomDomainInput("");
      setTagInput("");
      setLoadDomains(false);
    } else {
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setIsUpdatingPassword(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [mode, tutor, open]);

  const validate = (formToValidate = form) => {
    const e: Partial<Record<keyof typeof form | "confirmPassword" | "domains" | "tags", string>> = {};
    
    if (!formToValidate.name.trim()) {
      e.name = "Full Name is required";
    } else if (hasEmoji(formToValidate.name)) {
      e.name = "Full Name cannot contain emojis";
    }

    if (!formToValidate.email.trim()) {
      e.email = "Email Address is required";
    } else if (hasEmoji(formToValidate.email)) {
      e.email = "Email Address cannot contain emojis";
    }

    if (!formToValidate.phone.trim()) {
      e.phone = "Contact Number is required";
    } else if (formToValidate.phone.length !== 10) {
      e.phone = "Contact Number must be exactly 10 digits";
    }

    if (mode === "add") {
      if (!formToValidate.password.trim()) {
        e.password = "Password is required";
      } else if (hasEmoji(formToValidate.password)) {
        e.password = "Password cannot contain emojis";
      }
      if (!formToValidate.confirmPassword.trim()) {
        e.confirmPassword = "Confirm Password is required";
      } else if (formToValidate.password !== formToValidate.confirmPassword) {
        e.confirmPassword = "Passwords do not match";
      }
    } else if (mode === "edit" && isUpdatingPassword) {
      if (!formToValidate.password.trim()) {
        e.password = "New password is required";
      } else if (hasEmoji(formToValidate.password)) {
        e.password = "Password cannot contain emojis";
      }
      if (!formToValidate.confirmPassword.trim()) {
        e.confirmPassword = "Confirm New Password is required";
      } else if (formToValidate.password !== formToValidate.confirmPassword) {
        e.confirmPassword = "Passwords do not match";
      }
    }

    if (formToValidate.tags.some(t => hasEmoji(t))) {
      e.tags = "Tags cannot contain emojis";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    let currentTags = form.tags;
    if (tagInput.trim()) {
      const newTag = tagInput.trim().toUpperCase();
      if (!currentTags.includes(newTag)) {
        currentTags = [...currentTags, newTag];
      }
    }
    
    const updatedForm = { ...form, tags: currentTags };
    if (!validate(updatedForm)) return;
    
    const payload = { ...updatedForm };
    delete (payload as any).confirmPassword;
    if (mode === "edit" && (!isUpdatingPassword || !payload.password)) {
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

  const handleAddCustomDomain = () => {
    const cleaned = customDomainInput.trim();
    if (!cleaned) return;

    if (hasEmoji(cleaned)) {
      setErrors(prev => ({ ...prev, domains: "Custom Domain cannot contain emojis" }));
      return;
    }

    const upper = cleaned.toUpperCase();
    if (!form.domains.includes(upper)) {
      setForm(prev => ({ ...prev, domains: [...prev.domains, upper] }));
    }
    setIsAddingCustomDomain(false);
    setCustomDomainInput("");
    setErrors(prev => ({ ...prev, domains: "" }));
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setForm({ ...form, domains: form.domains.filter(d => d !== domainToRemove) });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toUpperCase();
      if (newTag && !form.tags.includes(newTag)) {
        setForm({ ...form, tags: [...form.tags, newTag] });
      }
      setTagInput("");
      if (errors.tags) setErrors(prev => ({ ...prev, tags: "" }));
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
      size="2xl"
    >
      <div className="space-y-6 mt-4">
        {/* Row 1: Full Name (Full Width) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
            }}
            placeholder="e.g. Dr. John Doe"
            className={`w-full border rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors h-[46px] ${
              errors.name ? "border-red-500" : "border-gray-200 dark:border-border/70"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.name}</p>
          )}
        </div>

        {/* Row 2: Email Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
            }}
            placeholder="john.doe@example.com"
            autoComplete="new-email"
            className={`w-full border rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors h-[46px] ${
              errors.email ? "border-red-500" : "border-gray-200 dark:border-border/70"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.email}</p>
          )}
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            value={form.phone}
            onChange={handlePhoneChange}
            placeholder="+1 (234) 567-8900"
            autoComplete="new-phone"
            className={`w-full border rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors h-[46px] ${
              errors.phone ? "border-red-500" : "border-gray-200 dark:border-border/70"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.phone}</p>
          )}
        </div>

        {/* Password Section */}
        {mode === "add" ? (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                  }}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  className={`w-full border rounded-xl px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors h-[46px] ${
                    errors.password ? "border-red-500" : "border-gray-200 dark:border-border/70"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-muted-foreground transition-colors z-10"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
                  }}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className={`w-full border rounded-xl px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors h-[46px] ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-200 dark:border-border/70"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-muted-foreground transition-colors z-10"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-border/50">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isUpdatingPassword}
                onChange={(e) => {
                  setIsUpdatingPassword(e.target.checked);
                  if (!e.target.checked) {
                    setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
                    setErrors((prev) => ({ ...prev, password: "", confirmPassword: "" }));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Update Password
            </label>

            {isUpdatingPassword && (
              <div className="grid grid-cols-2 gap-6 pt-1">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => {
                        setForm({ ...form, password: e.target.value });
                        if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                      }}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      className={`w-full border rounded-xl px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors h-[46px] ${
                        errors.password ? "border-red-500" : "border-gray-200 dark:border-border/70"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-muted-foreground transition-colors z-10"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => {
                        setForm({ ...form, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
                      }}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      className={`w-full border rounded-xl px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors h-[46px] ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-200 dark:border-border/70"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-muted-foreground transition-colors z-10"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Multi-Domain Selection & Tags */}
        <div className="grid grid-cols-2 gap-6">
          {/* Multi-Domain Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Domains (Multi-select)
            </label>
            <DomainSelect
              value=""
              onChange={(val, domainObj) => {
                const domainName = (domainObj?.name || val).trim();
                if (domainName && !form.domains.includes(domainName)) {
                  setForm(prev => ({ ...prev, domains: [...prev.domains, domainName] }));
                }
              }}
              placeholder="Search and select domains..."
              allowClear={false}
              closeOnSelect={false}
              selectedValues={form.domains}
            />
            {/* Display Selected Domains */}
            {form.domains.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.domains.map((dom) => (
                  <Chip
                    key={dom}
                    label={dom}
                    variant="domain"
                    onRemove={() => handleRemoveDomain(dom)}
                  />
                ))}
              </div>
            )}
            {errors.domains && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.domains}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <TagsInput
              label="Tags"
              variant="tag"
              value={form.tags}
              onChange={(newTags) => setForm(prev => ({ ...prev, tags: newTags }))}
              error={errors.tags}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-border/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm rounded-xl text-gray-600 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted font-semibold transition-colors"
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
