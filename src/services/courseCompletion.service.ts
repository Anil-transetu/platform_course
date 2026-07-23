import { getAuthHeaders, handleResponse } from "./student-course.service";
import { resolveCompletionEndpoint } from "@/utils/resolveCompletionEndpoint";
import { CompletionResourceType, CompletionResponse } from "@/types/completion";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";

export const courseCompletionService = {
  /**
   * Mark a module, lesson, or topic as completed
   */
  async markAsCompleted(
    resourceType: CompletionResourceType,
    resourceId: string | number
  ): Promise<CompletionResponse> {
    const endpointPath = resolveCompletionEndpoint(resourceType, resourceId);
    const url = `${API_HOST}${endpointPath}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(),
      // The API uses PATCH and typically updates the 'read' state implicitly by calling the endpoint.
      // If a payload is required, we would add body: JSON.stringify({...}) here.
    });

    return handleResponse<CompletionResponse>(response);
  },
};
