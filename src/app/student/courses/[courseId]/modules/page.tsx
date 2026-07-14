import { ActivityPageClient } from "@/components/course/activity-page-client";

export default function ModulesActivityPage({ params }: { params: { courseId: string } }) {
  return <ActivityPageClient activityType="modules" title="Modules Activity" />;
}
