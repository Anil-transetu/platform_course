"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useQuiz } from "@/features/admin/quizzes/api/use-quizzes";
import QuizForm from "@/app/admin/quizzes/QuizForm";
import QuizPageSkeleton from "@/components/admin/quizzes/QuizPageSkeleton";
import DeleteDialog from "@/components/reusable/DeleteDialog";
import { useState } from "react";

export default function QuizDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as "edit") || "edit";
  const id = params.id as string;

  const { data: quiz, isLoading, error } = useQuiz(id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return <QuizPageSkeleton />;
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <h2 className="text-xl font-bold text-slate-700">Quiz Not Found</h2>
        <p className="mt-2 text-sm">The quiz you're looking for doesn't exist or failed to load.</p>
      </div>
    );
  }

  return (
    <>
      <QuizForm mode={mode} initialData={quiz} />
      <DeleteDialog 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onSubmit={() => {}} 
        itemName={quiz.title || quiz.quiz_title}
      />
    </>
  );
}
