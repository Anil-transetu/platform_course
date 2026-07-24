import React from "react";
import { Card } from "@/components/ui/card";
import { Clock, HelpCircle, FileText, Target } from "lucide-react";
import { Quiz } from "@/types/student-course";

interface QuizHeaderProps {
  quiz: Quiz;
}

export function QuizHeader({ quiz }: QuizHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{quiz.quizTitle || quiz.title || quiz.quiz_title || quiz.name || "Quiz"}</h1>
        {quiz.description && (
          <p className="text-muted-foreground mt-1">{quiz.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quiz.total_questions !== undefined && (
          <Card className="p-4 flex items-center space-x-3 bg-blue-50/50 border-blue-100">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <HelpCircle size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Questions</p>
              <p className="text-lg font-bold">{quiz.total_questions}</p>
            </div>
          </Card>
        )}

        {(quiz.quizTime !== undefined || quiz.time_limit_minutes !== undefined) && (quiz.quizTime! > 0 || quiz.time_limit_minutes! > 0) && (
          <Card className="p-4 flex items-center space-x-3 bg-amber-50/50 border-amber-100">
            <div className="bg-amber-100 p-2 rounded-full text-amber-600">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="text-lg font-bold">{quiz.quizTime || quiz.time_limit_minutes} mins</p>
            </div>
          </Card>
        )}

        {quiz.total_marks !== undefined && (
          <Card className="p-4 flex items-center space-x-3 bg-green-50/50 border-green-100">
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Marks</p>
              <p className="text-lg font-bold">{quiz.total_marks}</p>
            </div>
          </Card>
        )}

        {quiz.passing_score !== undefined && (
          <Card className="p-4 flex items-center space-x-3 bg-purple-50/50 border-purple-100">
            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
              <Target size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Passing</p>
              <p className="text-lg font-bold">{quiz.passing_score}</p>
            </div>
          </Card>
        )}
      </div>
      
      {quiz.instructions && (
        <div className="bg-muted/50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-1">Instructions</h3>
          <p className="text-sm text-muted-foreground">{quiz.instructions}</p>
        </div>
      )}
    </div>
  );
}
