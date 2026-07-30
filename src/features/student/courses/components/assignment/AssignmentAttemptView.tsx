import React from "react";
import { ArrowLeft, Paperclip, UploadCloud, FileText, CheckCircle2, ChevronRight, Bold, Italic, Underline, List, ListOrdered, Link, Image, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AssignmentAttemptViewProps {
  courseId: string;
  assignmentTitle?: string;
  onBack: () => void;
  onSubmit: () => void;
}

export function AssignmentAttemptView({ courseId, assignmentTitle, onBack, onSubmit }: AssignmentAttemptViewProps) {
  return (
    <div className="max-w-7xl mx-auto w-full pb-20 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
          <FileText size={16} /> ASSIGNMENT • MODULE 2
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {assignmentTitle || "Case Study: Ethical AI Implementation"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Due Date: Dec 24, 2023 • 100 Points Possible
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Editor & Upload) */}
        <div className="lg:col-span-2 space-y-6">
          {/* WYSIWYG Editor Mockup */}
          <div className="border rounded-xl bg-white dark:bg-card shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            {/* Toolbar */}
            <div className="border-b p-3 flex flex-wrap gap-4 items-center bg-slate-50/50 dark:bg-muted/50">
              <div className="flex items-center gap-1 bg-white dark:bg-card border rounded-md p-1">
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-muted rounded text-slate-700 dark:text-slate-300"><Bold size={16} strokeWidth={2.5} /></button>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-muted rounded text-slate-700 dark:text-slate-300"><Italic size={16} strokeWidth={2.5} /></button>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-muted rounded text-slate-700 dark:text-slate-300"><Underline size={16} strokeWidth={2.5} /></button>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-card border rounded-md p-1">
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-muted rounded text-slate-700 dark:text-slate-300"><List size={16} /></button>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-muted rounded text-slate-700 dark:text-slate-300"><ListOrdered size={16} /></button>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-card border rounded-md p-1">
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-muted rounded text-slate-700 dark:text-slate-300"><Link size={16} /></button>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-muted rounded text-slate-700 dark:text-slate-300"><Image size={16} /></button>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-muted rounded text-slate-700 dark:text-slate-300"><Code size={16} /></button>
              </div>
            </div>
            {/* Text Area */}
            <div className="p-6 flex-1">
              <textarea 
                className="w-full h-full resize-none outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 bg-transparent"
                placeholder="Write your case study response here..."
              ></textarea>
            </div>
          </div>

          {/* File Upload Mockup */}
          <div className="border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-muted/10 p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload Supporting Documents</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm">
              Enhance your submission with datasets, diagrams, or additional research papers.
            </p>
            <Button variant="outline" className="flex items-center gap-2 rounded-full px-6 bg-white dark:bg-card hover:bg-slate-50">
              <Paperclip size={16} /> Browse Files
            </Button>
            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-6">
              PDF, DOCX, ZIP, OR PNG (MAX 50MB PER FILE)
            </p>
          </div>
        </div>

        {/* Right Column (Instructions & Rubric) */}
        <div className="space-y-6">
          {/* Instructions Card */}
          <div className="border rounded-xl bg-white dark:bg-card shadow-sm p-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-wider uppercase mb-4">
              <FileText size={16} className="text-blue-500" /> Assignment Instructions
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
              Provide a comprehensive ethical analysis for a hypothetical AI recruitment tool. Your analysis should cover:
            </p>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
              <li><strong className="text-slate-900 dark:text-white">Bias Sources:</strong> Identify potential sources of bias in training data.</li>
              <li><strong className="text-slate-900 dark:text-white">Transparency:</strong> Strategies for maintaining algorithmic transparency.</li>
              <li><strong className="text-slate-900 dark:text-white">Accountability:</strong> A proposed framework for ethical responsibility.</li>
            </ul>
          </div>

          {/* Grading Rubric Card */}
          <div className="border rounded-xl bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-wider uppercase">
                <List size={16} className="text-blue-500" /> Grading Rubric
              </div>
            </div>
            <div className="divide-y">
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Ethical Depth</h4>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-semibold">40 pts</Badge>
                </div>
                <p className="text-xs text-slate-500">How deeply the student explores philosophical and practical ethics.</p>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Technical Accuracy</h4>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-semibold">30 pts</Badge>
                </div>
                <p className="text-xs text-slate-500">Correct usage of AI terminology and implementation concepts.</p>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Proposed Solutions</h4>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-semibold">30 pts</Badge>
                </div>
                <p className="text-xs text-slate-500">Feasibility and innovation of bias-mitigation strategies.</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-muted/30 text-center border-t">
              <button className="text-blue-600 font-bold text-xs tracking-wider uppercase hover:underline">View Full Rubric Details</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-card/80 backdrop-blur-md border-t flex justify-end gap-4 z-10 lg:pl-80">
        <div className="max-w-7xl mx-auto w-full flex justify-end gap-4 items-center">
          <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" onClick={onBack}>
            Save Progress
          </button>
          <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <ArrowLeft size={16} className="rotate-180" /> Submit Assignment
          </Button>
        </div>
      </div>
    </div>
  );
}
