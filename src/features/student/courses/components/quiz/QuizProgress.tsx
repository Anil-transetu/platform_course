import React from "react";
import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  total: number;
  answered: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = React.memo(({ total, answered }) => {
  const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
  const remaining = total - answered;

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-4 border-b">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Quiz Progress</h3>
        <span className="text-sm font-medium text-muted-foreground">
          Answered: {answered} / {total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{percentage}% Completed</span>
        <span>{remaining} Remaining</span>
      </div>
    </div>
  );
});

QuizProgress.displayName = "QuizProgress";
