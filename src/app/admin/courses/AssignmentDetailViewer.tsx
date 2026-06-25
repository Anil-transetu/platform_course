"use client";

import React from "react";
import { ArrowLeft, ClipboardList, Award, Calendar, ShieldCheck, FileType, CheckCircle, Info } from "lucide-react";
import { useAssignment } from "@/features/admin/assignments/api/use-assignments";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { Skeleton } from "@/components/ui/skeleton";

interface AssignmentDetailViewerProps {
  assignmentId: string | number;
  onBack: () => void;
}

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

export default function AssignmentDetailViewer({ assignmentId, onBack }: AssignmentDetailViewerProps) {
  const { data: assignment, isLoading, error } = useAssignment(assignmentId);

  if (isLoading) {
    return (
      <ListingScreenTemplate
        headerText="Assessment Detail View"
        subHeaderText="Loading assignment details..."
        buttonRequired={false}
        buttonOnclick={() => {}}
        extraActions={
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-border/70 rounded-lg hover:bg-gray-50 dark:bg-muted/50 bg-white dark:bg-card transition-all text-gray-700 dark:text-foreground shadow-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
        }
      >
        <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
          <Skeleton className="h-40 w-full rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl animate-pulse" />
              <Skeleton className="h-48 w-full rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </ListingScreenTemplate>
    );
  }

  if (error || !assignment) {
    return (
      <ListingScreenTemplate
        headerText="Assessment Detail View"
        subHeaderText="Error loading details"
        buttonRequired={false}
        buttonOnclick={() => {}}
        extraActions={
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg bg-card hover:bg-muted">
            <ArrowLeft size={16} /> Back
          </button>
        }
      >
        <div className="p-8 max-w-xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold text-rose-600">Failed to load assignment details</h2>
          <p className="text-gray-500">{(error as any)?.message || "The assignment details could not be retrieved."}</p>
          <button onClick={onBack} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </ListingScreenTemplate>
    );
  }

  const deliverables = getDeliverables(assignment.submissionType || assignment.submission_type);

  return (
    <ListingScreenTemplate
      headerText="Assessment Overview"
      subHeaderText="Detailed breakdown of capstone project instructions, deliverables and matrix"
      buttonRequired={false}
      buttonOnclick={() => {}}
      extraActions={
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700 bg-white shadow-xs hover:shadow-md"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      }
    >
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden text-white min-h-[200px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
            <div className="relative z-10 space-y-3">
              <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase border border-indigo-500/40 bg-indigo-500/10 text-indigo-300">
                Capstone Assessment
              </span>
              <h1 className="text-3xl font-black tracking-tight leading-tight">
                {assignment.title || assignment.assignment_title || "Untitled Assignment"}
              </h1>
              <p className="text-slate-300 text-sm max-w-3xl leading-relaxed font-medium">
                Please review all instructions, required deliverables, and evaluation rubrics before submitting your project.
              </p>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Column (Main Content) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Instructions Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs flex flex-col gap-5">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Info size={18} className="text-indigo-500" />
                  Project Instructions
                </h3>
                <div 
                  className="text-sm text-slate-600 leading-relaxed prose prose-slate max-w-none font-medium"
                  dangerouslySetInnerHTML={{ __html: assignment.description || "In this assignment, you will apply concepts learned throughout the modules to build a complete project solution." }}
                />
              </div>

              {/* Deliverables Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ClipboardList size={18} className="text-indigo-500" />
                  Required Deliverables
                </h3>
                <ul className="flex flex-col gap-4">
                  {deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-sm text-slate-600 font-semibold group">
                      <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs font-black shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                        {idx + 1}
                      </div>
                      <span className="pt-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Grading Rubric Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Award size={18} className="text-indigo-500" />
                  Evaluation Rubric Matrix
                </h3>
                {assignment.evaluation_matrix && assignment.evaluation_matrix.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assignment.evaluation_matrix.map((criteria: any, cIdx: number) => (
                      <div key={cIdx} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-indigo-50/5 hover:border-indigo-100/50 transition-all shadow-2xs">
                        <span className="font-extrabold text-sm text-slate-800 block mb-1">{criteria.name}</span>
                        <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Max Score: <span className="text-indigo-600">{criteria.marks} marks</span></span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-indigo-50/5 hover:border-indigo-100/50 transition-all shadow-2xs">
                      <span className="font-extrabold text-sm text-slate-800 block mb-1">Completeness (40%)</span>
                      <span className="text-xs text-slate-500 font-medium leading-relaxed block mt-1">All deliverables are submitted, functional, and meet the minimal criteria.</span>
                    </div>
                    <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-indigo-50/5 hover:border-indigo-100/50 transition-all shadow-2xs">
                      <span className="font-extrabold text-sm text-slate-800 block mb-1">Quality & Craft (60%)</span>
                      <span className="text-xs text-slate-500 font-medium leading-relaxed block mt-1">Code/design meets professional formatting, structuring, and documentation standards.</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column (Sidebar Details) */}
            <div className="space-y-8">
              
              {/* Specifications Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col gap-6">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100">
                  Assessment Specifications
                </h3>
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                      <FileType size={14} className="text-slate-400" />
                      Submission Type
                    </span>
                    <span className="font-bold text-indigo-700 bg-indigo-50/80 px-3 py-1 rounded-lg capitalize border border-indigo-100/30">
                      {assignment.submissionType || assignment.submission_type || "File submission"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                      <Award size={14} className="text-slate-400" />
                      Maximum Score
                    </span>
                    <span className="font-black text-slate-800 text-sm">
                      {assignment.marks || assignment.total_marks || assignment.max_score || "100"} marks
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-slate-400" />
                      Passing Score
                    </span>
                    <span className="font-black text-slate-800 text-sm">
                      {assignment.passing_score || "70%"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-slate-400" />
                      Status
                    </span>
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-2xs">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Deadline/Notes Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/30 border border-indigo-100/55 rounded-3xl p-6 shadow-2xs flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Calendar size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 text-sm">Grading & Feedback</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Once submitted, capstone project assignments are graded by course facilitators. Feedback will be populated in your learner console within 3-5 business days.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </ListingScreenTemplate>
  );
}
