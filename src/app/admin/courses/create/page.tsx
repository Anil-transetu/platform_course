"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, LayoutGrid, UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { isEmpty, inputErrorClass, errorTextClass } from "@/lib/validation";
import { useCourseStore } from "@/store/useCourseStore";
import { useCourse } from "@/features/admin/courses/api/course-api";

export default function CreateCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { data: fetchedCourse, isLoading } = useCourse(id || undefined);

  const { course, setCourseDetails, addModule, setCourse, resetCourse } = useCourseStore();
  const { title, thumbnail_url = "", description = "", domain = "", tags = "" } = course;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) {
      resetCourse();
    }
  }, [id, resetCourse]);

  useEffect(() => {
    if (fetchedCourse) {
      const mappedModules = (fetchedCourse.modules || []).map((m: any) => ({
        id: String(m.id),
        title: m.name || "",
        description: m.description || "",
        lessons: (m.topics || []).map((t: any) => ({
          id: String(t.id),
          title: t.name || "",
          content: t.content_text || t.text || "",
          topics: (t.lessons || []).map((l: any) => ({
            id: String(l.id),
            title: l.name || "",
            content: l.content_text || l.text || "",
          })),
          quizzes: (t.quizzes || []).map((q: any) => ({
            id: String(q.id),
            title: q.name || "",
          })),
          assignments: (t.assignments || []).map((a: any) => ({
            id: String(a.id),
            title: a.title || a.name || "",
          })),
        })),
        quizzes: (m.quizzes || []).map((q: any) => ({
          id: String(q.id),
          title: q.name || "",
        })),
        assignments: (m.assignments || []).map((a: any) => ({
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
        quizzes: (fetchedCourse.quizzes || []).map((q: any) => ({
          id: String(q.id),
          title: q.name || "",
        })),
        assignments: (fetchedCourse.assignments || []).map((a: any) => ({
          id: String(a.id),
          title: a.title || a.name || "",
        })),
      });
    }
  }, [fetchedCourse, setCourse]);

  if (id && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-muted min-h-screen">
        <div className="text-gray-500 font-medium">Loading course data...</div>
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
        else if (value.trim().length < 10) error = "Description must be at least 10 characters";
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

    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      handleFieldChange("thumbnail_url", objectUrl);
    }
  };

  const getInputClass = (field: string, base: string) => {
    return touched[field] && errors[field] ? `${base} ${inputErrorClass}` : base;
  };

  const ErrorMsg = ({ field }: { field: string }) => {
    if (!touched[field] || !errors[field]) return null;
    return (
      <p className={errorTextClass}>
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* COURSE BANNER PREVIEW */}
        <div className="w-full h-56 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl overflow-hidden relative shadow-md">
          {thumbnail_url ? (
            <>
              <img
                src={thumbnail_url}
                alt="Course Banner"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-8">
                <div className="text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/60 px-3 py-1 rounded-full border border-blue-500/30">
                    Course Preview
                  </span>
                  <h1 className="text-3xl font-extrabold tracking-tight mt-3 text-white drop-shadow-md">
                    {title || "Untitled Course"}
                  </h1>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
              <span className="text-blue-200 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                Course Header Banner
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-3 text-center text-white/90">
                {title || "Untitled Course"}
              </h1>
              <p className="text-blue-100 text-xs mt-2 max-w-sm text-center">
                Add a thumbnail image url or upload an image file to display a customized header banner.
              </p>
            </div>
          )}
        </div>

        {/* METADATA FORM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: TITLE & DESCRIPTION */}
          <div className="lg:col-span-2 bg-card rounded-3xl border border-gray-100 dark:border-border/50 p-8 shadow-xs flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-foreground border-b pb-4 mb-2">
              Course Details
            </h3>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                Course Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                onBlur={() => handleBlur("title", title)}
                className={getInputClass(
                  "title",
                  "w-full px-4 py-3 rounded-xl bg-muted border border-gray-100 dark:border-border/50 focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-card-foreground placeholder-gray-400 font-medium"
                )}
                placeholder="e.g. Python Programming Fundamentals"
              />
              <ErrorMsg field="title" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                Course Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                onBlur={() => handleBlur("description", description)}
                rows={5}
                className={getInputClass(
                  "description",
                  "w-full px-4 py-3 rounded-xl bg-muted border border-gray-100 dark:border-border/50 focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-card-foreground placeholder-gray-400 font-medium resize-none leading-relaxed"
                )}
                placeholder="Provide a comprehensive introduction to the course topics, goals, and targets..."
              />
              <ErrorMsg field="description" />
            </div>
          </div>

          {/* RIGHT COLUMN: THUMBNAIL IMAGE */}
          <div className="bg-card rounded-3xl border border-gray-100 dark:border-border/50 p-8 shadow-xs flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-foreground border-b pb-4 mb-2">
              Course Thumbnail
            </h3>

            {/* Thumbnail Upload Uploader */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Thumbnail Image File
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-border hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-muted/40 hover:bg-blue-50/10 transition-all cursor-pointer group text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-card shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                  <UploadCloud className="text-blue-500" size={24} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-foreground group-hover:text-blue-600 transition-colors">
                  Upload file from computer
                </span>
                <span className="text-[10px] text-gray-400 mt-1">PNG, JPG or WEBP (Max 5MB)</span>
              </div>
            </div>

            {/* OR text input */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-border"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                OR
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-border"></div>
            </div>

            {/* Image URL text input */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                Thumbnail URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={thumbnail_url}
                  onChange={(e) => handleFieldChange("thumbnail_url", e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-muted border border-gray-100 dark:border-border/50 focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-card-foreground placeholder-gray-400 text-xs font-medium"
                  placeholder="https://example.com/image.png"
                />
                {thumbnail_url && (
                  <button
                    onClick={() => handleFieldChange("thumbnail_url", "")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CURRICULUM SECTION */}
        <div className="bg-card rounded-3xl shadow-xs border border-dashed border-border flex flex-col items-center justify-center p-16 min-h-[350px]">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
            <LayoutGrid className="text-blue-500" size={28} />
          </div>

          <h2 className="text-lg font-bold text-foreground mb-1.5">
            Course Curriculum Structure
          </h2>
          <p className="text-muted-foreground text-center max-w-sm mb-8 leading-relaxed text-xs font-normal">
            Your course curriculum contains modules, lessons, topics, quizzes, and assignments. Start adding your modules to build the curriculum.
          </p>

          <button
            onClick={() => {
              if (course.modules.length === 0) {
                addModule();
              }
              router.push("/admin/courses/create/module");
            }}
            className="flex items-center gap-3 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/35 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
          >
            <Plus size={18} className="stroke-[3px]" />
            {course.modules.length === 0 ? "Add First Module" : "Continue to Modules"}
          </button>
        </div>
      </div>
    </div>
  );
}
