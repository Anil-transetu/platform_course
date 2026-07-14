import { useQuery } from "@tanstack/react-query";
import { studentCourseService } from "@/services/student-course.service";
import { ActivityType } from "@/types/course-activity";

export function useCourseActivity(courseId: string, activityType: ActivityType, params: Record<string, any> = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: ["course-activity", courseId, activityType, params],
    queryFn: () => studentCourseService.getCourseActivity(courseId, activityType, params),
    enabled: !!courseId && !!activityType && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
