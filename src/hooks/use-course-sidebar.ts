import { useQuery } from "@tanstack/react-query";
import { studentCourseService } from "@/services/student-course.service";

export function useCourseSidebar(courseId: string) {
  return useQuery({
    queryKey: ["course-sidebar", courseId],
    queryFn: () => studentCourseService.getSidebar(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
