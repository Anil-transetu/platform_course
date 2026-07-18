import React from "react";
import { CourseContent, ActiveSidebarItem, SidebarModule, SidebarLesson, Quiz, Assignment } from "@/types/student-course";
import { ViewerSkeleton } from "./skeleton";
import { EmptyState } from "./empty-state";
import { Clock, Play, Award, ClipboardList, HelpCircle, FileText, Target, Folder, Layers, BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCourseView } from "@/hooks/use-course-view";
import { useCourseHome } from "@/hooks/use-course-home";
import { useRouter, useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CourseViewerProps {
  courseId: string;
  activeItem: ActiveSidebarItem | null;
}

export function CourseViewer({ courseId, activeItem }: CourseViewerProps) {
  const { data: viewContent, isLoading: isViewLoading, error: viewError, refetch: refetchView } = useCourseView(
    courseId, 
    activeItem?.id && activeItem.type !== "course" ? String(activeItem.id) : null, 
    activeItem?.type !== "course" ? activeItem?.type || null : null
  );

  const { data: homeContent, isLoading: isHomeLoading, error: homeError, refetch: refetchHome } = useCourseHome(
    courseId,
    activeItem?.type === "course"
  );

  if (!activeItem) {
    return <EmptyState />;
  }

  if (activeItem.type === "course") {
    if (isHomeLoading) return <ViewerSkeleton />;
    if (homeError || !homeContent) return (
      <ErrorState onRetry={refetchHome} message="Failed to load Course Home dashboard." />
    );
    return <CourseOverview courseHome={homeContent} />;
  }

  if (isViewLoading) {
    return <ViewerSkeleton />;
  }

  if (viewError || !viewContent) {
    return <ErrorState onRetry={refetchView} message="Failed to load content." />;
  }

  if (activeItem.type === "module") {
    const module = activeItem.data as SidebarModule;
    return <ModuleOverview module={module} content={viewContent} />;
  }

  if (activeItem.type === "lesson") {
    const lesson = activeItem.data as SidebarLesson;
    return <LessonOverview lesson={lesson} content={viewContent} />;
  }

  if (activeItem.type === "topic") {
    return <TopicViewer content={viewContent} data={activeItem.data} />;
  }

  if (activeItem.type === "quiz") {
    return <QuizViewer content={viewContent} data={activeItem.data as Quiz} />;
  }

  if (activeItem.type === "assignment") {
    return <AssignmentViewer content={viewContent} data={activeItem.data as Assignment} />;
  }

  return <EmptyState title="Unsupported content type" description="This content type is not supported yet." />;
}

// ----------------------------------------------------
// UI Subcomponents
// ----------------------------------------------------

function ErrorState({ onRetry, message }: { onRetry: () => void, message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
      <Target className="text-destructive w-12 h-12 mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      <button 
        onClick={onRetry} 
        className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

function CourseOverview({ courseHome }: { courseHome: any }) {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const calculateOverallProgress = () => {
    if (courseHome.modules && courseHome.modules.total_count > 0) {
      return courseHome.modules.progress_percentage || 0;
    }
    return 0;
  };
  
  const overallProgress = calculateOverallProgress();
  const heroImage = courseHome.course_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-16">
      
      {/* HERO BANNER */}
      <div className="relative w-full h-[280px] rounded-xl overflow-hidden border bg-muted flex flex-col justify-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={heroImage} 
          alt={courseHome.course_name} 
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="relative p-8 w-full text-white">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-primary text-primary-foreground font-semibold border-none">
              Dashboard
            </Badge>
            {courseHome.tags?.map((tag: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-white border-white/30 backdrop-blur-sm">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {courseHome.course_name || "Untitled Course"}
          </h1>
          
          <p className="text-white/80 text-sm max-w-2xl mb-6">
            {courseHome.description || "Welcome to your course. Use the sidebar to navigate through your curriculum, track your progress, and complete your assessments."}
          </p>

          <div className="w-full max-w-md bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span>Overall Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-white/20" />
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS SECTION */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">
          Your Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="Modules" 
            icon={<Folder size={18} />} 
            stats={courseHome.modules} 
            onClick={() => router.push(`/student/courses/${courseId}/modules`)}
          />
          <StatCard 
            title="Lessons" 
            icon={<BookOpen size={18} />} 
            stats={courseHome.lessons} 
            onClick={() => router.push(`/student/courses/${courseId}/lessons`)}
          />
          <StatCard 
            title="Topics" 
            icon={<Layers size={18} />} 
            stats={courseHome.topics} 
            onClick={() => router.push(`/student/courses/${courseId}/topics`)}
          />
          <StatCard 
            title="Quizzes" 
            icon={<HelpCircle size={18} />} 
            stats={courseHome.quizzes} 
            onClick={() => router.push(`/student/courses/${courseId}/quizzes`)}
          />
          <StatCard 
            title="Assignments" 
            icon={<ClipboardList size={18} />} 
            stats={courseHome.assignments} 
            onClick={() => router.push(`/student/courses/${courseId}/assignments`)}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, icon, stats, onClick }: { title: string, icon: React.ReactNode, stats: any, onClick?: () => void }) {
  if (!stats) return null;
  const { completed_count, total_count, progress_percentage } = stats;

  return (
    <Card 
      className={cn("overflow-hidden transition-all duration-200", onClick && "cursor-pointer hover:shadow-md hover:border-primary/50")}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{completed_count}</span>
            <span className="text-sm text-muted-foreground">/ {total_count}</span>
          </div>
          <span className="text-sm font-medium text-foreground">{progress_percentage}%</span>
        </div>
        
        <Progress value={progress_percentage} className="h-1.5" />
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------
// Fallback Views for Modules and Lessons
// ----------------------------------------------------

function ModuleOverview({ module, content }: { module: SidebarModule; content?: CourseContent }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-16">
      <Card>
        <CardContent className="p-8">
          <Badge variant="outline" className="mb-4">Module Overview</Badge>
          <h1 className="text-2xl font-bold text-foreground mb-6">{content?.title || module.name}</h1>
          
          {content?.description && (
            <p className="text-muted-foreground mb-6">{content.description}</p>
          )}

          {module.progressPct !== undefined && (
            <div className="bg-muted p-4 rounded-lg border max-w-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Module Progress</span>
                <span className="font-bold text-primary">{module.progressPct}%</span>
              </div>
              <Progress value={module.progressPct} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LessonOverview({ lesson, content }: { lesson: SidebarLesson; content?: any }) {
  const duration = content?.duration_minutes || (lesson as any).duration_minutes;
  const videoUrl = content?.video_url || (lesson as any).video_url;
  const contentText = content?.content_text || (lesson as any).content_text;

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-16">
      <Card>
        <CardContent className="p-8">
          <Badge variant="outline" className="mb-4">Lesson Overview</Badge>
          <h1 className="text-2xl font-bold text-foreground mb-4">{content?.name || content?.title || lesson.name}</h1>
          
          {duration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 bg-muted w-fit px-3 py-1.5 rounded-md">
              <Clock size={14} /> {duration} minutes
            </div>
          )}
          
          {content?.description && (
            <p className="text-muted-foreground mb-6">{content.description}</p>
          )}

          {lesson.progressPct !== undefined && (
            <div className="bg-muted p-4 rounded-lg border max-w-sm mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Lesson Progress</span>
                <span className="font-bold text-primary">{lesson.progressPct}%</span>
              </div>
              <Progress value={lesson.progressPct} className="h-2" />
            </div>
          )}

          {videoUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                  <Play size={24} className="ml-1" />
                </div>
              </div>
            </div>
          )}

          {contentText && (
            <div className="mt-6 border-t pt-6">
              <h4 className="flex items-center gap-2 text-base font-semibold mb-4">
                <FileText size={18} /> Reading Material
              </h4>
              <div 
                className="text-sm text-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none" 
                dangerouslySetInnerHTML={{ __html: contentText }} 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ----------------------------------------------------
// Specific Viewers (Topics, Quizzes, Assignments)
// ----------------------------------------------------

function TopicViewer({ content, data }: { content: CourseContent; data: any }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-16">
      
      <div>
        <Badge variant="outline" className="mb-3">Topic Details</Badge>
        <h1 className="text-3xl font-bold text-foreground">{content.title || data.name}</h1>
        
        {(content.description || data.description) && (
          <p className="text-muted-foreground mt-4 mb-2">
            {content.description || data.description}
          </p>
        )}

        {data.duration_minutes && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 bg-muted w-fit px-3 py-1.5 rounded-md">
            <Clock size={14} /> {data.duration_minutes} minutes
          </div>
        )}
      </div>

      {(content.video_url || data.video_url) && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
              <Play size={24} className="ml-1" />
            </div>
          </div>
        </div>
      )}

      {(content.content_text || data.content_text) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText size={18} /> Reading Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="text-sm text-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: content.content_text || data.content_text || "" }} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QuizViewer({ content, data }: { content: CourseContent; data: Quiz }) {
  const timeLimit = data.time_limit_minutes || content.metadata?.time_limit_minutes;
  const maxAttempts = data.max_attempts || content.metadata?.max_attempts;
  const totalMarks = data.total_marks || content.metadata?.total_marks;
  const passingScore = data.passing_score || content.metadata?.passing_score;

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-16">
      <Card>
        <CardContent className="p-8 md:p-10">
          <Badge variant="secondary" className="mb-4">Quiz Assessment</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {content.title || data.name || data.quiz_title || data.title}
          </h1>
          <p className="text-muted-foreground mb-8">
            {content.description || data.instructions || "Carefully review the quiz rules below. Once started, the timer cannot be paused."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-muted rounded-lg border text-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Time Limit</span>
              <span className="text-lg font-bold text-foreground">{timeLimit ? `${timeLimit}m` : "20m"}</span>
            </div>
            <div className="p-4 bg-muted rounded-lg border text-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Attempts</span>
              <span className="text-lg font-bold text-foreground">{maxAttempts || "1"}</span>
            </div>
            <div className="p-4 bg-muted rounded-lg border text-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Total Points</span>
              <span className="text-lg font-bold text-foreground">{totalMarks || "10"}</span>
            </div>
            <div className="p-4 bg-muted rounded-lg border text-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Pass Score</span>
              <span className="text-lg font-bold text-foreground">{passingScore ? `${passingScore}%` : "70%"}</span>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
              Start Assessment <ArrowRight size={16} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssignmentViewer({ content, data }: { content: CourseContent; data: Assignment }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-16">
      <Card>
        <CardContent className="p-8 md:p-10">
          <Badge variant="secondary" className="mb-4">Assignment</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {content.title || data.title || data.name}
          </h1>
          
          <div className="bg-muted rounded-lg p-6 mb-8 border">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ClipboardList size={16} /> Project Instructions
            </h4>
            <div 
              className="text-sm text-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content.content_text || data.description || "Follow the detailed requirements to complete this assignment." }}
            />
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
              Begin Submission <ArrowRight size={16} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
