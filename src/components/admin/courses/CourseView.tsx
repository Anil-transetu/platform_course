"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  BookOpen, 
  Folder, 
  FileText, 
  Target, 
  HelpCircle, 
  ClipboardList, 
  ChevronRight, 
  Clock, 
  Play, 
  Award, 
  ExternalLink,
  Book,
  GraduationCap
} from "lucide-react";
import CourseViewSidebar from "./CourseViewSidebar";
import { cn } from "@/lib/utils";

interface CourseViewProps {
  course: any;
  onBack: () => void;
}

type ActiveItem = {
  type: "course" | "module" | "lesson" | "topic" | "quiz" | "assignment";
  id: string | number;
  data: any;
};

export default function CourseView({ course, onBack }: CourseViewProps) {
  const [activeItem, setActiveItem] = useState<ActiveItem | null>({
    type: "course",
    id: course.id,
    data: course
  });

  const modules = course.modules || [];

  // Calculate statistics
  const totalModules = modules.length;
  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.topics?.length || m.lessons?.length || 0), 0);
  const totalTopics = modules.reduce((acc: number, m: any) => 
    acc + ((m.topics || m.lessons)?.reduce((acc2: number, t: any) => acc2 + (t.lessons?.length || t.topics?.length || 0), 0) || 0), 0
  );

  const courseQuizzesCount = course.quizzes?.length || 0;
  const moduleQuizzesCount = modules.reduce((acc: number, m: any) => acc + (m.quizzes?.length || 0), 0);
  const lessonQuizzesCount = modules.reduce((acc: number, m: any) => 
    acc + ((m.topics || m.lessons)?.reduce((acc2: number, t: any) => acc2 + (t.quizzes?.length || 0), 0) || 0), 0
  );
  const totalQuizzes = courseQuizzesCount + moduleQuizzesCount + lessonQuizzesCount;

  const courseAssignmentsCount = course.assignments?.length || 0;
  const moduleAssignmentsCount = modules.reduce((acc: number, m: any) => acc + (m.assignments?.length || 0), 0);
  const lessonAssignmentsCount = modules.reduce((acc: number, m: any) => 
    acc + ((m.topics || m.lessons)?.reduce((acc2: number, t: any) => acc2 + (t.assignments?.length || 0), 0) || 0), 0
  );
  const totalAssignments = courseAssignmentsCount + moduleAssignmentsCount + lessonAssignmentsCount;

  const renderRightPanelContent = () => {
    if (!activeItem || activeItem.type === "course") {
      // Course Overview Content (Learner perspective)
      return (
        <div className="space-y-6">
          {/* COURSE HERO IMAGE BANNER */}
          <div className="bg-card border border-gray-100 rounded-3xl shadow-xs overflow-hidden relative min-h-[240px] flex flex-col justify-end">
            {course.thumbnail_url ? (
              <>
                <img 
                  src={course.thumbnail_url} 
                  alt={course.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
            )}
            
            <div className="p-8 relative text-white z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/20 bg-blue-600/40 backdrop-blur-xs">
                {course.status ? course.status.toUpperCase() : "DRAFT"}
              </span>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight drop-shadow-sm mt-3">
                {course.name || "Untitled Course"}
              </h1>
              {course.description && (
                <p className="text-blue-50/95 text-xs max-w-3xl leading-relaxed mt-2 drop-shadow-sm font-semibold">
                  {course.description}
                </p>
              )}
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatsCardItem icon={<Folder size={18} />} label="Modules" value={totalModules} colorClass="bg-blue-50 text-blue-500" />
            <StatsCardItem icon={<FileText size={18} />} label="Lessons" value={totalLessons} colorClass="bg-indigo-50 text-indigo-500" />
            <StatsCardItem icon={<Target size={18} />} label="Topics" value={totalTopics} colorClass="bg-purple-50 text-purple-500" />
            <StatsCardItem icon={<HelpCircle size={18} />} label="Quizzes" value={totalQuizzes} colorClass="bg-green-50 text-green-500" />
            <StatsCardItem icon={<ClipboardList size={18} />} label="Assignments" value={totalAssignments} colorClass="bg-pink-50 text-pink-500" />
          </div>

          {/* CURRICULUM OUTLINE */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Curriculum Outline</h3>
            {modules.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No modules added to this course.</p>
            ) : (
              <div className="space-y-3">
                {modules.map((m: any, idx: number) => (
                  <div 
                    key={m.id}
                    onClick={() => setActiveItem({ type: "module", id: m.id, data: m })}
                    className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-blue-50/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <span className="text-sm font-bold text-slate-700">{m.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-355 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeItem.type === "module") {
      const moduleData = activeItem.data;
      const lessonItems = moduleData.topics || moduleData.lessons || [];

      return (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Module Details
            </span>
            <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-2">{moduleData.name}</h1>
            {moduleData.description && (
              <p className="text-sm text-slate-500 leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: moduleData.description }} />
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Lessons inside Module</h3>
            {lessonItems.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No lessons in this module.</p>
            ) : (
              <div className="space-y-3">
                {lessonItems.map((t: any, idx: number) => (
                  <div 
                    key={t.id}
                    onClick={() => setActiveItem({ type: "lesson", id: t.id, data: t })}
                    className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-blue-50/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-indigo-500" size={16} />
                      <span className="text-sm font-bold text-slate-700">{t.name || t.title}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeItem.type === "lesson") {
      const lessonData = activeItem.data;
      const subtopics = lessonData.lessons || lessonData.topics || [];

      return (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Lesson Details
            </span>
            <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-2">{lessonData.name || lessonData.title}</h1>
            {lessonData.content_text && (
              <div 
                className="text-sm text-slate-550 leading-relaxed mt-4 border-t pt-4 font-medium"
                dangerouslySetInnerHTML={{ __html: lessonData.content_text }}
              />
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Lesson Topics</h3>
            {subtopics.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No topics inside this lesson.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subtopics.map((item: any) => (
                  <div 
                    key={item.id}
                    onClick={() => setActiveItem({ type: "topic", id: item.id, data: item })}
                    className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-blue-50/10 cursor-pointer transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="text-purple-500" size={16} />
                      <span className="text-sm font-bold text-slate-700">{item.name || item.title}</span>
                    </div>
                    {item.duration_minutes && (
                      <span className="text-[10px] text-gray-450 font-bold flex items-center gap-1">
                        <Clock size={12} /> {item.duration_minutes} mins
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeItem.type === "topic") {
      const topicData = activeItem.data;
      const displayContent = topicData.content_text || topicData.content || topicData.text || "";

      return (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Topic Details
            </span>
            <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-2">{topicData.name || topicData.title}</h1>
            {topicData.duration_minutes && (
              <div className="flex items-center gap-1 text-xs text-slate-400 font-bold mt-1">
                <Clock size={14} /> Duration: {topicData.duration_minutes} minutes
              </div>
            )}
          </div>

          {topicData.video_url && (
            <div className="bg-slate-950 aspect-video rounded-3xl overflow-hidden relative shadow-md flex items-center justify-center text-white border border-slate-900">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xs">
                <div className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer">
                  <Play size={28} className="text-white fill-white ml-1" />
                </div>
                <h4 className="font-bold text-base mt-4 max-w-md text-center truncate">{topicData.name || topicData.title} Video Player</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center truncate">{topicData.video_url}</p>
              </div>
            </div>
          )}

          {displayContent && (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-3">Topic Content</h3>
              <div 
                className="text-sm text-slate-655 leading-relaxed font-semibold prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: displayContent }} 
              />
            </div>
          )}
        </div>
      );
    }

    if (activeItem.type === "quiz") {
      const quiz = activeItem.data;
      return (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 tracking-wider uppercase mb-4 py-1 px-3 bg-green-50 rounded-full w-fit">
              <Award size={14} />
              Quiz Assessment
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{quiz.name || quiz.quiz_title || quiz.title}</h1>
            <p className="text-slate-500 text-sm max-w-xl leading-relaxed mt-2 font-medium">
              {quiz.instructions || "This assessment is designed to verify the learner's comprehension of this curriculum unit."}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Time Limit</span>
                <span className="text-sm font-bold text-slate-700">{quiz.time_limit_minutes ? `${quiz.time_limit_minutes} mins` : "20 mins"}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Max Attempts</span>
                <span className="text-sm font-bold text-slate-700">{quiz.max_attempts || "1 attempt"}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Total Marks</span>
                <span className="text-sm font-bold text-slate-700">{quiz.total_marks ? `${quiz.total_marks} pts` : "10 pts"}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Passing Score</span>
                <span className="text-sm font-bold text-slate-700">{quiz.passing_score ? `${quiz.passing_score}%` : "70%"}</span>
              </div>
            </div>
          </div>

          {/* QUESTIONS PREVIEW */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                <HelpCircle size={18} className="text-green-500" />
                Assessment Preview
              </h3>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div className="p-6 border border-slate-100 rounded-2xl">
                <h4 className="font-bold text-slate-800 mb-4 text-sm">1. Identify the correct output of the following statement.</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-card">
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300" />
                    <span className="text-xs font-semibold text-slate-600">Sample Option A</span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-card">
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300" />
                    <span className="text-xs font-semibold text-slate-600">Sample Option B</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem.type === "assignment") {
      const assignment = activeItem.data;
      
      const getDeliverables = (type?: string) => {
        const t = (type || "").toUpperCase();
        if (t.includes("DEVELOP") || t.includes("DEV") || t.includes("CODE")) {
          return [
            "Link to your public repository (GitHub, GitLab, etc.)",
            "A 2-minute walkthrough video explaining the functionality",
            "A brief README.md outlining setup steps and architecture"
          ];
        }
        if (t.includes("DESIGN") || t.includes("UI") || t.includes("UX")) {
          return [
            "Figma file link with edit/view permissions",
            "High-fidelity desktop/mobile interface layouts",
            "Interactive prototype showing user flows"
          ];
        }
        return [
          "1x PDF Report summarizing your findings (Max 3 pages)",
          "Source files or reference links to data used",
          "Summary slide deck explaining your methodology"
        ];
      };

      const deliverables = getDeliverables(assignment.submission_type);

      return (
        <div className="space-y-6 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col gap-4">
                <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider w-fit">
                  Assignment Overview
                </span>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  {assignment.title || assignment.name}
                </h1>
                
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Project Instructions</h4>
                  <div 
                    className="text-sm text-slate-655 leading-relaxed font-semibold prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: assignment.description || "In this assignment, apply the concepts learned in this unit to build a practical project. Follow the detailed requirements." }}
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                  <ClipboardList size={18} className="text-indigo-500" />
                  Required Deliverables
                </h3>
                <ul className="flex flex-col gap-4">
                  {deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-sm text-slate-600 font-semibold">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                        {idx + 1}
                      </div>
                      <span className="pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Award size={18} className="text-indigo-500" />
                  Grading Criteria Rubric
                </h3>
                {assignment.evaluation_matrix && assignment.evaluation_matrix.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assignment.evaluation_matrix.map((criteria: any, cIdx: number) => (
                      <div key={cIdx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <span className="font-bold text-sm text-slate-800 block mb-1">{criteria.name}</span>
                        <span className="text-xs text-slate-500 font-medium">Marks: {criteria.marks}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="font-bold text-sm text-slate-800 block mb-1">Completeness (40%)</span>
                      <span className="text-xs text-slate-500 font-semibold">All deliverables are submitted and meet minimum specifications.</span>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="font-bold text-sm text-slate-800 block mb-1">Quality & Craft (60%)</span>
                      <span className="text-xs text-slate-500 font-semibold">The work demonstrates high engineering/design standards and attention to detail.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100">
                  Specifications
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Type</span>
                    <span className="font-bold text-slate-850 bg-slate-100 px-2.5 py-1 rounded-md capitalize">
                      {assignment.submission_type || "File submission"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Max Points</span>
                    <span className="font-bold text-slate-850 text-sm">
                      {assignment.max_score || "100"} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Status</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100">
      {/* visual distinction: Premium Learner Player Dark Header */}
      <header className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10 hover:scale-105"
            title="Back to Course Management"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 leading-none">Course Preview Player</h2>
            <h3 className="font-black text-lg leading-tight mt-1 max-w-xl truncate">{course.name}</h3>
          </div>
        </div>
      </header>

      {/* Main split pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <CourseViewSidebar 
          course={course}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />

        {/* Right Content details panel */}
        <main className="flex-1 overflow-y-auto p-8 max-w-5xl">
          {renderRightPanelContent()}
        </main>
      </div>
    </div>
  );
}

function StatsCardItem({ icon, label, value, colorClass }: { icon: React.ReactNode; label: string; value: number; colorClass: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", colorClass)}>
        {icon}
      </div>
      <div>
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">{label}</span>
        <span className="text-lg font-bold text-slate-800 leading-none block mt-0.5">{value}</span>
      </div>
    </div>
  );
}
