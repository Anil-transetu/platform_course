import { ActivityPageClient } from "@/components/course/activity-page-client";

export default function AssignmentsActivityPage({ params }: { params: { courseId: string } }) {
  return <ActivityPageClient activityType="assignments" title="Assignments Activity" />;
}
