import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizResultQuestion, QuizOption } from "@/types/student-course";
import { CheckCircle2, XCircle, Info } from "lucide-react";

interface QuizReviewQuestionCardProps {
  question: QuizResultQuestion;
  index: number;
}

export const QuizReviewQuestionCard: React.FC<QuizReviewQuestionCardProps> = React.memo(({ question, index }) => {
  const isCorrect = question.isCorrect;
  const isSkipped = question.studentOptionId === null || question.studentOptionId === undefined;

  return (
    <Card className="p-6 overflow-hidden border-2 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="uppercase tracking-wider text-xs font-bold text-muted-foreground">
            Question {index + 1}
          </Badge>
          {question.type === 'mcq' && (
            <Badge variant="outline" className="text-xs">Multiple Choice</Badge>
          )}
          {question.type === 'boolean' && (
            <Badge variant="outline" className="text-xs">True / False</Badge>
          )}
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

      <div className="space-y-3 mb-6">
        {question.options.map((opt: QuizOption) => {
          const isCorrectAnswer = String(opt.optionId) === String(question.correctOptionId);
          const isStudentAnswer = String(opt.optionId) === String(question.studentOptionId);
          
          let containerStyles = "border-transparent bg-muted/40";
          let icon = null;
          let labelText = "";

          if (isCorrectAnswer) {
            containerStyles = "border-green-200 bg-green-50/50 text-green-900";
            icon = <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />;
            labelText = isStudentAnswer ? "YOUR ANSWER & CORRECT ANSWER" : "CORRECT ANSWER";
          } else if (isStudentAnswer && !isCorrectAnswer) {
            containerStyles = "border-red-200 bg-red-50/50 text-red-900";
            icon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
            labelText = "YOUR ANSWER";
          } else {
            containerStyles = "border-border bg-background";
          }

          return (
            <div
              key={opt.optionId}
              className={`relative flex items-start sm:items-center p-4 rounded-xl border-2 ${containerStyles}`}
            >
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                {icon ? icon : <div className="w-5 h-5 shrink-0" />}
                
                <div className="flex-1">
                  <div className="text-sm font-medium leading-relaxed">
                    {opt.option}
                  </div>
                  {labelText && (
                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isCorrectAnswer ? 'text-green-600' : 'text-red-600'}`}>
                      {labelText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {question.explanation && (
        <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-muted flex gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Explanation</h4>
            <p className="text-sm text-foreground leading-relaxed">
              {question.explanation}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
});

QuizReviewQuestionCard.displayName = "QuizReviewQuestionCard";
