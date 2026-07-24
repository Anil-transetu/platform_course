import React from "react";
import { Card } from "@/components/ui/card";
import { QuizQuestion } from "@/types/student-course";
import { QuestionOptions } from "./QuestionOptions";

interface QuizQuestionCardProps {
  question: QuizQuestion;
  index: number;
  selectedOptionId?: string | number;
  onOptionSelect: (questionId: string | number, optionId: string | number) => void;
  onClearSelection: () => void;
}

export const QuizQuestionCard: React.FC<QuizQuestionCardProps> = React.memo(({
  question,
  index,
  selectedOptionId,
  onOptionSelect,
  onClearSelection
}) => {
  return (
    <Card className="p-6 overflow-hidden">
      <div className="flex gap-4">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded bg-muted text-sm font-semibold text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-medium leading-relaxed pr-4">
              {question.question}
            </h3>
            {selectedOptionId !== undefined && (
              <button
                onClick={onClearSelection}
                className="text-xs font-semibold text-muted-foreground hover:text-destructive shrink-0 transition-colors bg-muted/50 hover:bg-destructive/10 px-2 py-1 rounded"
              >
                Clear selection
              </button>
            )}
          </div>
          <QuestionOptions 
            question={question}
            selectedOptionId={selectedOptionId}
            onOptionSelect={onOptionSelect}
          />
        </div>
      </div>
    </Card>
  );
});

QuizQuestionCard.displayName = "QuizQuestionCard";
