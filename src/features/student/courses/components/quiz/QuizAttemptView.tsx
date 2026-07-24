import React, { useState, useCallback, useMemo } from "react";
import { useSubmitQuiz } from "@/features/student/courses/api/quiz-api";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { SubmitQuizButton } from "./SubmitQuizButton";
import { Quiz } from "@/types/student-course";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface QuizAttemptViewProps {
  courseId: string;
  quiz: Quiz;
  onBack: () => void;
  onSuccess: () => void;
}

export function QuizAttemptView({ courseId, quiz, onBack, onSuccess }: QuizAttemptViewProps) {
  const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitQuiz();
  const quizId = quiz.quizId || quiz.id;

  const [answers, setAnswers] = useState<Record<string, string | number>>(() => {
    if (typeof window !== "undefined" && quizId) {
      try {
        const saved = localStorage.getItem(`quiz_progress_${quizId}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load quiz progress", e);
      }
    }
    return {};
  });

  React.useEffect(() => {
    if (quizId) {
      localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify(answers));
    }
  }, [answers, quizId]);

  const handleOptionSelect = useCallback((questionId: string | number, optionId: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  }, []);

  const handleClearSelection = useCallback((questionId: string | number) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!quizId) return;
    
    // Transform answers object map to array of objects
    const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => ({
      questionId: String(questionId),
      optionId: String(optionId)
    }));

    submitQuiz(
      { courseId, quizId: String(quizId), payload: { answers: formattedAnswers } },
      {
        onSuccess: () => {
          if (quizId) localStorage.removeItem(`quiz_progress_${quizId}`);
          toast.success("Quiz submitted successfully!");
          onSuccess();
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to submit quiz. Please try again.");
        },
      }
    );
  }, [quizId, answers, courseId, submitQuiz, onSuccess]);

  const totalQuestions = useMemo(() => quiz.questions?.length || quiz.total_questions || 0, [quiz]);
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  return (
    <div className="absolute inset-0 flex flex-col bg-white dark:bg-card">
      {/* Fixed Header Section */}
      <div className="shrink-0 pt-6 px-6 md:px-10 pb-4 border-b bg-white dark:bg-card z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mb-4 -ml-3 text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Intro
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {quiz.quizTitle || quiz.title || quiz.name || "Quiz"}
            </h1>
            {quiz.description && (
              <p className="text-muted-foreground mt-1">{quiz.description}</p>
            )}
          </div>
          
          {totalQuestions > 0 && (
            <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[350px]">
              <Progress value={totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0} className="h-2 flex-grow transition-all duration-500 ease-in-out" />
              <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                Answered {answeredCount} of {totalQuestions}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Questions Section */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto w-full space-y-6 pb-16">
          {quiz.questions && quiz.questions.length > 0 ? (
            quiz.questions.map((question, index) => (
              <QuizQuestionCard
                key={question.questionId || (question as any).id}
                index={index}
                question={question}
                selectedOptionId={answers[question.questionId?.toString() || (question as any).id?.toString() || ""]}
                onOptionSelect={handleOptionSelect}
                onClearSelection={() => handleClearSelection(question.questionId || (question as any).id)}
              />
            ))
          ) : (
            <div className="p-8 text-center border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">This quiz currently has no questions.</p>
            </div>
          )}

          <SubmitQuizButton 
            isSubmitting={isSubmitting} 
            onSubmit={handleSubmit} 
          />
        </div>
      </div>
    </div>
  );
}
