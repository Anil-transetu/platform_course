"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  Play, 
  CheckCircle2, 
  Circle, 
  Lock,
  Plus,
  Clock,
  ArrowRight,
  ChevronRight,
  Award,
  BarChart,
  HelpCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const courseData = {
  id: "react-dev",
  title: "Modern React Development",
  progress: 28,
  modules: [
    {
      id: "m1",
      title: "Module 1: React Fundamentals",
      progress: "2/5",
      lessons: [
        { id: "1.1", title: "Introduction to JSX", type: "video", duration: "12:15", completed: true, active: false, locked: false },
        { id: "1.2", title: "Understanding Components", type: "video", duration: "15:45", active: true, completed: false, locked: false },
        { id: "1.3", title: "Props and Composition", type: "video", duration: "18:20", locked: true, active: false, completed: false },
        { id: "1.4", title: "State Management with Hooks", type: "video", duration: "22:10", locked: true, active: false, completed: false },
        { id: "quiz-1", title: "Module 1 Quiz", type: "quiz", questions: 10, locked: true, active: false, completed: false },
      ]
    },
    {
      id: "m2",
      title: "Module 2: Advanced Hooks",
      progress: "0/4",
      locked: true,
      lessons: [
        { id: "2.1", title: "useEffect Deep Dive", type: "video", duration: "25:00", locked: true, active: false, completed: false },
        { id: "2.2", title: "Custom Hooks Patterns", type: "video", duration: "20:15", locked: true, active: false, completed: false },
        { id: "quiz-2", title: "Module 2 Quiz", type: "quiz", questions: 15, locked: true, active: false, completed: false },
      ]
    }
  ]
};

const quizData = {
  title: "Module 1 Quiz: React Fundamentals",
  questions: 10,
  currentQuestion: 3,
  timeRemaining: "14:22",
  questionText: "What is the primary purpose of React fragments?",
  options: [
    "To create multiple DOM elements from a single component",
    "To group a list of children without adding extra nodes to the DOM",
    "To improve performance by minimizing re-renders",
    "To provide a way to pass props deeply through the component tree"
  ],
  selectedOption: 1
};

