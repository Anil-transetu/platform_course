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
    domains: [] as string[],
    tags: [] as string[],
    status: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form | "domains" | "tags", string>>>({});

  // Custom Domain input state
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
          domains: tutor.domains || [],
          tags: tutor.tags || [],
          status: tutor.status ? tutor.status.toLowerCase() : "",
        });
      } else {
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          domains: [],
          tags: [],
          status: "",
        });
      }
      setErrors({});
      setShowPassword(false);
      setIsAddingCustomDomain(false);
      setCustomDomainInput("");
      setTagInput("");
      setLoadDomains(false);
    }
  }, [mode, tutor, open]);

  const validate = (formToValidate = form) => {
    const e: Partial<Record<keyof typeof form | "domains" | "tags", string>> = {};
    
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

    if (mode === "add" && !formToValidate.password.trim()) {
      e.password = "Password is required";
    } else if (formToValidate.password && hasEmoji(formToValidate.password)) {
      e.password = "Password cannot contain emojis";
    }

    if (formToValidate.tags.some(t => hasEmoji(t))) {
      e.tags = "Tags cannot contain emojis";
    }

    if (!formToValidate.status) {
      e.status = "Status is required";
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

        {/* Row 2: Status & Email Address */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.status}
              onValueChange={(val) => {
                setForm({ ...form, status: val });
                if (errors.status) setErrors(prev => ({ ...prev, status: "" }));
              }}
            >
              <SelectTrigger className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-muted/50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors h-[46px] flex items-center justify-between capitalize ${
                form.status ? "text-gray-700 dark:text-foreground" : "text-gray-400"
              } ${
                errors.status ? "border-red-500" : "border-gray-200 dark:border-border/70"
              }`}>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-card z-50 border border-gray-200 dark:border-border/70 shadow-lg rounded-xl p-1">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.status}</p>
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
        </div>

        {/* Row 3: Contact Number & Password */}
        <div className="grid grid-cols-2 gap-6">
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Password {mode === "add" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                }}
                placeholder={mode === "edit" ? "••••••••" : "........"}
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
        </div>

        {/* Row 4: Domains & Tags */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Domains
            </label>
            {isAddingCustomDomain ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomDomain();
                    }
                  }}
                  placeholder="Enter custom domain... (e.g. DOCKER)"
                  className="w-full border border-gray-200 dark:border-border/70 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-muted/50/50 transition-colors h-[46px]"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustomDomain(false);
                      setCustomDomainInput("");
                      setErrors(prev => ({ ...prev, domains: "" }));
                    }}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/80 text-gray-700 dark:text-foreground rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomDomain}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <Select
                value=""
                onValueChange={(val) => {
                  if (val === "ADD_CUSTOM") {
                    setIsAddingCustomDomain(true);
                  } else if (val && !form.domains.includes(val)) {
                    setForm({ ...form, domains: [...form.domains, val] });
                  }
                }}
                onOpenChange={(open) => {
                  if (open) {
                    setLoadDomains(true);
                  }
                }}
              >
                <SelectTrigger className="w-full border border-gray-200 dark:border-border/70 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-muted/50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors h-[46px] flex items-center justify-between text-gray-400">
                  <SelectValue placeholder="Select domain..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-card z-50 border border-gray-200 dark:border-border/70 shadow-lg rounded-xl max-h-60 overflow-y-auto p-1">
                  <SelectItem value="ADD_CUSTOM" className="font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-muted cursor-pointer">
                    + Add Custom Domain
                  </SelectItem>
                  {availableDomains.map((dom) => (
                    <SelectItem key={dom} value={dom}>
                      {dom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.domains && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.domains}</p>
            )}

            {/* Selected domains tags */}
            {form.domains.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 max-h-[72px] overflow-y-auto pr-1">
                {form.domains.map((domain) => (
                  <span key={domain} className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-blue-100">
                    {domain}
                    <button onClick={() => handleRemoveDomain(domain)} className="text-blue-400 hover:text-blue-600 transition-colors">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
              Tags
            </label>
            <div className="w-full border border-gray-200 dark:border-border/70 rounded-xl px-3 bg-gray-50 dark:bg-muted/50/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors h-[46px] flex items-center justify-between">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(",")) {
                    const parts = val.split(",");
                    const tagToAdd = parts[0].trim().toUpperCase();
                    if (tagToAdd && !form.tags.includes(tagToAdd)) {
                      setForm(prev => ({ ...prev, tags: [...prev.tags, tagToAdd] }));
                    }
                    setTagInput(parts.slice(1).join(","));
                    if (errors.tags) setErrors(prev => ({ ...prev, tags: "" }));
                  } else {
                    setTagInput(val);
                    if (errors.tags) setErrors(prev => ({ ...prev, tags: "" }));
                  }
                }}
                onKeyDown={handleAddTag}
                placeholder="Add tag... (Enter or comma)"
                className="w-full bg-transparent border-0 outline-none text-sm placeholder-gray-400"
              />
              {tagInput.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    const newTag = tagInput.trim().toUpperCase();
                    if (newTag && !form.tags.includes(newTag)) {
                      setForm(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
                    }
                    setTagInput("");
                    if (errors.tags) setErrors(prev => ({ ...prev, tags: "" }));
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 ml-2 whitespace-nowrap focus:outline-none"
                >
                  Add
                </button>
              )}
            </div>
            {errors.tags && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.tags}</p>
            )}

            {/* Selected tags */}
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 max-h-[72px] overflow-y-auto pr-1">
                {form.tags.map((tag, i) => (
                  <span key={tag} className={`text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border ${i % 2 === 0 ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="opacity-60 hover:opacity-100 transition-opacity">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
