"use client";

import { useState } from "react";
import { Search, HelpCircle, Clock, CheckSquare, Loader2, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCourseStore } from "@/store/useCourseStore";
import { useQuizLookup, useQuiz } from "@/features/admin/quizzes/api/use-quizzes";
import { useUpdateModule, useUpdateLesson, useUnlinkQuiz } from '@/features/admin/courses/api/course-api';
import { Quiz as ApiQuiz, QuizQuestion, QuizQuestionOption } from "@/features/admin/quizzes/api/quiz-api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from 'sonner';

export default function QuizLibraryPage() {
  const router = useRouter();
  const { 
    course, 
    activeModuleId, 
    activeLessonId, 
    activeQuizId, 
    updateQuiz, 
    updateCourseQuiz,
    setActiveQuiz,
    deleteQuiz,
    deleteCourseQuiz
  } = useCourseStore();
  
  let activeQuiz: { id: string | number; title?: string; quiz_title?: string } | undefined;
  if (!activeModuleId) {
    activeQuiz = course.quizzes?.find(q => String(q.id) === String(activeQuizId));
  } else if (!activeLessonId) {
    const activeModule = course.modules.find(m => String(m.id) === String(activeModuleId));
    activeQuiz = activeModule?.quizzes?.find(q => String(q.id) === String(activeQuizId));
  } else {
    const activeModule = course.modules.find(m => String(m.id) === String(activeModuleId));
    const activeLesson = activeModule?.lessons.find(l => String(l.id) === String(activeLessonId));
    activeQuiz = activeLesson?.quizzes?.find(q => String(q.id) === String(activeQuizId));
  }

  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [forceLibraryView, setForceLibraryView] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const activeQuizIdStr = activeQuiz?.id ? String(activeQuiz.id) : (activeQuizId ? String(activeQuizId) : "");
  const isRealId = !!(activeQuizIdStr && !activeQuizIdStr.startsWith("temp-"));
  const isLibraryEnabled = !isRealId || forceLibraryView;

  // 1. Fetch lookup list of quizzes — triggered only when library view is enabled
  const { data: quizzesData, isLoading: listLoading } = useQuizLookup(
    debouncedSearch || undefined,
    { enabled: isLibraryEnabled }
  );
  const quizItems: ApiQuiz[] = Array.isArray(quizzesData) ? quizzesData : (quizzesData as any)?.data || [];

  // 2. Fetch specific quiz details if it is a real database ID
  const { data: quizDetail, isLoading: detailLoading } = useQuiz(isRealId ? activeQuizIdStr : "", { enabled: isRealId });

  const quizTitle = activeQuiz?.title || activeQuiz?.quiz_title || (activeQuiz as any)?.name || quizDetail?.title || quizDetail?.quiz_title || quizDetail?.name || (isRealId ? `Quiz #${activeQuizIdStr}` : "");
  const shouldShowPreview = isRealId && !forceLibraryView;

  const updateModuleMutation = useUpdateModule();
  const updateLessonMutation = useUpdateLesson();
  const unlinkQuizMutation = useUnlinkQuiz();

  const handleAddToCourse = (quiz: ApiQuiz) => {
    if (!activeQuizId) {
      alert("Please ensure you have an active quiz selected in the sidebar to replace.");
      return;
    }

    // Course level does not support quizzes
    if (!activeModuleId) {
      alert("Course-level quizzes are not supported. Please select a module or lesson.");
      return;
    }

    const newId = String(quiz.id);

    // Update local store so UI updates immediately
    if (!activeLessonId) {
      updateQuiz(activeModuleId, null, activeQuizId, { id: newId, title: quiz.title }, { isLocalOnly: true });
    } else {
      updateQuiz(activeModuleId, activeLessonId || null, activeQuizId, { id: newId, title: quiz.title }, { isLocalOnly: true });
    }
    setActiveQuiz(newId);
    setForceLibraryView(false);
    setSuccessMsg(`"${quiz.title}" added to course successfully!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const truncateText = (text?: string, limit: number = 120) => {
    if (!text) return "";
    if (text.length > limit) {
      return text.substring(0, limit) + "...";
    }
    return text;
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "DRAFT").toUpperCase();
    if (s === "ACTIVE") {
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

  const getIcon = () => {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100/50 shadow-xs">
        <CheckSquare size={18} strokeWidth={2.2} />
      </div>
    );
  };


  return (
    <div className="flex-1 overflow-y-auto bg-slate-100">
      <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 max-w-5xl w-full">
          {shouldShowPreview ? (
            /* --- PREVIEW SCREEN --- */
            <div className="flex flex-col gap-8">
              {/* QUIZ HEADER SUMMARY CARD */}
              <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 sm:p-8 rounded-2xl border border-slate-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.02)] gap-6">
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100/50 shrink-0 shadow-[0_4px_10px_rgba(37,99,235,0.04)] mt-1">
                    <CheckSquare size={26} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-extrabold tracking-wider px-3 py-1 rounded-full uppercase">
                        Quiz Selected
                      </span>
                      <span className="text-slate-600 text-xs font-semibold flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                        <Clock size={12} /> Est. {quizDetail?.durationMinutes || 15} mins
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 truncate">
                      {quizTitle || "Unnamed Quiz"}
                    </h1>
                    <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                      {quizDetail?.description || quizDetail?.desc || "This quiz has been attached to your lesson. Students will be required to complete it before progressing."}
                    </p>
                  </div>
                </div>
                
                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full sm:w-auto">
                  <button 
                    onClick={() => setForceLibraryView(true)}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold border border-slate-200 hover:border-slate-350 hover:bg-slate-50 transition-all text-slate-700 bg-white rounded-xl shadow-xs"
                  >
                    Change Quiz
                  </button>
                  <button 
                    onClick={() => {
                      if (!activeQuiz?.id) return;
                      const quizIdStr = String(activeQuiz.id);

                      // Remove from local store immediately
                      if (!activeModuleId) {
                        // Course level not supported for quizzes — fallback to clearing local selection
                        setActiveQuiz(null);
                      } else {
                        deleteQuiz(activeModuleId, activeLessonId || null, quizIdStr);
                      }

                      setActiveQuiz(null);
                      setForceLibraryView(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-650 rounded-xl transition-all shadow-xs"
                  >
                    Remove Association
                  </button>
                </div>
              </div>

              {/* QUESTIONS LIST CARD */}
              <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="px-5 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2.5 text-sm uppercase tracking-wider">
                    <CheckSquare size={16} className="text-blue-500" />
                    Preview: Quiz Questions
                  </h3>
                </div>
                <div className="p-5 sm:p-8 flex flex-col gap-6">
                  {detailLoading ? (
                    <div className="py-20 flex items-center justify-center text-slate-450 font-semibold">
                      Loading quiz questions...
                    </div>
                  ) : quizDetail?.questions && quizDetail.questions.length > 0 ? (
                    quizDetail.questions.map((q: QuizQuestion, idx: number) => (
                      <div key={q.id || idx} className="p-6 border border-slate-100 bg-slate-50/40 rounded-2xl flex flex-col gap-4 shadow-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold tracking-widest text-blue-650 uppercase bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                            Question {String(idx + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">
                          {q.prompt}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                          {q.options?.map((opt: QuizQuestionOption, optIdx: number) => (
                            <div 
                              key={optIdx} 
                              className="flex items-center gap-3 p-3.5 rounded-xl border transition-all border-slate-200 bg-white text-slate-700"
                            >
                              <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-50 shrink-0" />
                              <span className="text-xs">
                                {opt.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400 font-semibold text-sm">
                      No questions found in this quiz.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* --- LIBRARY SCREEN --- */
            <>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Quiz Library</h1>
                <p className="text-slate-500 text-sm font-medium">Select an existing quiz to add to your course structure.</p>
              </div>

              {/* SEARCH BAR */}
              <div className="w-full mt-2 bg-white border border-slate-100/80 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
                {/* Search */}
                <div className="relative w-full">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                  <Input 
                    type="text" 
                    placeholder="Search quizzes..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 w-full bg-slate-50/50 border-slate-250 text-xs font-semibold text-slate-800 placeholder-slate-450 focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 rounded-lg"
                  />
                </div>
              </div>

              {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-sm font-bold shadow-sm">
                  {successMsg}
                </div>
              )}

              {/* GRID */}
              {listLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-450 font-semibold gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <span>Loading quiz library...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {quizItems.map((quiz: ApiQuiz) => {
                      const durationVal = quiz.durationMinutes ?? (quiz as any).duration_minutes ?? quiz.duration;
                      const durationStr = durationVal ? (typeof durationVal === 'number' || !String(durationVal).includes('min') ? `${durationVal} mins` : String(durationVal)) : "-- mins";
                      
                      const marksVal = quiz.totalMarks ?? (quiz as any).total_marks ?? (quiz as any).total_score ?? quiz.marks;
                      const marksStr = marksVal !== undefined && marksVal !== null ? String(marksVal) : "0";
                      
                      const qCount = (quiz.questions || []).length || (quiz as any).questionsCount || (quiz as any).question_count || (quiz as any).questions_count || 0;

                      return (
                        <div key={quiz.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-[0_10px_30px_rgba(37,99,235,0.06)] hover:border-blue-200/50 transition-all flex flex-col h-full group">
                          {/* ICON BADGE */}
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100/60 mb-4 shrink-0">
                            <CheckSquare size={20} strokeWidth={2.2} />
                          </div>

                          {/* TITLE */}
                          <h3 className="font-bold text-slate-800 text-base mb-5 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {quiz.title || "Untitled Quiz"}
                          </h3>

                          {/* STATS ROW */}
                          <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 font-semibold pb-4 border-b border-slate-100 mb-4">
                            <span className="flex items-center gap-1.5">
                              <HelpCircle size={14} className="text-slate-400" />
                              {qCount} {qCount === 1 ? "Question" : "Questions"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              {durationStr}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Target size={14} className="text-slate-400" />
                              {marksStr} Marks
                            </span>
                          </div>

                          <div className="mt-auto">
                            <button 
                              onClick={() => handleAddToCourse(quiz)}
                              className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700 py-2.5 rounded-xl font-bold transition-all text-xs shadow-xs"
                            >
                              Add Quiz
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {quizItems.length === 0 && (
                    <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-xs max-w-md mx-auto my-6">
                      <h3 className="font-bold text-slate-800 text-base mb-1.5">No published quizzes found</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Create and publish a quiz first before attaching it to a course.
                      </p>
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