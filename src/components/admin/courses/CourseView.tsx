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
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  Paperclip,
  UploadCloud,
  Menu,
  X
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
  isFinal?: boolean;
};

export default function CourseView({ course, onBack }: CourseViewProps) {
  const [activeItem, setActiveItem] = useState<ActiveItem | null>({
    type: "course",
    id: course.id,
    data: course
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const modules = course.modules || [];

  const renderRightPanelContent = () => {
    if (!activeItem || activeItem.type === "course") {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* COURSE HERO BANNER */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
            <div className="relative h-[280px] w-full bg-slate-900">
              {course.thumbnail_url ? (
                <>
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900 opacity-90" />
              )}
              
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-white">
                    {course.category?.name || "General"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/80 backdrop-blur-md text-white border border-blue-400/50">
                    {course.status || "DRAFT"}
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                  {course.name || "Untitled Course"}
                </h1>
                {course.description && (
                  <p className="text-slate-200 text-sm max-w-3xl leading-relaxed font-medium">
                    {course.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-white p-6 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-slate-100">
              <div className="px-4 text-center">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Modules</div>
                <div className="text-2xl font-bold text-slate-800">{modules.length}</div>
              </div>
              <div className="px-4 text-center">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Lessons</div>
                <div className="text-2xl font-bold text-slate-800">
                  {modules.reduce((acc: number, m: any) => acc + (m.topics?.length || m.lessons?.length || 0), 0)}
                </div>
              </div>
              <div className="px-4 text-center">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Assessments</div>
                <div className="text-2xl font-bold text-slate-800">
                  {course.quizzes?.length + course.assignments?.length + 
                   modules.reduce((acc: number, m: any) => acc + (m.quizzes?.length || 0) + (m.assignments?.length || 0), 0) || 0}
                </div>
              </div>
              <div className="px-4 text-center">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Duration</div>
                <div className="text-2xl font-bold text-slate-800">Self-Paced</div>
              </div>
            </div>
          </div>

          {/* CURRICULUM OVERVIEW */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="text-blue-500" size={20} />
              Curriculum Overview
            </h3>
            {modules.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <Folder className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-slate-500">No modules have been added to this course yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((m: any, idx: number) => (
                  <div 
                    key={m.id}
                    onClick={() => setActiveItem({ type: "module", id: m.id, data: m })}
                    className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{m.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {(m.topics || m.lessons || []).length} Lessons • {(m.quizzes || []).length} Quizzes
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
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
      const lessonsArray = moduleData.topics || moduleData.lessons || [];

      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -mr-16 -mt-16 z-0" />
            <div className="relative z-10">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 block">
                Module Overview
              </span>
              <h1 className="text-3xl font-extrabold text-slate-800 mb-4">{moduleData.name}</h1>
              {moduleData.description ? (
                <div className="text-slate-600 leading-relaxed max-w-3xl prose prose-slate" dangerouslySetInnerHTML={{ __html: moduleData.description }} />
              ) : (
                <p className="text-slate-500 italic">No description provided for this module.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="text-blue-500" size={20} />
              Lessons in this Module
            </h3>
            {lessonsArray.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <Book className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-slate-500">No lessons have been added to this module yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessonsArray.map((lesson: any, idx: number) => (
                  <div 
                    key={lesson.id}
                    onClick={() => setActiveItem({ type: "lesson", id: lesson.id, data: lesson })}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-medium group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-slate-900">{lesson.name || lesson.title}</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 block">
              Lesson
            </span>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-6">{lessonData.name || lessonData.title}</h1>
            {lessonData.content_text && (
              <div 
                className="text-slate-600 leading-relaxed prose prose-slate max-w-none pt-6 border-t border-slate-100"
                dangerouslySetInnerHTML={{ __html: lessonData.content_text }}
              />
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PlayCircle className="text-indigo-500" size={20} />
              Related Topics
            </h3>
            {subtopics.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <Target className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-slate-500">No topics added to this lesson.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subtopics.map((item: any, idx: number) => (
                  <div 
                    key={item.id}
                    onClick={() => setActiveItem({ type: "topic", id: item.id, data: item })}
                    className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all flex flex-col gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <PlayCircle className="text-slate-400 group-hover:text-indigo-500 shrink-0 mt-0.5 transition-colors" size={20} />
                      <div>
                        <span className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors block leading-tight">{item.name || item.title}</span>
                        {item.duration_minutes && (
                          <span className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
                            <Clock size={12} /> {item.duration_minutes} mins
                          </span>
                        )}
                      </div>
                    </div>
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
          <div className="mb-2">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 block">
              Topic
            </span>
            <h1 className="text-3xl font-extrabold text-slate-800">{topicData.name || topicData.title}</h1>
            {topicData.duration_minutes && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mt-3">
                <Clock size={16} /> {topicData.duration_minutes} minutes
              </div>
            )}
          </div>

          {topicData.video_url && (
            <div className="bg-slate-900 aspect-video rounded-2xl overflow-hidden relative shadow-lg group">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40 hover:bg-black/50 transition-colors backdrop-blur-[2px]">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 cursor-pointer">
                  <Play size={36} className="text-white fill-white ml-2" />
                </div>
                <h4 className="font-bold text-lg text-white mt-6 max-w-md text-center">{topicData.name || topicData.title} Video</h4>
                <p className="text-sm text-slate-300 mt-2 max-w-sm text-center truncate">{topicData.video_url}</p>
              </div>
            </div>
          )}

          {displayContent && (
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200 mt-8">
              <div 
                className="text-slate-700 leading-relaxed prose prose-slate prose-headings:text-slate-800 prose-a:text-blue-600 max-w-none" 
                dangerouslySetInnerHTML={{ __html: displayContent }} 
              />
            </div>
          )}
          
          {/* Notes section placeholder */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mt-6">
            <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
              <FileText size={18} className="text-slate-400" /> My Notes
            </h4>
            <p className="text-sm text-slate-500 italic">Click here to add private notes for this topic...</p>
          </div>
        </div>
      );
    }

    if (activeItem.type === "quiz") {
      const quiz = activeItem.data;
      return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <HelpCircle size={20} className="text-green-600" />
              </span>
              <span className="text-sm font-bold text-green-600 uppercase tracking-wider">Quiz Assessment</span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-800 mb-4">{quiz.name || quiz.quiz_title || quiz.title}</h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              {quiz.instructions || "Please complete the following assessment to verify your understanding. Read each question carefully."}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Time Limit</span>
                <span className="text-lg font-bold text-slate-800 flex items-center gap-1">
                  <Clock size={16} className="text-slate-400" />
                  {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} mins` : "20 mins"}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Questions</span>
                <span className="text-lg font-bold text-slate-800">10</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Passing Score</span>
                <span className="text-lg font-bold text-slate-800">{quiz.passing_score ? `${quiz.passing_score}%` : "70%"}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Max Attempts</span>
                <span className="text-lg font-bold text-slate-800">{quiz.max_attempts || "1"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="font-bold text-slate-700">Question 1 of 10</span>
              <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">1 Points</span>
            </div>
            
            <div className="p-8 md:p-10">
              <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
                Which of the following describes the correct output behavior for the configured environment?
              </h3>
              
              <div className="space-y-4">
                {["Option A represents the primary behavior", "Option B is an alternative", "Option C is incorrect", "Option D throws an exception"].map((opt, i) => (
                  <label key={i} className="flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all group">
                    <div className="mt-0.5 relative flex items-center justify-center">
                      <input type="radio" name="q1" className="w-5 h-5 border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </div>
                    <span className="text-slate-700 font-medium group-hover:text-slate-900">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sticky Footer Actions */}
          <div className="fixed bottom-0 right-0 left-[320px] p-6 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-between items-center z-20">
            <button className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              Previous
            </button>
            <div className="flex gap-4">
              <button className="px-6 py-3 rounded-xl font-bold text-blue-600 hover:bg-blue-50 transition-colors border border-blue-200">
                Next Question
              </button>
              <button className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all">
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem.type === "assignment") {
      const assignment = activeItem.data;
      const isFinal = activeItem.isFinal;
      
      if (isFinal) {
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-10 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-bl-full -mr-16 -mt-16 z-0" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-tr-full -ml-10 -mb-10 z-0 blur-xl" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 shadow-lg">
                  <Award size={40} className="text-yellow-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Course Final Assignment</h1>
                <p className="text-indigo-100 text-lg max-w-2xl font-medium leading-relaxed">
                  {assignment.title || assignment.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">Assignment Brief</h3>
                  <div 
                    className="text-slate-600 leading-relaxed prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: assignment.description || "Complete this final project to demonstrate mastery of the course material. Follow all specifications closely." }}
                  />
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <UploadCloud className="text-blue-500" size={20} />
                    Submit Your Work
                  </h3>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Paperclip size={24} className="text-blue-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">Upload Submission Files</h4>
                    <p className="text-sm text-slate-500 mb-6">Drag and drop your files here, or click to browse</p>
                    <button className="px-6 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 shadow-sm hover:border-slate-400">
                      Select Files
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4">Course Completion Requirements</h3>
                  <div className="space-y-3">
                    {modules.map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        <span>Module {i + 1} Completed</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-400 mt-4 pt-4 border-t border-slate-100">
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300 shrink-0" />
                      <span>Final Assignment Pending</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Details</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Max Score</span>
                      <span className="font-bold text-slate-800">{assignment.max_score || 100} Points</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Submission Type</span>
                      <span className="font-bold text-slate-800 capitalize">{assignment.submission_type || "File Upload"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ClipboardList size={20} className="text-blue-600" />
              </span>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Assignment</span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-800 mb-6">
              {assignment.title || assignment.name}
            </h1>
            
            <div className="flex gap-6 mb-8 pb-8 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Points</span>
                <span className="font-bold text-slate-700">{assignment.max_score || 100}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Type</span>
                <span className="font-bold text-slate-700 capitalize">{assignment.submission_type || "File Upload"}</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Instructions</h3>
              <div 
                className="text-slate-600 leading-relaxed prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: assignment.description || "Follow the instructions below to complete this assignment." }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <UploadCloud className="text-blue-500" size={20} />
              Your Submission
            </h3>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Paperclip size={24} className="text-blue-500" />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Upload files for submission</h4>
              <p className="text-sm text-slate-500 mb-6">Supported formats: PDF, ZIP, MP4 (Max 50MB)</p>
              <button className="px-6 py-2.5 bg-blue-600 rounded-xl font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
                Select Files
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-4 md:px-6 py-4 bg-white border-b border-slate-200 shadow-sm shrink-0 z-40 relative">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            title="Open Menu"
          >
            <Menu size={18} />
          </button>
          <button 
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            title="Exit Course View"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-8 w-[1px] bg-slate-200 mx-1 md:mx-2" />
          <div className="min-w-0">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1 hidden sm:block">Previewing</h2>
            <h3 className="font-bold text-slate-800 leading-tight max-w-[150px] sm:max-w-xl truncate">{course.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="px-2 sm:px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-bold border border-blue-100">
            Learner View
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar wrapper with responsive classes */}
        <div className={cn(
          "absolute inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 h-full",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Close button for mobile inside the sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md border border-slate-200 text-slate-500 hover:text-slate-800 md:hidden z-[60]"
          >
            <X size={16} />
          </button>
          
          <CourseViewSidebar 
            course={course}
            activeItem={activeItem}
            setActiveItem={(item) => {
              setActiveItem(item);
              setIsSidebarOpen(false); // Close sidebar on mobile when item selected
            }}
          />
        </div>
        
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6 md:p-8 lg:p-10 relative scroll-smooth w-full">
          {renderRightPanelContent()}
        </main>
      </div>
    </div>
  );
}
