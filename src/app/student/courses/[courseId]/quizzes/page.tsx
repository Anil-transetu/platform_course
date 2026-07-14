import { ActivityPageClient } from "@/components/course/activity-page-client";

export default function QuizzesActivityPage({ params }: { params: { courseId: string } }) {
  return <ActivityPageClient activityType="quizzes" title="Quizzes Activity" />;
}
