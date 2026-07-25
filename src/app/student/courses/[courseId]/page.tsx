"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { CourseSidebar } from "@/components/course/course-sidebar";
import { CourseViewer } from "@/components/course/course-viewer";
import { CourseFullSkeleton } from "@/components/course/skeleton";
import { useCourseSidebar } from "@/hooks/use-course-sidebar";
import { useCourseNavigation } from "@/hooks/use-course-navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CourseNotes } from "@/components/course-notes";

export default function StudentCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    const savedState = localStorage.getItem("course_sidebar_open");
    if (savedState !== null) {
      setIsDesktopSidebarOpen(savedState === "true");
    }
  }, []);

  const toggleDesktopSidebar = (open: boolean) => {
    setIsDesktopSidebarOpen(open);
    localStorage.setItem("course_sidebar_open", String(open));
  };

  const { data: courseData, isLoading, error } = useCourseSidebar(courseId);
  const {
    activeItem,
    handleSelectItem,
    expandedModules,
    toggleModule,
    expandedLessons,
    toggleLesson,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
  } = useCourseNavigation(courseData);

  if (isLoading) {
    return <CourseFullSkeleton />;
  }

  if (error || !courseData) {
    throw error || new Error("Failed to load course details");
  }

  return (
    <ListingScreenTemplate
      headerText={courseData.courseName || "Course Player"}
      subHeaderText="Browse and navigate your curriculum"
      buttonRequired={false}
      extraActions={
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Trigger */}
          <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden flex items-center gap-2">
                <Menu size={16} /> Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 sm:w-[320px]">
              <CourseSidebar
                courseData={courseData}
                activeItem={activeItem}
                onSelectItem={handleSelectItem}
                expandedModules={expandedModules}
                toggleModule={toggleModule}
                expandedLessons={expandedLessons}
                toggleLesson={toggleLesson}
              />
            </SheetContent>
          </Sheet>

          <button
            onClick={() => router.push('/student/courses')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-border/70 rounded-lg hover:bg-gray-50 dark:bg-muted/50 bg-white dark:bg-card transition-all text-gray-700 dark:text-foreground shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Courses
          </button>
        </div>
      }
    >
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-140px)] bg-slate-50/50 relative">
        {/* LEFT SIDEBAR: Course Structure (Desktop) */}
        {isDesktopSidebarOpen && (
          <aside className="hidden md:flex w-[320px] border-r border-gray-200/80 bg-white flex-col shrink-0 overflow-hidden transition-all duration-300 relative">
            <CourseSidebar
              courseData={courseData}
              activeItem={activeItem}
              onSelectItem={handleSelectItem}
              expandedModules={expandedModules}
              toggleModule={toggleModule}
              expandedLessons={expandedLessons}
              toggleLesson={toggleLesson}
              headerAction={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleDesktopSidebar(false)}
                  className="rounded-full h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors -mr-2"
                  title="Close Sidebar"
                >
                  <PanelLeftClose size={18} />
                </Button>
              }
            />
          </aside>
        )}

        {/* RIGHT PANEL: Course Viewer */}
        <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
          {!isDesktopSidebarOpen && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleDesktopSidebar(true)}
              className="hidden md:flex absolute top-4 left-4 z-10 rounded-full h-8 w-8 bg-white shadow-sm hover:bg-slate-100 text-slate-600 transition-all"
              title="Open Sidebar"
            >
              <PanelLeftOpen size={16} />
            </Button>
          )}
          <CourseViewer courseId={courseId} activeItem={activeItem} />
        </main>
      </div>
      <CourseNotes courseId={courseId} activeItem={activeItem} />
    </ListingScreenTemplate>
  );
}
