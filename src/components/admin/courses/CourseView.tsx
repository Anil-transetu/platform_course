"use client";

import React, { useState, useEffect } from "react";
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
  X,
  Loader2
} from "lucide-react";
import CourseViewSidebar from "./CourseViewSidebar";
import { cn, getDisplayThumbnailUrl, getDisplayMediaUrl, openPdf } from "@/lib/utils";
import { ContentBlocksRenderer } from "@/components/ui/ContentBlocksRenderer";
import { useUpdateCourse, useCourseModuleDetail, useCourseLessonDetail, useCourseTopicDetail } from "@/features/admin/courses/api/course-api";
import { useQuiz } from "@/features/admin/quizzes/api/use-quizzes";
import { useAssignment } from "@/features/admin/assignments/api/use-assignments";
import { toast } from "sonner";

interface CourseViewProps {
  course: any;
  onBack: () => void;
}

type ActiveItem = {
  type: "course" | "module" | "lesson" | "topic" | "quiz" | "assignment";
  id: string | number;
  data: any;
  isFinal?: boolean;
  isFinal?: boolean;
};

export default function CourseView({ course, onBack }: CourseViewProps) {
  const [activeItem, setActiveItem] = useState<ActiveItem | null>({
    type: "course",
    id: course.id,
    data: course
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasRestored, setHasRestored] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setHasRestored(false);
  }, [course?.id]);

  // Save active selection state to sessionStorage
  useEffect(() => {
    if (!hasRestored) return;
    if (!course || !course.id) return;
    const sessionKey = `course-view-active-${course.id}`;
    
    // Calculate context IDs to restore matching layouts
    let resolvedModuleId: string | number | null = null;
    let resolvedLessonId: string | number | null = null;
    let resolvedTopicId: string | number | null = null;
    let resolvedQuizId: string | number | null = null;
    let resolvedAssignmentId: string | number | null = null;
    let resolvedFinalAssessment: boolean = false;

    if (activeItem) {
      if (activeItem.type === "module") {
        resolvedModuleId = activeItem.id;
      } else if (activeItem.type === "lesson") {
        resolvedLessonId = activeItem.id;
        const mod = course.modules?.find((m: any) => 
          (m.lessons || m.topics || []).some((l: any) => String(l.id) === String(activeItem.id))
        );
        if (mod) resolvedModuleId = mod.id;
      } else if (activeItem.type === "topic") {
        resolvedTopicId = activeItem.id;
        let foundLesson: any = null;
        let foundModule: any = null;
        for (const m of course.modules || []) {
          const l = (m.lessons || m.topics || []).find((les: any) => 
            (les.topics || []).some((t: any) => String(t.id) === String(activeItem.id))
          );
          if (l) {
            foundLesson = l;
            foundModule = m;
            break;
          }
        }
        if (foundLesson) resolvedLessonId = foundLesson.id;
        if (foundModule) resolvedModuleId = foundModule.id;
      } else if (activeItem.type === "quiz") {
        resolvedQuizId = activeItem.id;
        let foundLesson: any = null;
        let foundModule: any = null;
        for (const m of course.modules || []) {
          const l = (m.lessons || m.topics || []).find((les: any) => 
            (les.quizzes || []).some((q: any) => String(q.id) === String(activeItem.id))
          );
          if (l) {
            foundLesson = l;
            foundModule = m;
            break;
          }
        }
        if (foundLesson) {
          resolvedLessonId = foundLesson.id;
          resolvedModuleId = foundModule.id;
        } else {
          const mod = course.modules?.find((m: any) => 
            (m.quizzes || []).some((q: any) => String(q.id) === String(activeItem.id))
          );
          if (mod) resolvedModuleId = mod.id;
        }
      } else if (activeItem.type === "assignment") {
        resolvedAssignmentId = activeItem.id;
        resolvedFinalAssessment = !!activeItem.isFinal;
        
        if (!resolvedFinalAssessment) {
          let foundLesson: any = null;
          let foundModule: any = null;
          for (const m of course.modules || []) {
            const l = (m.lessons || m.topics || []).find((les: any) => 
              (les.assignments || []).some((a: any) => String(a.id) === String(activeItem.id))
            );
            if (l) {
               foundLesson = l;
               foundModule = m;
               break;
            }
          }
          if (foundLesson) {
            resolvedLessonId = foundLesson.id;
            resolvedModuleId = foundModule.id;
          } else {
            const mod = course.modules?.find((m: any) => 
              (m.assignments || []).some((a: any) => String(a.id) === String(activeItem.id))
            );
            if (mod) resolvedModuleId = mod.id;
          }
        }
      }
    }

    const data = {
      activeItemType: activeItem?.type || "course",
      activeItemId: activeItem?.id || course.id,
      activeModuleId: resolvedModuleId,
      activeLessonId: resolvedLessonId,
      activeTopicId: resolvedTopicId,
      activeQuizId: resolvedQuizId,
      activeAssignmentId: resolvedAssignmentId,
      activeFinalAssessment: resolvedFinalAssessment,
      expandedModules,
      expandedLessons
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(data));
  }, [activeItem, course, expandedModules, expandedLessons, hasRestored]);

  // Restore active selection state from sessionStorage once curriculum is loaded
  useEffect(() => {
    if (!course || !course.id || hasRestored) return;
    const sessionKey = `course-view-active-${course.id}`;
    const stored = sessionStorage.getItem(sessionKey);
    if (!stored) {
      setHasRestored(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      let targetItem: ActiveItem | null = null;

      if (parsed.activeItemType === "course") {
        targetItem = { type: "course", id: course.id, data: course };
      } else if (parsed.activeItemType === "module") {
        const mod = course.modules?.find((m: any) => String(m.id) === String(parsed.activeItemId));
        if (mod) {
          targetItem = { type: "module", id: mod.id, data: mod };
        }
      } else if (parsed.activeItemType === "lesson") {
        let foundLesson: any = null;
        for (const m of course.modules || []) {
          const l = (m.lessons || m.topics || []).find((l: any) => String(l.id) === String(parsed.activeItemId));
          if (l) {
            foundLesson = l;
            break;
          }
        }
        if (foundLesson) {
          targetItem = { type: "lesson", id: foundLesson.id, data: foundLesson };
        }
      } else if (parsed.activeItemType === "topic") {
        let foundTopic: any = null;
        for (const m of course.modules || []) {
          if (Array.isArray(m.topics)) {
            foundTopic = m.topics.find((t: any) => String(t.id) === String(parsed.activeItemId));
            if (foundTopic) break;
          }
          for (const l of m.lessons || []) {
            if (String(l.id) === String(parsed.activeItemId)) {
              foundTopic = l;
              break;
            }
            const t = (l.topics || l.lessons || []).find((t: any) => String(t.id) === String(parsed.activeItemId));
            if (t) {
              foundTopic = t;
              break;
            }
          }
          if (foundTopic) break;
        }
        targetItem = { 
          type: "topic", 
          id: foundTopic ? foundTopic.id : parsed.activeItemId, 
          data: foundTopic || { id: parsed.activeItemId, name: `Topic ${parsed.activeItemId}` } 
        };
      } else if (parsed.activeItemType === "quiz") {
        let foundQuiz: any = (course.quizzes || []).find((q: any) => String(q.id) === String(parsed.activeItemId));
        if (!foundQuiz) {
          for (const m of course.modules || []) {
            foundQuiz = (m.quizzes || []).find((q: any) => String(q.id) === String(parsed.activeItemId));
            if (foundQuiz) break;
            for (const l of m.lessons || m.topics || []) {
              foundQuiz = (l.quizzes || []).find((q: any) => String(q.id) === String(parsed.activeItemId));
              if (foundQuiz) break;
            }
            if (foundQuiz) break;
          }
        }
        targetItem = { 
          type: "quiz", 
          id: foundQuiz ? foundQuiz.id : parsed.activeItemId, 
          data: foundQuiz || { id: parsed.activeItemId, title: `Quiz ${parsed.activeItemId}` } 
        };
      } else if (parsed.activeItemType === "assignment") {
        let foundAssignment: any = null;
        if (parsed.activeFinalAssessment) {
          foundAssignment = (course as any)?.final_assessment || (course as any)?.finalAssessment || (course as any)?.final_assignment ||
            ((course as any)?.final_assessment_id
              ? ((course as any)?.assignments?.find((a: any) => String(a.id) === String((course as any).final_assessment_id)) || { id: (course as any).final_assessment_id, title: `Assignment ${(course as any).final_assessment_id}` })
              : null);
          if (foundAssignment && parsed.activeItemId && String(foundAssignment.id) !== String(parsed.activeItemId)) {
            foundAssignment = null;
          }
        }

        if (!foundAssignment) {
          foundAssignment = (course.assignments || []).find((a: any) => String(a.id) === String(parsed.activeItemId));
        }
        if (!foundAssignment) {
          for (const m of course.modules || []) {
            foundAssignment = (m.assignments || []).find((a: any) => String(a.id) === String(parsed.activeItemId));
            if (foundAssignment) break;
            for (const l of m.lessons || m.topics || []) {
              foundAssignment = (l.assignments || []).find((a: any) => String(a.id) === String(parsed.activeItemId));
              if (foundAssignment) break;
            }
            if (foundAssignment) break;
          }
        }
        targetItem = { 
          type: "assignment", 
          id: foundAssignment ? foundAssignment.id : parsed.activeItemId, 
          data: foundAssignment || { id: parsed.activeItemId, title: `Assignment ${parsed.activeItemId}` },
          isFinal: parsed.activeFinalAssessment 
        };
      }

      // Validate and restore expansion states
      if (parsed.expandedModules) {
        const validatedModules: Record<string, boolean> = {};
        Object.keys(parsed.expandedModules).forEach((modId) => {
          const exists = course.modules?.some((m: any) => String(m.id) === String(modId));
          if (exists) {
            validatedModules[modId] = !!parsed.expandedModules[modId];
          }
        });
        setExpandedModules(validatedModules);
      }

      if (parsed.expandedLessons) {
        const validatedLessons: Record<string, boolean> = {};
        Object.keys(parsed.expandedLessons).forEach((lesId) => {
          let exists = false;
          for (const m of course.modules || []) {
            if ((m.lessons || m.topics || []).some((l: any) => String(l.id) === String(lesId))) {
              exists = true;
              break;
            }
          }
          if (exists) {
            validatedLessons[lesId] = !!parsed.expandedLessons[lesId];
          }
        });
        setExpandedLessons(validatedLessons);
      }

      if (targetItem) {
        setActiveItem(targetItem);
      }
    } catch (e) {
      console.error("Failed to restore active selection in course view", e);
    } finally {
      setHasRestored(true);
    }
  }, [course, hasRestored]);

  const updateCourseMutation = useUpdateCourse();

  const activeModuleId = activeItem?.type === "module" ? activeItem.id : undefined;
  const activeLessonId = activeItem?.type === "lesson" ? activeItem.id : undefined;
  const activeTopicId = activeItem?.type === "topic" ? activeItem.id : undefined;
  const activeQuizId = activeItem?.type === "quiz" ? activeItem.id : undefined;
  const activeAssignmentId = activeItem?.type === "assignment" ? activeItem.id : undefined;

  const { data: moduleDetail, isLoading: isLoadingModule } = useCourseModuleDetail(course.id, activeModuleId, { enabled: !!activeModuleId });
  const { data: lessonDetail, isLoading: isLoadingLesson } = useCourseLessonDetail(course.id, activeLessonId, { enabled: !!activeLessonId });
  const { data: topicDetail, isLoading: isLoadingTopic } = useCourseTopicDetail(course.id, activeTopicId, { enabled: !!activeTopicId });
  const { data: quizDetail, isLoading: isLoadingQuiz } = useQuiz(activeQuizId ? String(activeQuizId) : "", { enabled: !!activeQuizId });
  const { data: assignmentDetail, isLoading: isLoadingAssignment } = useAssignment(activeAssignmentId ? String(activeAssignmentId) : undefined, { enabled: !!activeAssignmentId });

  const currentStatus = course.status && (course.status.toLowerCase() === 'active' || course.status.toLowerCase() === 'published')
    ? 'active'
    : 'draft';

  const handleStatusToggle = async (newStatus: 'active' | 'draft') => {
    if (updateCourseMutation.isPending) return;
    const isOffline = typeof window !== "undefined" && !navigator.onLine;
    if (isOffline) {
      toast.error("Network disconnected. Please check your connection.");
      return;
    }
    
    try {
      await updateCourseMutation.mutateAsync({
        id: course.id,
        data: { status: newStatus }
      });
      toast.success(newStatus === 'active' ? "Course published successfully!" : "Course reverted to draft successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update course status");
    }
  };

  useEffect(() => {
    if (!hasRestored || !course || !activeItem) return;
    if (activeItem.type === "course") {
      setActiveItem({
        type: "course",
        id: course.id,
        data: course
      });
    } else if (activeItem.type === "module") {
      const found = course.modules?.find((m: any) => String(m.id) === String(activeItem.id));
      if (found) {
        setActiveItem({
          type: "module",
          id: found.id,
          data: found
        });
      }
    } else if (activeItem.type === "lesson") {
      let foundLesson: any = null;
      for (const m of course.modules || []) {
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
      for (const m of course.modules || []) {
        if (Array.isArray(m.topics)) {
          foundTopic = m.topics.find((t: any) => String(t.id) === String(activeItem.id));
          if (foundTopic) break;
        }
        for (const l of m.lessons || []) {
          if (String(l.id) === String(activeItem.id)) {
            foundTopic = l;
            break;
          }
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
      let foundQuiz: any = (course.quizzes || []).find((q: any) => String(q.id) === String(activeItem.id));
      if (!foundQuiz) {
        for (const m of course.modules || []) {
          foundQuiz = (m.quizzes || []).find((q: any) => String(q.id) === String(activeItem.id));
          if (foundQuiz) break;
          for (const l of m.lessons || m.topics || []) {
            foundQuiz = (l.quizzes || []).find((q: any) => String(q.id) === String(activeItem.id));
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
      let foundAssignment: any = null;
      if (activeItem.isFinal) {
        foundAssignment = (course as any)?.final_assessment || (course as any)?.finalAssessment || (course as any)?.final_assignment ||
          ((course as any)?.final_assessment_id
            ? ((course as any)?.assignments?.find((a: any) => String(a.id) === String((course as any).final_assessment_id)) || { id: (course as any).final_assessment_id, title: `Assignment ${(course as any).final_assessment_id}` })
            : null);
      }
      if (!foundAssignment) {
        foundAssignment = (course.assignments || []).find((a: any) => String(a.id) === String(activeItem.id));
      }
      if (!foundAssignment) {
        for (const m of course.modules || []) {
          foundAssignment = (m.assignments || []).find((a: any) => String(a.id) === String(activeItem.id));
          if (foundAssignment) break;
          for (const l of m.lessons || m.topics || []) {
            foundAssignment = (l.assignments || []).find((a: any) => String(a.id) === String(activeItem.id));
            if (foundAssignment) break;
          }
          if (foundAssignment) break;
        }
      }
      if (foundAssignment) {
        setActiveItem({
          type: "assignment",
          id: foundAssignment.id,
          data: foundAssignment,
          isFinal: activeItem.isFinal
        });
      }
    }
  }, [course, hasRestored]);

  const modules = course.modules || [];

  const renderRightPanelContent = () => {
    if (!activeItem || activeItem.type === "course") {
      const contentBlocks = course.content_blocks ?? [];
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* COURSE HERO BANNER */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
            <div className="relative h-[280px] w-full bg-slate-900">
              {getDisplayThumbnailUrl(course.thumbnail_url) ? (
                <>
                  <img 
                    src={getDisplayThumbnailUrl(course.thumbnail_url)} 
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
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <Folder className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-slate-500">No modules have been added to this course yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
              <div className="space-y-4">
                {modules.map((m: any, idx: number) => (
                  <div 
                    key={m.id}
                    onClick={() => setActiveItem({ type: "module", id: m.id, data: m })}
                    className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
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
                {(() => {
                  const fa = (course as any)?.final_assessment || (course as any)?.finalAssessment || (course as any)?.final_assignment ||
                    ((course as any)?.final_assessment_id
                      ? ((course as any)?.assignments?.find((a: any) => String(a.id) === String((course as any).final_assessment_id)) || { id: (course as any).final_assessment_id, title: `Assignment ${(course as any).final_assessment_id}` })
                      : null);
                  if (!fa) {
                    return (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Assessment</p>
                        <p className="mt-1.5 text-xs font-semibold text-slate-500">No Final Assessment Assigned</p>
                      </div>
                    );
                  }
                  return (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Assessment</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">{fa.title || fa.name || "Final Assessment"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveItem({ type: "assignment", id: fa.id, data: { id: fa.id, title: fa.title || fa.name || "Final Assessment" }, isFinal: true })}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeItem.type === "module") {
      const moduleData = moduleDetail || activeItem.data;
      if (isLoadingModule) {
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-semibold text-sm">Loading module details...</p>
          </div>
        );
      }

      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -mr-16 -mt-16 z-0" />
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold text-slate-800 mb-4">{moduleData.name || moduleData.title}</h1>
              {moduleData.content_blocks && moduleData.content_blocks.length > 0 ? (
                <ContentBlocksRenderer blocks={moduleData.content_blocks} />
              ) : moduleData.description ? (
                <div className="text-slate-600 leading-relaxed max-w-3xl prose prose-slate" dangerouslySetInnerHTML={{ __html: moduleData.description }} />
              ) : (
                <p className="text-slate-500 italic">No description provided for this module.</p>
              )}
              {(!moduleData.content_blocks || moduleData.content_blocks.length === 0) && (
                <CourseViewMedia media={{ 
                  image_url: moduleData.image_url, 
                  video_url: moduleData.video_url, 
                  pdf_url: moduleData.pdf_url, 
                  url: moduleData.url 
                }} />
              )}
            </div>
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 block">
              Lesson
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 block">
              Lesson
            </span>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-6">{lessonData.name || lessonData.title}</h1>
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
                className="text-slate-600 leading-relaxed prose prose-slate max-w-none pt-6 border-t border-slate-100"
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
            {!hasContentBlocks && (
              <CourseViewMedia media={{ 
                image_url: lessonData.image_url, 
                video_url: lessonData.video_url, 
                pdf_url: lessonData.pdf_url, 
                url: lessonData.url 
              }} />
            )}
          </div>
        </div>
      );
    }

    if (activeItem.type === "topic") {
      const topicData = topicDetail || activeItem.data;
      if (isLoadingTopic) {
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-semibold text-sm">Loading topic details...</p>
          </div>
        );
      }

      const displayContent = topicData.content_text || topicData.content || topicData.text || "";

      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-2">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 block">
              Topic
            </span>
            <h1 className="text-3xl font-extrabold text-slate-800">{topicData.name || topicData.title}</h1>
            <h1 className="text-3xl font-extrabold text-slate-800">{topicData.name || topicData.title}</h1>
            {topicData.duration_minutes && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mt-3">
                <Clock size={16} /> {topicData.duration_minutes} minutes
              <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mt-3">
                <Clock size={16} /> {topicData.duration_minutes} minutes
              </div>
            )}
          </div>

          {topicData.content_blocks && topicData.content_blocks.length > 0 ? (
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200 mt-8">
              <ContentBlocksRenderer blocks={topicData.content_blocks} />
            </div>
          ) : displayContent ? (
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200 mt-8">
              <div 
                className="text-slate-700 leading-relaxed prose prose-slate prose-headings:text-slate-800 prose-a:text-blue-600 max-w-none" 
                className="text-slate-700 leading-relaxed prose prose-slate prose-headings:text-slate-800 prose-a:text-blue-600 max-w-none" 
                dangerouslySetInnerHTML={{ __html: displayContent }} 
              />
              <CourseViewMedia media={{ 
                image_url: topicData.image_url, 
                video_url: topicData.video_url, 
                pdf_url: topicData.pdf_url, 
                url: topicData.url 
              }} />
            </div>
          ) : (
            (topicData.image_url || topicData.video_url || topicData.pdf_url || topicData.url) && (
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200 mt-8">
                <CourseViewMedia media={{ 
                  image_url: topicData.image_url, 
                  video_url: topicData.video_url, 
                  pdf_url: topicData.pdf_url, 
                  url: topicData.url 
                }} />
              </div>
            )
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
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Questions</span>
                <span className="text-lg font-bold text-slate-800">10</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Passing Score</span>
                <span className="text-lg font-bold text-slate-800">{quiz.passing_score ? `${quiz.passing_score}%` : "70%"}</span>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Passing Score</span>
                <span className="text-lg font-bold text-slate-800">{quiz.passing_score ? `${quiz.passing_score}%` : "70%"}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Max Attempts</span>
                <span className="text-lg font-bold text-slate-800">{quiz.max_attempts || "1"}</span>
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
      const assignment = assignmentDetail || activeItem.data;
      const isFinal = activeItem.isFinal;
      
      if (isLoadingAssignment) {
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-semibold text-sm">Loading assignment details...</p>
          </div>
        );
      }
           if (isFinal) {
        if (!assignment || !assignment.id) {
          return (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                <Award size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">No Final Assessment Assigned</h2>
              <p className="text-sm text-slate-500 max-w-sm">This course does not currently have a final assessment assigned.</p>
            </div>
          );
        }

        const showDescription = !!assignment.description;
        const showInstructions = !!(assignment.instructions || assignment.instruction);
        const showAttachments = Array.isArray(assignment.attachments) && assignment.attachments.length > 0;
        const showContentBlocks = Array.isArray(assignment.content_blocks) && assignment.content_blocks.length > 0;
        const showMedia = !!(assignment.image_url || assignment.video_url || assignment.pdf_url || assignment.url);

        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* HERO SECTION */}
            <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-full -mr-12 -mt-12 z-0" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-tr-full -ml-8 -mb-8 z-0 blur-lg" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg shrink-0">
                    <Award size={28} className="text-yellow-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Final Assessment</span>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-0.5">{assignment.title || assignment.name || "Final Assignment"}</h1>
                  </div>
                </div>
                
                {/* Metadata badge bar */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30 px-3 py-1.5 text-xs font-bold text-yellow-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    Pending Submission
                  </span>
                  <span className="rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-100">
                    {assignment.max_score || 100} Points
                  </span>
                  <span className="rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-100 capitalize">
                    {assignment.submission_type || "File Upload"}
                  </span>
                </div>
              </div>
            </div>

            {/* GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {showDescription && (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">Assignment Brief</h3>
                    <div 
                      className="text-slate-650 leading-relaxed prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: assignment.description }}
                    />
                  </div>
                )}

                {showInstructions && (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">Instructions</h3>
                    <div 
                      className="text-slate-650 leading-relaxed prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: assignment.instructions || assignment.instruction }}
                    />
                  </div>
                )}

                {showAttachments && (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">Downloadable Assets</h3>
                    <ul className="space-y-3">
                      {assignment.attachments.map((file: any, idx: number) => (
                        <li key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-sm font-semibold text-slate-700 truncate max-w-[70%]">{file.name || "Attachment"}</span>
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                          >
                            Download
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {showContentBlocks && (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Course Material</h3>
                    <ContentBlocksRenderer blocks={assignment.content_blocks} />
                  </div>
                )}

                {showMedia && (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                    <CourseViewMedia media={{ image_url: assignment.image_url, video_url: assignment.video_url, pdf_url: assignment.pdf_url, url: assignment.url }} />
                  </div>
                )}

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
            className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            title="Exit Course View"
          >
            <ArrowLeft size={18} />
            <ArrowLeft size={18} />
          </button>
          <div className="h-8 w-[1px] bg-slate-200 mx-1 md:mx-2" />
          <div className="min-w-0">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1 hidden sm:block">Previewing</h2>
            <h3 className="font-bold text-slate-800 leading-tight max-w-[150px] sm:max-w-xl truncate">{course.name}</h3>
          <div className="h-8 w-[1px] bg-slate-200 mx-1 md:mx-2" />
          <div className="min-w-0">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1 hidden sm:block">Previewing</h2>
            <h3 className="font-bold text-slate-800 leading-tight max-w-[150px] sm:max-w-xl truncate">{course.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentStatus === 'draft' ? (
            <button
              onClick={() => handleStatusToggle('active')}
              disabled={updateCourseMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm h-[36px]"
            >
              {updateCourseMutation.isPending && updateCourseMutation.variables?.data.status === 'active' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              ) : null}
              Publish Course
            </button>
          ) : (
            <button
              onClick={() => handleStatusToggle('draft')}
              disabled={updateCourseMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm h-[36px]"
            >
              {updateCourseMutation.isPending && updateCourseMutation.variables?.data.status === 'draft' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
              ) : null}
              Revert to Draft
            </button>
          )}
          <span className="px-2 sm:px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-bold border border-blue-100 h-[36px] flex items-center">
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
            expandedModules={expandedModules}
            setExpandedModules={setExpandedModules}
            expandedLessons={expandedLessons}
            setExpandedLessons={setExpandedLessons}
          />
        </div>
        
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6 md:p-8 lg:p-10 relative scroll-smooth w-full">
          {renderRightPanelContent()}
        </main>
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

const getFileName = (url: string) => {
  if (!url) return "PDF Document";
  if (url.startsWith("data:")) return "Attached PDF Document.pdf";
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  return decodeURIComponent(lastPart) || "PDF Document";
};

function CourseViewMedia({ media }: { media: { image_url?: string; video_url?: string; pdf_url?: string; url?: string } }) {
  const { image_url, video_url, pdf_url, url } = media;

  if (!image_url && !video_url && !pdf_url && !url) return null;

  return (
    <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Attached Resources</h4>
      <div className="space-y-6">
        {/* Image Display */}
        {image_url && (
          <div className="flex justify-center">
            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={getDisplayMediaUrl(image_url)} 
                alt="Resource" 
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          </div>
        )}

        {/* Video Display */}
        {video_url && (
          <div className="flex justify-center">
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-black relative">
              {isEmbedUrl(video_url) ? (
                <iframe
                  src={getEmbedUrl(video_url)}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              ) : (
                <video
                  src={getDisplayMediaUrl(video_url)}
                  controls
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        )}

        {/* PDF Document */}
        {pdf_url && (
          <div className="border border-red-100 rounded-2xl p-4 sm:p-5 bg-red-50/20 hover:bg-red-50/45 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 w-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-200/50 shrink-0">
                <FileText size={22} />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider">PDF Resource</p>
                <h4 className="text-sm font-bold text-slate-800 truncate block mt-0.5" title={getFileName(pdf_url)}>{getFileName(pdf_url)}</h4>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => openPdf(pdf_url)}
              className="px-4 sm:px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm shrink-0 uppercase tracking-wider w-full sm:w-auto text-center"
            >
              Open PDF
            </button>
          </div>
        )}

        {/* External URL */}
        {url && (
          <div className="border border-blue-100 rounded-2xl p-4 sm:p-5 bg-blue-50/15 hover:bg-blue-50/30 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 w-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 text-blue-650 flex items-center justify-center border border-blue-200/50 shrink-0">
                <ExternalLink size={22} />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs font-bold text-blue-650 uppercase tracking-wider">Reference Link</p>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-slate-800 hover:underline truncate block mt-0.5 min-w-0"
                  title={url}
                >
                  {url}
                </a>
              </div>
            </div>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm shrink-0 uppercase tracking-wider w-full sm:w-auto text-center"
            >
              Visit Link
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
