import React from "react";
import { useQuizResult } from "@/features/student/courses/api/quiz-api";
import { QuizResultResponse } from "@/types/student-course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

interface QuizResultViewProps {
  courseId: string;
  quizId: string;
  onBackToCourse: () => void;
  onReviewQuiz: () => void;
}

export function QuizResultView({ courseId, quizId, onBackToCourse, onReviewQuiz }: QuizResultViewProps) {
  const { data, isLoading, error, refetch } = useQuizResult(courseId, quizId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">Calculating your results...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
        <XCircle className="w-12 h-12 text-destructive" />
        <h3 className="text-xl font-semibold">Failed to load results</h3>
        <p className="text-muted-foreground">We couldn't fetch your quiz results at this time.</p>
        <Button onClick={() => refetch()} variant="outline">Try Again</Button>
      </div>
    );
  }

  // Gracefully handle partial API responses
  const result: QuizResultResponse = data.summary ? data : { summary: data, questions: [] };
  const { summary } = result;

  const percentage = summary.percentage || 0;
  const isPass = summary.isPass ?? (percentage >= (summary.passingMarks || 70));
  const correctCount = summary.correctAnswers || 0;
  const incorrectCount = summary.incorrectAnswers || 0;
  const totalCount = summary.totalQuestions || (correctCount + incorrectCount);

  // Deriving performance summary if backend doesn't provide it
  const performanceMessage = summary.status || (
    isPass 
      ? (percentage >= 90 ? "Excellent work! You have a strong grasp of the material." : "Good job! You've passed the quiz.")
      : "Needs improvement. Review the material and try again."
  );

  return (
    <div className="max-w-4xl mx-auto w-full pb-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Card */}
      <Card className="overflow-hidden border-none shadow-sm bg-muted/30">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                Quiz Results and Performance Summary
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                {performanceMessage}
              </p>
            </div>
            
            <div className="flex shrink-0 gap-3">
              <Button onClick={onReviewQuiz} variant="outline" className="bg-background">
                <Eye className="w-4 h-4 mr-2" />
                Review Quiz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Score Display */}
      <Card className="border shadow-sm">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center border-b">
          <div className="relative flex items-center justify-center w-48 h-48 rounded-full">
            {/* SVG Circle Progress */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                className="stroke-muted fill-none"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                className={`fill-none transition-all duration-1000 ease-out ${isPass ? 'stroke-green-500' : 'stroke-destructive'}`}
                strokeWidth="12"
                strokeDasharray={`${(percentage / 100) * (2 * Math.PI * 88)} ${2 * Math.PI * 88}`}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="relative flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold tracking-tighter text-foreground">
                {percentage}%
              </span>
              <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mt-1">
                YOUR SCORE
              </span>
            </div>
          </div>
          
          <div className="mt-8">
            <Badge variant={isPass ? "default" : "destructive"} className={`text-sm px-4 py-1 uppercase tracking-wider ${isPass ? "bg-green-500 hover:bg-green-600" : ""}`}>
              {isPass ? "PASSED" : "FAILED"}
            </Badge>
          </div>
        </CardContent>
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-t">
          <div className="p-8 flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 text-green-500 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">Correct Answers</h4>
              <p className="text-muted-foreground mb-3">{correctCount} out of {totalCount} questions</p>
            </div>
          </div>
          
          <div className="p-8 flex items-start gap-4 bg-muted/10">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">Areas for Review</h4>
              <p className="text-muted-foreground mb-3">{incorrectCount} out of {totalCount} questions</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Button onClick={onBackToCourse} size="lg" className="px-8 py-6 text-lg w-full md:w-auto">
          Continue to Next Lesson <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
        </Button>
      </div>

    </div>
  );
}
