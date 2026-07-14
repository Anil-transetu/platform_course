import { useQuery } from "@tanstack/react-query";
import { studentCourseService } from "@/services/student-course.service";

export function useCourseHome(courseId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["course-home", courseId],
    queryFn: () => studentCourseService.getCourseHome(courseId),
    enabled: !!courseId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
