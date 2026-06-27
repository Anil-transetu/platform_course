import React from "react";
import { X, ClipboardList, Code, Palette, BarChart, FileText } from "lucide-react";
import { useAssignment } from "@/features/admin/assignments/api/use-assignments";

interface AssignmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string | null;
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

export default function AssignmentPreviewModal({ isOpen, onClose, assignmentId }: AssignmentPreviewModalProps) {
  const { data: assignmentDetail, isLoading } = useAssignment(assignmentId || undefined);

  if (!isOpen || !assignmentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-card rounded-3xl shadow-2xl border border-gray-100 dark:border-border/50 flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-border/50 bg-gray-50/50 dark:bg-muted/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">
              {assignmentDetail?.title || assignmentDetail?.assignment_title || "Assignment Details"}
            </h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Max Score: {assignmentDetail?.marks || assignmentDetail?.total_marks || 100} marks
              </span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-muted rounded-full transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-20 flex items-center justify-center text-gray-400 font-medium">
              Loading assignment details...
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="bg-card rounded-2xl border border-gray-100 dark:border-border/50 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-muted/30">
                  <h3 className="font-bold text-gray-700 dark:text-foreground flex items-center gap-2">
                    <ClipboardList size={18} className="text-indigo-500" />
                    Instructions & Deliverables
                  </h3>
                </div>
                <div className="p-6 flex flex-col gap-8">
                  <div>
                    <h4 className="font-bold text-foreground mb-2">Instructions</h4>
                    <div 
                      className="text-sm text-gray-500 dark:text-muted-foreground leading-relaxed max-w-3xl prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: assignmentDetail?.description || "In this assignment, you will be applying the concepts learned in this lesson to a real-world scenario. Please ensure you follow all guidelines and utilize the templates provided. Your submission should be comprehensive and clearly demonstrate your understanding of the core material." }}
                    />
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-3">Deliverables</h4>
                    <ul className="flex flex-col gap-2">
                      {getDeliverables(assignmentDetail?.submissionType || assignmentDetail?.submission_type).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 dark:text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-foreground mb-3">Grading Criteria</h4>
                    {assignmentDetail?.evaluation_matrix && assignmentDetail.evaluation_matrix.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {assignmentDetail.evaluation_matrix.map((criteria: any, cIdx: number) => (
                          <div key={cIdx} className="p-4 rounded-xl border border-gray-100 dark:border-border/50 bg-muted/30">
                            <span className="font-bold text-sm text-foreground block mb-1">{criteria.name}</span>
                            <span className="text-xs text-gray-500 dark:text-muted-foreground">Marks: {criteria.marks}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-gray-100 dark:border-border/50 bg-muted/30">
                          <span className="font-bold text-sm text-foreground block mb-1">Completeness (40%)</span>
                          <span className="text-xs text-gray-500 dark:text-muted-foreground">All deliverables are submitted and meet minimum requirements.</span>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-100 dark:border-border/50 bg-muted/30">
                          <span className="font-bold text-sm text-foreground block mb-1">Quality (60%)</span>
                          <span className="text-xs text-gray-500 dark:text-muted-foreground">The work demonstrates high quality and attention to detail.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
