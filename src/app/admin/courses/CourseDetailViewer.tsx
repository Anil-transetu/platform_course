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
  ChevronDown, 
  Pencil,
  Clock,
  Play,
  CheckCircle,
  Video,
  ExternalLink,
  Award
} from "lucide-react";
import { useCourse } from "@/features/admin/courses/api/course-api";
import { Skeleton } from "@/components/ui/skeleton";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { cn } from "@/lib/utils";

interface CourseDetailViewerProps {
  courseId: string | number;
  onBack: () => void;
  onEdit: () => void;
}

type ActiveItem = {
  type: "course" | "module" | "lesson" | "topic" | "quiz" | "assignment";
  id: string | number;
  data: any;
};

export default function CourseDetailViewer({ courseId, onBack, onEdit }: CourseDetailViewerProps) {
  const { data: fetchedCourse, isLoading, error } = useCourse(courseId);
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <ListingScreenTemplate
        headerText="Course Structure View"
        subHeaderText="Loading curriculum..."
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
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </ListingScreenTemplate>
    );
  }

  if (error || !fetchedCourse) {
    return (
      <ListingScreenTemplate
        headerText="Course Structure View"
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
          <h2 className="text-xl font-bold text-red-600">Failed to load course details</h2>
          <p className="text-gray-500">{(error as any)?.message || "The course could not be found or fetched."}</p>
          <button onClick={onBack} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Dashboard
          </button>
        </div>
      </ListingScreenTemplate>
    );
  }

  const course = fetchedCourse;
  const modules = course.modules || [];

  // Count stats
  const totalModules = modules.length;
  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.topics?.length || 0), 0);
  const totalTopics = modules.reduce((acc: number, m: any) => 
    acc + (m.topics?.reduce((acc2: number, t: any) => acc2 + (t.lessons?.length || 0), 0) || 0), 0
  );

  const courseQuizzesCount = course.quizzes?.length || 0;
  const moduleQuizzesCount = modules.reduce((acc: number, m: any) => acc + (m.quizzes?.length || 0), 0);
  const lessonQuizzesCount = modules.reduce((acc: number, m: any) => 
    acc + (m.topics?.reduce((acc2: number, t: any) => acc2 + (t.quizzes?.length || 0), 0) || 0), 0
  );
  const totalQuizzes = courseQuizzesCount + moduleQuizzesCount + lessonQuizzesCount;

  const courseAssignmentsCount = course.assignments?.length || 0;
  const moduleAssignmentsCount = modules.reduce((acc: number, m: any) => acc + (m.assignments?.length || 0), 0);
  const lessonAssignmentsCount = modules.reduce((acc: number, m: any) => 
    acc + (m.topics?.reduce((acc2: number, t: any) => acc2 + (t.assignments?.length || 0), 0) || 0), 0
  );
  const totalAssignments = courseAssignmentsCount + moduleAssignmentsCount + lessonAssignmentsCount;

  const renderRightPanelContent = () => {
    if (!activeItem || activeItem.type === "course") {
      // Course Overview Content
      return (
        <div className="space-y-6">
          {/* COURSE HERO IMAGE BANNER */}
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl shadow-sm overflow-hidden relative min-h-[220px] flex flex-col justify-end">
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
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/20",
                  course.status === "published" || course.status === "Published"
                    ? "bg-green-500/80" 
                    : "bg-orange-500/80"
                )}>
                  {course.status ? course.status.toUpperCase() : "DRAFT"}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight drop-shadow-sm">
                {course.name || "Untitled Course"}
              </h1>
              <p className="text-blue-50/95 text-xs max-w-3xl leading-relaxed mt-2 drop-shadow-sm font-medium">
                {course.description || "No description provided for this course. Add course details using the Course Builder edit button."}
              </p>
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

          {/* COURSE-LEVEL ASSESSMENTS */}
          {(courseQuizzesCount > 0 || courseAssignmentsCount > 0) && (
            <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Course-Level Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.quizzes?.map((quiz: any, idx: number) => (
                  <div 
                    key={quiz.id || idx}
                    onClick={() => setActiveItem({ type: "quiz", id: quiz.id, data: quiz })}
                    className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-gray-100/50 dark:border-border hover:bg-blue-50/20 hover:border-blue-100 cursor-pointer transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      <HelpCircle size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block font-medium">Quiz {idx + 1}</span>
                      <span className="text-sm font-bold text-foreground truncate block">{quiz.name || "Selected Quiz"}</span>
                    </div>
                  </div>
                ))}
                {course.assignments?.map((assignment: any, idx: number) => (
                  <div 
                    key={assignment.id || idx}
                    onClick={() => setActiveItem({ type: "assignment", id: assignment.id, data: assignment })}
                    className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-gray-100/50 dark:border-border hover:bg-blue-50/20 hover:border-blue-100 cursor-pointer transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                      <ClipboardList size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block font-medium">Assignment {idx + 1}</span>
                      <span className="text-sm font-bold text-foreground truncate block">{assignment.title || assignment.name || "Selected Assignment"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CURRICULUM PREVIEW */}
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Curriculum Outline</h3>
            {modules.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No modules added to this course.</p>
            ) : (
              <div className="space-y-3">
                {modules.map((m: any, idx: number) => (
                  <div 
                    key={m.id}
                    onClick={() => setActiveItem({ type: "module", id: m.id, data: m })}
                    className="flex items-center justify-between p-4 bg-muted/20 border border-gray-100/50 dark:border-border/20 rounded-xl hover:bg-blue-50/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-foreground">{m.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
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
      return (
        <div className="space-y-6">
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-8 shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Module Details
            </span>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-foreground mt-4 mb-2">{moduleData.name}</h1>
            <p className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: moduleData.description || "No description provided." }} />
          </div>

          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Lessons inside Module</h3>
            {(!moduleData.topics || moduleData.topics.length === 0) ? (
              <p className="text-sm text-gray-400 italic">No lessons in this module.</p>
            ) : (
              <div className="space-y-3">
                {moduleData.topics.map((t: any, idx: number) => (
                  <div 
                    key={t.id}
                    onClick={() => setActiveItem({ type: "lesson", id: t.id, data: t })}
                    className="flex items-center justify-between p-4 bg-muted/20 border border-gray-100/50 dark:border-border/20 rounded-xl hover:bg-blue-50/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-indigo-400" size={16} />
                      <span className="text-sm font-bold text-slate-700 dark:text-foreground">{t.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
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
      return (
        <div className="space-y-6">
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-8 shadow-sm">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Lesson Details
            </span>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-foreground mt-4 mb-2">{lessonData.name}</h1>
            {lessonData.content_text && (
              <div 
                className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed mt-4 border-t pt-4"
                dangerouslySetInnerHTML={{ __html: lessonData.content_text }}
              />
            )}
          </div>

          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Lesson Topics</h3>
            {(!lessonData.lessons || lessonData.lessons.length === 0) ? (
              <p className="text-sm text-gray-400 italic">No topics inside this lesson.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessonData.lessons.map((item: any) => (
                  <div 
                    key={item.id}
                    onClick={() => setActiveItem({ type: "topic", id: item.id, data: item })}
                    className="p-4 bg-muted/20 border border-gray-100/50 dark:border-border/20 rounded-xl hover:bg-blue-50/10 cursor-pointer transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="text-purple-400" size={16} />
                      <span className="text-sm font-bold text-slate-700 dark:text-foreground">{item.name}</span>
                    </div>
                    {item.duration_minutes && (
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
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
      return (
        <div className="space-y-6">
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-8 shadow-sm">
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Topic Details
            </span>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-foreground mt-4 mb-2">{topicData.name}</h1>
            {topicData.duration_minutes && (
              <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold mt-1">
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
                <h4 className="font-bold text-base mt-4 max-w-md text-center truncate">{topicData.name} Video Player</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center truncate">{topicData.video_url}</p>
              </div>
            </div>
          )}

          {topicData.content_text && (
            <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-8 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-3">Topic Notes</h3>
              <p className="text-sm text-slate-600 dark:text-muted-foreground leading-relaxed leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: topicData.content_text }} />
            </div>
          )}
        </div>
      );
    }

    if (activeItem.type === "quiz") {
      const quiz = activeItem.data;
      return (
        <div className="space-y-6">
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 tracking-wider uppercase mb-4 py-1 px-3 bg-green-50 rounded-full w-fit">
              <Award size={14} />
              Quiz Assessment
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-foreground tracking-tight mb-2">{quiz.name || quiz.quiz_title || quiz.title}</h1>
            <p className="text-gray-400 text-sm max-w-xl leading-relaxed mt-2 font-medium">
              {quiz.instructions || "This assessment is designed to verify the student's learning progress and comprehension of this curriculum unit."}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-50/50">
              <div className="p-4 bg-muted/40 rounded-2xl text-center border border-gray-100/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Time Limit</span>
                <span className="text-sm font-bold text-foreground">{quiz.time_limit_minutes ? `${quiz.time_limit_minutes} mins` : "20 mins"}</span>
              </div>
              <div className="p-4 bg-muted/40 rounded-2xl text-center border border-gray-100/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Max Attempts</span>
                <span className="text-sm font-bold text-foreground">{quiz.max_attempts || "1 attempt"}</span>
              </div>
              <div className="p-4 bg-muted/40 rounded-2xl text-center border border-gray-100/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Total Marks</span>
                <span className="text-sm font-bold text-foreground">{quiz.total_marks ? `${quiz.total_marks} pts` : "10 pts"}</span>
              </div>
              <div className="p-4 bg-muted/40 rounded-2xl text-center border border-gray-100/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Passing Score</span>
                <span className="text-sm font-bold text-foreground">{quiz.passing_score ? `${quiz.passing_score}%` : "70%"}</span>
              </div>
            </div>
          </div>

          {/* SAMPLE QUESTIONS PREVIEW */}
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 bg-muted/30">
              <h3 className="font-bold text-gray-700 dark:text-foreground flex items-center gap-2 text-sm uppercase tracking-wider">
                <HelpCircle size={18} className="text-green-500" />
                Sample Questions Preview
              </h3>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div className="p-6 border border-gray-100 dark:border-border/50 rounded-2xl">
                <h4 className="font-bold text-foreground mb-4 text-sm">1. Identify the correct output of the following statement.</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-blue-500 bg-blue-50/50">
                    <CheckCircle size={18} className="text-blue-500" />
                    <span className="text-xs font-semibold text-blue-900">Output option A</span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-border/50 bg-card">
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200 dark:border-border/70" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-muted-foreground">Output option B</span>
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
      return (
        <div className="space-y-6">
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-8 shadow-sm">
            <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Assignment details
            </span>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-foreground mt-4 mb-2">{assignment.title || assignment.name}</h1>
            <div 
              className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed mt-4 border-t pt-4"
              dangerouslySetInnerHTML={{ __html: assignment.description || "In this assignment, apply the concepts learned in this module to build a practical project. Follow the detailed requirements." }}
            />
          </div>

          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-3">Assignment Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Submission Type</span>
                <span className="text-sm font-bold text-slate-800 dark:text-foreground capitalize">{assignment.submission_type || "File upload (.zip / .pdf)"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Maximum Score</span>
                <span className="text-sm font-bold text-slate-800 dark:text-foreground">{assignment.max_score || "100.00"} marks</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <ListingScreenTemplate
      headerText="Course Player View"
      subHeaderText="Browse and preview the curriculum layout of this course"
      buttonRequired={false}
      buttonOnclick={() => {}}
      extraActions={
        <div className="flex gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-border/70 rounded-lg hover:bg-gray-50 dark:bg-muted/50 bg-white dark:bg-card transition-all text-gray-700 dark:text-foreground shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            <Pencil size={16} /> Edit Course
          </button>
        </div>
      }
    >
      <div className="flex-1 flex overflow-hidden h-screen bg-slate-50/50">
        {/* LEFT SIDEBAR: Course Structure */}
        <aside className="w-[320px] border-r border-gray-200/80 bg-white flex flex-col shrink-0 overflow-y-auto">
          {/* Sidebar Header */}
          <div 
            onClick={() => setActiveItem({ type: "course", id: course.id, data: course })}
            className={cn(
              "p-6 border-b border-gray-100 cursor-pointer hover:bg-slate-50 transition-colors group",
              (!activeItem || activeItem.type === "course") && "bg-blue-50/30"
            )}
          >
            <h2 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Course Structure</h2>
            <h3 className="font-bold text-sm text-slate-800 mt-2 truncate group-hover:text-blue-600 transition-colors">
              {course.name}
            </h3>
          </div>

          {/* Curriculum tree */}
          <div className="flex-grow p-4 space-y-3">
            {/* Course-level Quizzes / Assignments */}
            {((course.quizzes && course.quizzes.length > 0) || (course.assignments && course.assignments.length > 0)) && (
              <div className="space-y-1.5 border-b pb-3 mb-2 pl-2">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Course Content</span>
                {course.quizzes?.map((q: any) => (
                  <button 
                    key={q.id}
                    onClick={() => setActiveItem({ type: "quiz", id: q.id, data: q })}
                    className={cn(
                      "w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-colors",
                      activeItem?.type === "quiz" && activeItem?.id === q.id 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <HelpCircle size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate">{q.name || "Course Quiz"}</span>
                  </button>
                ))}
                {course.assignments?.map((a: any) => (
                  <button 
                    key={a.id}
                    onClick={() => setActiveItem({ type: "assignment", id: a.id, data: a })}
                    className={cn(
                      "w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-colors",
                      activeItem?.type === "assignment" && activeItem?.id === a.id 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <ClipboardList size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate">{a.title || a.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Modules List */}
            {modules.map((m: any, mIdx: number) => {
              const isModExpanded = !!expandedModules[m.id];
              const isModActive = activeItem?.type === "module" && activeItem?.id === m.id;
              
              return (
                <div key={m.id} className="space-y-1">
                  {/* Module item trigger */}
                  <div 
                    onClick={() => {
                      setActiveItem({ type: "module", id: m.id, data: m });
                      toggleModule(m.id);
                    }}
                    className={cn(
                      "w-full p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between group",
                      isModActive && "bg-blue-50/40"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {mIdx + 1}
                      </span>
                      <span className={cn(
                        "text-xs font-bold truncate tracking-wide text-slate-700 uppercase",
                        isModActive && "text-blue-600"
                      )}>
                        {m.name}
                      </span>
                    </div>
                    {isModExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                  </div>

                  {/* Module contents (expanded) */}
                  {isModExpanded && (
                    <div className="pl-4 border-l border-gray-100/80 ml-5 py-1 space-y-1">
                      {/* Module quizzes and assignments */}
                      {m.quizzes?.map((q: any) => (
                        <button
                          key={q.id}
                          onClick={() => setActiveItem({ type: "quiz", id: q.id, data: q })}
                          className={cn(
                            "w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-colors",
                            activeItem?.type === "quiz" && activeItem?.id === q.id 
                              ? "bg-blue-50 text-blue-600" 
                              : "text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <HelpCircle size={14} className="shrink-0 text-slate-400" />
                          <span className="truncate">{q.name || "Module Quiz"}</span>
                        </button>
                      ))}
                      {m.assignments?.map((a: any) => (
                        <button
                          key={a.id}
                          onClick={() => setActiveItem({ type: "assignment", id: a.id, data: a })}
                          className={cn(
                            "w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-colors",
                            activeItem?.type === "assignment" && activeItem?.id === a.id 
                              ? "bg-blue-50 text-blue-600" 
                              : "text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <ClipboardList size={14} className="shrink-0 text-slate-400" />
                          <span className="truncate">{a.title || a.name}</span>
                        </button>
                      ))}

                      {/* Lessons (topics in API) */}
                      {m.topics?.map((lesson: any, lIdx: number) => {
                        const isLessActive = activeItem?.type === "lesson" && activeItem?.id === lesson.id;
                        
                        return (
                          <div key={lesson.id} className="space-y-1">
                            <button
                              onClick={() => setActiveItem({ type: "lesson", id: lesson.id, data: lesson })}
                              className={cn(
                                "w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-colors",
                                isLessActive ? "bg-indigo-50/50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              <FileText size={14} className="shrink-0 text-slate-400" />
                              <span className="truncate">{lesson.name}</span>
                            </button>

                            {/* Lesson topics/quizzes/assignments (lessons inside topic in API) */}
                            {isLessActive && (
                              <div className="pl-4 border-l border-gray-100 ml-4 py-1 space-y-1">
                                {lesson.lessons?.map((t: any) => (
                                  <button
                                    key={t.id}
                                    onClick={() => setActiveItem({ type: "topic", id: t.id, data: t })}
                                    className={cn(
                                      "w-full px-3 py-2 rounded-xl text-left text-[11px] font-semibold flex items-center gap-2 transition-colors",
                                      activeItem?.type === "topic" && activeItem?.id === t.id 
                                        ? "bg-purple-50 text-purple-600" 
                                        : "text-slate-500 hover:bg-slate-50"
                                    )}
                                  >
                                    <Target size={12} className="shrink-0 text-slate-400" />
                                    <span className="truncate">{t.name}</span>
                                  </button>
                                ))}
                                {lesson.quizzes?.map((q: any) => (
                                  <button
                                    key={q.id}
                                    onClick={() => setActiveItem({ type: "quiz", id: q.id, data: q })}
                                    className={cn(
                                      "w-full px-3 py-2 rounded-xl text-left text-[11px] font-semibold flex items-center gap-2 transition-colors",
                                      activeItem?.type === "quiz" && activeItem?.id === q.id 
                                        ? "bg-green-50 text-green-600" 
                                        : "text-slate-500 hover:bg-slate-50"
                                    )}
                                  >
                                    <HelpCircle size={12} className="shrink-0 text-slate-400" />
                                    <span className="truncate">{q.name || "Lesson Quiz"}</span>
                                  </button>
                                ))}
                                {lesson.assignments?.map((a: any) => (
                                  <button
                                    key={a.id}
                                    onClick={() => setActiveItem({ type: "assignment", id: a.id, data: a })}
                                    className={cn(
                                      "w-full px-3 py-2 rounded-xl text-left text-[11px] font-semibold flex items-center gap-2 transition-colors",
                                      activeItem?.type === "assignment" && activeItem?.id === a.id 
                                        ? "bg-pink-50 text-pink-600" 
                                        : "text-slate-500 hover:bg-slate-50"
                                    )}
                                  >
                                    <ClipboardList size={12} className="shrink-0 text-slate-400" />
                                    <span className="truncate">{a.title || a.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-4xl mx-auto">
            {renderRightPanelContent()}
          </div>
        </main>
      </div>
    </ListingScreenTemplate>
  );
}

function StatsCardItem({ icon, label, value, colorClass }: { icon: React.ReactNode; label: string; value: number; colorClass: string }) {
  return (
    <div className="bg-card border border-gray-100 dark:border-border/50 p-5 rounded-2xl shadow-xs flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner", colorClass)}>
        {icon}
      </div>
      <div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{label}</span>
        <span className="text-xl font-bold text-foreground leading-none mt-1 block">{value}</span>
      </div>
    </div>
  );
}