export default function CoursePlayerPage() {
  const [view, setView] = useState<"video" | "text" | "quiz" | "results">("video");
  const [sidebarOpen] = useState(true);
  const [notesSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#1E293B]">
      {/* Top Header */}
      <header className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-20">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-tight">{courseData.title}</h1>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
              <span>Course</span>
              <ChevronRight size={10} />
              <span>Module 1</span>
              <ChevronRight size={10} />
              <span className="text-blue-600">Lesson 1.2: Understanding Components</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[28%] shadow-[0_0_8px_rgba(37,99,235,0.3)]"></div>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{courseData.progress}% Progress</span>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
            JD
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Course Structure */}
        {sidebarOpen && (
          <aside className="w-[320px] border-r border-gray-100 flex flex-col bg-white overflow-y-auto shrink-0 animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course Structure</h2>
            </div>
            <div className="flex-1">
              {courseData.modules.map((module) => (
                <div key={module.id} className="border-b border-gray-50 last:border-0">
                  <button className="w-full p-6 flex flex-col gap-2 hover:bg-gray-50 transition-all text-left group">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <ChevronRight size={14} className={cn("text-gray-300 group-hover:text-gray-900 transition-transform", !module.locked && "rotate-90 text-gray-900")} />
                        <span className={cn("text-sm font-bold", module.locked ? "text-gray-400" : "text-gray-900")}>
                          {module.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-500">{module.progress}</span>
                    </div>
                  </button>
                  
                  {!module.locked && (
                    <div className="pb-4">
                      {module.lessons.map((lesson) => (
                        <button 
                          key={lesson.id} 
                          className={cn(
                            "w-full px-10 py-3 flex items-center justify-between group transition-all text-left",
                            lesson.active ? "bg-blue-50/50 border-r-4 border-blue-600" : "hover:bg-gray-50"
                          )}
                          onClick={() => {
                            if (lesson.type === "quiz") setView("quiz");
                            else setView("video");
                          }}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {lesson.completed ? (
                              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            ) : lesson.active ? (
                              <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                <Play size={8} className="text-white fill-white" />
                              </div>
                            ) : lesson.locked ? (
                              <Lock size={16} className="text-gray-300 shrink-0" />
                            ) : (
                              <Circle size={16} className="text-gray-300 shrink-0" />
                            )}
                            <span className={cn(
                              "text-xs font-medium truncate",
                              lesson.active ? "text-blue-600 font-bold" : lesson.locked ? "text-gray-400" : "text-gray-600"
                            )}>
                              {lesson.id} {lesson.title}
                            </span>
                          </div>
                          {lesson.type === "quiz" && (
                            <span className="text-[8px] font-extrabold text-blue-600 uppercase tracking-tighter bg-blue-100/50 px-1.5 py-0.5 rounded">Quiz</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-white flex flex-col relative z-10 scroll-smooth">
          {view !== "quiz" && view !== "results" ? (
            <>
              {/* Video Player Shell */}
              <div className="aspect-video bg-gray-900 relative group overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl scale-110 cursor-pointer hover:scale-125 transition-transform">
                    <Play size={32} className="ml-1 fill-white" />
                  </div>
                </div>
                {/* Custom Video Controls Mockup */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-[35%] h-full bg-blue-600"></div>
                   </div>
                   <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <Play size={16} className="fill-white" />
                        <span className="text-xs font-medium">05:20 / 15:45</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <HelpCircle size={16} />
                        <Lock size={16} />
                        <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Lesson Info */}
              <div className="p-10 max-w-4xl mx-auto w-full space-y-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Components and Props</h2>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Topic 2 of 5 in Lesson 1.2</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95">
                    <CheckCircle2 size={18} />
                    Mark as Complete
                  </button>
                </div>

                <section className="space-y-6">
                  <h3 className="text-xl font-bold">Lesson Content: Building Blocks of the UI</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Components are the core building blocks of any React application. They allow you to split the UI into independent, reusable pieces, and think about each piece in isolation. Think of them like...
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    React is a single-threaded language, meaning it executes one command at a time. However, web applications often need to perform time-consuming tasks like fetching data from an API, reading files, or handling user input. Without asynchronous patterns, the entire UI would freeze while waiting for these tasks to complete.
                  </p>
                </section>

                <section className="space-y-6">
                  <h3 className="text-xl font-bold">Deep Dive: Props</h3>
                  <div className="flex flex-col gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <ul className="space-y-4">
                      {[
                        "Props are the original approach, leading to deeply nested structures.",
                        "Props: Introduced in React to provide a cleaner way for components to communicate.",
                        "Data flows down from parent components to children."
                      ].map((text, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 size={14} className="text-blue-600 mt-1 shrink-0" />
                          <span className="text-sm text-slate-700 font-medium">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
            </>
          ) : view === "quiz" ? (
            <div className="flex-1 flex flex-col p-10 max-w-5xl mx-auto w-full space-y-10 animate-in fade-in zoom-in-95 duration-500">
               <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-4 py-1 px-3 bg-blue-50 rounded-full w-fit">
                    <Award size={14} />
                    Assessment • Module 1
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-3xl font-extrabold tracking-tight">{quizData.title}</h2>
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-bold text-xs ring-1 ring-orange-100">
                      <Clock size={14} />
                      Time Remaining: {quizData.timeRemaining}
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[30%] shadow-[0_0_12px_rgba(37,99,235,0.4)] transition-all duration-700"></div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 text-right">Question {quizData.currentQuestion} of {quizData.questions}</p>
               </div>

               <div className="space-y-8 flex-1">
                  <div className="p-10 bg-white rounded-[40px] border-2 border-gray-100 shadow-sm space-y-10">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-gray-400 font-bold text-sm">
                        Q{quizData.currentQuestion}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 leading-snug">{quizData.questionText}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {quizData.options.map((option, i) => (
                        <button 
                          key={i} 
                          className={cn(
                            "w-full p-6 text-left rounded-[24px] border-2 transition-all flex items-center justify-between group",
                            quizData.selectedOption === i 
                              ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-500/10" 
                              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 bg-white"
                          )}
                        >
                          <span className={cn(
                            "text-sm font-medium",
                            quizData.selectedOption === i ? "text-blue-900" : "text-gray-600"
                          )}>
                            {option}
                          </span>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            quizData.selectedOption === i ? "border-blue-600 bg-blue-600" : "border-gray-200"
                          )}>
                            {quizData.selectedOption === i && <Circle size={10} className="text-blue-50 fill-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="flex items-center justify-between pt-10 border-t border-gray-100 mt-auto">
                  <button className="px-8 py-3.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                    Previous
                  </button>
                  <div className="flex gap-4">
                    <button className="px-8 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">
                      Save Progress
                    </button>
                    <button 
                      className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 group"
                      onClick={() => setView("results")}
                    >
                      Next Question
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
               </div>
            </div>
          ) : (
            /* Results View */
            <div className="flex-1 flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-700">
               <div className="bg-white p-12 rounded-[50px] border-2 border-gray-100 shadow-2xl max-w-3xl w-full flex flex-col items-center text-center space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                     <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all">
                       <BarChart size={14} /> Review Quiz
                     </button>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-3xl font-extrabold tracking-tight">Quiz Results and Performance Summary</h2>
                    <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                      Great job! You&apos;ve successfully completed the Module 1 Quiz on React Fundamentals. You have a strong grasp of the core concepts.
                    </p>
                  </div>

                  <div className="relative w-56 h-56 flex items-center justify-center ">
                    {/* Circle Progress Visual */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="112" cy="112" r="90" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-gray-50" />
                      <circle cx="112" cy="112" r="90" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={565.48} strokeDashoffset={565.48 * (1 - 0.85)} strokeLinecap="round" className="text-emerald-500" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
                      <span className="text-6xl font-black text-gray-900 tracking-tight">85%</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Your Score</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 w-full">
                    <div className="p-6 bg-emerald-50 text-left rounded-3xl border border-emerald-100 space-y-3">
                       <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-900">Correct Answers</span>
                       </div>
                       <p className="text-[10px] font-bold text-emerald-600/80">17 out of 20 questions</p>
                       <p className="text-[10px] text-emerald-700 leading-normal pt-2">
                         <span className="font-bold">Well Done:</span> You clearly understand logic Flow and the importance of diverse data.
                       </p>
                    </div>
                    
                    <div className="p-6 bg-rose-50 text-left rounded-3xl border border-rose-100 space-y-3">
                       <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">X</div>
                          <span className="text-xs font-bold text-rose-900">Areas for Review</span>
                       </div>
                       <p className="text-[10px] font-bold text-rose-600/80">3 out of 20 questions</p>
                       <p className="text-[10px] text-rose-700 leading-normal pt-2">
                         <span className="font-bold">Check:</span> Review the specific legal frameworks for AI liability in the European Union.
                       </p>
                    </div>
                  </div>

                  <button 
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all transform active:scale-[0.98]"
                    onClick={() => setView("video")}
                  >
                    Continue to Next Lesson
                  </button>
                  <p className="text-[8px] font-extrabold text-gray-300 uppercase tracking-widest">Next: Module 2 - Advanced State Management</p>
               </div>
            </div>
          )}
        </main>

        {/* Right Sidebar: Notes */}
        {notesSidebarOpen && view !== "quiz" && view !== "results" && (
          <aside className="w-[320px] border-l border-gray-100 flex flex-col bg-white overflow-hidden shrink-0 animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <FileText size={16} /> Notes
              </h2>
              <button className="p-2 text-gray-300 hover:text-gray-900 transition-all rounded-lg hover:bg-gray-50">
                <Plus size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-tighter">Timestamp 02:45</span>
                    <button className="text-gray-300 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-700 leading-relaxed font-medium">
                    Important: Props are strictly read-only. We should never try to mutate them inside a child component.
                  </p>
               </div>

               <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-tighter">General Note</span>
                    <button className="text-gray-300 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
                    Review the backpropagation calculus section again. Need to clarify the chain rule application in deep layers.
                  </p>
               </div>
            </div>

            <div className="p-6 border-t border-gray-50 space-y-4">
               <textarea 
                  placeholder="Start typing your note..." 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 min-h-[120px] resize-none font-medium text-gray-600"
               ></textarea>
               <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                 Save Note
               </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function MoreVertical({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
  );
}
