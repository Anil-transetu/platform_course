import { useState } from "react";
import {
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { QuizQuestion } from "@/features/admin/quizzes/api/quiz-api";
import { Textarea } from "@/components/ui/textarea";

interface QuestionBuilderProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
  questionErrors?: Record<number, string>;
  showAllErrors?: boolean;
}

export default function QuestionBuilder({ questions, onChange, questionErrors = {}, showAllErrors = false }: QuestionBuilderProps) {
  const [touchedExplanations, setTouchedExplanations] = useState<Record<number, boolean>>({});

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    onChange(newQuestions);
  };

  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onChange(newQuestions);
  };

  const handleMarksChange = (qIndex: number, rawVal: string) => {
    const newQuestions = [...questions];
    if (rawVal === "") {
      newQuestions[qIndex] = { ...newQuestions[qIndex], marks: "" as any };
    } else {
      const parsed = Number(rawVal);
      newQuestions[qIndex] = { ...newQuestions[qIndex], marks: parsed };
    }
    onChange(newQuestions);
  };

  const handleKeyDownMarks = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", ".", ",", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = text;
    onChange(newQuestions);
  };

  const handleCorrectOptionChange = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === oIndex,
    }));
    onChange(newQuestions);
  };

  const getMarksError = (q: QuizQuestion, qIndex: number): string => {
    if (questionErrors[qIndex]) {
      return questionErrors[qIndex];
    }
    if (q.marks === undefined || q.marks === null || String(q.marks).trim() === "") {
      return "Marks is required.";
    }
    const val = Number(q.marks);
    if (isNaN(val)) {
      return "Marks is required.";
    }
    if (!Number.isInteger(val)) {
      return "Marks must be a positive integer.";
    }
    if (val <= 0) {
      return "Marks must be greater than 0.";
    }
    return "";
  };

  const getExplanationError = (q: QuizQuestion, qIndex: number): string => {
    const isTouched = touchedExplanations[qIndex] || showAllErrors;
    if (isTouched && (!q.explanation || q.explanation.trim() === "")) {
      return "Explanation is required.";
    }
    return "";
  };

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => {
        const marksError = getMarksError(q, qIndex);
        const explanationError = getExplanationError(q, qIndex);

        return (
          <div key={q.id || qIndex} className="bg-white dark:bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                  {String(qIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {q.type === "multiple_choice" ? "MULTIPLE CHOICE" : "TRUE / FALSE"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={q.marks !== undefined && q.marks !== null ? q.marks : ""}
                    onKeyDown={handleKeyDownMarks}
                    onChange={(e) => handleMarksChange(qIndex, e.target.value)}
                    placeholder="1"
                    className={`w-20 rounded-lg border ${
                      marksError ? "border-red-500 ring-2 ring-red-100" : "border-slate-200 focus:border-blue-500"
                    } bg-white dark:bg-card px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none text-center transition-all`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Question"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {marksError && (
              <div className="-mt-3 mb-4 text-right">
                <p className="text-red-500 text-xs font-medium">{marksError}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  value={q.prompt}
                  onChange={(e) => handleQuestionChange(qIndex, "prompt", e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full border-none px-0 py-2 text-lg font-medium text-slate-800 outline-none placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, oIndex) => {
                  const isSelected = opt.isCorrect;
                  return (
                    <div 
                      key={oIndex} 
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-green-200 bg-green-50/50' 
                          : 'border-slate-100 hover:border-slate-200 bg-white dark:bg-card'
                      }`}
                    >
                      {q.type === "multiple_choice" ? (
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={
                            oIndex === 0 ? "O(n)" : 
                            oIndex === 1 ? "O(log n)" : 
                            oIndex === 2 ? "O(n^2)" : "O(1)"
                          }
                          className={`w-full bg-transparent outline-none py-1 text-sm font-medium transition-colors ${
                            isSelected ? 'text-green-800' : 'text-slate-600'
                          }`}
                        />
                      ) : (
                        <span className={`w-full py-1 text-sm font-bold ${
                          isSelected ? 'text-green-800' : 'text-slate-600'
                        }`}>
                          {opt.text}
                        </span>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => handleCorrectOptionChange(qIndex, oIndex)}
                        className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                          isSelected ? 'text-green-600 bg-white dark:bg-card' : 'text-slate-300 hover:text-green-500'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 size={24} className="fill-green-100" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Field */}
              <div className="pt-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Explanation <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={q.explanation ?? ""}
                  onChange={(e) => handleQuestionChange(qIndex, "explanation", e.target.value)}
                  onBlur={() => setTouchedExplanations((prev) => ({ ...prev, [qIndex]: true }))}
                  placeholder="Explain why this is the correct answer..."
                  className={`w-full min-h-[80px] rounded-xl border ${
                    explanationError
                      ? "border-red-500 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500"
                  } bg-white dark:bg-card px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400`}
                />
                {explanationError && (
                  <p className="text-red-500 text-xs font-medium mt-1.5">{explanationError}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

