import { getAuthHeaders, handleResponse } from "@/lib/api-client";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BASE_URL = `${API_HOST}/api/v1/quizzes`;

export type QuestionType = "multiple_choice" | "true_false";

export interface QuizQuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id?: string;
  type: QuestionType;
  prompt: string;
  options: QuizQuestionOption[];
}

export interface Quiz {
  [key: string]: any;
  id: string | number;
  title: string;
  domain: string;
  tags?: string[];
  module?: string;
  duration?: string;
  durationMinutes?: number;
  totalMarks?: number;
  status: string;
  questions?: QuizQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizStats {
  total_quizzes: number;
  active_quizzes: number;
  pending_reviews: number;
}



export function mapQuiz(data: any): Quiz {
  let tags = data.tags || [];
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch(e) {
      tags = [tags];
    }
  }

  let questions = data.questions || [];
  if (typeof questions === 'string') {
    try {
      questions = JSON.parse(questions);
    } catch(e) {
      questions = [];
    }
  }

  const mappedQuestions = questions.map((q: any) => {
    const isMcq = q.type === "mcq" || q.type === "MULTIPLE_CHOICE" || q.type === "multiple_choice";
    const frontendType = isMcq ? "multiple_choice" : "true_false";

    let mappedOptions = [];
    if (Array.isArray(q.options) && typeof q.options[0] === "string") {
      mappedOptions = q.options.map((optStr: string) => ({
        text: optStr,
        isCorrect: optStr === q.correct_answer
      }));
    } else if (Array.isArray(q.options)) {
      mappedOptions = q.options;
    }

    return {
      ...q,
      type: frontendType,
      prompt: q.question_text || q.prompt || "",
      options: mappedOptions
    };
  });

  return {
    ...data,
    title: data.quiz_title || data.title || "",
    durationMinutes: data.time_limit_minutes || data.durationMinutes || data.duration || null,
    totalMarks: data.total_marks || data.totalMarks || null,
    tags,
    questions: mappedQuestions,
  };
}

/**
 * Fetch all quizzes
 */
export async function fetchQuizzes(
  page: number = 1,
  limit: number = 50,
  search?: string, 
  statusFilter?: string,
  signal?: AbortSignal
): Promise<{ data: Quiz[], total?: number }> {
  let url = BASE_URL;
  const query = new URLSearchParams();
  
  if (page !== undefined && limit !== undefined) {
    query.append("page", page.toString());
    query.append("limit", limit.toString());
  }

  if (search) {
    query.append("search", search);
  }
  if (statusFilter && statusFilter !== "ALL") {
    const apiStatus = statusFilter.toUpperCase() === "ACTIVE" ? "published" : statusFilter.toLowerCase();
    query.append("status", apiStatus);
  }
  
  if (query.toString()) {
    url = `${BASE_URL}?${query.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  const data = await handleResponse(response);
  const items = Array.isArray(data) ? data : data.data || data.quizzes || [];
  return {
    data: items.map((i: any) => mapQuiz(i)),
    total: data.total || items.length
  };
}

/**
 * Fetch stats for quizzes
 */
export async function fetchQuizStats(signal?: AbortSignal): Promise<QuizStats> {
  const response = await fetch(`${BASE_URL}/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });
  const result = await handleResponse(response);
  return result.data || {
    total_quizzes: 0,
    active_quizzes: 0,
    pending_reviews: 0
  };
}

/**
 * Fetch a single quiz by ID
 */
export async function fetchQuizById(
  id: string | number,
  signal?: AbortSignal
): Promise<Quiz> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  const data = await handleResponse(response);
  return mapQuiz(data.data || data);
}

/**
 * Create a new quiz
 */
export async function createQuiz(
  quizData: Partial<Quiz>
): Promise<Quiz> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(quizData),
  });

  const data = await handleResponse(response);
  return data.data || data;
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(
  id: string | number,
  quizData: Partial<Quiz>
): Promise<Quiz> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(quizData),
  });

  const data = await handleResponse(response);
  return data.data || data;
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(id: string | number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    await handleResponse(response);
  }
}
