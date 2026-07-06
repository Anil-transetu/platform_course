"use client";

import { useState } from "react";
import { Search, FileText, Code, Palette, BarChart, Plus, ClipboardList, Loader2 } from "lucide-react";
import { useCourseStore } from "@/store/useCourseStore";
import Pagination from "@/components/ui/Pagination/Pagination";
import { useAssignments, useAssignment } from "@/features/admin/assignments/api/use-assignments";
import { Assignment as ApiAssignment } from "@/features/admin/assignments/api/assignment-api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

export default function AssignmentLibraryPage() {
  const { 
    course, 
    activeModuleId, 
    activeLessonId, 
    activeAssignmentId, 
    updateAssignment, 
    updateCourseAssignment,
    setActiveAssignment,
    deleteAssignment,
    deleteCourseAssignment
    setActiveAssignment,
    deleteAssignment,
    deleteCourseAssignment
  } = useCourseStore();
  
  let activeAssignment: { id: string | number; title?: string; assignment_title?: string } | undefined;
  if (!activeModuleId) {
    const finalAssessment = (course as any)?.final_assessment || (course as any)?.finalAssessment;
    const effectiveAssignmentId = activeAssignmentId || finalAssessmentId;

    if (finalAssessment && String(finalAssessment.id) === String(effectiveAssignmentId)) {
      activeAssignment = finalAssessment;
    } else if (finalAssessmentId && String(finalAssessmentId) === String(effectiveAssignmentId)) {
      activeAssignment = finalAssessment || { id: finalAssessmentId };
    } else {
      activeAssignment = course.assignments?.find(a => String(a.id) === String(effectiveAssignmentId));
    }
  } else if (!activeLessonId) {
    const activeModule = course.modules.find(m => String(m.id) === String(activeModuleId));
    activeAssignment = activeModule?.assignments?.find(a => String(a.id) === String(activeAssignmentId));
  } else {
    const activeModule = course.modules.find(m => String(m.id) === String(activeModuleId));
    const activeLesson = activeModule?.lessons.find(l => String(l.id) === String(activeLessonId));
    activeAssignment = activeLesson?.assignments?.find(a => String(a.id) === String(activeAssignmentId));
  }

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [forceLibraryView, setForceLibraryView] = useState(false);

  // 1. Fetch real list of assignments — only when library view is active
  const { data: assignmentsData, isLoading: listLoading } = useAssignments(
    currentPage, 
    6, 
    debouncedSearch || undefined, 
    statusFilter === "All" ? undefined : statusFilter,
    { enabled: isLibraryEnabled }
  );
  const assignmentItems = assignmentsData?.data || [];
  const totalItems = assignmentsData?.total || 0;
  const totalPages = Math.ceil(totalItems / 6);

  // 2. Fetch specific assignment details from backend if ID is a real backend ID
  const activeAssignmentIdStr = activeAssignment?.id ? String(activeAssignment.id) : undefined;
  const isRealId = activeAssignmentIdStr && !activeAssignmentIdStr.includes("-");
  const { data: assignmentDetail, isLoading: detailLoading } = useAssignment(isRealId ? activeAssignmentIdStr : undefined);

  const assignmentTitle = activeAssignment?.title || activeAssignment?.assignment_title || "";
  const shouldShowPreview = !!assignmentTitle && !forceLibraryView;

  const handleAddToCourse = (assignment: ApiAssignment) => {
    if (activeAssignmentId) {
      const assignmentIdStr = String(assignment.id);
      if (!activeModuleId) {
        updateCourseAssignment(activeAssignmentId, { id: assignmentIdStr, title: assignment.title });
      } else {
        updateAssignment(activeModuleId, activeLessonId || null, activeAssignmentId, { id: assignmentIdStr, title: assignment.title });
      }
      setActiveAssignment(assignmentIdStr);
      setForceLibraryView(false);
      setSuccessMsg(`"${assignment.title}" added to course successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      updateAssignment(activeModuleId, activeLessonId || null, activeAssignmentId, { id: assignmentIdStr, title: assignment.title }, { isLocalOnly: true });
    }
    setActiveAssignment(assignmentIdStr);
    setForceLibraryView(false);
    setSuccessMsg(`"${assignment.title}" added to course successfully!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const truncateText = (text?: string, limit: number = 120) => {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    if (cleanText.length > limit) {
      return cleanText.substring(0, limit) + "...";
    }
    return cleanText;
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "DRAFT").toUpperCase();
    if (s === "ACTIVE" || s === "PUBLISHED") {
      return { 
        text: "Active", 
        color: "bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-extrabold" 
      };
    }
    return { 
      text: "Draft", 
      color: "bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold" 
    };
  };

  const getSubmissionTypeDetails = (type?: string) => {
    const t = (type || "WRITING").toUpperCase();
    if (t.includes("DEVELOP") || t.includes("DEV") || t.includes("CODE")) {
      return { label: "DEVELOPMENT", color: "text-blue-600", bg: "bg-blue-50 border-blue-105", icon: Code };
    }
    if (t.includes("DESIGN") || t.includes("UI") || t.includes("UX")) {
      return { label: "DESIGN", color: "text-rose-600", bg: "bg-rose-50 border-rose-105", icon: Palette };
    }
    if (t.includes("ANALY") || t.includes("SWOT") || t.includes("MARK")) {
      return { label: "ANALYSIS", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-105", icon: BarChart };
    }
    return { label: t || "ASSIGNMENT", color: "text-slate-600", bg: "bg-slate-50 border-slate-150", icon: FileText };
  };

  const getDeliverables = (type?: string) => {
    const t = (type || "").toUpperCase();
    if (t.includes("DEVELOP") || t.includes("DEV") || t.includes("CODE")) {
      return [
        "Link to your public repository (GitHub, GitLab, etc.)",
        "A 2-minute Loom video walking through the code and functionality",
        "A brief README.md explaining your design decisions"
      ];
    }
    if (t.includes("DESIGN") || t.includes("UI") || t.includes("UX")) {
      return [
        "Figma file link with edit/view permissions",
        "High-fidelity desktop/mobile mockups",
        "Interactive prototype showing user flows"
      ];
    }
    return [
      "1x PDF Report summarizing your findings (Max 3 pages)",
      "Source files or reference links to data used",
      "Summary slide deck explaining your methodology"
    ];
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100">
      <div className="p-8 flex flex-col gap-6 max-w-5xl">
          {shouldShowPreview ? (
            /* --- PREVIEW SCREEN --- */
            <div className="flex flex-col gap-8">
              {/* ASSIGNMENT HEADER SUMMARY CARD */}
              <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-2xl border border-slate-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.02)] gap-6">
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100/50 shrink-0 shadow-[0_4px_10px_rgba(99,102,241,0.04)] mt-1">
                    <ClipboardList size={28} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-extrabold tracking-wider px-3 py-1 rounded-full uppercase">
                        Assignment Selected
                      </span>
                      <span className="text-slate-700 text-xs font-semibold flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                        Score: {assignmentDetail?.marks || assignmentDetail?.total_marks || 100} marks
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 truncate">
                      {assignmentTitle || "Unnamed Assignment"}
                    </h1>
                    <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                      This assignment has been added to your lesson. Students must submit their deliverables before passing.
                    </p>
                  </div>
                </div>
                
                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  <button 
                    onClick={() => setForceLibraryView(true)}
                    className="px-4 py-2.5 text-xs font-bold border border-slate-200 hover:border-slate-355 hover:bg-slate-50 transition-all text-slate-700 bg-white rounded-xl shadow-xs"
                  >
                    Change Assignment
                  </button>
                  <button 
                    onClick={() => {
                      if (activeAssignment?.id) {
                        const assignmentIdStr = String(activeAssignment.id);
                        if (!activeModuleId) {
                          deleteCourseAssignment(assignmentIdStr);
                        } else {
                          deleteAssignment(activeModuleId, activeLessonId || null, assignmentIdStr);
                        }
                        // Clear active assignment and return to library — do NOT navigate away
                        setActiveAssignment(null);
                        setForceLibraryView(false);
                      }
                    }}
                    className="px-4 py-2.5 text-xs font-bold bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-650 rounded-xl transition-all shadow-xs"
                  >
                    Remove Association
                  </button>
                </div>
              </div>

              {detailLoading ? (
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.02)] p-8 flex items-center justify-center text-slate-400 font-semibold">
                  Loading assignment details...
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2.5 text-sm uppercase tracking-wider">
                      <ClipboardList size={18} className="text-indigo-500" />
                      Preview: Instructions & Deliverables
                    </h3>
                  </div>
                  <div className="p-8 flex flex-col gap-8">
                    {/* INSTRUCTIONS */}
                    <div className="p-6 border border-slate-100 bg-slate-50/40 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
                        Instructions
                      </h4>
                      <div 
                        className="text-sm text-slate-600 leading-relaxed max-w-3xl prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: assignmentDetail?.description || "In this assignment, you will be applying the concepts learned in this lesson to a real-world scenario. Please ensure you follow all guidelines and utilize the templates provided. Your submission should be comprehensive and clearly demonstrate your understanding of the core material." }}
                      />
                    </div>

                    {/* DELIVERABLES */}
                    <div className="p-6 border border-slate-100 bg-slate-50/40 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
                        Required Deliverables
                      </h4>
                      <ul className="flex flex-col gap-3">
                        {getDeliverables(assignmentDetail?.submissionType || assignmentDetail?.submission_type).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3.5 text-sm text-slate-600 font-medium">
                            <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100/50 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                              {idx + 1}
                            </div>
                            <span className="pt-0.5">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* GRADING CRITERIA */}
                    <div className="p-6 border border-slate-100 bg-slate-50/40 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
                        Grading Criteria
                      </h4>
                      {assignmentDetail?.evaluation_matrix && assignmentDetail.evaluation_matrix.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {assignmentDetail.evaluation_matrix.map((criteria, cIdx: number) => (
                          {assignmentDetail.evaluation_matrix.map((criteria, cIdx: number) => (
                            <div key={cIdx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                              <span className="font-bold text-sm text-slate-800 block mb-1">{criteria.name}</span>
                              <span className="text-xs text-slate-500">Marks: {criteria.marks}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                            <span className="font-bold text-sm text-slate-800 block mb-1">Completeness (40%)</span>
                            <span className="text-xs text-slate-500 leading-relaxed">All deliverables are submitted and meet minimum requirements.</span>
                          </div>
                          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                            <span className="font-bold text-sm text-slate-800 block mb-1">Quality (60%)</span>
                            <span className="text-xs text-slate-500 leading-relaxed">The work demonstrates high quality and attention to detail.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- LIBRARY SCREEN --- */
            <>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Assignment Library</h1>
                <p className="text-slate-550 text-sm font-medium">Browse and add pre-existing assignments to your module.</p>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mt-2 bg-white border border-slate-100/80 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
                {/* Search */}
                <div className="relative flex-1 w-full sm:max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                  <Input 
                    type="text" 
                    placeholder="Search assignments..." 
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 h-10 w-full bg-slate-50/50 border-slate-250 text-xs font-semibold text-slate-800 placeholder-slate-450 focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 rounded-lg"
                  />
                </div>
                
                {/* Select Filter */}
                <div className="w-full sm:w-48">
                  <Select 
                    value={statusFilter} 
                    onValueChange={(val) => {
                      setStatusFilter(val);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 w-full bg-slate-50/50 border border-slate-250 text-xs font-bold text-slate-700 rounded-lg">
                      <SelectValue placeholder="Status Filter" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200">
                      <SelectItem value="All" className="text-xs font-semibold">All Assignments</SelectItem>
                      <SelectItem value="Active" className="text-xs font-semibold">Active Only</SelectItem>
                      <SelectItem value="Draft" className="text-xs font-semibold">Draft Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-sm font-bold shadow-sm">
                  {successMsg}
                </div>
              )}

              {/* GRID */}
              {listLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-455 font-semibold gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <span>Loading assignment library...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignmentItems.map((assignment: ApiAssignment) => {
                    {assignmentItems.map((assignment: ApiAssignment) => {
                      const details = getSubmissionTypeDetails(assignment.submissionType || assignment.submission_type);
                      const badge = getStatusBadge(assignment.status);
                      const IconComponent = details.icon;
                      return (
                        <div key={assignment.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-[0_10px_30px_rgba(37,99,235,0.045)] hover:border-blue-200/50 transition-all flex flex-col h-full group">
                          <div className="flex justify-between items-center mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${details.bg} ${details.color} border border-slate-150`}>
                              <IconComponent size={20} strokeWidth={2.2} />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold tracking-wider uppercase bg-slate-550 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200">
                                {details.label}
                              </span>
                              <span className={badge.color}>
                                {badge.text}
                              </span>
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-slate-800 text-base mb-2 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">{assignment.title}</h3>
                          <p className="text-slate-550 text-xs mb-4 leading-relaxed flex-1 line-clamp-3">
                            {truncateText(assignment.description) || "No description provided."}
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                            <span className="text-[11px] font-semibold text-slate-500">Score: {assignment.marks || assignment.total_marks || 100} marks</span>
                            <button 
                              onClick={() => handleAddToCourse(assignment)}
                              className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all text-xs shadow-xs"
                            >
                              <Plus size={13} /> Add Assignment
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {assignmentItems.length === 0 && (
                    <div className="py-20 flex items-center justify-center text-slate-400 font-semibold">
                      No assignments found matching your criteria.
                    </div>
                  )}

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                        totalItems={totalItems}
                        itemsPerPage={6}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}
      </div>
    </div>
  );
}
