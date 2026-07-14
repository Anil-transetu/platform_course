import { ActivityPageClient } from "@/components/course/activity-page-client";

export default function TopicsActivityPage({ params }: { params: { courseId: string } }) {
  return <ActivityPageClient activityType="topics" title="Topics Activity" />;
}
