import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizResultQuestion, QuizOption } from "@/types/student-course";
import { CheckCircle2, XCircle, Info } from "lucide-react";

interface QuizReviewQuestionCardProps {
  question: any;
  index: number;
}

export const QuizReviewQuestionCard: React.FC<QuizReviewQuestionCardProps> = React.memo(({ question, index }) => {
  const isCorrect = question.isCorrect;
  const studentAnswer = question.studentSelectedAnswer?.option;
  const correctAnswer = question.correctAnswer?.option;
  const isSkipped = !studentAnswer;

  return (
    <Card className="p-6 overflow-hidden border-2 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="uppercase tracking-wider text-xs font-bold text-muted-foreground">
            Question {index + 1}
          </Badge>
        </div>

        <div>
          {isCorrect ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 flex items-center gap-1.5 px-3 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct
            </Badge>
          ) : isSkipped ? (
            <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
              Skipped
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 flex items-center gap-1.5 px-3 py-1">
              <XCircle className="w-3.5 h-3.5" /> Incorrect
            </Badge>
          )}
        </div>
      </div>

      <h3 className="text-xl font-semibold leading-relaxed mb-6">
        {question.question}
      </h3>

      <div className="space-y-4 mb-6">
        {/* Student's Wrong Answer (Shown First if Incorrect) */}
        {!isCorrect && !isSkipped && studentAnswer && (
          <div className="relative flex flex-col p-4 rounded-xl border border-red-300 bg-background text-red-900 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div className="text-base font-medium leading-relaxed text-foreground">
                {studentAnswer}
              </div>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-red-500 ml-8">
              YOUR ANSWER
            </div>
          </div>
        )}

        {/* Correct Answer */}
        <div className="relative flex flex-col p-4 rounded-xl border border-green-300 bg-background text-green-900 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <div className="text-base font-medium leading-relaxed text-foreground">
              {correctAnswer || "Not provided"}
            </div>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-green-600 ml-8">
            {isCorrect ? "YOUR ANSWER & CORRECT ANSWER" : "CORRECT ANSWER"}
          </div>
        </div>
      </div>

      {/* Explanation */}
      {!isCorrect && (
        <div className="p-4 rounded-xl border border-muted bg-background shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-muted-foreground shrink-0" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Explanation</h4>
          </div>
          <div className="ml-7">
            <p className="text-sm text-foreground leading-relaxed italic">
              {question.explanation || "Explanation is not available for this question."}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
});

QuizReviewQuestionCard.displayName = "QuizReviewQuestionCard";
