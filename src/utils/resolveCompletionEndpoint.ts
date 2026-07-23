import { CompletionResourceType } from "@/types/completion";

export function resolveCompletionEndpoint(type: CompletionResourceType, id: string | number): string {
  // According to the prompt:
  // Module Completion: PATCH /api/v1/student-portal/modules/:moduleId/read
  // Lesson Completion: PATCH /api/v1/student-portal/lessons/:lessonId/read
  // Topic Completion:  PATCH /api/v1/student-portal/topics/:topicId/read

  switch (type) {
    case 'module':
      return `/api/v1/student-portal/modules/${id}/read`;
    case 'lesson':
      return `/api/v1/student-portal/lessons/${id}/read`;
    case 'topic':
      return `/api/v1/student-portal/topics/${id}/read`;
    default:
      throw new Error(`Unsupported resource type for completion: ${type}`);
  }
}
