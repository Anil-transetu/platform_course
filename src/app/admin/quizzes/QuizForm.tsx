"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, Info, LayoutGrid, Check, Plus, SlidersHorizontal } from "lucide-react";
import { Quiz, QuizQuestion } from "@/features/admin/quizzes/api/quiz-api";
import { useCreateQuiz, useUpdateQuiz } from "@/features/admin/quizzes/api/use-quizzes";
import { toast, Toaster } from "sonner";
import QuestionBuilder from "./QuestionBuilder";
import { useRouter } from "next/navigation";

const availableDomains = ["COMPUTER SCI", "DATA SCI", "MATHS", "ENGINEERING"];

interface Props {
  mode: "add" | "edit";
  initialData?: Quiz | null;
}

export default function QuizForm({ mode, initialData }: Props) {
  const router = useRouter();
  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();

  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>(["COMPUTER SCI"]);
  const [domainSearch, setDomainSearch] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || initialData.quiz_title || "");
      setDurationMinutes(initialData.durationMinutes?.toString() || "");
      setTotalMarks(initialData.totalMarks?.toString() || "");
      setSelectedDomains(initialData.domain ? [initialData.domain] : ["COMPUTER SCI"]);
      setTags(initialData.tags || []);
      setQuestions(initialData.questions || []);
      setIsPublished(initialData.status === "PUBLISHED" || initialData.status === "ACTIVE" || initialData.status === "published");
      setShuffleQuestions(initialData.shuffleQuestions || false);
    } else {
      setTitle("");
      setDurationMinutes("");
      setTotalMarks("");
      setSelectedDomains(["COMPUTER SCI"]);
      setTags([]);
      setQuestions([]);
      setIsPublished(false);
      setShuffleQuestions(false);
    }
    setErrors({});
    setTouched({});
    setDomainSearch("");
    setTagInput("");
  }, [mode, initialData]);

  const filteredDomains = useMemo(
    () =>
      availableDomains.filter(
        (item) =>
          item.toLowerCase().includes(domainSearch.toLowerCase()) && !selectedDomains.includes(item),
      ),
    [domainSearch, selectedDomains],
  );

  const addTag = () => {
    const normalized = tagInput.trim().toUpperCase();
    if (!normalized) return;
    if (!tags.includes(normalized)) {
      setTags((prev) => [...prev, normalized]);
    }
    setTagInput("");
  };

  const validateField = (field: string, value: string): string => {
    let error = "";
    switch (field) {
      case "title":
        if (!value.trim()) error = "Quiz title is required";
        else if (value.trim().length < 3) error = "Title must be at least 3 characters";
        break;
      case "durationMinutes":
        if (!value) error = "Duration is required";
        else if (isNaN(Number(value)) || Number(value) <= 0) error = "Must be a positive number";
        break;
      case "totalMarks":
        if (!value) error = "Total marks is required";
        else if (isNaN(Number(value)) || Number(value) <= 0) error = "Must be a positive number";
        break;
      case "domains":
        if (selectedDomains.length === 0) error = "Select at least one domain";
        break;
    }
    setErrors((prev) => {
      if (error) return { ...prev, [field]: error };
      const next = { ...prev };
      delete next[field];
      return next;
    });
    return error;
  };

  const handleFieldChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validateAll = (): boolean => {
    const validations: [string, string][] = [
      ["title", title],
      ["durationMinutes", durationMinutes],
      ["totalMarks", totalMarks],
    ];
    const allTouched: Record<string, boolean> = {};
    let hasError = false;
    for (const [field, value] of validations) {
      allTouched[field] = true;
      const error = validateField(field, value);
      if (error) hasError = true;
    }
    if (selectedDomains.length === 0) {
      allTouched["domains"] = true;
      setErrors((prev) => ({ ...prev, domains: "Select at least one domain" }));
      hasError = true;
    }
    setTouched((prev) => ({ ...prev, ...allTouched }));
    return !hasError;
  };

  const getInputClass = (field: string, base: string) => {
    return touched[field] && errors[field] ? `${base} border-red-500` : base;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateAll()) {
      toast.error("Please fix the errors above before saving.");
      return;
    }

    const payload: Record<string, any> = {
      quiz_title: title.trim(),
      title: title.trim(), // Send both just in case
      domain: selectedDomains[0] || "GENERAL",
      tags,
      duration: Number(durationMinutes),
      duration_minutes: Number(durationMinutes),
      durationMinutes: Number(durationMinutes),
      total_marks: Number(totalMarks),
      totalMarks: Number(totalMarks),
      status: isPublished ? "published" : "draft",
      is_published: isPublished,
      questions: questions.map(q => {
        const correctOpt = q.options.find(o => o.isCorrect) || q.options[0];
        return {
          question_text: q.prompt,
          type: q.type === "multiple_choice" ? "mcq" : "true_false",
          options: q.options.map(o => o.text),
          correct_answer: correctOpt.text,
          marks: Math.max(1, Math.floor(Number(totalMarks) / (questions.length || 1)))
        };
      }),
      shuffle_questions: shuffleQuestions
    };

    if (mode === "add") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Quiz created successfully!");
          router.push("/admin/quizzes");
        },
        onError: (err: any) => toast.error(err.message || "Failed to create quiz"),
      });
    } else if (initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Quiz updated successfully!");
            router.push("/admin/quizzes");
          },
          onError: (err: any) => toast.error(err.message || "Failed to update quiz"),
        }
      );
    }
  };

  const handleAddQuestion = (type: "multiple_choice" | "true_false") => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      type,
      prompt: "",
      options: type === "multiple_choice" 
        ? [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ]
        : [
            { text: "True", isCorrect: true },
            { text: "False", isCorrect: false },
          ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-5xl">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm text-slate-500 mb-2">
          <span className="cursor-pointer hover:text-slate-800" onClick={() => router.push("/admin/quizzes")}>Quizzes</span> / <span className="text-slate-800 font-semibold">{mode === "add" ? "Create New Quiz" : "Edit Quiz Details"}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{mode === "add" ? "Create New Quiz" : "Edit Quiz Details"}</h1>
        <p className="text-sm text-slate-500">
          {mode === "add" ? "Fill in the details below to set up a new student assessment." : "Update assessment details and questions for the existing quiz."}
        </p>
      </div>

      <div className="space-y-6 pb-24">

        {/* Basic Information */}
        <section className="rounded-2xl border border-slate-100 bg-white dark:bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <Info size={16} className="text-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Basic Information</h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-slate-800">Quiz Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleFieldChange("title", e.target.value, setTitle)}
                onBlur={() => setTouched(p => ({ ...p, title: true }))}
                placeholder="e.g. Introduction to Data Structures Midterm"
                className={getInputClass("title", "w-full rounded-xl border border-slate-200 bg-white dark:bg-card px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all")}
              />
              {touched.title && errors.title && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.title}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">Duration (Minutes) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => handleFieldChange("durationMinutes", e.target.value, setDurationMinutes)}
                  onBlur={() => setTouched(p => ({ ...p, durationMinutes: true }))}
                  placeholder="e.g. 60"
                  className={getInputClass("durationMinutes", "w-full rounded-xl border border-slate-200 bg-white dark:bg-card px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all")}
                />
                {touched.durationMinutes && errors.durationMinutes && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.durationMinutes}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">Total Marks <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => handleFieldChange("totalMarks", e.target.value, setTotalMarks)}
                  onBlur={() => setTouched(p => ({ ...p, totalMarks: true }))}
                  placeholder="e.g. 100"
                  className={getInputClass("totalMarks", "w-full rounded-xl border border-slate-200 bg-white dark:bg-card px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all")}
                />
                {touched.totalMarks && errors.totalMarks && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.totalMarks}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Categorization */}
        <section className="rounded-2xl border border-slate-100 bg-white dark:bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Categorization</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Domains <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 min-h-[52px] focus-within:border-blue-500 focus-within:bg-white dark:bg-card focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                {selectedDomains.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-2.5 py-1.5 text-xs font-bold tracking-wide text-blue-700"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => setSelectedDomains((prev) => prev.filter((d) => d !== item))}
                      className="text-blue-500 hover:text-blue-800"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={domainSearch}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredDomains.length > 0) {
                      e.preventDefault();
                      setSelectedDomains((prev) => [...prev, filteredDomains[0]]);
                      setDomainSearch("");
                    }
                  }}
                  onChange={(e) => setDomainSearch(e.target.value)}
                  placeholder={selectedDomains.length === 0 ? "Search domains..." : "Search domains..."}
                  className="flex-1 min-w-[120px] bg-transparent px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-3">Select one or more professional domains for this quiz.</p>

              {filteredDomains.length > 0 && domainSearch.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-white dark:bg-card border border-slate-100 rounded-xl shadow-sm absolute z-10 w-full max-w-sm">
                  {filteredDomains.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSelectedDomains((prev) => [...prev, item]);
                        setDomainSearch("");
                      }}
                      className="rounded-lg border border-slate-200 bg-white dark:bg-card px-3 py-1.5 text-xs font-bold tracking-wide text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              )}
              {touched.domains && errors.domains && <p className="text-red-500 text-xs mt-2 font-medium">{errors.domains}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Tags</label>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 min-h-[52px] focus-within:border-blue-500 focus-within:bg-white dark:bg-card focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                {tags.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 px-2.5 py-1.5 text-xs font-bold tracking-wide text-slate-700"
                  >
                    {item}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== item))} className="text-slate-500 hover:text-slate-800">
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder={tags.length === 0 ? "Type and press Enter..." : "Type and press Enter..."}
                  className="flex-1 min-w-[120px] bg-transparent px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-3">Helpful for searching and filtering assessments.</p>
            </div>
          </div>
        </section>

        {/* Quiz Content Builder */}
        <section className="rounded-2xl border border-slate-100 bg-white dark:bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <LayoutGrid size={16} className="text-blue-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Quiz Content</h2>
            </div>
            
            {/* Action when questions exist */}
            {questions.length > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAddQuestion("multiple_choice")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 text-xs font-bold transition-colors"
                >
                  <Plus size={14} strokeWidth={3} /> Multiple Choice
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion("true_false")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 text-xs font-bold transition-colors"
                >
                  <Plus size={14} strokeWidth={3} /> True / False
                </button>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-slate-50/30">
            {questions.length === 0 ? (
              <div className="py-16 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-white dark:bg-card">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
                  <LayoutGrid size={24} className="text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No questions added yet</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm text-center">Start building your quiz by adding Multiple Choice or True/False questions.</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion("multiple_choice")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:bg-card px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                  >
                    <SlidersHorizontal size={16} className="text-slate-400" /> Multiple Choice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion("true_false")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:bg-card px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                  >
                    <SlidersHorizontal size={16} className="text-slate-400" /> True / False
                  </button>
                </div>
              </div>
            ) : (
              <QuestionBuilder questions={questions} onChange={setQuestions} />
            )}
          </div>
        </section>

        {/* Visibility & Settings */}
        <section className="rounded-2xl border border-slate-100 bg-white dark:bg-card shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Visibility & Settings</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Published Status</p>
                <p className="text-xs text-slate-500 mt-0.5">Quiz will be visible to students</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  isPublished
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-slate-50 text-transparent"
                }`}
              >
                <Check size={16} strokeWidth={3} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Shuffle Questions</p>
                <p className="text-xs text-slate-500 mt-0.5">Randomize question order for students</p>
              </div>
              <button
                type="button"
                onClick={() => setShuffleQuestions(!shuffleQuestions)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  shuffleQuestions
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-slate-50 text-transparent"
                }`}
              >
                <Check size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white dark:bg-card border-t border-slate-200 p-4 z-50">
        <div className="mx-auto max-w-5xl flex justify-end gap-3 pr-4">
          <button
            onClick={() => router.push("/admin/quizzes")}
            className="px-5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white dark:bg-card text-slate-600 hover:bg-slate-50 font-semibold transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2.5 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow-sm"
          >
            {isPending ? "Saving..." : mode === "add" ? "Create Quiz" : "Update Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
