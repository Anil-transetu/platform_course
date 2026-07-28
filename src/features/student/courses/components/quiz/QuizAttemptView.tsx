import React, { useState, useCallback, useMemo } from "react";
import { useSubmitQuiz } from "@/features/student/courses/api/quiz-api";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { SubmitQuizButton } from "./SubmitQuizButton";
import { Quiz } from "@/types/student-course";
import { toast } from "sonner";
import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface QuizAttemptViewProps {
  courseId: string;
  quiz: any;
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

  // Calculate clock offset exactly once when component mounts with valid server_time
  const clockOffset = useMemo(() => {
    if (quiz.server_time) {
      const serverTime = new Date(quiz.server_time).getTime();
      return serverTime - Date.now();
    }
    return 0;
  }, [quiz.server_time]);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Keep a ref to the latest handleSubmit to avoid stale closures
  const handleSubmitRef = React.useRef<((isAutoSubmit?: boolean) => void) | null>(null);

  React.useEffect(() => {
    if (!quiz.expires_at) return;

    const expiresAt = new Date(quiz.expires_at).getTime();

    const interval = setInterval(() => {
      const currentAdjustedTime = Date.now() + clockOffset;
      const remaining = expiresAt - currentAdjustedTime;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        // Auto-submit when time is up using the latest function reference
        if (handleSubmitRef.current) {
          handleSubmitRef.current(true);
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    // Set initial value and check if already expired
    const currentAdjustedTime = Date.now() + clockOffset;
    const initialRemaining = expiresAt - currentAdjustedTime;
    setTimeLeft(Math.max(0, initialRemaining));
    
    if (initialRemaining <= 0) {
      clearInterval(interval);
      if (handleSubmitRef.current) {
        handleSubmitRef.current(true);
      }
    }

    return () => clearInterval(interval);
  }, [quiz.expires_at, clockOffset]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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

  const handleSubmit = useCallback((isAutoSubmit = false) => {
    if (!quizId) return;
    
    // Transform answers object map to array of objects
    const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => ({
      questionId: String(questionId),
      selectedOptionId: String(optionId)
    }));

    const finalPayload = {
      submittedAt: new Date().toISOString(),
      isAutoSubmitted: isAutoSubmit === true,
      answers: formattedAnswers
    };

    console.log("🚀 Submitting Quiz Payload:", JSON.stringify(finalPayload, null, 2));

    submitQuiz(
      { courseId, quizId: String(quizId), payload: finalPayload },
      {
        onSuccess: () => {
          if (quizId) localStorage.removeItem(`quiz_progress_${quizId}`);
          toast.success(isAutoSubmit ? "Time's up! Quiz auto-submitted." : "Quiz submitted successfully!");
          onSuccess();
        },
        onError: (err: Error) => {
          if (err.message.includes("expired") || err.message.includes("Expired") || isAutoSubmit) {
            toast.error(isAutoSubmit ? "Time's up! Submitting your answers." : "Quiz attempt has expired.");
            onSuccess(); // Push to results/refresh view to show completed
          } else {
            toast.error(err.message || "Failed to submit quiz. Please try again.");
          }
        },
      }
    );
  }, [quizId, answers, courseId, submitQuiz, onSuccess]);

  // Update ref immediately during render
  handleSubmitRef.current = handleSubmit;

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
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex-1 md:w-48">
                <Progress value={totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0} className="h-2 transition-all duration-500 ease-in-out mb-1" />
                <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  Answered {answeredCount} of {totalQuestions}
                </span>
              </div>
              
              {timeLeft !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-md border shrink-0 ${timeLeft < 60000 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-muted text-foreground'}`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold text-lg leading-none">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Questions Section */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto w-full space-y-6 pb-16">
          {quiz.questions && quiz.questions.length > 0 ? (
            quiz.questions.map((question: any, index: number) => (
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
