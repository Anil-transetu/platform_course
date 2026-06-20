"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, Info, LayoutGrid, Plus, Bold, Italic, List, 
  Link as LinkIcon, Code, ChevronLeft
} from "lucide-react";
import { isEmpty, inputErrorClass, errorTextClass } from "@/lib/validation";

interface EditFormProps {
  id: string;
}

export default function EditForm({ id }: EditFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("Introduction to Web Ethics");
  const [description, setDescription] = useState("The objective of this assignment is to explore the ethical considerations of web development and software engineering. Students will analyze case studies related to data privacy, accessibility, algorithmic bias, and the environmental impact of large-scale digital infrastructure.");
  const [domain, setDomain] = useState("Web Development");
  const [tags, setTags] = useState("FRONTEND, ETHICS");
  const [criteria, setCriteria] = useState([
    { name: "Code Quality and Best Practices", marks: "80" },
    { name: "Documentation and Readability", marks: "20" }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleAddCriteria = () => {
    setCriteria([...criteria, { name: "", marks: "0" }]);
  };

  const handleUpdateCriteria = (index: number, field: string, value: string) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const handleSave = () => {
    if (!validateAll()) {
      return;
    }

    router.push("/admin/assignments");
  };

  const validateField = (field: string, value: string): string => {
    let error = "";
    switch (field) {
      case "title":
        if (isEmpty(value)) error = "Assignment title is required";
        else if (value.trim().length < 3) error = "Title must be at least 3 characters";
        break;
      case "description":
        if (isEmpty(value)) error = "Description is required";
        else if (value.trim().length < 10) error = "Description must be at least 10 characters";
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

  const handleFieldChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validateCriteria = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    criteria.forEach((c, i) => {
      if (isEmpty(c.name)) {
        newErrors[`criteria_${i}_name`] = "Criteria name is required";
        hasError = true;
      }
      if (isNaN(Number(c.marks)) || Number(c.marks) < 0) {
        newErrors[`criteria_${i}_marks`] = "Must be a valid number";
        hasError = true;
      }
    });
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return !hasError;
  };

  const validateAll = (): boolean => {
    const allTouched: Record<string, boolean> = {};
    let hasError = false;

    for (const [field, value] of [["title", title], ["description", description], ["tags", tags]] as [string, string][]) {
      allTouched[field] = true;
      const error = validateField(field, value);
      if (error) hasError = true;
    }

    const criteriaValid = validateCriteria();

    setTouched((prev) => ({ ...prev, ...allTouched }));
    return !hasError && criteriaValid;
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
    <div className="min-h-screen bg-muted/50 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border/50 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-border/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-accent rounded-lg transition text-gray-400"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-foreground">
              Edit Assignment (ID: {id})
            </h2>
          </div>
          <button 
            onClick={() => router.push("/admin/assignments")}
            className="text-gray-400 hover:text-muted-foreground transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-8">
          
          {/* SECTION 1 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Info size={16} className="text-blue-500" />
              <h3 className="text-xs font-bold text-blue-500 tracking-widest uppercase">
                Assignment Information
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Assignment Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleFieldChange("title", e.target.value, setTitle)}
                  onBlur={() => handleBlur("title", title)}
                  className={getInputClass("title", "w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition")}
                />
                <ErrorMsg field="title" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Domains</label>
                  <select 
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-card-foreground"
                  >
                    <option>Web Development</option>
                    <option>Data Science</option>
                    <option>Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Tags <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => handleFieldChange("tags", e.target.value, setTags)}
                    onBlur={() => handleBlur("tags", tags)}
                    className={getInputClass("tags", "w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-card-foreground")}
                  />
                  <ErrorMsg field="tags" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Description <span className="text-red-400">*</span></label>
                <div className={`border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition ${touched.description && errors.description ? inputErrorClass : ""}`}>
                  <div className="bg-muted/50 border-b border-border px-3 py-2 flex items-center gap-1">
                    <button className="p-1.5 text-muted-foreground hover:bg-gray-200 rounded transition"><Bold size={14} /></button>
                    <button className="p-1.5 text-muted-foreground hover:bg-gray-200 rounded transition"><Italic size={14} /></button>
                    <button className="p-1.5 text-muted-foreground hover:bg-gray-200 rounded transition"><List size={14} /></button>
                    <button className="p-1.5 text-muted-foreground hover:bg-gray-200 rounded transition"><LinkIcon size={14} /></button>
                    <div className="flex-1"></div>
                    <button className="p-1.5 text-muted-foreground hover:bg-gray-200 rounded transition"><Code size={14} /></button>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
                    onBlur={() => handleBlur("description", description)}
                    className="w-full px-4 py-3 text-sm outline-none min-h-[160px] resize-y leading-relaxed text-muted-foreground"
                  />
                </div>
                <ErrorMsg field="description" />
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-border/50" />

          {/* SECTION 2 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid size={16} className="text-blue-500" />
              <h3 className="text-xs font-bold text-blue-500 tracking-widest uppercase">
                Evaluation Matrix
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-1">
                <div className="col-span-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Criteria Name</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marks</div>
              </div>

              {criteria.map((c, i) => (
                <div key={i} className="grid grid-cols-12 gap-4">
                  <div className="col-span-10">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => { handleUpdateCriteria(i, "name", e.target.value); const key = `criteria_${i}_name`; if (errors[key]) { setErrors(prev => { const n = {...prev}; delete n[key]; return n; }); } }}
                      className={`w-full border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${errors[`criteria_${i}_name`] ? inputErrorClass : ""}`}
                    />
                    {errors[`criteria_${i}_name`] && (
                      <p className={errorTextClass}>
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        {errors[`criteria_${i}_name`]}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={c.marks}
                      onChange={(e) => { handleUpdateCriteria(i, "marks", e.target.value); const key = `criteria_${i}_marks`; if (errors[key]) { setErrors(prev => { const n = {...prev}; delete n[key]; return n; }); } }}
                      className={`w-full border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-center font-bold transition-all duration-200 ${errors[`criteria_${i}_marks`] ? inputErrorClass : ""}`}
                    />
                    {errors[`criteria_${i}_marks`] && (
                      <p className={errorTextClass}>
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        {errors[`criteria_${i}_marks`]}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <button 
                onClick={handleAddCriteria}
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition mt-2"
              >
                <Plus size={16} /> ADD CRITERIA
              </button>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-border/50 bg-muted/50">
          <button
            onClick={() => router.push("/admin/assignments")}
            className="px-8 py-2.5 border border-border text-card-foreground font-bold text-sm rounded-lg hover:bg-accent transition shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200"
          >
            Update Assignment
          </button>
        </div>

      </div>
    </div>
  );
}
