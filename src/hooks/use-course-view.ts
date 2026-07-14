import { useQuery } from "@tanstack/react-query";
import { studentCourseService } from "@/services/student-course.service";

export function useCourseView(courseId: string, itemId: string | null, itemType: string | null) {
  return useQuery({
    queryKey: ["course-view", courseId, itemType, itemId],
    queryFn: () => {
      if (!itemId || !itemType) return Promise.reject("Missing item ID or Type");
      return studentCourseService.getCourseView(courseId, itemId, itemType);
    },
    enabled: !!courseId && !!itemId && !!itemType,
    staleTime: 5 * 60 * 1000,
  });
}
