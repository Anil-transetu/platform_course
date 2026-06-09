"use client";

import { useState } from "react";
import { Search, HelpCircle, Clock, RefreshCcw, Edit3, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCourseStore } from "@/store/useCourseStore";
import CourseSidebar from "@/components/admin/courses/CourseSidebar";
import Pagination from "@/components/ui/Pagination/Pagination";

const MOCK_QUIZZES = [
  { id: "q1", title: "Introduction to UX", desc: "A fundamental assessment covering basic UX principles and methodologies.", questions: 20, time: "15 mins", diff: "Beginner", diffColor: "bg-gray-100 text-gray-600", icon: "brain" },
  { id: "q2", title: "Color Theory Basics", desc: "Deep dive into the psychology of colors, contrast ratios, and palettes.", questions: 15, time: "10 mins", diff: "Intermediate", diffColor: "bg-blue-100 text-blue-700", icon: "palette" },
  { id: "q3", title: "Typography Mastery", desc: "Complex concepts including variable fonts, kerning, and hierarchy.", questions: 35, time: "45 mins", diff: "Advanced", diffColor: "bg-red-100 text-red-700", icon: "type" },
  { id: "q4", title: "Information Architecture", desc: "Testing knowledge on site mapping, card sorting, and user flows.", questions: 25, time: "20 mins", diff: "Intermediate", diffColor: "bg-blue-100 text-blue-700", icon: "git-merge" },
  { id: "q5", title: "Responsive Design 101", desc: "Understanding breakpoints, fluid grids, and adaptive media queries.", questions: 18, time: "12 mins", diff: "Beginner", diffColor: "bg-gray-100 text-gray-600", icon: "smartphone" },
  { id: "q6", title: "Accessibility Auditing", desc: "Advanced WCAG 2.1 compliance testing, ARIA roles, and screen readers.", questions: 40, time: "50 mins", diff: "Advanced", diffColor: "bg-red-100 text-red-700", icon: "bar-chart" },
  { id: "q7", title: "Prototyping Workflows", desc: "Interactive states, variables, and advanced component logic in Figma.", questions: 30, time: "30 mins", diff: "Intermediate", diffColor: "bg-blue-100 text-blue-700", icon: "layers" },
];

export default function QuizLibraryPage() {
  const router = useRouter();
  const { course, activeModuleId, activeLessonId, activeQuizId, updateQuiz } = useCourseStore();
  
  const activeModule = course.modules.find(m => m.id === activeModuleId);
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);
  const activeQuiz = activeLesson?.quizzes?.find(q => q.id === activeQuizId);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");

  const quizTitle = activeQuiz?.title || "";

  const itemsPerPage = 6;

  const filteredQuizzes = MOCK_QUIZZES.filter(q => 
    q.title.toLowerCase().includes(search.toLowerCase()) || 
    q.desc.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const currentItems = filteredQuizzes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddToCourse = (title: string) => {
    if (activeModuleId && activeLessonId && activeQuizId) {
      updateQuiz(activeModuleId, activeLessonId, activeQuizId, { title });
      setSuccessMsg(`"${title}" added to course successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      alert("Please ensure you have an active quiz selected in the sidebar to replace.");
    }
  };

  const getIcon = (type: string) => {
    // simplified icon rendering for the mock data
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500`}>
        <HelpCircle size={20} strokeWidth={2.5} />
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex p-8 gap-8 items-start min-h-full">
        {/* LEFT SIDEBAR */}
        <CourseSidebar />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 max-w-5xl">
          {quizTitle ? (
            /* --- PREVIEW SCREEN --- */
            <div className="flex flex-col gap-8">
              <div className="flex items-start justify-between bg-card p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full uppercase">
                      Quiz Selected
                    </span>
                    <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                      <Clock size={14} /> Est. 15 mins
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">{quizTitle}</h1>
                  <p className="text-gray-500 text-sm max-w-2xl">
                    This quiz has been attached to your lesson. Students will be required to complete it before progressing.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all text-sm border border-blue-100 shadow-sm cursor-not-allowed opacity-70">
                    <Edit3 size={16} /> Edit in Builder
                  </button>
                  <button 
                    onClick={() => updateQuiz(activeModuleId!, activeLessonId!, activeQuizId!, { title: "" })}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-card text-gray-500 font-bold rounded-xl hover:bg-muted transition-all text-sm border border-gray-200 shadow-sm"
                  >
                    <RefreshCcw size={16} /> Replace Quiz
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-50 bg-muted/30">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <HelpCircle size={18} className="text-blue-500" />
                    Preview: Sample Questions
                  </h3>
                </div>
                <div className="p-8 flex flex-col gap-6">
                  {/* Mock Question 1 */}
                  <div className="p-6 border border-gray-100 rounded-xl">
                    <h4 className="font-bold text-foreground mb-4">1. Which of the following is a primary color?</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500 bg-blue-50/50">
                        <CheckCircle2 size={18} className="text-blue-500" />
                        <span className="text-sm font-medium text-blue-900">Red</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-card">
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200" />
                        <span className="text-sm font-medium text-gray-600">Green</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-card">
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200" />
                        <span className="text-sm font-medium text-gray-600">Orange</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Question 2 */}
                  <div className="p-6 border border-gray-100 rounded-xl">
                    <h4 className="font-bold text-foreground mb-4">2. What is the recommended minimum contrast ratio for text?</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500 bg-blue-50/50">
                        <CheckCircle2 size={18} className="text-blue-500" />
                        <span className="text-sm font-medium text-blue-900">4.5:1</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-card">
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200" />
                        <span className="text-sm font-medium text-gray-600">3.0:1</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-card">
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200" />
                        <span className="text-sm font-medium text-gray-600">2.5:1</span>
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
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Quiz Library</h1>
                <p className="text-gray-500 text-sm">Select an existing quiz to add to your course structure.</p>
              </div>

              {/* SEARCH BAR */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-gray-200 shadow-sm">
                  <Search size={18} className="text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search quizzes..." 
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
                {currentItems.map((quiz) => (
                  <div key={quiz.id} className="bg-card border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      {getIcon(quiz.icon)}
                      <span className={`text-[11px] font-bold tracking-widest px-3 py-1.5 rounded-full ${quiz.diffColor}`}>
                        {quiz.diff}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-foreground text-lg mb-3 leading-tight">{quiz.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1">{quiz.desc}</p>
                    
                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <HelpCircle size={14} />
                        <span className="text-xs font-semibold">{quiz.questions} Questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={14} />
                        <span className="text-xs font-semibold">{quiz.time}</span>
                      </div>
                    </div>

                    <div className="pt-0 mt-auto">
                      <button 
                        onClick={() => handleAddToCourse(quiz.title)}
                        className="w-full flex items-center justify-center gap-2 border border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-blue-600 py-2.5 rounded-xl font-bold transition-all text-sm shadow-sm"
                      >
                        Add to Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredQuizzes.length === 0 && (
                <div className="py-20 flex items-center justify-center text-gray-400 font-medium">
                  No quizzes found matching your search.
                </div>
              )}

              {/* PAGINATION */}
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
                totalItems={filteredQuizzes.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
