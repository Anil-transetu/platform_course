"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, LayoutGrid, UploadCloud, Image as ImageIcon, BookOpen, GraduationCap, ClipboardList, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { isEmpty, inputErrorClass, errorTextClass } from "@/lib/validation";
import { useCourseStore } from "@/store/useCourseStore";
import { useCourse } from "@/features/admin/courses/api/course-api";

interface RawQuiz {
  id: string | number;
  name?: string;
}

interface RawAssignment {
  id: string | number;
  title?: string;
  name?: string;
}

interface RawTopic {
  id: string | number;
  name: string;
  content_text?: string;
  text?: string;
  quizzes?: RawQuiz[];
  assignments?: RawAssignment[];
}

interface RawLesson {
  id: string | number;
  name: string;
  content_text?: string;
  text?: string;
  topics?: RawTopic[];
  quizzes?: RawQuiz[];
  assignments?: RawAssignment[];
}

interface RawModule {
  id: string | number;
  name: string;
  description?: string;
  lessons?: RawLesson[];
  quizzes?: RawQuiz[];
  assignments?: RawAssignment[];
}

export default function CreateCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { data: fetchedCourse, isLoading } = useCourse(id || undefined);
  

  const { course, setCourseDetails, addModule, setCourse, resetCourse } = useCourseStore();
  const { title, thumbnail_url = "", description = "", domain = "", tags = "" } = course;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasInitialized, setHasInitialized] = useState(false);
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
    if (id && fetchedCourse) {
      const mappedModules = (fetchedCourse.modules || []).map((m: RawModule) => ({
        id: String(m.id),
        title: m.name || "",
        description: m.description || "",
        lessons: (m.lessons || []).map((l: RawLesson) => ({
          id: String(l.id),
          title: l.name || "",
          content: l.content_text || l.text || "",
          topics: (l.topics || []).map((t: RawTopic) => ({
            id: String(t.id),
            title: t.name || "",
            content: t.content_text || t.text || "",
            quizzes: (t.quizzes || []).map((q: RawQuiz) => ({
              id: String(q.id),
              title: q.name || "",
            })),
            assignments: (t.assignments || []).map((a: RawAssignment) => ({
              id: String(a.id),
              title: a.title || a.name || "",
            })),
          })),
          quizzes: (l.quizzes || []).map((q: RawQuiz) => ({
            id: String(q.id),
            title: q.name || "",
          })),
          assignments: (l.assignments || []).map((a: RawAssignment) => ({
            id: String(a.id),
            title: a.title || a.name || "",
          })),
        })),
        quizzes: (m.quizzes || []).map((q: RawQuiz) => ({
          id: String(q.id),
          title: q.name || "",
        })),
        assignments: (m.assignments || []).map((a: RawAssignment) => ({
          id: String(a.id),
          title: a.title || a.name || "",
        })),
      }));

      setCourse({
        id: fetchedCourse.id,
        title: fetchedCourse.name || "",
        domain: fetchedCourse.domain_id ? String(fetchedCourse.domain_id) : "Web Development",
        tags: fetchedCourse.tags ? (Array.isArray(fetchedCourse.tags) ? fetchedCourse.tags.join(", ") : String(fetchedCourse.tags)) : "",
        thumbnail_url: fetchedCourse.thumbnail_url || "",
        description: fetchedCourse.description || "",
        modules: mappedModules,
        quizzes: (fetchedCourse.quizzes || []).map((q: RawQuiz) => ({
          id: String(q.id),
          title: q.name || "",
        })),
        assignments: (fetchedCourse.assignments || []).map((a: RawAssignment) => ({
          id: String(a.id),
          title: a.title || a.name || "",
        })),
      });
      setHasInitialized(true);
    } else if (!id && !hasInitialized) {
      // Only reset if we're not editing an existing course and haven't initialized yet
      resetCourse();
      setHasInitialized(true);
    }
  }, [fetchedCourse, setCourse, id, resetCourse, hasInitialized]);

  if (id && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-100 min-h-screen">
        <div className="text-slate-500 font-medium">Loading course data...</div>
      </div>
    );
  }

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
        if (domain !== cleanCourse?.domain) dirtyFields.domain = domain;
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
        if (domain) {
          payload.domain = domain;
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
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Define your course details, structure, and content elements</p>
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
                <div ref={domainRef} className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Domain</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setDomainsRequested(true);
                        setDomainOpen((prev) => !prev);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all ${domainOpen ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-200 hover:border-blue-300"}`}
                    >
                      <span className="flex items-center gap-2 overflow-hidden">
                        <Globe size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate">{domain || "Select a domain..."}</span>
                      </span>
                      <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${domainOpen ? "rotate-180" : ""}`} />
                    </button>

                    {domainOpen && (
                      <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        <div className="border-b border-slate-100 bg-white p-2">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              autoFocus
                              value={domainSearch}
                              onChange={(event) => setDomainSearch(event.target.value)}
                              onKeyDown={handleDomainKeyDown}
                              placeholder="Search domains..."
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            />
                          </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto p-1">
                          {domainsLoading ? (
                            <div className="flex items-center justify-center p-4 text-sm text-slate-500">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
                              Loading...
                            </div>
                          ) : domainOptions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">No domains found.</div>
                          ) : filteredDomainOptions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">No domains found for your search.</div>
                          ) : (
                            <ul className="space-y-1">
                              <li>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleFieldChange("domain", "");
                                    setDomainOpen(false);
                                  }}
                                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${!domain ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"} ${domainFocusedIndex === 0 ? "bg-slate-100 font-semibold" : ""}`}
                                >
                                  <span>Select a domain...</span>
                                  {!domain ? <Check size={14} className="shrink-0" /> : null}
                                </button>
                              </li>
                              {filteredDomainOptions.map((d, index) => {
                                const isSelected = domain === d;
                                const optionIndex = index + 1;
                                return (
                                  <li key={d}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleFieldChange("domain", d);
                                        setDomainOpen(false);
                                      }}
                                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${isSelected ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"} ${domainFocusedIndex === optionIndex ? "bg-slate-100 font-semibold" : ""}`}
                                    >
                                      <span className="truncate text-left">{d}</span>
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
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Tag size={12} className="text-slate-400" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-slate-700" aria-label={`Remove ${tag}`}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => handleTagInputChange(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={() => handleAddTag(tagInput)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  placeholder="Type a tag and press Space or Enter"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Press Space or Enter to convert text into a tag.</p>
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
                </div>
                
                {/* TIMELINE PATH OF MODULES */}
                <div className="relative pl-6 border-l border-slate-200 flex flex-col gap-8 py-2 ml-3">
                  {course.modules.map((m, idx) => {
                    const totalLessons = m.lessons?.length || 0;
                    const totalQuizzes = (m.quizzes?.length || 0) + m.lessons?.reduce((acc: number, l: { quizzes?: { id: string | number }[] }) => acc + (l.quizzes?.length || 0), 0);
                    const totalAssignments = (m.assignments?.length || 0) + m.lessons?.reduce((acc: number, l: { assignments?: { id: string | number }[] }) => acc + (l.assignments?.length || 0), 0);

                    return (
                      <div key={m.id} className="relative group">
                        {/* Timeline node */}
                        <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-500 flex items-center justify-center text-xs font-extrabold text-blue-600 shadow-sm z-10">
                          {idx + 1}
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
