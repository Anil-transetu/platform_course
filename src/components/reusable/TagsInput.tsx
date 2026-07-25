"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { toSentenceCase } from "@/lib/utils";
import Chip from "./Chip";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  variant?: "domain" | "tag";
  availableOptions?: string[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  onOpen?: () => void;
}

export default function TagsInput({
  value = [],
  onChange,
  variant = "tag",
  availableOptions = ["COMPUTER SCI", "DATA SCI", "MATHS", "ENGINEERING", "FRONTEND", "BACKEND", "DEVOPS", "AI/ML"],
  placeholder = "Add or search tags...",
  label,
  error,
  disabled,
  onOpen,
}: TagsInputProps) {
  const [tagInput, setTagInput] = useState("");

  const addTag = (tagToAdd?: string) => {
    const raw = tagToAdd !== undefined ? tagToAdd : tagInput;
    const normalized = raw.trim();
    if (!normalized) return;
    if (!value.some((t) => t.toUpperCase() === normalized.toUpperCase())) {
      onChange([...value, normalized]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t.toUpperCase() !== tagToRemove.toUpperCase()));
  };

  // Filter available options matching search input excluding already selected tags
  const filteredSuggestions = useMemo(() => {
    if (!tagInput.trim()) return [];
    const query = tagInput.trim().toUpperCase();
    return availableOptions.filter(
      (opt) => opt.toUpperCase().includes(query) && !value.some((t) => t.toUpperCase() === opt.toUpperCase())
    );
  }, [tagInput, availableOptions, value]);

  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">{label}</label>}

      {/* Selected Tags Display & Input Area */}
      <div
        className={`flex flex-wrap items-center gap-2 rounded-xl border bg-[#f4f6fb] dark:bg-muted/30 p-2.5 min-h-[50px] transition-all ${
          error
            ? "border-red-500"
            : "border-[#e2e8f0] dark:border-border/70 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-card focus-within:ring-2 focus-within:ring-blue-500/10 shadow-2xs"
        }`}
      >
        {value.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            variant={variant}
            disabled={disabled}
            onRemove={() => removeTag(tag)}
          />
        ))}

        {!disabled && (
          <div className="flex-1 flex items-center gap-2 min-w-[140px]">
            <input
              type="text"
              value={tagInput}
              onFocus={() => onOpen?.()}
              onClick={() => onOpen?.()}
              onChange={(e) => {
                onOpen?.();
                setTagInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === "Tab") && tagInput.trim()) {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder={value.length === 0 ? placeholder : variant === "domain" ? "Select domains..." : "Type and press enter..."}
              className="flex-1 bg-transparent px-2 py-1 text-sm font-medium text-slate-800 dark:text-foreground outline-none placeholder:text-[#64748B] placeholder:font-medium"
            />
            {tagInput.trim() && (
              <button
                type="button"
                onClick={() => addTag()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shrink-0 shadow-xs"
              >
                <Plus size={13} strokeWidth={2.5} /> Add
              </button>
            )}
          </div>
        )}
      </div>

      {/* Matching Tag Suggestions dropdown */}
      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-white dark:bg-card border border-gray-200 dark:border-border/70 rounded-xl shadow-md">
          <span className="w-full text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Suggestions:
          </span>
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-border/70 bg-gray-50 dark:bg-muted/40 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <Plus size={12} className="text-blue-500" />
              {toSentenceCase(suggestion)}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>}
    </div>
  );
}