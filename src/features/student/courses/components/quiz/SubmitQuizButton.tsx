import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

interface SubmitQuizButtonProps {
  isSubmitting: boolean;
  onSubmit: () => void;
  disabled?: boolean;
}

export const SubmitQuizButton: React.FC<SubmitQuizButtonProps> = React.memo(({
  isSubmitting,
  onSubmit,
  disabled
}) => {
  return (
    <div className="flex justify-end pt-6 border-t mt-8">
      <Button 
        onClick={onSubmit} 
        disabled={isSubmitting || disabled}
        className="min-w-[150px]"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit Quiz
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </div>
  );
});

SubmitQuizButton.displayName = "SubmitQuizButton";
