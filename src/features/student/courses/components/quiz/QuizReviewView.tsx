import React from "react";
import { useQuizResult } from "@/features/student/courses/api/quiz-api";
import { QuizResultResponse } from "@/types/student-course";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, XCircle } from "lucide-react";
import { QuizReviewQuestionCard } from "./QuizReviewQuestionCard";

interface QuizReviewViewProps {
  courseId: string;
  quizId: string;
  onBackToResults: () => void;
}

export function QuizReviewView({ courseId, quizId, onBackToResults }: QuizReviewViewProps) {
  const { data, isLoading, error, refetch } = useQuizResult(courseId, quizId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">Loading review...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
        <XCircle className="w-12 h-12 text-destructive" />
        <h3 className="text-xl font-semibold">Failed to load review</h3>
        <p className="text-muted-foreground">We couldn't fetch the quiz review at this time.</p>
        <Button onClick={() => refetch()} variant="outline">Try Again</Button>
      </div>
    );
  }

  const result: QuizResultResponse = data.summary ? data : { summary: data, questions: [] };
  const { summary, questions } = result;

  return (
    <div className="max-w-4xl mx-auto w-full pb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Detailed Quiz Answer Review
          </h1>
          <p className="text-muted-foreground mt-2">
            Review each question and understand the reasoning behind the correct answers.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" onClick={onBackToResults}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Results
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {questions && questions.length > 0 ? (
          questions.map((question, index) => (
            <QuizReviewQuestionCard
              key={question.questionId}
              index={index}
              question={question}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No questions found in this review.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-center pt-8 border-t">
        <Button onClick={onBackToResults} size="lg" className="px-8 py-6 text-lg w-full md:w-auto">
          Return to Results
        </Button>
      </div>
    </div>
  );
}
