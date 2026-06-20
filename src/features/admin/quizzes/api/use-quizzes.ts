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
export function useQuizzes(page: number = 1, limit: number = 50, search?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["quizzes", { page, limit, search, statusFilter }],
    queryFn: () => fetchQuizzes(page, limit, search, statusFilter),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a single quiz by ID
 */
export function useQuiz(id: string | number) {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: () => fetchQuizById(id),
    enabled: !!id,
  });
}

/**
 * Fetch quiz statistics
 */
export function useQuizStats() {
  return useQuery({
    queryKey: ["quizStats"],
    queryFn: () => fetchQuizStats(),
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
