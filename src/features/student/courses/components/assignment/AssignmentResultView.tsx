import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MessageSquare, Download, Clock, TrendingUp, History, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AssignmentResultViewProps {
  courseId: string;
  assignmentTitle?: string;
  onBackToCourse: () => void;
  onNextSection?: () => void;
}

export function AssignmentResultView({ courseId, assignmentTitle, onBackToCourse, onNextSection }: AssignmentResultViewProps) {
  return (
    <div className="max-w-7xl mx-auto w-full pb-20 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 mb-2">
            <CheckCircle2 size={16} /> ASSIGNMENT SUBMISSION • MODULE 2
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {assignmentTitle || "Ethical AI Framework Analysis"}
          </h1>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <CheckCircle2 size={16} /> Graded
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Grade & Feedback) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grade Card */}
          <div className="border rounded-xl bg-white dark:bg-card shadow-sm p-8 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Your Total Grade</p>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">18</span>
                <span className="text-2xl font-bold text-slate-400">/ 20</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Pass Mark</p>
              <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">14 / 20</div>
              <div className="flex items-center justify-end gap-1 text-sm font-semibold text-green-600">
                <TrendingUp size={16} /> Above Average
              </div>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="border rounded-xl bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              Feedback from Instructor
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                    IS
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dr. Isaac Sarahs</h4>
                  </div>
                </div>
                <div className="text-xs text-slate-400">Oct 24, 2023 • 10:15 AM</div>
              </div>
              
              <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-4 mb-6 ml-13 pl-13">
                <p>
                  Excellent work on the framework analysis, John. Your points regarding algorithmic bias were particularly well-researched. I appreciated your inclusion of recent case studies to support your arguments.
                </p>
                <p>
                  For future submissions, try to expand more on the "Liability" section. While your current overview is solid, exploring more specific legal precedents would have pushed this to a perfect 20/20. Great progress overall!
                </p>
              </div>

              <div className="flex gap-2 ml-13 pl-13">
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  EXCELLENT INSIGHT
                </Badge>
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  STRONG RESEARCH
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Details & Next Step) */}
        <div className="space-y-6">
          {/* Submission Details */}
          <div className="border rounded-xl bg-white dark:bg-card shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-6">Submission Details</h3>
            
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Date Submitted</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">October 22, 2023</p>
              <p className="text-sm text-slate-500">at 02:30 PM (On-time)</p>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Submitted Files</p>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-red-100 text-red-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">ethic_analysis_v...</p>
                    <p className="text-xs text-slate-500">2.4 MB</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <Download size={18} />
                </button>
              </div>
            </div>

            <Button variant="outline" className="w-full font-bold bg-slate-900 text-white hover:bg-slate-800 border-none">
              <History size={16} className="mr-2" /> View All Attempts
            </Button>
          </div>

          {/* Unlock Card */}
          <div className="rounded-xl bg-blue-600 text-white p-6 shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <CheckCircle2 size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Next Module Unlocked!</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                You've successfully completed Module 2. Ready to dive into Neural Networks?
              </p>
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold border-none backdrop-blur-sm">
                START MODULE 3
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-card/90 backdrop-blur-md border-t flex justify-between items-center z-10 lg:pl-[320px]">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center px-4">
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" onClick={onBackToCourse}>
            <ArrowLeft size={16} /> Back to Lesson 2.1
          </button>
          <Button onClick={onNextSection} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            Continue to Next Section <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
