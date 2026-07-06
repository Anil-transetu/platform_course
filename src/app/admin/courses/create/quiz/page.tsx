"use client";

import { useState } from "react";
import { Search, HelpCircle, Clock, CheckSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCourseStore } from "@/store/useCourseStore";
import CourseSidebar from "@/components/admin/courses/CourseSidebar";
import Pagination from "@/components/ui/Pagination/Pagination";
import { useQuizzes, useQuiz } from "@/features/admin/quizzes/api/use-quizzes";
import { Quiz as ApiQuiz, QuizQuestion, QuizQuestionOption } from "@/features/admin/quizzes/api/quiz-api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [forceLibraryView, setForceLibraryView] = useState(false);

  // 1. Fetch real list of quizzes with pagination & search
  const { data: quizzesData, isLoading: listLoading } = useQuizzes(
    currentPage, 
    6, 
    search || undefined, 
    statusFilter === "ALL" ? undefined : statusFilter
  );
  const quizItems = quizzesData?.data || [];
  const totalItems = quizzesData?.total || 0;
  const totalPages = Math.ceil(totalItems / 6);

  // 2. Fetch specific quiz details if it is a real database ID
  const activeQuizIdStr = activeQuiz?.id ? String(activeQuiz.id) : "";
  const isRealId = activeQuizIdStr && !activeQuizIdStr.includes("-");
  const { data: quizDetail, isLoading: detailLoading } = useQuiz(isRealId ? activeQuizIdStr : "");

  const quizTitle = activeQuiz?.title || activeQuiz?.quiz_title || "";
  const shouldShowPreview = !!quizTitle && !forceLibraryView;

  const handleAddToCourse = (quiz: ApiQuiz) => {
    if (activeQuizId) {
      const newId = String(quiz.id);
      if (!activeModuleId) {
        updateCourseQuiz(activeQuizId, { id: newId, title: quiz.title });
      } else {
        updateQuiz(activeModuleId, activeLessonId || null, activeQuizId, { id: newId, title: quiz.title });
      }
      setActiveQuiz(newId);
      setForceLibraryView(false);
      setSuccessMsg(`"${quiz.title}" added to course successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      alert("Please ensure you have an active quiz selected in the sidebar to replace.");
    }
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
      <div className="flex p-8 gap-8 items-start min-h-full">
        {/* LEFT SIDEBAR */}
        <CourseSidebar />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 max-w-5xl">
          {shouldShowPreview ? (
            /* --- PREVIEW SCREEN --- */
            <div className="flex flex-col gap-8">
              {/* QUIZ HEADER SUMMARY CARD */}
              <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-2xl border border-slate-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.02)] gap-6">
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
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  <button 
                    onClick={() => setForceLibraryView(true)}
                    className="px-4 py-2.5 text-xs font-bold border border-slate-200 hover:border-slate-350 hover:bg-slate-50 transition-all text-slate-700 bg-white rounded-xl shadow-xs"
                  >
                    Change Quiz
                  </button>
                  <button 
                    onClick={() => {
                      if (activeQuiz?.id) {
                        if (!activeModuleId) {
                          deleteCourseQuiz(String(activeQuiz.id));
                        } else {
                          deleteQuiz(activeModuleId, activeLessonId || null, String(activeQuiz.id));
                        }
                      }
                      router.push('/admin/courses/create');
                    }}
                    className="px-4 py-2.5 text-xs font-bold bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-650 rounded-xl transition-all shadow-xs"
                  >
                    Remove Association
                  </button>
                </div>
              </div>

              {/* QUESTIONS LIST CARD */}
              <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2.5 text-sm uppercase tracking-wider">
                    <CheckSquare size={16} className="text-blue-500" />
                    Preview: Quiz Questions
                  </h3>
                </div>
                <div className="p-8 flex flex-col gap-6">
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
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Quiz Library</h1>
                <p className="text-slate-500 text-sm font-medium">Select an existing quiz to add to your course structure.</p>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mt-2 bg-white border border-slate-100/80 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
                {/* Search */}
                <div className="relative flex-1 w-full sm:max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                  <Input 
                    type="text" 
                    placeholder="Search quizzes..." 
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
                      <SelectItem value="ALL" className="text-xs font-semibold">All Quizzes</SelectItem>
                      <SelectItem value="ACTIVE" className="text-xs font-semibold">Active Only</SelectItem>
                      <SelectItem value="DRAFT" className="text-xs font-semibold">Draft Only</SelectItem>
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
                <div className="py-20 flex flex-col items-center justify-center text-slate-450 font-semibold gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <span>Loading quiz library...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizItems.map((quiz: ApiQuiz) => {
                      const badge = getStatusBadge(quiz.status);
                      return (
                        <div key={quiz.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-[0_10px_30px_rgba(37,99,235,0.045)] hover:border-blue-200/50 transition-all flex flex-col h-full group">
                          <div className="flex justify-between items-center mb-4">
                            {getIcon()}
                            <span className={badge.color}>
                              {badge.text}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-slate-800 text-base mb-2 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">{quiz.title}</h3>
                          <p className="text-slate-550 text-xs mb-4 leading-relaxed flex-1 line-clamp-3">
                            {truncateText(quiz.description || quiz.desc) || "No description provided."}
                          </p>
                          
                          <div className="flex items-center gap-4 mb-5 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <HelpCircle size={13} />
                              <span className="text-[11px] font-semibold">{(quiz.questions || []).length || quiz.questionsCount || 0} Questions</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Clock size={13} />
                              <span className="text-[11px] font-semibold">{quiz.durationMinutes || 15} mins</span>
                            </div>
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
                    <div className="py-20 flex items-center justify-center text-slate-400 font-semibold">
                      No quizzes found matching your criteria.
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
    </div>
  );
}
