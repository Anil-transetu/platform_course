"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, LayoutGrid, UploadCloud, Image as ImageIcon, X, BookOpen, GraduationCap, ClipboardList, Book, Sparkles, Settings } from "lucide-react";
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    if (id && fetchedCourse && !hasInitialized) {
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
      setHasInitialized(true);
    } else if (!id && !hasInitialized) {
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
    if (field === "domain") setCourseDetails(title, description, thumbnail_url, value, tags);
    if (field === "tags") setCourseDetails(title, description, thumbnail_url, domain, value);

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

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* HEADER BLUEPRINT TITLE */}
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
            
            {/* DETAILS CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-100">
                <BookOpen className="text-blue-500" size={16} />
                Course Information
              </h3>
              
              <div className="flex flex-col gap-6">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Course Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    onBlur={() => handleBlur("description", description)}
                    rows={6}
                    className={getInputClass(
                      "description",
                      "w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400 resize-none leading-relaxed"
                    )}
                    placeholder="Provide a comprehensive introduction to the course topics, goals, and targets..."
                  />
                  <ErrorMsg field="description" />
                </div>
              </div>
            </div>

            {/* CURRICULUM SECTION */}
            {course.modules.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-16 min-h-[350px] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                  <LayoutGrid className="text-blue-600" size={28} />
                </div>

                <h2 className="text-lg font-bold text-slate-800 mb-1.5">
                  Course Curriculum Structure
                </h2>
                <p className="text-slate-500 text-center max-w-sm mb-8 leading-relaxed text-xs font-medium">
                  Your course curriculum is empty. Add modules to start building your structural lessons, topics, quizzes, and assignments.
                </p>

                <button
                  onClick={() => {
                    addModule();
                    router.push("/admin/courses/create/module");
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all text-sm"
                >
                  <Plus size={18} className="stroke-[3px]" />
                  Add First Module
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <LayoutGrid className="text-blue-500" size={18} />
                    Curriculum Overview ({course.modules.length} Modules)
                  </h3>
                  <button 
                    onClick={() => router.push("/admin/courses/create/module")}
                    className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl text-slate-700 text-xs font-bold transition-all shadow-xs"
                  >
                    Continue building curriculum &rarr;
                  </button>
                </div>
                
                {/* TIMELINE PATH OF MODULES */}
                <div className="relative pl-6 border-l border-slate-200 flex flex-col gap-8 py-2 ml-3">
                  {course.modules.map((m, idx) => {
                    const totalLessons = m.lessons?.length || 0;
                    const totalQuizzes = (m.quizzes?.length || 0) + m.lessons?.reduce((acc: number, l: any) => acc + (l.quizzes?.length || 0), 0);
                    const totalAssignments = (m.assignments?.length || 0) + m.lessons?.reduce((acc: number, l: any) => acc + (l.assignments?.length || 0), 0);

                    return (
                      <div key={m.id} className="relative group">
                        {/* Timeline node */}
                        <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-500 flex items-center justify-center text-xs font-extrabold text-blue-600 shadow-sm z-10">
                          {idx + 1}
                        </div>
                        
                        <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white transition-all hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:border-blue-200 flex flex-col justify-between gap-4">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Module {idx + 1}</span>
                            <h4 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-blue-600 transition-colors truncate">
                              {m.title || "Untitled Module"}
                            </h4>
                            <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed">
                              {m.description || "No description configured."}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 font-semibold text-[10px] pt-3 border-t border-slate-150">
                            <span className="flex items-center gap-1 bg-blue-50/50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100/50">
                              <BookOpen size={11} className="text-blue-500" /> {totalLessons} Lessons
                            </span>
                            <span className="flex items-center gap-1 bg-green-50/50 text-green-700 px-2 py-0.5 rounded-md border border-green-100/50">
                              <GraduationCap size={11} className="text-green-500" /> {totalQuizzes} Quizzes
                            </span>
                            <span className="flex items-center gap-1 bg-indigo-50/50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100/50">
                              <ClipboardList size={11} className="text-indigo-500" /> {totalAssignments} Assignments
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1/3 COLUMN */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            
            {/* THUMBNAIL CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
                <ImageIcon className="text-blue-500" size={15} />
                Course Artwork
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
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/5 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/30 transition-all cursor-pointer group text-center"
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
