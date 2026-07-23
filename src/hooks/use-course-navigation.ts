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
    
    if (courseData?.courseId) {
      sessionStorage.setItem(`course_${courseData.courseId}_last_type`, item.type);
      sessionStorage.setItem(`course_${courseData.courseId}_last_id`, String(item.id));
    }
  }, [courseData]);

  useEffect(() => {
    if (courseData && !activeItem) {
      const savedType = sessionStorage.getItem(`course_${courseData.courseId}_last_type`);
      const savedId = sessionStorage.getItem(`course_${courseData.courseId}_last_id`);

      let initialItem: ActiveSidebarItem = {
        type: "course",
        id: courseData.courseId,
        data: courseData,
      };

      let foundParentMod: string | null = null;
      let foundParentLess: string | null = null;

      if (savedType && savedId && courseData.sidebar) {
         let foundData: any = null;

         const searchHierarchy = (items: any[], currentModId?: string, currentLessId?: string) => {
           for (const item of items) {
             if (String(item.id) === savedId) {
                foundData = item;
                if (currentModId) foundParentMod = currentModId;
                if (currentLessId) foundParentLess = currentLessId;
                return true;
             }
             if (item.lessons && searchHierarchy(item.lessons, currentModId || String(item.id), undefined)) return true;
             if (item.topics && searchHierarchy(item.topics, currentModId, currentLessId || String(item.id))) return true;
             if (item.quiz && String(item.quiz.id) === savedId) { foundData = item.quiz; foundParentMod = currentModId || String(item.id); return true; }
             if (item.quizzes && searchHierarchy(item.quizzes, currentModId || String(item.id))) return true;
             if (item.assignment && String(item.assignment.id) === savedId) { foundData = item.assignment; foundParentMod = currentModId || String(item.id); return true; }
             if (item.assignments && searchHierarchy(item.assignments, currentModId || String(item.id))) return true;
           }
           return false;
         };

         if (savedType === "course") {
           foundData = courseData;
         } else {
           searchHierarchy(courseData.sidebar);
         }

         if (foundData && !foundData.isLocked && !foundData.locked) {
           initialItem = {
             type: savedType as any,
             id: savedId,
             data: foundData
           };
         }
      }

      setActiveItem(initialItem);

      if (foundParentMod) {
         setExpandedModules(prev => ({ ...prev, [foundParentMod as string]: true }));
      } else if (courseData.sidebar && courseData.sidebar.length > 0 && initialItem.type === "course") {
         setExpandedModules({ [String(courseData.sidebar[0].id)]: true });
      }

      if (foundParentLess) {
         setExpandedLessons(prev => ({ ...prev, [foundParentLess as string]: true }));
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
