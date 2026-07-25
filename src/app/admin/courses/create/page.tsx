"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, UploadCloud, Image as ImageIcon, BookOpen, Sparkles, Tag, Globe, Loader2, Search, Check, ChevronDown, Info } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { isEmpty, inputErrorClass, errorTextClass } from "@/lib/validation";
import { useCourseStore } from "@/store/useCourseStore";
import { useCreateCourse, useUpdateCourse, useAssignmentsLookup } from "@/features/admin/courses/api/course-api";
import { getDefaultEditorRoute, cn } from "@/lib/utils";
import { useDomains } from "@/features/admin/domains/api/domain-api";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DomainSelect from "@/components/reusable/DomainSelect";
import TagsInput from "@/components/reusable/TagsInput";

// Static domain list — will be replaced by API data in Phase 1
const DOMAIN_OPTIONS = [
  "Engineering",
  "Design",
  "Business",
  "Marketing",
  "Data Science",
  "Product Management",
  "Finance",
  "Health & Wellness",
  "Web Development",
  "Mobile Development",
];

const toastApiError = (err: any, fallbackMessage: string) => {
  if (typeof window !== "undefined" && !navigator.onLine) {
    toast.error("Network disconnected. Please check your connection.");
    return;
  }
  toast.error(err.message || fallbackMessage);
};

