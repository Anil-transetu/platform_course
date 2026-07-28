"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, Check, Loader2, Globe } from "lucide-react";
import { useDomainLookup } from "@/features/admin/domains/api/use-domains";
import { useDebounce } from "@/hooks/use-debounce";
import { toSentenceCase } from "@/lib/utils";

interface DomainSelectProps {
  value: string | number | null | undefined;
  onChange: (value: string, domainObj?: { id: number; name: string }) => void;
  initialName?: string;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  closeOnSelect?: boolean;
  selectedValues?: string[];
}

export default function DomainSelect({
  value,
  onChange,
  initialName,
  placeholder = "Search and select domain...",
  error,
  disabled,
  allowClear = true,
  closeOnSelect = true,
  selectedValues = [],
}: DomainSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [selectedName, setSelectedName] = useState(initialName || "");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const stringValue = value !== undefined && value !== null ? String(value) : "";
  const { data: domains = [], isLoading } = useDomainLookup(debouncedSearch, { enabled: isOpen || hasBeenOpened });

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

  // Update selectedName when lookup domains load and value matches
  useEffect(() => {
    if (stringValue && Array.isArray(domains)) {
      const match = domains.find((d: any) => String(d.id) === stringValue || String(d.name) === stringValue);
      if (match) {
        setSelectedName(match.name);
      }
    } else if (!stringValue && !initialName) {
      setSelectedName("");
    }
  }, [stringValue, domains, initialName]);

  // Keep internal selectedName in sync with initialName on edit mount
  useEffect(() => {
    if (initialName && (!selectedName || selectedName === "N/A" || selectedName === "None")) {
      setSelectedName(initialName);
    }
  }, [initialName, selectedName]);

  // Reset focus index when search term changes or dropdown toggles
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchTerm, isOpen]);

  const handleSelect = (domainId: string, domainName: string, domainObj?: any) => {
    onChange(domainId, domainObj);
    setSelectedName(domainName);
    if (closeOnSelect) {
      setIsOpen(false);
    }
    setSearchTerm("");
  };

  // Filter domains locally
  const filteredDomains = (Array.isArray(domains) ? domains : []).filter((d: any) =>
    d.name ? d.name.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  const optionsList = allowClear
    ? [{ id: "", name: "None (No Domain)" }, ...filteredDomains]
    : filteredDomains;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % Math.max(1, optionsList.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + optionsList.length) % Math.max(1, optionsList.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < optionsList.length) {
        const item = optionsList[focusedIndex];
        if (item.id === "") {
          handleSelect("", "");
        } else {
          handleSelect(String(item.id), item.name, item);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const displayText = useMemo(() => {
    if (disabled) return "Disabled";
    if (selectedValues && selectedValues.length > 0) {
      if (selectedValues.length === 1) return toSentenceCase(selectedValues[0]);
      return `${selectedValues.length} domains selected`;
    }
    if (selectedName) return toSentenceCase(selectedName);
    return placeholder;
  }, [disabled, selectedValues, selectedName, placeholder]);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger Button */}
      <div
        className={`w-full flex items-center justify-between border rounded-xl px-4 h-[46px] text-sm ${
          disabled
            ? "bg-gray-100 dark:bg-muted/30 border-gray-200 dark:border-border/40 cursor-not-allowed opacity-50"
            : "bg-gray-50 dark:bg-muted/50/50 cursor-pointer hover:bg-gray-100/80 dark:hover:bg-muted/70"
        } ${
          !disabled && error ? "border-red-500" : !disabled ? "border-gray-200 dark:border-border/70" : ""
        } ${!disabled && isOpen ? "ring-2 ring-blue-500/20 border-blue-500" : ""} transition-colors`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setHasBeenOpened(true);
          }
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Globe size={16} className={`shrink-0 ${disabled ? "text-gray-300" : "text-gray-400"}`} />
          <span
            className={`truncate ${
              disabled
                ? "text-gray-400"
                : (selectedValues && selectedValues.length > 0) || selectedName
                ? "text-gray-900 dark:text-foreground font-medium"
                : "text-gray-400"
            }`}
          >
            {displayText}
          </span>
        </div>
        <ChevronDown size={16} className={`shrink-0 ${disabled ? "text-gray-300" : "text-gray-400"}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 w-full min-w-full mt-1 bg-white dark:bg-card border border-gray-200 dark:border-border/70 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[280px] animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100 dark:border-border/50 sticky top-0 bg-white dark:bg-card z-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                ref={searchInputRef}
                autoFocus
                type="text"
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-muted/50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-foreground"
              />
            </div>
          </div>

          <div className="overflow-y-auto p-1 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-600" />
                Searching domains...
              </div>
            ) : (
              <ul className="space-y-0.5">
                {allowClear && (
                  <li
                    onClick={() => handleSelect("", "")}
                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                      !stringValue
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                        : focusedIndex === 0
                        ? "bg-gray-100 dark:bg-muted font-medium"
                        : "hover:bg-gray-50 dark:hover:bg-muted/50 text-gray-700 dark:text-foreground"
                    }`}
                  >
                    <span className="truncate italic text-gray-500">None (No Domain)</span>
                    {!stringValue && <Check size={14} className="shrink-0 text-blue-600" />}
                  </li>
                )}
                {filteredDomains.length > 0 ? (
                  filteredDomains.map((d: any, index: number) => {
                    const optionIndex = allowClear ? index + 1 : index;
                    const isSelected =
                      stringValue === String(d.id) ||
                      stringValue === String(d.name) ||
                      (selectedValues &&
                        selectedValues.some(
                          (v) =>
                            v.toUpperCase() === String(d.name).toUpperCase() ||
                            v.toUpperCase() === String(d.id).toUpperCase()
                        ));
                    const isFocused = focusedIndex === optionIndex;
                    return (
                      <li
                        key={d.id}
                        onClick={() => handleSelect(String(d.id), d.name, d)}
                        className={`flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                            : isFocused
                            ? "bg-gray-100 dark:bg-muted font-medium"
                            : "hover:bg-gray-50 dark:hover:bg-muted/50 text-gray-700 dark:text-foreground"
                        }`}
                      >
                        <span className="truncate min-w-0 flex-1">{toSentenceCase(d.name)}</span>
                        {isSelected && <Check size={14} className="shrink-0 text-blue-600" />}
                      </li>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-gray-500 dark:text-muted-foreground">
                    No domains found.
                  </div>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
