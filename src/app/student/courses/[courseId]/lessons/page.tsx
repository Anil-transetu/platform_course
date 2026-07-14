import { ActivityPageClient } from "@/components/course/activity-page-client";

export default function LessonsActivityPage({ params }: { params: { courseId: string } }) {
  return <ActivityPageClient activityType="lessons" title="Lessons Activity" />;
}
