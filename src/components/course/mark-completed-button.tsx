import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { CompletionResourceType } from "@/types/completion";
import { useCourseCompletion } from "@/hooks/useCourseCompletion";

interface MarkCompletedButtonProps {
  courseId: string | number;
  resourceId: string | number;
  resourceType: CompletionResourceType;
  isInitiallyCompleted?: boolean;
}

export function MarkCompletedButton({
  courseId,
  resourceId,
  resourceType,
  isInitiallyCompleted = false,
}: MarkCompletedButtonProps) {
  // We keep a local optimistic state to show completion immediately
  // before the queries invalidate and re-render the parent.
  const [optimisticCompleted, setOptimisticCompleted] = React.useState(isInitiallyCompleted);

  // Sync if parent updates the prop
  React.useEffect(() => {
    setOptimisticCompleted(isInitiallyCompleted);
  }, [isInitiallyCompleted]);

  const { mutate, isPending } = useCourseCompletion({ courseId });

  const isCompleted = optimisticCompleted;

  const handleComplete = () => {
    if (isCompleted || isPending) return;

    mutate(
      { resourceType, resourceId },
      {
        onSuccess: () => {
          setOptimisticCompleted(true);
        },
      }
    );
  };

  return (
    <Button
      onClick={handleComplete}
      disabled={isCompleted || isPending}
      className={`min-w-[200px] flex items-center justify-center gap-2 transition-all duration-300 ${
        isCompleted
          ? "bg-green-600 hover:bg-green-700 text-white opacity-100"
          : "bg-primary hover:bg-primary/90 text-primary-foreground"
      }`}
      size="lg"
      aria-label={isCompleted ? "Completed" : "Mark as Completed"}
      aria-disabled={isCompleted || isPending}
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <CheckCircle2 size={18} className={isCompleted ? "opacity-100" : "opacity-70"} />
      )}
      {isPending ? "Updating..." : isCompleted ? "Completed" : "Mark as Completed"}
    </Button>
  );
}
