import React from "react";
import { BookOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title = "Select a lesson to continue", 
  description = "Choose an item from the sidebar to view its content.",
  icon = <BookOpen size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full p-8 text-center bg-white/50 dark:bg-card/50 rounded-3xl border border-dashed border-gray-200 dark:border-border">
      {icon}
      <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
