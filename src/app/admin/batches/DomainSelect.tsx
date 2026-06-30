"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, Loader2, Globe } from "lucide-react";
import { useDomainsLookup } from "@/hooks/use-batches";
import { useDebounce } from "@/hooks/use-debounce";

interface DomainSelectProps {
  value: string;
  onChange: (value: string) => void;
  initialName?: string;
  error?: boolean;
}

export default function DomainSelect({ value, onChange, initialName, error }: DomainSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [selectedName, setSelectedName] = useState(initialName || "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // We run the query when the dropdown is open or when there is a value
  const { data: domains, isLoading } = useDomainsLookup(debouncedSearch, { enabled: isOpen || !!value });

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

  // Update selectedName when domains load and value matches
  useEffect(() => {
    if (value && domains) {
      const match = domains.find((d) => String(d.id) === String(value));
      if (match) {
        setSelectedName(match.name);
      }
    } else if (!value) {
      setSelectedName("");
    }
  }, [value, domains]);

  // Keep internal selectedName in sync with initialName on edit mount
  useEffect(() => {
    if (initialName && (!selectedName || selectedName === "N/A" || selectedName === "None")) {
      setSelectedName(initialName);
    }
  }, [initialName, selectedName]);

  const handleSelect = (domainId: string, domainName: string) => {
    onChange(domainId);
    setSelectedName(domainName);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Filter domains locally in case the backend lookup endpoint doesn't support query-level search
  const filteredDomains = (domains || []).filter((d: any) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger Button */}
      <div
        className={`w-full flex items-center justify-between border bg-white dark:bg-card rounded-lg px-3 py-2.5 text-sm cursor-pointer ${
          error ? "border-red-500" : "border-gray-200 dark:border-border/70"
        } ${isOpen ? "ring-2 ring-blue-500/20 border-blue-500" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Globe size={16} className="text-gray-400 shrink-0" />
          <span className={`truncate ${selectedName ? "text-gray-900 dark:text-foreground" : "text-gray-400"}`}>
            {selectedName || "Search and select domain..."}
          </span>
        </div>
        <ChevronDown size={16} className="text-gray-400 shrink-0" />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-card border border-gray-200 dark:border-border/70 rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[300px]">
          <div className="p-2 border-b border-gray-100 dark:border-border/50 sticky top-0 bg-white dark:bg-card z-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                autoFocus
                type="text"
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-muted/50 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-foreground"
              />
            </div>
          </div>

          <div className="overflow-y-auto p-1 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Searching...
              </div>
            ) : (
              <ul className="space-y-0.5">
                <li
                  onClick={() => handleSelect("", "None (No Domain)")}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                    !value
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                      : "hover:bg-gray-50 dark:hover:bg-muted/50 text-gray-700 dark:text-foreground"
                  }`}
                >
                  <span className="truncate italic text-gray-500">None (No Domain)</span>
                  {!value && <Check size={14} className="shrink-0" />}
                </li>
                {filteredDomains.map((d: any) => (
                  <li
                    key={d.id}
                    onClick={() => handleSelect(String(d.id), d.name)}
                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                      String(value) === String(d.id)
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                        : "hover:bg-gray-50 dark:hover:bg-muted/50 text-gray-700 dark:text-foreground"
                    }`}
                  >
                    <span className="truncate">{d.name}</span>
                    {String(value) === String(d.id) && <Check size={14} className="shrink-0" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
