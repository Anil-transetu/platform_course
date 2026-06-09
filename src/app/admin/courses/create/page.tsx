"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutGrid, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { isEmpty, inputErrorClass, errorTextClass } from "@/lib/validation";
import { useCourseStore } from "@/store/useCourseStore";

export default function CreateCoursePage() {
  const router = useRouter();
  const { course, setCourseDetails, addModule } = useCourseStore();
  const { title, domain, tags } = course;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState("");

  const validateField = (field: string, value: string): string => {
    let error = "";
    switch (field) {
      case "title":
        if (isEmpty(value)) error = "Course title is required";
        else if (value.trim().length < 3) error = "Title must be at least 3 characters";
        break;
      case "tags":
        if (isEmpty(value)) error = "At least one tag is required";
        break;
    }
    setErrors((prev) => {
      if (error) return { ...prev, [field]: error };
      const next = { ...prev };
      delete next[field];
      return next;
    });
    return error;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'title') setCourseDetails(value, domain, tags);
    if (field === 'domain') setCourseDetails(title, value, tags);
    if (field === 'tags') setCourseDetails(title, domain, value);
    
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validateAll = (): boolean => {
    const allTouched: Record<string, boolean> = {};
    let hasError = false;
    for (const [field, value] of [["title", title], ["tags", tags]] as [string, string][]) {
      allTouched[field] = true;
      const error = validateField(field, value);
      if (error) hasError = true;
    }
    setTouched((prev) => ({ ...prev, ...allTouched }));
    return !hasError;
  };

  const handlePublish = () => {
    setFormError("");
    if (!validateAll()) {
      setFormError("Please fix the errors above before publishing.");
      return;
    }
    // Publish logic here
  };

  const handleSaveDraft = () => {
    setFormError("");
    if (!validateAll()) {
      setFormError("Please fix the errors above before saving.");
      return;
    }
    // Save draft logic here
  };

  const getInputClass = (field: string, base: string) => {
    return touched[field] && errors[field] ? `${base} ${inputErrorClass}` : base;
  };

  const ErrorMsg = ({ field }: { field: string }) => {
    if (!touched[field] || !errors[field]) return null;
    return (
      <p className={errorTextClass}>
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        {errors[field]}
      </p>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

      {/* FORM SECTION */}
      <div className="bg-card rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Course Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              onBlur={() => handleBlur("title", title)}
              className={getInputClass("title", "w-full px-4 py-3 rounded-xl bg-muted border border-gray-100 focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-card-foreground placeholder-gray-400 font-medium")}
              placeholder="Enter course title..."
            />
            <ErrorMsg field="title" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Domain
            </label>
            <div className="relative">
              <select
                value={domain}
                onChange={(e) => handleFieldChange("domain", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-gray-100 focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-card-foreground font-medium appearance-none cursor-pointer"
              >
                <option>Web Development</option>
                <option>Data Science</option>
                <option>Cybersecurity</option>
                <option>Design</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Tags <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => handleFieldChange("tags", e.target.value)}
              onBlur={() => handleBlur("tags", tags)}
              className={getInputClass("tags", "w-full px-4 py-3 rounded-xl bg-muted border border-gray-100 focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-card-foreground placeholder-gray-400 font-medium")}
              placeholder="Add tags separated by comma..."
            />
            <ErrorMsg field="tags" />
          </div>
        </div>

        {/* FORM ERROR */}
        {formError && (
          <p className="text-red-500 text-sm mt-4 flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            {formError}
          </p>
        )}
      </div>

      {/* CURRICULUM SECTION */}
      <div className="bg-card rounded-2xl shadow-sm border border-dashed border-border flex flex-col items-center justify-center p-20 min-h-[400px]">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <LayoutGrid className="text-blue-500" size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          Start your curriculum
        </h2>
        <p className="text-muted-foreground text-center max-w-sm mb-10 leading-relaxed font-normal">
          Your course curriculum is currently empty. Start by adding your first module to organize lessons and resources.
        </p>

        <button 
          onClick={() => {
            if (course.modules.length === 0) {
              addModule();
            }
            router.push("/admin/courses/create/module");
          }}
          className="flex items-center gap-3 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Plus size={20} className="stroke-[3px]" /> {course.modules.length === 0 ? "Add First Module" : "Continue to Modules"}
        </button>
      </div>
      </div>
    </div>
  );
}
