import { useQuery, useMutation } from "@tanstack/react-query";
import { Quiz, QuizSubmitPayload } from "@/types/student-course";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    if (match) {
      headers["Authorization"] = `Bearer ${match[2]}`;
    }
  }
  return headers;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    let messageStr = "API request failed";
    if (err.errors) {
      if (Array.isArray(err.errors)) {
        messageStr = err.errors.map((e: unknown) => typeof e === 'string' ? e : JSON.stringify(e)).join(", ");
      } else if (typeof err.errors === "object") {
        messageStr = Object.values(err.errors).flat().join(", ");
      } else {
        messageStr = String(err.errors);
      }
    } else if (Array.isArray(err.message)) {
      messageStr = err.message.join(", ");
    } else if (err.message) {
      messageStr = err.message;
    } else if (err.detail) {
      messageStr = err.detail;
    } else if (err.error) {
      messageStr = err.error;
    }

    const isTokenExpired =
      messageStr.toLowerCase().includes("token expired") ||
      response.status === 401;

    if (!isTokenExpired) {
      console.error("API ERROR DETAILED:", {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        err,
      });
    } else {
      if (typeof document !== "undefined") {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "mock_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
      }
    }
    throw new Error(messageStr);
  }
  return response.json();
}

/**
 * Fetch Quiz Details
 */
export async function fetchQuiz(courseId: string, quizId: string): Promise<Quiz> {
  const url = `${API_HOST}/api/v1/student-portal/course/${courseId}/quiz/${quizId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result?.data || result;
}

/**
 * React Query hook for Quiz Details
 */
export function useQuiz(courseId: string, quizId: string) {
  return useQuery({
    queryKey: ["quiz", courseId, quizId],
    queryFn: () => fetchQuiz(courseId, quizId),
    enabled: !!courseId && !!quizId,
  });
}

/**
 * Start Quiz (Initializes backend timer and returns questions)
 */
export async function startQuiz(courseId: string, quizId: string): Promise<any> {
  const url = `${API_HOST}/api/v1/student-portal/course/${courseId}/quiz/${quizId}/start`;

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result?.data || result;
}

/**
 * React Query mutation for starting Quiz
 */
export function useStartQuiz() {
  return useMutation({
    mutationFn: ({ courseId, quizId }: { courseId: string; quizId: string }) =>
      startQuiz(courseId, quizId),
  });
}

/**
 * Submit Quiz
 */
export async function submitQuiz(courseId: string, quizId: string, payload: QuizSubmitPayload) {
  const url = `${API_HOST}/api/v1/student-portal/course/${courseId}/quiz/${quizId}/submit`;

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/**
 * React Query mutation for submitting Quiz
 */
export function useSubmitQuiz() {
  return useMutation({
    mutationFn: ({ courseId, quizId, payload }: { courseId: string; quizId: string; payload: QuizSubmitPayload }) =>
      submitQuiz(courseId, quizId, payload),
  });
}

/**
 * Fetch Quiz Result
 */
export async function fetchQuizResult(courseId: string, quizId: string): Promise<any> {
  const url = `${API_HOST}/api/v1/student-portal/course/quiz/result?courseId=${courseId}&quizId=${quizId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result?.data || result;
}

/**
 * React Query hook for Quiz Result
 */
export function useQuizResult(courseId: string, quizId: string) {
  return useQuery({
    queryKey: ["quiz-result", courseId, quizId],
    queryFn: () => fetchQuizResult(courseId, quizId),
    enabled: !!courseId && !!quizId,
  });
}

/**
 * Fetch Quiz Review
 */
export async function fetchQuizReview(courseId: string, quizId: string): Promise<any> {
  const url = `${API_HOST}/api/v1/student-portal/course/${courseId}/quiz/${quizId}/review`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await handleResponse(response);
  return result?.data || result;
}

/**
 * React Query hook for Quiz Review
 */
export function useQuizReview(courseId: string, quizId: string) {
  return useQuery({
    queryKey: ["quiz-review", courseId, quizId],
    queryFn: () => fetchQuizReview(courseId, quizId),
    enabled: !!courseId && !!quizId,
  });
}
