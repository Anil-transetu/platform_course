export type ActivityType = "modules" | "lessons" | "topics" | "quizzes" | "assignments";

export interface CourseActivityItem extends Record<string, unknown> {
  id: string | number;
  name: string;
  completed_at?: string | null;
  progress: number;
  status?: string;
}

export interface CourseActivityResponse {
  data: CourseActivityItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
