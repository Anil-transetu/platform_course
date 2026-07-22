"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
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
  Award,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useCourseCurriculum, useUpdateCourse, useCourseModuleDetail, useCourseLessonDetail, useCourseTopicDetail } from "@/features/admin/courses/api/course-api";
import { useQuiz } from "@/features/admin/quizzes/api/use-quizzes";
import { useAssignment } from "@/features/admin/assignments/api/use-assignments";
import { Skeleton } from "@/components/ui/skeleton";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { cn, getDisplayThumbnailUrl, getDisplayMediaUrl } from "@/lib/utils";
import { ContentBlocksRenderer } from "@/components/ui/ContentBlocksRenderer";
import { toast } from "sonner";

interface QuizItem {
  id: string | number;
  name?: string;
  quiz_title?: string;
  title?: string;
  instructions?: string;
  time_limit_minutes?: number;
  max_attempts?: number;
  total_marks?: number;
  passing_score?: number;
}

interface AssignmentItem {
  id: string | number;
  title?: string;
  name?: string;
  description?: string;
  submission_type?: string;
  submission_type_info?: string;
  max_score?: number | string;
  evaluation_matrix?: { name: string; marks: number | string }[];
}

interface TopicItem {
  id: string | number;
  name: string;
  duration_minutes?: number;
  video_url?: string;
  content_text?: string;
  content_blocks?: any[];
  lessons?: any[];
  topics?: any[];
}

interface LessonItem {
  id: string | number;
  name: string;
  content_text?: string;
  content?: string;
  text?: string;
  title?: string;
  images?: string[];
  videos?: string[];
  pdfs?: string[];
  urls?: string[];
  lessons?: TopicItem[];
  topics?: TopicItem[];
  quizzes?: QuizItem[];
  assignments?: AssignmentItem[];
  content_blocks?: any[];
}

interface ModuleItem {
  id: string | number;
  name: string;
  description?: string;
  topics?: LessonItem[];
  lessons?: LessonItem[];
  quizzes?: QuizItem[];
  assignments?: AssignmentItem[];
  content_blocks?: any[];
}

interface CourseDetailItem {
  id: string | number;
  name: string;
  thumbnail_url?: string;
  status?: string;
  description?: string;
  modules?: ModuleItem[];
  quizzes?: QuizItem[];
  assignments?: AssignmentItem[];
}

interface CourseDetailViewerProps {
  courseId: string | number;
  onBack: () => void;
  onEdit: () => void;
}

type ActiveItem = 
  | { type: "course"; id: string | number; data: CourseDetailItem }
  | { type: "module"; id: string | number; data: ModuleItem }
  | { type: "lesson"; id: string | number; data: LessonItem }
  | { type: "topic"; id: string | number; data: TopicItem }
  | { type: "quiz"; id: string | number; data: QuizItem }
  | { type: "assignment"; id: string | number; data: AssignmentItem };

