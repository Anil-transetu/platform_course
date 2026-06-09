"use client";

import { useState } from "react";
import { Search, FileText, Code, Palette, BarChart, Plus, RefreshCcw, Edit3, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCourseStore } from "@/store/useCourseStore";
import CourseSidebar from "@/components/admin/courses/CourseSidebar";
import Pagination from "@/components/ui/Pagination/Pagination";

const MOCK_ASSIGNMENTS = [
  { id: "a1", title: "User Research Report", desc: "Detailed analysis of user testing sessions including personas and journey maps.", time: "2.5 hrs est.", type: "WRITING", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "a2", title: "React Component Build", desc: "Implement a reusable data table component with sorting and pagination.", time: "4.0 hrs est.", type: "DEVELOPMENT", icon: Code, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "a3", title: "Logo Design Challenge", desc: "Create three distinct logo concepts for a sustainable tech startup.", time: "1.5 hrs est.", type: "DESIGN", icon: Palette, color: "text-red-500", bg: "bg-red-50" },
  { id: "a4", title: "Market Competitor Audit", desc: "Identify top three competitors and perform a comprehensive SWOT analysis.", time: "3.0 hrs est.", type: "ANALYSIS", icon: BarChart, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "a5", title: "Database Schema Design", desc: "Model an e-commerce backend using SQL, including relations and indexing.", time: "2.0 hrs est.", type: "DEVELOPMENT", icon: Code, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "a6", title: "High-Fidelity Prototyping", desc: "Convert wireframes into interactive prototypes using Figma components.", time: "5.0 hrs est.", type: "DESIGN", icon: Palette, color: "text-red-500", bg: "bg-red-50" },
  { id: "a7", title: "API Integration Task", desc: "Connect the frontend application to a third-party REST API securely.", time: "3.5 hrs est.", type: "DEVELOPMENT", icon: Code, color: "text-indigo-500", bg: "bg-indigo-50" },
];

export default function AssignmentLibraryPage() {
  const router = useRouter();
  const { course, activeModuleId, activeLessonId, activeAssignmentId, updateAssignment } = useCourseStore();

  const activeModule = course.modules.find(m => m.id === activeModuleId);
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);
  const activeAssignment = activeLesson?.assignments?.find(a => a.id === activeAssignmentId);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");

  const assignmentTitle = activeAssignment?.title || "";

  const itemsPerPage = 6;

  const filteredAssignments = MOCK_ASSIGNMENTS.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.desc.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const currentItems = filteredAssignments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddToCourse = (title: string) => {
    if (activeModuleId && activeLessonId && activeAssignmentId) {
      updateAssignment(activeModuleId, activeLessonId, activeAssignmentId, { title });
      setSuccessMsg(`"${title}" added to course successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      alert("Please ensure you have an active assignment selected in the sidebar to replace.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex p-8 gap-8 items-start min-h-full">
        {/* LEFT SIDEBAR */}
        <CourseSidebar />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 max-w-5xl">
          {assignmentTitle ? (
            /* --- PREVIEW SCREEN --- */
            <div className="flex flex-col gap-8">
              <div className="flex items-start justify-between bg-card p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full uppercase">
                      Assignment Selected
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">{assignmentTitle}</h1>
                  <p className="text-gray-500 text-sm max-w-2xl">
                    This assignment has been added to your lesson. Students must submit their deliverables before passing.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all text-sm border border-blue-100 shadow-sm cursor-not-allowed opacity-70">
                    <Edit3 size={16} /> Edit Details
                  </button>
                  <button 
                    onClick={() => updateAssignment(activeModuleId!, activeLessonId!, activeAssignmentId!, { title: "" })}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-card text-gray-500 font-bold rounded-xl hover:bg-muted transition-all text-sm border border-gray-200 shadow-sm"
                  >
                    <RefreshCcw size={16} /> Replace Assignment
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-50 bg-muted/30">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <ClipboardList size={18} className="text-indigo-500" />
                    Preview: Instructions & Deliverables
                  </h3>
                </div>
                <div className="p-8 flex flex-col gap-8">
                  <div>
                    <h4 className="font-bold text-foreground mb-2">Instructions</h4>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-3xl">
                      In this assignment, you will be applying the concepts learned in this lesson to a real-world scenario. 
                      Please ensure you follow all guidelines and utilize the templates provided. Your submission should be 
                      comprehensive and clearly demonstrate your understanding of the core material.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-3">Deliverables</h4>
                    <ul className="flex flex-col gap-2">
                      <li className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        1x PDF Report summarizing your findings (Max 3 pages)
                      </li>
                      <li className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Source files or link to your repository
                      </li>
                      <li className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        A 2-minute Loom video explaining your approach
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-foreground mb-3">Grading Criteria</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-gray-100 bg-muted/30">
                        <span className="font-bold text-sm text-foreground block mb-1">Completeness (40%)</span>
                        <span className="text-xs text-gray-500">All deliverables are submitted and meet minimum requirements.</span>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-100 bg-muted/30">
                        <span className="font-bold text-sm text-foreground block mb-1">Quality (60%)</span>
                        <span className="text-xs text-gray-500">The work demonstrates high quality and attention to detail.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- LIBRARY SCREEN --- */
            <>
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Assignment Library</h1>
                <p className="text-gray-500 text-sm">Browse and add pre-existing assignments to your module.</p>
              </div>

              {/* SEARCH BAR */}
              <div className="bg-card border border-gray-200 rounded-2xl p-2 flex items-center shadow-sm">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-muted rounded-xl border border-gray-100">
                  <Search size={18} className="text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by title or topic..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder-gray-400"
                  />
                </div>
              </div>

              {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-sm font-bold shadow-sm">
                  {successMsg}
                </div>
              )}

              {/* GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((assignment) => (
                  <div key={assignment.id} className="bg-card border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${assignment.bg} ${assignment.color}`}>
                        <assignment.icon size={20} strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-muted text-gray-500 px-3 py-1 rounded-lg">
                        {assignment.type}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-foreground text-lg mb-3 leading-tight">{assignment.title}</h3>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed flex-1">{assignment.desc}</p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                      <span className="text-xs font-bold text-gray-400 w-16">{assignment.time}</span>
                      <button 
                        onClick={() => handleAddToCourse(assignment.title)}
                        className="flex-1 flex items-center justify-center gap-2 bg-muted hover:bg-gray-200 text-foreground py-2.5 rounded-xl font-bold transition-all text-sm shadow-sm"
                      >
                        <Plus size={16} /> Add to Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAssignments.length === 0 && (
                <div className="py-20 flex items-center justify-center text-gray-400 font-medium">
                  No assignments found matching your search.
                </div>
              )}

              {/* PAGINATION */}
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
                totalItems={filteredAssignments.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
