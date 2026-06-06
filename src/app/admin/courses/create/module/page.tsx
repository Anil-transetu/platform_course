"use client";
// Force rebuild – Quiz/Assignment inline selector dropdowns added

import React, { useState, useCallback, useRef, useEffect } from "react";
import { 
  ChevronRight, 
  FolderPlus, 
  FileText, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Code,
  FileUp,
  Video,
  Globe,
  Check,
  ClipboardList
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResourceModals from "@/components/modals/ResourceModals";
import { isEmpty, inputErrorClass, errorTextClass } from "@/lib/validation";

// ─── Static sample data (mirrors quizzes/assignments pages) ───────────────────
const SAMPLE_QUIZZES = [
  { id: "quiz-001", title: "Introduction to Algorithms", module: "Module 1: Foundations", duration: "15 Qs", status: "PUBLISHED" },
  { id: "quiz-002", title: "Big O Notation Deep Dive", module: "Module 2: Complexity", duration: "10 Qs", status: "DRAFT" },
  { id: "quiz-003", title: "Sorting Algorithms Midterm", module: "Module 3: Sorting", duration: "40 Qs", status: "PUBLISHED" },
  { id: "quiz-004", title: "Final Comprehensive Assessment", module: "Module 5: Final Project", duration: "50 Qs", status: "SCHEDULED" },
];

const SAMPLE_ASSIGNMENTS = [
  { id: "ASG-00124", title: "Introduction to Web Ethics", domain: "Web Development", marks: 100, submissionType: "FILE UPLOAD" },
  { id: "ASG-00125", title: "Advanced React Hooks Quiz", domain: "Web Development", marks: 50, submissionType: "LINK" },
  { id: "ASG-00126", title: "Data Modeling Fundamentals", domain: "Data Science", marks: 100, submissionType: "FILE UPLOAD" },
];

// ─── Status badge colours ─────────────────────────────────────────────────────
function statusColor(status: string) {
  if (status === "PUBLISHED") return "bg-emerald-100 text-emerald-700";
  if (status === "DRAFT") return "bg-amber-100 text-amber-700";
  return "bg-indigo-100 text-indigo-700";
}

export default function ModuleDetailsPage() {
  const router = useRouter();
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"pdf" | "image" | "video" | "url" | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string): string => {
    let error = "";
    if (field === "moduleTitle" && isEmpty(value)) error = "Module title is required";
    if (field === "moduleDescription" && isEmpty(value)) error = "Module description is required";
    setErrors(prev => {
      if (error) return { ...prev, [field]: error };
      const n = { ...prev }; delete n[field]; return n;
    });
    return error;
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleSaveModule = () => {
    const t1 = validateField("moduleTitle", moduleTitle);
    const t2 = validateField("moduleDescription", moduleDescription);
    setTouched({ moduleTitle: true, moduleDescription: true });
    if (t1 || t2) return;
    alert("Module saved successfully!");
  };

  // Dropdown open states
  const [quizOpen, setQuizOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);

  // Selected items
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // Search filters inside dropdowns
  const [quizSearch, setQuizSearch] = useState("");
  const [assignmentSearch, setAssignmentSearch] = useState("");

  const quizRef = useRef<HTMLDivElement>(null);
  const assignmentRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (quizRef.current && !quizRef.current.contains(e.target as Node)) setQuizOpen(false);
      if (assignmentRef.current && !assignmentRef.current.contains(e.target as Node)) setAssignmentOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openModal = (type: "pdf" | "image" | "video" | "url") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleAddAnotherModule = useCallback(() => {
    setModuleTitle("");
    setModuleDescription("");
    alert("New module setup initialized!");
  }, []);

  const filteredQuizzes = SAMPLE_QUIZZES.filter(q =>
    q.title.toLowerCase().includes(quizSearch.toLowerCase())
  );

  const filteredAssignments = SAMPLE_ASSIGNMENTS.filter(a =>
    a.title.toLowerCase().includes(assignmentSearch.toLowerCase())
  );

  const selectedQuiz = SAMPLE_QUIZZES.find(q => q.id === selectedQuizId);
  const selectedAssignment = SAMPLE_ASSIGNMENTS.find(a => a.id === selectedAssignmentId);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* TOP HEADER / BREADCRUMB */}
      <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Link href="/admin/courses/create" className="text-gray-400 hover:text-blue-600 transition-colors">Create New Course</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-bold">New Module</span>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/courses/create">
            <button className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition-all text-xs">
              Back to Course
            </button>
          </Link>
          <button
            onClick={handleSaveModule}
            className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-all text-xs"
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex p-8 gap-8">
        {/* LEFT SIDEBAR */}
        <div className="w-80 flex flex-col gap-8">
          {/* MODULE STRUCTURE */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Module Structure</h3>
            <div className="bg-white border-blue-500 border-l-4 rounded-r-xl shadow-sm p-4 flex items-center gap-3">
              <FolderPlus className="text-blue-600" size={18} />
              <span className="text-sm font-bold text-gray-900 truncate">{moduleTitle || "New Module"}</span>
            </div>
          </div>

          {/* ADD CONTENT */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Add Content</h3>
            <div className="flex flex-col gap-3">
              {/* Add Lesson */}
              <button 
                onClick={() => router.push("/admin/courses/create/lesson")}
                className="w-full flex items-center gap-3 border border-gray-200 bg-white px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group shadow-sm text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <Plus size={14} className="text-blue-600 group-hover:text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Add Lesson</span>
              </button>
              
              {/* ── Add Quiz dropdown ── */}
              <div ref={quizRef} className="relative">
                <button 
                  onClick={() => { setQuizOpen(p => !p); setAssignmentOpen(false); }}
                  className={`w-full flex items-center justify-between border px-4 py-3 rounded-xl transition-all shadow-sm ${quizOpen ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={quizOpen ? "text-blue-500" : "text-gray-400"} size={18} />
                    <span className={`text-sm font-medium ${quizOpen ? "text-blue-600" : "text-gray-700"}`}>
                      {selectedQuiz ? selectedQuiz.title : "Add Quiz"}
                    </span>
                  </div>
                  {quizOpen ? <ChevronUp size={16} className="text-blue-500" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {quizOpen && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-30 relative">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-100">
                      <input
                        autoFocus
                        type="text"
                        value={quizSearch}
                        onChange={e => setQuizSearch(e.target.value)}
                        placeholder="Search quizzes..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
                      />
                    </div>

                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                      {filteredQuizzes.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No quizzes found</p>
                      ) : (
                        filteredQuizzes.map(quiz => (
                          <button
                            key={quiz.id}
                            onClick={() => {
                              setSelectedQuizId(prev => prev === quiz.id ? null : quiz.id);
                              setQuizOpen(false);
                            }}
                            className={`w-full text-left flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${selectedQuizId === quiz.id ? "bg-blue-50" : ""}`}
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{quiz.title}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{quiz.module} · {quiz.duration}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor(quiz.status)}`}>{quiz.status}</span>
                              {selectedQuizId === quiz.id && <Check size={14} className="text-blue-600" />}
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Footer action */}
                    <div className="p-2 border-t border-gray-100 bg-gray-50">
                      <button
                        onClick={() => { setQuizOpen(false); router.push("/admin/quizzes/new"); }}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Plus size={13} /> Create New Quiz
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected quiz chip */}
                {selectedQuiz && !quizOpen && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Check size={13} className="text-blue-600 shrink-0" />
                    <span className="text-xs font-semibold text-blue-700 truncate">{selectedQuiz.title}</span>
                    <button onClick={() => setSelectedQuizId(null)} className="ml-auto text-blue-400 hover:text-red-500 text-[10px] font-bold">✕</button>
                  </div>
                )}
              </div>

              {/* ── Add Assignment dropdown ── */}
              <div ref={assignmentRef} className="relative">
                <button 
                  onClick={() => { setAssignmentOpen(p => !p); setQuizOpen(false); }}
                  className={`w-full flex items-center justify-between border px-4 py-3 rounded-xl transition-all shadow-sm ${assignmentOpen ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className={assignmentOpen ? "text-purple-500" : "text-gray-400"} size={18} />
                    <span className={`text-sm font-medium ${assignmentOpen ? "text-purple-600" : "text-gray-700"}`}>
                      {selectedAssignment ? selectedAssignment.title : "Add Assignment"}
                    </span>
                  </div>
                  {assignmentOpen ? <ChevronUp size={16} className="text-purple-500" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {assignmentOpen && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-30 relative">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-100">
                      <input
                        autoFocus
                        type="text"
                        value={assignmentSearch}
                        onChange={e => setAssignmentSearch(e.target.value)}
                        placeholder="Search assignments..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 bg-gray-50"
                      />
                    </div>

                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                      {filteredAssignments.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No assignments found</p>
                      ) : (
                        filteredAssignments.map(asg => (
                          <button
                            key={asg.id}
                            onClick={() => {
                              setSelectedAssignmentId(prev => prev === asg.id ? null : asg.id);
                              setAssignmentOpen(false);
                            }}
                            className={`w-full text-left flex items-center justify-between px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-0 ${selectedAssignmentId === asg.id ? "bg-purple-50" : ""}`}
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{asg.title}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{asg.domain} · {asg.marks} marks</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{asg.submissionType}</span>
                              {selectedAssignmentId === asg.id && <Check size={14} className="text-purple-600" />}
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Footer action */}
                    <div className="p-2 border-t border-gray-100 bg-gray-50">
                      <button
                        onClick={() => { setAssignmentOpen(false); router.push("/admin/assignments"); }}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Plus size={13} /> Create New Assignment
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected assignment chip */}
                {selectedAssignment && !assignmentOpen && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <Check size={13} className="text-purple-600 shrink-0" />
                    <span className="text-xs font-semibold text-purple-700 truncate">{selectedAssignment.title}</span>
                    <button onClick={() => setSelectedAssignmentId(null)} className="ml-auto text-purple-400 hover:text-red-500 text-[10px] font-bold">✕</button>
                  </div>
                )}
              </div>

              <button 
                onClick={handleAddAnotherModule}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-blue-200 bg-blue-50/30 text-blue-600 py-3 rounded-xl hover:bg-blue-50 transition-all mt-4 font-bold text-sm"
              >
                <Plus size={16} /> Add Another Module
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-8">
          {/* MODULE DETAILS CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Module Details</h2>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Module Title <span className="text-red-400">*</span></label>
                <input 
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => { setModuleTitle(e.target.value); if(errors.moduleTitle){setErrors(prev=>{const n={...prev};delete n.moduleTitle;return n;});} }}
                  onBlur={() => handleFieldBlur("moduleTitle", moduleTitle)}
                  placeholder="e.g., Introduction to UI Design Fundamentals"
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-800 ${touched.moduleTitle && errors.moduleTitle ? inputErrorClass : ""}`}
                />
                {touched.moduleTitle && errors.moduleTitle && (
                  <p className={errorTextClass}>
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    {errors.moduleTitle}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Module Description <span className="text-red-400">*</span></label>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  {/* TOOLBAR */}
                  <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 overflow-x-auto">
                    <ToolbarButton icon={<Bold size={16} />} />
                    <ToolbarButton icon={<Italic size={16} />} />
                    <div className="w-[1px] h-6 bg-gray-200 mx-1" />
                    <ToolbarButton icon={<List size={16} />} />
                    <ToolbarButton icon={<ListOrdered size={16} />} />
                    <div className="w-[1px] h-6 bg-gray-200 mx-1" />
                    <ToolbarButton icon={<LinkIcon size={16} />} />
                    <ToolbarButton icon={<ImageIcon size={16} />} />
                    <ToolbarButton icon={<Code size={16} />} />
                    <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-2">Markdown Editor</span>
                  </div>
                  {/* TEXTAREA */}
                  <textarea 
                    placeholder="Provide a detailed description of what students will learn in this module..."
                    value={moduleDescription}
                    onChange={e => setModuleDescription(e.target.value)}
                    className="w-full h-48 p-4 outline-none resize-none font-normal text-gray-600 placeholder-gray-400 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MODULE RESOURCES CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Module Resources</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-4 gap-4">
                <ResourceButton icon={<FileUp size={24} />} label="Attach PDF" onClick={() => openModal("pdf")} />
                <ResourceButton icon={<ImageIcon size={24} />} label="Upload Image" onClick={() => openModal("image")} />
                <ResourceButton icon={<Video size={24} />} label="Embed Video" onClick={() => openModal("video")} />
                <ResourceButton icon={<Globe size={24} />} label="Add URL" onClick={() => openModal("url")} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResourceModals 
        isOpen={isModalOpen} 
        type={modalType} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

function ToolbarButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-2 rounded hover:bg-white hover:shadow-sm text-gray-500 transition-all">
      {icon}
    </button>
  );
}

function ResourceButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-8 border border-gray-100 rounded-2xl bg-gray-50/10 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
    >
      <div className="text-gray-400 group-hover:text-blue-500 transition-colors mb-3">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-900 uppercase tracking-widest">{label}</span>
    </button>
  );
}
