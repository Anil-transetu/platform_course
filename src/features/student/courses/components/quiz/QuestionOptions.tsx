import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuizQuestion } from "@/types/student-course";

interface QuestionOptionsProps {
  question: QuizQuestion;
  selectedOptionId?: string | number;
  onOptionSelect: (questionId: string | number, optionId: string | number) => void;
}

export const QuestionOptions: React.FC<QuestionOptionsProps> = React.memo(({
  question,
  selectedOptionId,
  onOptionSelect
}) => {
  const isBoolean = question.type === 'boolean' || !question.options || question.options.length === 0;

  const options = isBoolean ? [
    { optionId: 'yes', option: 'Yes' },
    { optionId: 'no', option: 'No' }
  ] : (question.options || []);

  const qId = question.questionId || (question as any).id;

  const handleChange = (value: string) => {
    onOptionSelect(qId, value);
  };

  const isShortOptions = options.every(opt => opt.option.length < 40);

  return (
    <RadioGroup
      name={`question-${qId}`}
      value={selectedOptionId?.toString() || ""}
      onValueChange={handleChange}
      className={`grid gap-3 mt-4 ${isShortOptions ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}
    >
      {options.map((opt) => {
        const uniqueId = `q${qId}-opt${opt.optionId ?? opt.option}`;
        const currentOptId = opt.optionId?.toString() ?? (opt as any).id?.toString() ?? opt.option;
        const isSelected = selectedOptionId?.toString() === currentOptId;
        
        return (
          <div
            key={opt.optionId ?? (opt as any).id ?? opt.option}
            onClick={() => onOptionSelect(qId, opt.optionId?.toString() ?? (opt as any).id?.toString() ?? opt.option)}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            className={`
              relative flex items-center space-x-3 p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ease-in-out
              ${isSelected 
                ? "border-primary bg-primary/5 shadow-sm" 
                : "border-transparent bg-muted/40 hover:bg-muted/80 hover:border-border"}
            `}
          >
            <div className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border transition-all duration-200 ${
              isSelected
                ? "border-primary bg-primary"
                : "border-muted-foreground/40 bg-background"
            }`}>
              {isSelected && (
                <div className="w-2 h-2 bg-primary-foreground rounded-full animate-in zoom-in-50 duration-200" />
              )}
            </div>
            
            <div className="flex-1 text-sm font-medium leading-relaxed text-foreground">
              {opt.option}
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
});

QuestionOptions.displayName = "QuestionOptions";
