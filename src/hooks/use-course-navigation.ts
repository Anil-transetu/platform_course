import { useState, useCallback, useEffect } from "react";
import { ActiveSidebarItem, CourseSidebarResponse } from "@/types/student-course";

export function useCourseNavigation(courseData?: CourseSidebarResponse) {
  const [activeItem, setActiveItem] = useState<ActiveSidebarItem | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleModule = useCallback((id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleLesson = useCallback((id: string) => {
    setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSelectItem = useCallback((item: ActiveSidebarItem) => {
    if (item.data?.isLocked || item.data?.locked) {
      return;
    }
    setActiveItem(item);
    setIsMobileDrawerOpen(false); 
  }, []);

  useEffect(() => {
    if (courseData && !activeItem) {
      setActiveItem({
        type: "course",
        id: courseData.courseId,
        data: courseData,
      });

      if (courseData.sidebar && courseData.sidebar.length > 0) {
        setExpandedModules({ [String(courseData.sidebar[0].id)]: true });
      }
    }
  }, [courseData, activeItem]);

  return {
    activeItem,
    handleSelectItem,
    expandedModules,
    toggleModule,
    expandedLessons,
    toggleLesson,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
  };
}