export default function CourseDetailViewer({ courseId, onBack, onEdit }: CourseDetailViewerProps) {
  const { data: fetchedCourse, isLoading, error } = useCourseCurriculum(courseId);
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const activeModuleId = activeItem?.type === "module" ? activeItem.id : undefined;
  const activeLessonId = activeItem?.type === "lesson" ? activeItem.id : undefined;
  const activeTopicId = activeItem?.type === "topic" ? activeItem.id : undefined;
  const activeQuizId = activeItem?.type === "quiz" ? activeItem.id : undefined;
  const activeAssignmentId = activeItem?.type === "assignment" ? activeItem.id : undefined;

  const { data: moduleDetail, isLoading: isLoadingModule } = useCourseModuleDetail(courseId, activeModuleId, { enabled: !!activeModuleId });
  const { data: lessonDetail, isLoading: isLoadingLesson } = useCourseLessonDetail(courseId, activeLessonId, { enabled: !!activeLessonId });
  const { data: topicDetail, isLoading: isLoadingTopic } = useCourseTopicDetail(courseId, activeTopicId, { enabled: !!activeTopicId });
  const { data: quizDetail, isLoading: isLoadingQuiz } = useQuiz(activeQuizId ? String(activeQuizId) : "", { enabled: !!activeQuizId });
  const { data: assignmentDetail, isLoading: isLoadingAssignment } = useAssignment(activeAssignmentId ? String(activeAssignmentId) : undefined, { enabled: !!activeAssignmentId });

  const updateCourseMutation = useUpdateCourse();

  const handleStatusToggle = async (newStatus: 'active' | 'draft') => {
    if (updateCourseMutation.isPending) return;
    const isOffline = typeof window !== "undefined" && !navigator.onLine;
    if (isOffline) {
      toast.error("Network disconnected. Please check your connection.");
      return;
    }
    
    try {
      await updateCourseMutation.mutateAsync({
        id: courseId,
        data: { status: newStatus }
      });
      toast.success(newStatus === 'active' ? "Course published successfully!" : "Course reverted to draft successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update course status");
    }
  };

  useEffect(() => {
    if (fetchedCourse) {
      if (!activeItem) {
        setActiveItem({
          type: "course",
          id: fetchedCourse.id,
          data: fetchedCourse
        });
        return;
      }

      if (activeItem.type === "course") {
        setActiveItem({
          type: "course",
          id: fetchedCourse.id,
          data: fetchedCourse
        });
      } else if (activeItem.type === "module") {
        const found = fetchedCourse.modules?.find((m: any) => String(m.id) === String(activeItem.id));
        if (found) {
          setActiveItem({
            type: "module",
            id: found.id,
            data: found
          });
        }
      } else if (activeItem.type === "lesson") {
        let foundLesson: any = null;
        for (const m of fetchedCourse.modules || []) {
          const l = (m.lessons || m.topics || []).find((l: any) => String(l.id) === String(activeItem.id));
          if (l) {
            foundLesson = l;
            break;
          }
        }
        if (foundLesson) {
          setActiveItem({
            type: "lesson",
            id: foundLesson.id,
            data: foundLesson
          });
        }
      } else if (activeItem.type === "topic") {
        let foundTopic: any = null;
        for (const m of fetchedCourse.modules || []) {
          for (const l of m.lessons || m.topics || []) {
            const t = (l.topics || l.lessons || []).find((t: any) => String(t.id) === String(activeItem.id));
            if (t) {
              foundTopic = t;
              break;
            }
          }
          if (foundTopic) break;
        }
        if (foundTopic) {
          setActiveItem({
            type: "topic",
            id: foundTopic.id,
            data: foundTopic
          });
        }
      } else if (activeItem.type === "quiz") {
        let foundQuiz: any = fetchedCourse.quizzes?.find((q: any) => String(q.id) === String(activeItem.id));
        if (!foundQuiz) {
          for (const m of fetchedCourse.modules || []) {
            foundQuiz = m.quizzes?.find((q: any) => String(q.id) === String(activeItem.id));
            if (foundQuiz) break;
            for (const l of m.lessons || m.topics || []) {
              foundQuiz = l.quizzes?.find((q: any) => String(q.id) === String(activeItem.id));
              if (foundQuiz) break;
            }
            if (foundQuiz) break;
          }
        }
        if (foundQuiz) {
          setActiveItem({
            type: "quiz",
            id: foundQuiz.id,
            data: foundQuiz
          });
        }
      } else if (activeItem.type === "assignment") {
        let foundAssignment: any = fetchedCourse.assignments?.find((a: any) => String(a.id) === String(activeItem.id));
        if (!foundAssignment) {
          for (const m of fetchedCourse.modules || []) {
            foundAssignment = m.assignments?.find((a: any) => String(a.id) === String(activeItem.id));
            if (foundAssignment) break;
            for (const l of m.lessons || m.topics || []) {
              foundAssignment = l.assignments?.find((a: any) => String(a.id) === String(activeItem.id));
              if (foundAssignment) break;
            }
            if (foundAssignment) break;
          }
        }
        if (foundAssignment) {
          setActiveItem({
            type: "assignment",
            id: foundAssignment.id,
            data: foundAssignment
          });
        }
      }
    }
  }, [fetchedCourse]);

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
          <p className="text-gray-500">{(error as Error)?.message || "The course could not be found or fetched."}</p>
          <button onClick={onBack} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Dashboard
          </button>
        </div>
      </ListingScreenTemplate>
    );
  }

  const course = fetchedCourse;
  const modules: ModuleItem[] = course.modules || [];

  // Count stats
  const totalModules = modules.length;
  const totalLessons = modules.reduce((acc: number, m: ModuleItem) => acc + (m.lessons?.length || m.topics?.length || 0), 0);
  const totalTopics = modules.reduce((acc: number, m: ModuleItem) => 
    acc + ((m.lessons || m.topics || []).reduce((acc2: number, t: LessonItem) => acc2 + (t.topics?.length || t.lessons?.length || 0), 0) || 0), 0
  );

  const courseQuizzesCount = course.quizzes?.length || 0;
  const moduleQuizzesCount = modules.reduce((acc: number, m: ModuleItem) => acc + (m.quizzes?.length || 0), 0);
  const lessonQuizzesCount = modules.reduce((acc: number, m: ModuleItem) => 
    acc + ((m.lessons || m.topics || []).reduce((acc2: number, t: LessonItem) => acc2 + (t.quizzes?.length || 0), 0) || 0), 0
  );
  const totalQuizzes = courseQuizzesCount + moduleQuizzesCount + lessonQuizzesCount;

  const courseAssignmentsCount = course.assignments?.length || 0;
  const moduleAssignmentsCount = modules.reduce((acc: number, m: ModuleItem) => acc + (m.assignments?.length || 0), 0);
  const lessonAssignmentsCount = modules.reduce((acc: number, m: ModuleItem) => 
    acc + ((m.lessons || m.topics || []).reduce((acc2: number, t: LessonItem) => acc2 + (t.assignments?.length || 0), 0) || 0), 0
  );
  const totalAssignments = courseAssignmentsCount + moduleAssignmentsCount + lessonAssignmentsCount;

  const renderRightPanelContent = () => {
    if (!activeItem || activeItem.type === "course") {
      const contentBlocks = course.content_blocks ?? [];
      // Course Overview Content
      return (
        <div className="space-y-6">
          {/* COURSE HERO IMAGE BANNER */}
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl shadow-sm overflow-hidden relative min-h-[220px] flex flex-col justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={getDisplayThumbnailUrl(course.thumbnail_url) || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"} 
              alt={course.name} 
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
            
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
                {course.quizzes?.map((quiz: QuizItem, idx: number) => (
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
                {course.assignments?.map((assignment: AssignmentItem, idx: number) => (
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
                {modules.map((m: ModuleItem, idx: number) => (
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
      const moduleData = moduleDetail || activeItem.data;
      const contentBlocks = moduleData.content_blocks ?? [];
      if (isLoadingModule) {
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-semibold text-sm">Loading module details...</p>
          </div>
        );
      }
      return (
        <div className="space-y-6">
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-8 shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Module Details
            </span>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-foreground mt-4 mb-2">{moduleData.name}</h1>
            {moduleData.content_blocks && moduleData.content_blocks.length > 0 ? (
              <ContentBlocksRenderer blocks={moduleData.content_blocks} />
            ) : moduleData.description ? (
              <p className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: moduleData.description }} />
            ) : (
              <p className="text-sm text-slate-400 italic mt-2">No description provided.</p>
            )}
          </div>

          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Lessons inside Module</h3>
            {(!moduleData.lessons && !moduleData.topics) || (moduleData.lessons || moduleData.topics || []).length === 0 ? (
              <p className="text-sm text-gray-400 italic">No lessons in this module.</p>
            ) : (
              <div className="space-y-3">
                {(moduleData.lessons || moduleData.topics || []).map((t: LessonItem) => (
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
      const lessonData = lessonDetail || activeItem.data;
      const hasContentBlocks = Array.isArray(lessonData.content_blocks)
        ? lessonData.content_blocks.length > 0
        : Boolean(lessonData.content_blocks);
      const hasResourceLists = [lessonData.images, lessonData.videos, lessonData.pdfs, lessonData.urls]
        .some((resources) => Array.isArray(resources) && resources.length > 0);
      if (isLoadingLesson) {
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-semibold text-sm">Loading lesson details...</p>
          </div>
        );
      }
      return (
        <div className="space-y-6">
          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-8 shadow-sm">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Lesson Details
            </span>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-foreground mt-4 mb-2">{lessonData.name || lessonData.title}</h1>
            {hasContentBlocks ? (
              <ContentBlocksRenderer
                blocks={lessonData.content_blocks}
                images={lessonData.images}
                videos={lessonData.videos}
                pdfs={lessonData.pdfs}
                urls={lessonData.urls}
              />
            ) : lessonData.content_text || lessonData.content || lessonData.text ? (
              <div 
                className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed mt-4 border-t pt-4"
                dangerouslySetInnerHTML={{ __html: lessonData.content_text || lessonData.content || lessonData.text }}
              />
            ) : null}
            {!hasContentBlocks && hasResourceLists && (
              <ContentBlocksRenderer
                images={lessonData.images}
                videos={lessonData.videos}
                pdfs={lessonData.pdfs}
                urls={lessonData.urls}
              />
            )}
          </div>

          <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Lesson Topics</h3>
            {(!lessonData.lessons && !lessonData.topics) || (lessonData.topics || lessonData.lessons || []).length === 0 ? (
              <p className="text-sm text-gray-400 italic">No topics inside this lesson.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(lessonData.topics || lessonData.lessons || []).map((item: TopicItem) => (
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
      const topicData = topicDetail || activeItem.data;
      const contentBlocks = topicData.content_blocks ?? [];
      if (isLoadingTopic) {
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-semibold text-sm">Loading topic details...</p>
          </div>
        );
      }
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

          {topicData.content_blocks && topicData.content_blocks.length > 0 ? (
            <div className="bg-card border border-gray-100 dark:border-border/50 rounded-3xl p-8 shadow-sm">
              <ContentBlocksRenderer blocks={topicData.content_blocks} />
            </div>
          ) : (
            <>
              {topicData.video_url && (
                <div className="bg-slate-955 aspect-video rounded-3xl overflow-hidden relative shadow-md flex items-center justify-center text-white border border-slate-900">
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
                  <p className="text-sm text-slate-600 dark:text-muted-foreground leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: topicData.content_text }} />
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    if (activeItem.type === "quiz") {
      const quiz = quizDetail || activeItem.data;
      if (isLoadingQuiz) {
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-semibold text-sm">Loading quiz details...</p>
          </div>
        );
      }
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
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-border/50 bg-card">
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200 dark:border-border/70" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-muted-foreground">Output option A</span>
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
      const assignment = assignmentDetail || activeItem.data;
      if (isLoadingAssignment) {
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-semibold text-sm">Loading assignment details...</p>
          </div>
        );
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

      const deliverables = getDeliverables(assignment.submission_type);

      return (
        <div className="space-y-6 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/50 rounded-3xl p-8 shadow-sm flex flex-col gap-4">
                <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full uppercase tracking-wider w-fit">
                  Assignment Overview
                </span>
                <h1 className="text-2xl font-black text-slate-800 dark:text-foreground tracking-tight">
                  {assignment.title || assignment.name}
                </h1>
                
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-3">Project Instructions</h4>
                  <div 
                    className="text-sm text-slate-600 dark:text-muted-foreground leading-relaxed prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: assignment.description || "In this assignment, apply the concepts learned in this module to build a practical project. Follow the detailed requirements." }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/50 rounded-3xl p-8 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-foreground text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                  <ClipboardList size={18} className="text-indigo-500" />
                  Required Deliverables
                </h3>
                <ul className="flex flex-col gap-4">
                  {deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-sm text-slate-600 dark:text-muted-foreground font-semibold">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                        {idx + 1}
                      </div>
                      <span className="pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/50 rounded-3xl p-8 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-foreground text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Award size={18} className="text-indigo-500" />
                  Grading Criteria Rubric
                </h3>
                {assignment.evaluation_matrix && assignment.evaluation_matrix.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assignment.evaluation_matrix.map((criteria, cIdx: number) => (
                      <div key={cIdx} className="p-4 rounded-xl border border-gray-150 dark:border-border/50 bg-slate-50/50 dark:bg-muted/30">
                        <span className="font-bold text-sm text-foreground block mb-1">{criteria.name}</span>
                        <span className="text-xs text-gray-500 dark:text-muted-foreground">Marks: {criteria.marks}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-150 dark:border-border/50 bg-slate-50/50 dark:bg-muted/30">
                      <span className="font-bold text-sm text-foreground block mb-1">Completeness (40%)</span>
                      <span className="text-xs text-slate-500 dark:text-muted-foreground">All deliverables are submitted and meet minimum specifications.</span>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-150 dark:border-border/50 bg-slate-50/50 dark:bg-muted/30">
                      <span className="font-bold text-sm text-foreground block mb-1">Quality & Craft (60%)</span>
                      <span className="text-xs text-slate-555 dark:text-muted-foreground">The work demonstrates high engineering/design standards and attention to detail.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/50 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest pb-3 border-b border-slate-100">
                  Specifications
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-455 uppercase tracking-wider">Type</span>
                    <span className="font-bold text-slate-800 dark:text-foreground bg-slate-100 dark:bg-muted px-2.5 py-1 rounded-md capitalize">
                      {assignment.submission_type || "File submission"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-455 uppercase tracking-wider">Max Points</span>
                    <span className="font-bold text-slate-800 dark:text-foreground text-sm">
                      {assignment.max_score || "100.00"} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-455 uppercase tracking-wider">Status</span>
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
    <ListingScreenTemplate
      headerText="Course Player View"
      subHeaderText="Browse and preview the curriculum layout of this course"
      buttonRequired={false}
      buttonOnclick={() => {}}
      extraActions={
        <div className="flex gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-border/70 rounded-lg hover:bg-gray-50 dark:bg-muted/50 bg-white dark:bg-card transition-all text-gray-700 dark:text-foreground shadow-sm h-[38px]"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          {(() => {
            const currentStatus = course.status && (course.status.toLowerCase() === 'active' || course.status.toLowerCase() === 'published')
              ? 'active'
              : 'draft';
            return currentStatus === 'draft' ? (
              <button
                onClick={() => handleStatusToggle('active')}
                disabled={updateCourseMutation.isPending}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm h-[38px] min-w-[120px]"
              >
                {updateCourseMutation.isPending && updateCourseMutation.variables?.data.status === 'active' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : null}
                Publish Course
              </button>
            ) : (
              <button
                onClick={() => handleStatusToggle('draft')}
                disabled={updateCourseMutation.isPending}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm h-[38px] min-w-[140px]"
              >
                {updateCourseMutation.isPending && updateCourseMutation.variables?.data.status === 'draft' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                ) : null}
                Revert to Draft
              </button>
            );
          })()}
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm font-semibold h-[38px]"
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
                {course.quizzes?.map((q: QuizItem) => (
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
                {course.assignments?.map((a: AssignmentItem) => (
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
            {modules.map((m: ModuleItem, mIdx: number) => {
              const isModExpanded = !!expandedModules[String(m.id)];
              const isModActive = activeItem?.type === "module" && activeItem?.id === m.id;
              
              return (
                <div key={m.id} className="space-y-1">
                  {/* Module item trigger */}
                  <div 
                    onClick={() => {
                      setActiveItem({ type: "module", id: m.id, data: m });
                      toggleModule(String(m.id));
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
                      {m.quizzes?.map((q: QuizItem) => (
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
                      {m.assignments?.map((a: AssignmentItem) => (
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
                      {(m.lessons || m.topics || []).map((lesson: LessonItem) => {
                        const isLessActive = 
                          (activeItem?.type === "lesson" && activeItem?.id === lesson.id) ||
                          (activeItem?.type === "topic" && (lesson.topics || lesson.lessons || []).some(t => String(t.id) === String(activeItem.id))) ||
                          (activeItem?.type === "quiz" && lesson.quizzes?.some(q => String(q.id) === String(activeItem.id))) ||
                          (activeItem?.type === "assignment" && lesson.assignments?.some(a => String(a.id) === String(activeItem.id)));
                        
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
                                {(lesson.topics || lesson.lessons || []).map((t: TopicItem) => (
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
                                {lesson.quizzes?.map((q: QuizItem) => (
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
                                {lesson.assignments?.map((a: AssignmentItem) => (
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

const isEmbedUrl = (url: string) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
};

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

