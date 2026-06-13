"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, Info, LayoutGrid, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

import { useCreateAssignment, useUpdateAssignment } from "@/features/admin/assignments/api/use-assignments";
import { Assignment } from "@/features/admin/assignments/api/assignment-api";
import { RichTextEditor } from "@/components/ui/RichTextEditor/RichTextEditor";
import EvaluationMatrixBuilder, { EvaluationCriteria } from "@/components/admin/assignments/EvaluationMatrixBuilder";

interface Props {
  mode: "add" | "edit";
  initialData?: Assignment | null;
}

export default function AssignmentForm({ mode, initialData }: Props) {
  const router = useRouter();
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Domains
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState("");
  
  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  // Evaluation Matrix
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([
    { name: "Code Quality and Best Practices", marks: "0" },
    { name: "Documentation and Readability", marks: "0" }
  ]);
  
  const [isPublished, setIsPublished] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || initialData.assignment_title || "");
      setDescription(initialData.description || "");
      setSelectedDomains(initialData.domains && initialData.domains.length > 0 ? initialData.domains : (initialData.domain ? [initialData.domain] : []));
      setTags(initialData.tags || []);
      const em = initialData.evaluation_matrix;
      if (em && Array.isArray(em) && em.length > 0) {
        setCriteria(em.map((c: any) => ({
          id: c.id,
          name: c.name || c.criteria_name || "",
          marks: c.marks || c.max_points || "0",
          description: c.description || ""
        })));
      } else {
        setCriteria([
          { name: "Code Quality and Best Practices", marks: "0" },
          { name: "Documentation and Readability", marks: "0" }
        ]);
      }
      setIsPublished(initialData.status === "PUBLISHED" || initialData.status === "ACTIVE" || initialData.status === "published");
    } else {
      setTitle("");
      setDescription("");
      setSelectedDomains([]);
      setTags([]);
      setCriteria([
        { name: "Code Quality and Best Practices", marks: "0" },
        { name: "Documentation and Readability", marks: "0" }
      ]);
      setIsPublished(false);
    }
    setErrors({});
    setTouched({});
    setDomainInput("");
    setTagInput("");
  }, [mode, initialData]);

  const addDomain = () => {
    const normalized = domainInput.trim().toUpperCase();
    if (!normalized) return;
    if (!selectedDomains.includes(normalized)) {
      setSelectedDomains((prev) => [...prev, normalized]);
    }
    setDomainInput("");
    if (errors.domains) setErrors(p => ({...p, domains: ""}));
  };

  const addTag = () => {
    const normalized = tagInput.trim().toUpperCase();
    if (!normalized) return;
    if (!tags.includes(normalized)) {
      setTags((prev) => [...prev, normalized]);
    }
    setTagInput("");
  };

  const validateField = (field: string, value: string): string => {
    let error = "";
    switch (field) {
      case "title":
        if (!value.trim()) error = "Assignment title is required";
        else if (value.trim().length < 3) error = "Title must be at least 3 characters";
        break;
      case "domains":
        if (selectedDomains.length === 0) error = "Select at least one domain";
        break;
      case "matrix":
        if (criteria.length === 0) {
          error = "At least one evaluation criteria is required";
        } else {
          const hasEmptyName = criteria.some(c => !c.name.trim());
          const hasInvalidMarks = criteria.some(c => isNaN(Number(c.marks)) || Number(c.marks) < 0);
          if (hasEmptyName) error = "All criteria names must be filled";
          else if (hasInvalidMarks) error = "Marks must be valid positive numbers";
        }
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

  const validateAll = (): boolean => {
    const validations: [string, string][] = [
      ["title", title],
    ];
    const allTouched: Record<string, boolean> = {};
    let hasError = false;
    for (const [field, value] of validations) {
      allTouched[field] = true;
      const error = validateField(field, value);
      if (error) hasError = true;
    }
    
    if (selectedDomains.length === 0) {
      allTouched["domains"] = true;
      setErrors((prev) => ({ ...prev, domains: "Select at least one domain" }));
      hasError = true;
    }

    const matrixError = validateField("matrix", "");
    if (matrixError) {
      hasError = true;
    }

    setTouched((prev) => ({ ...prev, ...allTouched }));
    return !hasError;
  };

  const getInputClass = (field: string, base: string) => {
    return touched[field] && errors[field] ? `${base} border-red-500` : base;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateAll()) {
      toast.error("Please fix the errors above before saving.");
      return;
    }

    const payload: Record<string, any> = {
      title: title.trim(),
      submission_type: "file",
      description,
      domains: selectedDomains,
      tags,
      status: isPublished ? "active" : "inactive",
      max_score: criteria.reduce((sum, c) => sum + (parseInt(String(c.marks)) || 0), 0),
      evaluation_matrix: criteria.map((c: any) => ({
        ...(c.id ? { id: c.id } : {}),
        name: c.name,
        description: "",
        marks: parseInt(String(c.marks)) || 0
      }))
    };

    if (mode === "add") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Assignment created successfully!");
          router.push("/admin/assignments");
        },
        onError: (err: any) => toast.error(err.message || "Failed to create assignment"),
      });
    } else if (initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Assignment updated successfully!");
            router.push("/admin/assignments");
          },
          onError: (err: any) => toast.error(err.message || "Failed to update assignment"),
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-5xl">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm text-slate-500 mb-2">
          <span className="cursor-pointer hover:text-slate-800" onClick={() => router.push("/admin/assignments")}>Assignments</span> / <span className="text-slate-800 font-semibold">{mode === "add" ? "Create New Assignment" : "Edit Assignment Details"}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{mode === "add" ? "Create New Assignment" : "Edit Assignment Details"}</h1>
        <p className="text-sm text-slate-500">
          {mode === "add" ? "Fill in the details below to set up a new student assignment." : "Update assignment details, description, and evaluation matrix."}
        </p>
      </div>

      <div className="space-y-6 pb-24">

        {/* Basic Information */}
        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <Info size={16} className="text-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Basic Information</h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-slate-800">Assignment Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(p => ({...p, title: ""}));
                }}
                onBlur={() => setTouched(p => ({ ...p, title: true }))}
                placeholder="e.g. Introduction to Web Ethics"
                className={getInputClass("title", "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all")}
              />
              {touched.title && errors.title && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.title}</p>}
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Description</label>
              <div className="rounded-xl overflow-hidden border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <RichTextEditor 
                  value={description}
                  onChange={setDescription}
                  className="border-none shadow-none rounded-none"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-3">Provide comprehensive details, objectives, and any necessary resources.</p>
            </div>
          </div>
        </section>

        {/* Categorization */}
        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Categorization</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Domains <span className="text-red-500">*</span>
              </label>
              <div className={getInputClass("domains", "flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 min-h-[52px] focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all")}>
                {selectedDomains.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-2.5 py-1.5 text-xs font-bold tracking-wide text-blue-700"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => setSelectedDomains((prev) => prev.filter((d) => d !== item))}
                      className="text-blue-500 hover:text-blue-800"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDomain();
                    }
                  }}
                  placeholder={selectedDomains.length === 0 ? "Type and press Enter..." : "Type and press Enter..."}
                  className="flex-1 min-w-[120px] bg-transparent px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-3">Type a domain and press Enter.</p>
              {touched.domains && errors.domains && <p className="text-red-500 text-xs mt-2 font-medium">{errors.domains}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Tags</label>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 min-h-[52px] focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                {tags.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 px-2.5 py-1.5 text-xs font-bold tracking-wide text-slate-700"
                  >
                    {item}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== item))} className="text-slate-500 hover:text-slate-800">
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder={tags.length === 0 ? "Type and press Enter..." : "Type and press Enter..."}
                  className="flex-1 min-w-[120px] bg-transparent px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-3">Helpful for searching and filtering assignments.</p>
            </div>
          </div>
        </section>

        {/* Evaluation Matrix */}
        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <LayoutGrid size={16} className="text-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Evaluation Matrix</h2>
          </div>
          <div className="p-6">
            <EvaluationMatrixBuilder 
              criteria={criteria} 
              onChange={(c) => {
                setCriteria(c);
                if (errors.matrix) setErrors(p => ({...p, matrix: ""}));
              }}
              error={errors.matrix}
            />
          </div>
        </section>

        {/* Visibility & Settings */}
        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Visibility & Settings</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between max-w-sm">
              <div>
                <p className="text-sm font-bold text-slate-800">Published Status</p>
                <p className="text-xs text-slate-500 mt-0.5">Assignment will be visible to students</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isPublished ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublished ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-slate-200 p-4 z-50">
        <div className="mx-auto max-w-5xl flex justify-end gap-3 pr-4">
          <button
            onClick={() => router.push("/admin/assignments")}
            className="px-5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2.5 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow-sm"
          >
            {isPending ? "Saving..." : mode === "add" ? "Create Assignment" : "Update Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
