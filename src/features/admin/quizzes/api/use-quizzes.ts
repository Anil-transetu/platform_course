import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchQuizzes,
  fetchQuizStats,
  fetchQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  Quiz,
} from "./quiz-api";

/**
 * Fetch all quizzes with search and filter
 */
export function useQuizzes(
  page: number = 1,
  limit: number = 50,
  search?: string,
  statusFilter?: string,
  options?: { enabled?: boolean }
) {
export function useQuizzes(
  page: number = 1,
  limit: number = 50,
  search?: string,
  statusFilter?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["quizzes", { page, limit, search, statusFilter }],
    queryFn: ({ signal }) => fetchQuizzes(page, limit, search, statusFilter, signal),
    queryFn: ({ signal }) => fetchQuizzes(page, limit, search, statusFilter, signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
    enabled: options?.enabled,
  });
}

/**
 * Fetch a single quiz by ID
 */
export function useQuiz(id: string | number, options?: { enabled?: boolean }) {
  const isValidId = id !== undefined && id !== null && String(id).trim() !== "" && String(id) !== "null" && String(id) !== "undefined";
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: ({ signal }) => fetchQuizById(id, signal),
    enabled: !!id,
  });
}

/**
 * Fetch quiz statistics
 */
export function useQuizStats(options?: { enabled?: boolean }) {
export function useQuizStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["quizStats"],
    queryFn: ({ signal }) => fetchQuizStats(signal),
    enabled: options?.enabled,
  });
}

/**
 * Create a new quiz
 */
export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quizStats"] });
    },
  });
}

/**
 * Update a quiz
 */
export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Quiz> }) => updateQuiz(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["quizStats"] });
    },
  });
}

/**
 * Delete a quiz
 */
export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quizStats"] });
    },
  });
}