export default function CreateCoursePage() {
  const router = useRouter();
  const params = useParams();
  const editId = params?.id ? String(params.id) : undefined;

  const { course, cleanCourse, setCourseDetails, resetCourse } = useCourseStore();
  const { title, thumbnail_url = "", description = "", domain = "", tags = [] } = course;
  const [tagInput, setTagInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  const [domainsRequested, setDomainsRequested] = useState(false);
  const [finalAssessmentsRequested, setFinalAssessmentsRequested] = useState(false);
  const [finalAssessmentId, setFinalAssessmentId] = useState<string>("");
  const [finalAssessmentOpen, setFinalAssessmentOpen] = useState(false);
  const [finalAssessmentSearch, setFinalAssessmentSearch] = useState("");
  const finalAssessmentRef = useRef<HTMLDivElement>(null);

  const [domainOpen, setDomainOpen] = useState(false);
  const [domainSearch, setDomainSearch] = useState("");
  const domainRef = useRef<HTMLDivElement>(null);

  const [domainFocusedIndex, setDomainFocusedIndex] = useState(-1);
  const [faFocusedIndex, setFaFocusedIndex] = useState(-1);

  const { data: domainsRes, isLoading: domainsLoading } = useDomains(1, 100, undefined, undefined, { enabled: domainsRequested });
  const { data: finalAssessmentsRes } = useAssignmentsLookup({ enabled: finalAssessmentsRequested });
  const domains = domainsRes?.data || [];
  const finalAssessments = Array.isArray(finalAssessmentsRes) ? finalAssessmentsRes : (finalAssessmentsRes?.data || []);
  const filteredFinalAssessments = (finalAssessments || []).filter((assignment: any) => {
    const title = String(assignment.title || assignment.assignment_title || `Assignment ${assignment.id}` || "").toLowerCase();
    return title.includes(finalAssessmentSearch.toLowerCase());
  });

  const domainOptions = Array.from(new Set([
    ...DOMAIN_OPTIONS,
    ...(domains || []).map((d: any) => d.name),
    domain
  ].filter(Boolean)));
  const filteredDomainOptions = domainOptions.filter((d: string) =>
    d.toLowerCase().includes(domainSearch.toLowerCase())
  );

  useEffect(() => {
    const selected = (course as any).final_assessment_id ?? (course as any).finalAssessment?.id ?? (course as any).final_assessment?.id ?? "";
    if (selected) {
      setFinalAssessmentId(String(selected));
    } else {
      setFinalAssessmentId("");
    }
  }, [course]);

  useEffect(() => {
    if (!finalAssessmentOpen) {
      setFinalAssessmentSearch("");
    }
  }, [finalAssessmentOpen]);

  useEffect(() => {
    if (!domainOpen) {
      setDomainSearch("");
    }
  }, [domainOpen]);

  useEffect(() => {
    setDomainFocusedIndex(-1);
  }, [domainSearch, domainOpen]);

  useEffect(() => {
    setFaFocusedIndex(-1);
  }, [finalAssessmentSearch, finalAssessmentOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (finalAssessmentRef.current && !finalAssessmentRef.current.contains(event.target as Node)) {
        setFinalAssessmentOpen(false);
      }
      if (domainRef.current && !domainRef.current.contains(event.target as Node)) {
        setDomainOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDomainKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allOptions = ["", ...filteredDomainOptions];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setDomainFocusedIndex((prev) => (prev + 1) % allOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDomainFocusedIndex((prev) => (prev - 1 + allOptions.length) % allOptions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (domainFocusedIndex >= 0 && domainFocusedIndex < allOptions.length) {
        handleFieldChange("domain", allOptions[domainFocusedIndex]);
        setDomainOpen(false);
      }
    } else if (e.key === "Escape") {
      setDomainOpen(false);
    }
  };

  const handleFaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const listLength = filteredFinalAssessments.length + 1; // +1 for "No final assessment"
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFaFocusedIndex((prev) => (prev + 1) % listLength);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFaFocusedIndex((prev) => (prev - 1 + listLength) % listLength);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (faFocusedIndex === 0) {
        void handleFinalAssessmentChange("");
        setFinalAssessmentOpen(false);
      } else if (faFocusedIndex > 0 && faFocusedIndex < listLength) {
        const selectedId = filteredFinalAssessments[faFocusedIndex - 1].id;
        void handleFinalAssessmentChange(String(selectedId));
        setFinalAssessmentOpen(false);
      }
    } else if (e.key === "Escape") {
      setFinalAssessmentOpen(false);
    }
  };

  const handleFinalAssessmentChange = async (value: string) => {
    setFinalAssessmentId(value);
    const numVal = value ? Number(value) : null;
    const selectedAssignment = (finalAssessments || []).find((assignment: any) => String(assignment.id) === String(value));
    const faObj = selectedAssignment
      ? { id: selectedAssignment.id, title: selectedAssignment.title || selectedAssignment.assignment_title }
      : null;

    useCourseStore.setState((state) => ({
      course: {
        ...state.course,
        final_assessment_id: numVal,
        final_assessment: faObj || (numVal === null ? null : (state.course as any).final_assessment)
      }
    }));

    if (course.id) {
      try {
        await updateMutation.mutateAsync({
          id: course.id,
          data: { final_assessment_id: numVal },
        });
        toast.success("Final assessment updated.");
      } catch (err: any) {
        toastApiError(err, "Failed to update final assessment");
      }
    }
  };

  const courseFA = (course as any).final_assessment || (course as any).finalAssessment;
  const selectedFinalAssessment = (finalAssessments || []).find((assignment: any) => String(assignment.id) === String(finalAssessmentId));

  let selectedFinalAssessmentLabel = "No final assessment";
  if (selectedFinalAssessment) {
    selectedFinalAssessmentLabel = selectedFinalAssessment.title || selectedFinalAssessment.assignment_title || `Assignment ${selectedFinalAssessment.id}`;
  } else if (courseFA && (String(courseFA.id) === String(finalAssessmentId) || (!finalAssessmentId && courseFA.title))) {
    selectedFinalAssessmentLabel = courseFA.title || courseFA.name || courseFA.assignment_title || "No final assessment";
  } else if (finalAssessmentId) {
    selectedFinalAssessmentLabel = `Assignment ${finalAssessmentId}`;
  }

  // Reset course to a clean slate on first render if it has no title and we are not in edit mode
  useEffect(() => {
    if (!course.title && !course.id && !editId) {
      resetCourse();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // Sync status state with course from store (pre-fill edit form)
  useEffect(() => {
    if (course.id) {
      const isPublished = course.status === "Published" || course.status === "published" || course.status === "active";
      setStatus(isPublished ? "published" : "draft");
    }
  }, [course.id, course.status]);

  const validateField = (field: string, value: string): string => {
    let error = "";
    switch (field) {
      case "title":
        if (isEmpty(value)) error = "Course title is required";
        else if (value.trim().length < 3) error = "Title must be at least 3 characters";
        break;
      case "description":
        if (isEmpty(value)) error = "Course description is required";
        else if (value.length > 50) error = "Maximum 50 characters allowed.";
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
    if (field === "title") setCourseDetails(value, description, thumbnail_url, domain, tags);
    if (field === "description") setCourseDetails(title, value, thumbnail_url, domain, tags);
    if (field === "thumbnail_url") setCourseDetails(title, description, value, domain, tags);
    if (field === "domain") setCourseDetails(title, description, thumbnail_url, value, tags);
    if (field === "status") setCourseDetails(title, description, thumbnail_url, domain, tags, value);

    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const handleAddTag = (rawTag: string) => {
    const tag = rawTag.trim();
    if (!tag) return;
    const normalizedTag = tag.replace(/\s+/g, " ");
    if (tags.includes(normalizedTag)) return;
    setCourseDetails(title, description, thumbnail_url, domain, [...tags, normalizedTag], status === "published" ? "active" : "draft");
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCourseDetails(title, description, thumbnail_url, domain, tags.filter((tag) => tag !== tagToRemove), status === "published" ? "active" : "draft");
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleTagInputChange = (value: string) => {
    setTagInput(value);
  };

  const validateAndProcessImage = (file: File) => {
    // 1. File Size Validation (Max 5 MB)
    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`File size exceeds maximum limit of ${MAX_SIZE_MB} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Format Validation (PNG, JPG, JPEG, WEBP)
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const isAllowedType = ALLOWED_TYPES.includes(file.type.toLowerCase()) ||
      ["png", "jpg", "jpeg", "webp"].includes(fileExtension || "");

    if (!isAllowedType) {
      toast.error("Invalid file format. Please upload a PNG, JPG, JPEG, or WEBP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 3. Image Dimensions & Aspect Ratio Validation
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result !== "string") return;
      const dataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const aspectRatio = width / height;

        // Minimum Resolution: 1280 x 720 px
        const MIN_WIDTH = 1280;
        const MIN_HEIGHT = 720;
        // 16:9 Aspect Ratio (1.777...) with 5% tolerance
        const TARGET_RATIO = 16 / 9;
        const RATIO_TOLERANCE = 0.1;

        const isMinRes = width >= MIN_WIDTH && height >= MIN_HEIGHT;
        const isCorrectRatio = Math.abs(aspectRatio - TARGET_RATIO) <= RATIO_TOLERANCE;

        if (!isMinRes || !isCorrectRatio) {
          toast.error(
            `Invalid image dimensions. Please upload an image with recommended resolution (1280 × 720 px, 16:9 aspect ratio, min 1280×720). Uploaded: ${width} × ${height} px.`
          );
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        handleFieldChange("thumbnail_url", dataUrl);
      };
      img.onerror = () => {
        toast.error("Failed to load image for validation.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    validateAndProcessImage(e.target.files[0]);
  };

  const getInputClass = (field: string, base: string) => {
    return touched[field] && errors[field] ? `${base} ${inputErrorClass}` : base;
  };

  const ErrorMsg = ({ field }: { field: string }) => {
    if (!touched[field] || !errors[field]) return null;
    return (
      <p className={errorTextClass}>
        <svg className="w-3.5 h-3.5 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        {errors[field]}
      </p>
    );
  };

  const handleContinue = async () => {
    // Validate required fields
    const titleErr = validateField("title", title);
    const descErr = validateField("description", description);
    setTouched({ title: true, description: true });
    if (titleErr || descErr) return;

    if (course.id) {
      // Edit/Update mode
      try {
        setIsSubmitting(true);
        // Calculate dirty fields comparing current state with cleanCourse
        const dirtyFields: Record<string, any> = {};
        if (title !== cleanCourse?.title) dirtyFields.name = title;
        if (description !== cleanCourse?.description) dirtyFields.description = description;
        if (thumbnail_url !== cleanCourse?.thumbnail_url) dirtyFields.thumbnail_url = thumbnail_url;
        
        const currentDomainId = (course as any).domain_id !== undefined ? ((course as any).domain_id ? Number((course as any).domain_id) : null) : null;
        const cleanDomainId = (cleanCourse as any)?.domain_id !== undefined ? ((cleanCourse as any)?.domain_id ? Number((cleanCourse as any)?.domain_id) : null) : null;
        if (currentDomainId !== cleanDomainId) {
          dirtyFields.domain_id = currentDomainId;
        }

        if (JSON.stringify(tags) !== JSON.stringify(cleanCourse?.tags || [])) dirtyFields.tags = tags;
        
        const mappedStatus = status === "published" ? "active" : "draft";
        const initialStatusMapped = (cleanCourse?.status === "active" || cleanCourse?.status === "published") ? "active" : "draft";
        if (mappedStatus !== initialStatusMapped) {
          dirtyFields.status = mappedStatus;
        }

        if (Object.keys(dirtyFields).length > 0) {
          await updateMutation.mutateAsync({ id: course.id, data: dirtyFields });
          useCourseStore.getState().clearDeletedItems();
          toast.success("Course details saved.");
        }

        const { activeModuleId, activeLessonId, activeTopicId } = useCourseStore.getState();
        const builderRoute = getDefaultEditorRoute(course.id, { activeModuleId, activeLessonId, activeTopicId });
        router.push(builderRoute.endsWith(`/edit/${course.id}`) ? `${builderRoute}/module` : builderRoute);
      } catch (err: any) {
        toastApiError(err, "Failed to update course");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Create mode
      try {
        setIsSubmitting(true);
        const rawFaId = finalAssessmentId || (course as any).final_assessment_id || (course as any).finalAssessment?.id || (course as any).final_assessment?.id;
        const faIdNum = rawFaId ? Number(rawFaId) : null;
        const targetDomainId = (course as any).domain_id ? Number((course as any).domain_id) : null;

        const payload: Record<string, any> = {
          name: title,
          description,
          thumbnail_url,
          status: status === "published" ? "active" : "draft",
          modules: []
        };
        if (faIdNum !== null && !isNaN(faIdNum)) {
          payload.final_assessment_id = faIdNum;
        }
        if (tags.length > 0) {
          payload.tags = tags;
        }
        if (targetDomainId !== null) {
          payload.domain_id = targetDomainId;
        }
        const response = await createMutation.mutateAsync(payload);
        const newId = response.data?.id || response.id;
        useCourseStore.getState().clearDeletedItems(); // Reset baseline
        toast.success("Course created successfully!");
        router.push(`/admin/courses/edit/${newId}/module`);
      } catch (err: any) {
        toastApiError(err, "Failed to create course");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // If we are in edit mode (editId is present), but the store course ID is not editId,
  // we are still in the process of initializing the store. Show a loader to prevent loading flicker.
  if (editId && String(course.id) !== editId) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-8 min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-500 font-semibold text-sm">Initializing edit form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Course Configuration</h1>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Define your course details before building the curriculum</p>
            </div>
          </div>
        </div>

        {/* 3-COLUMN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT 2/3 COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* COURSE INFORMATION CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-100">
                <BookOpen className="text-blue-500" size={16} />
                Course Information
              </h3>

              <div className="flex flex-col gap-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Course Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    onBlur={() => handleBlur("title", title)}
                    className={getInputClass(
                      "title",
                      "w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                    )}
                    placeholder="e.g. Master React & Redux patterns"
                  />
                  <ErrorMsg field="title" />
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Course Description <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-xs font-semibold ${description.length >= 50 ? "text-rose-500" : "text-slate-400"}`}>
                      {description.length} / 50 characters
                    </span>
                  </div>
                  <textarea
                    value={description}
                    maxLength={50}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleFieldChange("description", val);
                      if (val.length >= 50) {
                        setErrors((prev) => ({ ...prev, description: "Maximum 50 characters allowed." }));
                      } else {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.description;
                          return n;
                        });
                      }
                    }}
                    onBlur={() => handleBlur("description", description)}
                    rows={3}
                    className={getInputClass(
                      "description",
                      "w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400 resize-none leading-relaxed"
                    )}
                    placeholder="Maximum 50 characters."
                  />
                  <ErrorMsg field="description" />
                </div>
              </div>
            </div>

            {/* METADATA CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-100">
                <Globe className="text-indigo-500" size={16} />
                Course Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStatus(val as "draft" | "published");
                      handleFieldChange("status", val === "published" ? "active" : "draft");
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                    {status === "draft" ? "Only visible to admins." : "Visible to all enrolled students."}
                  </p>
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Domain <span className="text-rose-500">*</span></label>
                  <DomainSelect
                    value={(course as any).domain_id !== undefined && (course as any).domain_id !== null ? (course as any).domain_id : domain}
                    onChange={(val, domainObj) => {
                      const domainIdNum = val ? Number(val) : null;
                      const domainName = domainObj?.name || (val && isNaN(Number(val)) ? val : "");
                      setCourseDetails(title, description, thumbnail_url, domainName, tags, status === "published" ? "active" : "draft", domainIdNum);
                    }}
                    initialName={domain}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <TagsInput
                  label="Tags"
                  variant="tag"
                  value={tags}
                  onChange={(newTags) => setCourseDetails(title, description, thumbnail_url, domain, newTags, status === "published" ? "active" : "draft", (course as any).domain_id)}
                />
              </div>

              {/* Final assessment is course metadata, not curriculum content. */}
              <div ref={finalAssessmentRef}>
                <label className="block text-xs font-bold text-slate-700 mb-2">Final Assessment</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (!finalAssessmentsRequested) {
                        setFinalAssessmentsRequested(true);
                      }
                      setFinalAssessmentOpen((prev) => !prev);
                    }}
                    disabled={updateMutation.isPending}
                    className={`w-full flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all ${finalAssessmentOpen ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-200 hover:border-blue-300"} disabled:opacity-60`}
                  >
                    <span className="flex items-center gap-2 overflow-hidden">
                      <BookOpen size={16} className="text-slate-400 shrink-0" />
                      <span className="truncate">{selectedFinalAssessmentLabel}</span>
                    </span>
                    <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${finalAssessmentOpen ? "rotate-180" : ""}`} />
                  </button>

                  {finalAssessmentOpen && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                      <div className="border-b border-slate-100 bg-white p-2">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            value={finalAssessmentSearch}
                            onChange={(event) => setFinalAssessmentSearch(event.target.value)}
                            onKeyDown={handleFaKeyDown}
                            placeholder="Search assignments..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          />
                        </div>
                      </div>

                      <div className="max-h-60 overflow-y-auto p-1">
                        {updateMutation.isPending ? (
                          <div className="flex items-center justify-center p-4 text-sm text-slate-500">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
                            Updating...
                          </div>
                        ) : !finalAssessmentsRequested ? (
                          <div className="p-4 text-center text-sm text-slate-500">Open to load assignments.</div>
                        ) : finalAssessments.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500">No assignments found.</div>
                        ) : filteredFinalAssessments.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500">No assignments found for your search.</div>
                        ) : (
                          <ul className="space-y-1">
                            <li>
                              <button
                                type="button"
                                onClick={() => {
                                  void handleFinalAssessmentChange("");
                                  setFinalAssessmentOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${!finalAssessmentId ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"} ${faFocusedIndex === 0 ? "bg-slate-100 font-semibold" : ""}`}
                              >
                                <span>No final assessment</span>
                                {!finalAssessmentId ? <Check size={14} className="shrink-0" /> : null}
                              </button>
                            </li>
                            {filteredFinalAssessments.map((assignment: any, index: number) => {
                              const isSelected = String(finalAssessmentId) === String(assignment.id);
                              const optionIndex = index + 1;
                              return (
                                <li key={assignment.id}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void handleFinalAssessmentChange(String(assignment.id));
                                      setFinalAssessmentOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${isSelected ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"} ${faFocusedIndex === optionIndex ? "bg-slate-100 font-semibold" : ""}`}
                                  >
                                    <span className="truncate text-left">{assignment.title || assignment.assignment_title || `Assignment ${assignment.id}`}</span>
                                    {isSelected ? <Check size={14} className="shrink-0" /> : null}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Loaded only when this selector is opened.</p>
              </div>
            </div>

            {/* BUILD CURRICULUM CTA */}
            <div className="flex justify-end">
              <button
                onClick={handleContinue}
                disabled={createMutation.isPending || updateMutation.isPending || isSubmitting}
                className="flex items-center gap-2.5 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending || updateMutation.isPending || isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    Build Curriculum
                    <ArrowRight size={16} className="stroke-[2.5px]" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT 1/3 COLUMN */}
          <div className="lg:col-span-1 flex flex-col gap-8">

            {/* THUMBNAIL CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="flex items-center gap-2">
                  <ImageIcon className="text-blue-500" size={15} />
                  Course Artwork
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 rounded-md hover:bg-slate-100"
                        aria-label="Upload Guidelines"
                      >
                        <Info size={15} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent align="end" className="p-3.5 max-w-xs text-xs space-y-2 bg-slate-900 text-slate-100 border-slate-800 shadow-xl rounded-xl z-50">
                      <div>
                        <p className="font-bold text-white uppercase tracking-wider text-[10px] text-blue-400">Recommended Image</p>
                        <p className="font-semibold text-slate-200 mt-0.5">Width: 1280 px</p>
                        <p className="font-semibold text-slate-200">Height: 720 px</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">(16:9 Aspect Ratio)</p>
                      </div>
                      <div className="border-t border-slate-800 pt-2">
                        <p className="font-bold text-white uppercase tracking-wider text-[10px] text-blue-400">Supported Formats</p>
                        <p className="text-slate-300">PNG, JPG, JPEG, WEBP</p>
                      </div>
                      <div className="border-t border-slate-800 pt-2">
                        <p className="font-bold text-white uppercase tracking-wider text-[10px] text-blue-400">Maximum Size</p>
                        <p className="text-slate-300">5 MB</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>

              {thumbnail_url ? (
                <div className="relative group/thumb aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnail_url}
                    alt="Course cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 font-bold text-[10px] uppercase tracking-wider transition-all shadow-md"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => handleFieldChange("thumbnail_url", "")}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all shadow-md"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        validateAndProcessImage(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer group text-center",
                      isDragging 
                        ? "border-blue-500 bg-blue-50/10 scale-[1.02]" 
                        : "border-slate-200 hover:border-blue-500 hover:bg-blue-50/5 bg-slate-50/30"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                      <UploadCloud className="text-blue-500" size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      Upload cover image
                    </span>
                    <span className="text-[9px] text-slate-400 mt-1">PNG, JPG, WEBP (Max 5MB)</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}