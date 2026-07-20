"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, Loader2, BookOpen } from "lucide-react";
import { useCoursesLookup } from "@/hooks/use-batches";
import { useDebounce } from "@/hooks/use-debounce";

interface CourseSelectProps {
  value: string;
  onChange: (value: string) => void;
  initialName?: string;
  error?: boolean;
  disabled?: boolean;
}

export default function CourseSelect({ value, onChange, initialName, error, disabled }: CourseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [selectedName, setSelectedName] = useState(initialName || "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // We run the query when the dropdown is open or when there is a value
  const { data: courses, isLoading } = useCoursesLookup(debouncedSearch, { enabled: isOpen || !!value });

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

  // Update selectedName when courses load and value matches
  useEffect(() => {
    if (value && courses) {
      const match = courses.find((c) => String(c.id) === String(value));
      if (match) {
        setSelectedName(match.name);
      }
    } else if (!value) {
      setSelectedName("");
    }
  }, [value, courses]);

  // Keep internal selectedName in sync with initialName on edit mount
  useEffect(() => {
    if (initialName && (!selectedName || selectedName === "N/A" || selectedName === "None")) {
      setSelectedName(initialName);
    }
  }, [initialName, selectedName]);

  const handleSelect = (courseId: string, courseName: string) => {
    onChange(courseId);
    setSelectedName(courseName);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Filter courses locally in case the backend lookup endpoint doesn't support query-level search
  const filteredCourses = (courses || []).filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger Button */}
      <div
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2.5 text-sm ${
          disabled
            ? "bg-gray-100 dark:bg-muted/30 border-gray-200 dark:border-border/40 cursor-not-allowed opacity-50"
            : "bg-white dark:bg-card cursor-pointer"
        } ${
          !disabled && error ? "border-red-500" : !disabled ? "border-gray-200 dark:border-border/70" : ""
        } ${!disabled && isOpen ? "ring-2 ring-blue-500/20 border-blue-500" : ""}`}
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <BookOpen size={16} className={`shrink-0 ${disabled ? "text-gray-300" : "text-gray-400"}`} />
          <span className={`truncate ${
            disabled ? "text-gray-400" : selectedName ? "text-gray-900 dark:text-foreground" : "text-gray-400"
          }`}>
            {disabled ? "Disabled (domain selected)" : selectedName || "Search and select course..."}
          </span>
        </div>
        <ChevronDown size={16} className={`shrink-0 ${disabled ? "text-gray-300" : "text-gray-400"}`} />
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
                placeholder="Search courses..."
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
                  onClick={() => handleSelect("", "None (No Course)")}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                    !value
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                      : "hover:bg-gray-50 dark:hover:bg-muted/50 text-gray-700 dark:text-foreground"
                  }`}
                >
                  <span className="truncate italic text-gray-500">None (No Course)</span>
                  {!value && <Check size={14} className="shrink-0" />}
                </li>
                {filteredCourses.map((c: any) => (
                  <li
                    key={c.id}
                    onClick={() => handleSelect(String(c.id), c.name)}
                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                      String(value) === String(c.id)
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                        : "hover:bg-gray-50 dark:hover:bg-muted/50 text-gray-700 dark:text-foreground"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {String(value) === String(c.id) && <Check size={14} className="shrink-0" />}
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
