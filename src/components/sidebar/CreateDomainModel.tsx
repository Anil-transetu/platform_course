"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Domain } from "@/types/domain";
import { useAssignments } from "@/features/admin/assignments/api/use-assignments";

interface CreateDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  mode: "add" | "edit" | "view";
  domain?: Domain | null;
}

const AVAILABLE_COURSES = [
  { id: 1, name: "Advanced Web Development" },
  { id: 2, name: "React & Redux Masterclass" },
  { id: 3, name: "Cloud Architecture on AWS" },
  { id: 4, name: "DevOps Pipelines for Beginners" },
  { id: 5, name: "Python for Machine Learning" },
  { id: 6, name: "Ethical Hacking Fundamentals" },
  { id: 7, name: "UI/UX Strategy & Design" },
  { id: 8, name: "MERN Stack Bootcamp" }
];

// Emoji detection regex
const hasEmoji = (str: string) => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
};

export default function CreateDomainModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  domain
}: CreateDomainModalProps) {
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  
  // Under new requirement, finalAssignment holds the selected assignment's ID
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [status, setStatus] = useState("Active");

  // Tags are the list of selected courses
  const [tags, setTags] = useState<string[]>([]);
  const [tagSearchInput, setTagSearchInput] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch available assignments from the backend API
  const { data: assignmentsRes } = useAssignments(1, 100);
  const availableAssignments = assignmentsRes?.data || [];

  // Listen to clicks outside tag dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prepopulate form state when opening/updating modal
  useEffect(() => {
    if (isOpen) {
      if (domain && (mode === "edit" || mode === "view")) {
        setDomainName(domain.name || "");
        setDescription(domain.description || "");
        setTags(domain.tags || []);
        setStatus(domain.status || "Active");
        
        // Populate assignment ID from the first assignment_ids element or fallback
        const assignId = domain.assignment_ids && domain.assignment_ids.length > 0 
          ? String(domain.assignment_ids[0])
          : "";
        setSelectedAssignmentId(assignId);
      } else {
        setDomainName("");
        setDescription("");
        setSelectedAssignmentId("");
        setTags([]);
        setStatus("Active");
      }
      setTagSearchInput("");
      setErrors({});
    }
  }, [isOpen, mode, domain]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!domainName.trim()) {
      newErrors.name = "Domain Name is required";
    } else if (hasEmoji(domainName)) {
      newErrors.name = "Domain Name cannot contain emojis";
    }
    
    if (description && hasEmoji(description)) {
      newErrors.description = "Description cannot contain emojis";
    }

    if (!selectedAssignmentId) {
      newErrors.assignment = "Final Assignment is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAction = () => {
    if (mode === "view") {
      onClose();
      return;
    }

    if (!validate()) return;

    // Call submit with updated data structure
    onSubmit({
      name: domainName,
      description,
      tags: tags, // tags contain selected courses names
      course_ids: AVAILABLE_COURSES.filter(c => tags.includes(c.name)).map(c => c.id),
      assignment_ids: selectedAssignmentId ? [Number(selectedAssignmentId)] : [],
      status: status
    });
    
    onClose();
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      
      {/* MODAL */}
      <div className="bg-card w-[550px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-slate-800">
          {mode === "add" && "Create New Domain"}
          {mode === "edit" && "Edit Domain"}
          {mode === "view" && "Domain Details"}
        </h2>

        {/* FORM */}
        <div className="space-y-4">

          {/* DOMAIN NAME */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Domain Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={domainName}
              disabled={mode === "view"}
              onChange={(e) => {
                setDomainName(e.target.value);
                if (errors.name) setErrors(p => ({ ...p, name: "" }));
              }}
              placeholder="e.g. Data Science & Engineering"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-colors text-slate-700 ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              disabled={mode === "view"}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(p => ({ ...p, description: "" }));
              }}
              placeholder="Briefly describe the educational focus..."
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-colors text-slate-700 min-h-[80px] ${
                errors.description ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.description}</p>}
          </div>

          {/* TAGS (COURSES SEARCH SELECTOR) */}
          <div ref={tagDropdownRef} className="relative">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Tags (Courses)
            </label>
            
            {mode !== "view" && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={tagSearchInput}
                  onChange={(e) => {
                    setTagSearchInput(e.target.value);
                    setShowTagDropdown(true);
                  }}
                  onFocus={() => setShowTagDropdown(true)}
                  placeholder="Search and select course to add as tag..."
                  className="w-full border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white border-gray-200 text-slate-700"
                />
                
                {/* Search Dropdown */}
                {showTagDropdown && (
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1">
                    {AVAILABLE_COURSES.filter(c => 
                      c.name.toLowerCase().includes(tagSearchInput.toLowerCase()) && !tags.includes(c.name)
                    ).length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">No available courses found</div>
                    ) : (
                      AVAILABLE_COURSES.filter(c => 
                        c.name.toLowerCase().includes(tagSearchInput.toLowerCase()) && !tags.includes(c.name)
                      ).map((course) => (
                        <div
                          key={course.id}
                          onClick={() => {
                            setTags([...tags, course.name]);
                            setTagSearchInput("");
                            setShowTagDropdown(false);
                          }}
                          className="px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-slate-50 text-slate-800 transition-colors"
                        >
                          {course.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAG LIST */}
            <div className="flex gap-2 flex-wrap mt-2">
              {tags.length === 0 && mode === "view" ? (
                <span className="text-sm text-slate-400">No courses assigned to this domain.</span>
              ) : (
                tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-blue-100"
                  >
                    {tag}
                    {mode !== "view" && (
                      <button 
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-800 text-blue-400 font-bold"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* FINAL ASSIGNMENT DROPDOWN */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Final Assignment <span className="text-red-500">*</span>
            </label>
            <Select 
              value={selectedAssignmentId}
              onValueChange={(val) => {
                setSelectedAssignmentId(val);
                if (errors.assignment) setErrors(p => ({ ...p, assignment: "" }));
              }}
              disabled={mode === "view"}
            >
              <SelectTrigger className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-slate-700 text-sm mt-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none">
                <SelectValue placeholder="Select a final assignment" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto bg-white z-50 border border-gray-200 shadow-md rounded-lg p-1">
                {availableAssignments.length === 0 ? (
                  <SelectItem value="none" disabled>No assignments available</SelectItem>
                ) : (
                  availableAssignments.map((assign) => (
                    <SelectItem key={assign.id} value={String(assign.id)}>
                      {assign.title || assign.assignment_title || `Assignment #${assign.id}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.assignment && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.assignment}</p>}
          </div>

          {/* STATUS */}
          {mode !== "add" && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Status <span className="text-red-500">*</span>
              </label>
              <Select 
                value={status}
                onValueChange={setStatus}
                disabled={mode === "view"}
              >
                <SelectTrigger className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-slate-700 text-sm mt-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-6">
          {mode !== "view" ? (
            <>
              <Button
                onClick={onClose}
                variant="outline"
                className="px-4 py-2 border rounded-lg h-10 text-sm font-semibold"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAction}
                disabled={!domainName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 h-10 text-sm font-semibold hover:bg-blue-700"
              >
                {mode === "add" ? "Create Domain" : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button 
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg h-10 text-sm font-semibold hover:bg-blue-700"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}