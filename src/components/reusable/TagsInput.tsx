"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Plus, Check, Tag } from "lucide-react";
import { toSentenceCase } from "@/lib/utils";
import Chip from "./Chip";
import { toast } from "sonner";

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

const DEFAULT_OPTIONS = [
  "COMPUTER SCI",
  "DATA SCI",
  "MATHS",
  "ENGINEERING",
  "FRONTEND",
  "BACKEND",
  "DEVOPS",
  "AI/ML",
  "WEB DEV",
  "MOBILE DEV",
  "DESIGN",
  "UI/UX",
];

export function normalizeTag(tag: string): string {
  if (!tag) return "";
  return tag.trim().toUpperCase();
}

export function isValidTag(tag: string): boolean {
  if (!tag) return false;
  const trimmed = tag.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  if (!/[a-zA-Z0-9]/.test(trimmed)) return false;
  const chars = new Set(trimmed.toLowerCase());
  if (chars.size === 1) return false;
  return true;
}

export default function TagsInput({
  value = [],
  onChange,
  variant = "tag",
  availableOptions = DEFAULT_OPTIONS,
  placeholder = "Add or search tags...",
  label,
  error,
  disabled,
  onOpen,
}: TagsInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset focus index when search term changes or dropdown toggles
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchTerm, isOpen]);

  // Combined pool of available options including default options, custom tags created, and existing values
  const allTagOptions = useMemo(() => {
    const set = new Set<string>();
    availableOptions.map(normalizeTag).forEach((opt) => set.add(opt));
    customTags.map(normalizeTag).forEach((tag) => set.add(tag));
    value.map(normalizeTag).forEach((v) => set.add(v));
    return Array.from(set);
  }, [availableOptions, customTags, value]);

  // Filter tag options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return allTagOptions;
    const query = searchTerm.trim().toLowerCase();
    return allTagOptions.filter((opt) => opt.toLowerCase().includes(query));
  }, [allTagOptions, searchTerm]);

  const addTag = (tagToAdd: string) => {
    const rawTrimmed = tagToAdd.trim();
    if (!rawTrimmed) return;

    if (!isValidTag(rawTrimmed)) {
      toast.error("Please enter a valid tag.");
      return;
    }

    const normalized = normalizeTag(rawTrimmed);

    const existsInValue = value.some((t) => normalizeTag(t) === normalized);
    if (!existsInValue) {
      onChange([...value.map(normalizeTag), normalized]);
    }

    if (!allTagOptions.some((t) => normalizeTag(t) === normalized)) {
      setCustomTags((prev) => [...prev, normalized]);
    }
    setSearchTerm("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => normalizeTag(t) !== normalizeTag(tagToRemove)));
  };

  const toggleTag = (tag: string) => {
    const isSelected = value.some((t) => normalizeTag(t) === normalizeTag(tag));
    if (isSelected) {
      removeTag(tag);
    } else {
      addTag(tag);
    }
  };

  const handleAddCustomTagClick = () => {
    if (searchTerm.trim()) {
      addTag(searchTerm.trim());
    } else if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % Math.max(1, filteredOptions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length));
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        toggleTag(filteredOptions[focusedIndex]);
      } else if (searchTerm.trim()) {
        addTag(searchTerm.trim());
      }
    } else if (e.key === "Backspace" && !searchTerm && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full space-y-1.5 relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
          {label}
        </label>
      )}

      {/* Selected Tags & Interactive Container */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            onOpen?.();
            searchInputRef.current?.focus();
          }
        }}
        className={`w-full flex flex-wrap items-center gap-2 rounded-xl border bg-[#f4f6fb] dark:bg-muted/30 p-2.5 min-h-[50px] cursor-pointer transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed border-gray-200"
            : error
            ? "border-red-500"
            : isOpen
            ? "border-blue-500 bg-white dark:bg-card ring-2 ring-blue-500/10 shadow-sm"
            : "border-[#e2e8f0] dark:border-border/70 hover:border-blue-300"
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
          <div className="flex-1 flex items-center min-w-[140px]">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onFocus={() => {
                setIsOpen(true);
                onOpen?.();
              }}
              onChange={(e) => {
                setIsOpen(true);
                onOpen?.();
                setSearchTerm(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : "Search or add tags..."}
              className="w-full bg-transparent px-1 py-0.5 text-sm font-medium text-slate-800 dark:text-foreground outline-none placeholder:text-[#64748B] placeholder:font-normal"
            />
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-card border border-gray-200 dark:border-border/70 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[300px] animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Header Action: Add Custom Tag */}
          <div className="p-2 border-b border-gray-100 dark:border-border/50 bg-slate-50/70 dark:bg-muted/40 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleAddCustomTagClick}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
            >
              <Plus size={14} strokeWidth={2.5} />
              {searchTerm.trim() ? `Add "${searchTerm.trim()}" as Custom Tag` : "+ Add Custom Tag"}
            </button>
          </div>

          {/* Search Input inside Dropdown */}
          <div className="p-2 border-b border-gray-100 dark:border-border/50 sticky top-0 bg-white dark:bg-card z-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search Tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-muted/50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-foreground font-medium"
              />
            </div>
          </div>

          {/* Available Tags List */}
          <div className="overflow-y-auto p-1 flex-1 max-h-[200px]">
            <ul className="space-y-0.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((tagOption, index) => {
                  const isSelected = value.some((t) => normalizeTag(t) === normalizeTag(tagOption));
                  const isFocused = focusedIndex === index;
                  return (
                    <li
                      key={tagOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTag(tagOption);
                      }}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
                          : isFocused
                          ? "bg-gray-100 dark:bg-muted font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-muted/50 text-gray-700 dark:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Tag size={13} className={isSelected ? "text-blue-600" : "text-gray-400"} />
                        <span className="truncate">{toSentenceCase(tagOption)}</span>
                      </div>
                      {isSelected && <Check size={14} className="shrink-0 text-blue-600" />}
                    </li>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-gray-500 dark:text-muted-foreground">
                  No matching tags found. Click &quot;+ Add Custom Tag&quot; above to create one.
                </div>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}