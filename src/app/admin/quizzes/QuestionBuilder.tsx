import {
  Trash2,
  CheckCircle2,
  Circle,
  Pencil,
} from "lucide-react";
import { QuizQuestion, QuestionType } from "@/features/admin/quizzes/api/quiz-api";

interface QuestionBuilderProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

export default function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
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

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => (
        <div key={q.id || qIndex} className="bg-white dark:bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                {String(qIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {q.type === "multiple_choice" ? "MULTIPLE CHOICE" : "TRUE / FALSE"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveQuestion(qIndex)}
                className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

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
          </div>
        </div>
      ))}
    </div>
  );
}
