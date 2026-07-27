"use client";

import { useState, useMemo, useEffect } from "react";
import { Info, LayoutGrid, Check, Plus, SlidersHorizontal, AlertCircle, CheckCircle2 } from "lucide-react";
import { Quiz, QuizQuestion } from "@/features/admin/quizzes/api/quiz-api";
import { useCreateQuiz, useUpdateQuiz } from "@/features/admin/quizzes/api/use-quizzes";
import { toast, Toaster } from "sonner";
import QuestionBuilder from "./QuestionBuilder";
import { useRouter } from "next/navigation";
import DomainSelect from "@/components/reusable/DomainSelect";
import Chip from "@/components/reusable/Chip";
import TagsInput from "@/components/reusable/TagsInput";

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
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || initialData.quiz_title || "");
      setDurationMinutes(initialData.durationMinutes?.toString() || "");
      setTotalMarks(initialData.totalMarks?.toString() || "");
      const rawDoms = Array.isArray(initialData.domains) && initialData.domains.length > 0
        ? initialData.domains
        : initialData.domain
        ? [initialData.domain]
        : [];
      const initialDoms = rawDoms
        .map((d: any) => {
          if (typeof d === "object" && d !== null) {
            return d.name || d.domain_name || d.title || "";
          }
          return String(d || "");
        })
        .filter(Boolean);
      setSelectedDomains(initialDoms);
      setTags(initialData.tags || []);
      setQuestions(
        (initialData.questions || []).map((q) => ({
          ...q,
          marks: q.marks !== undefined && q.marks !== null && !isNaN(Number(q.marks)) ? Number(q.marks) : 1,
          explanation: q.explanation ?? "",
        }))
      );
      setIsPublished(initialData.status === "PUBLISHED" || initialData.status === "ACTIVE" || initialData.status === "published");
      setShuffleQuestions(
        initialData.shuffle_questions !== undefined
          ? Boolean(initialData.shuffle_questions)
          : initialData.shuffleQuestions !== undefined
          ? Boolean(initialData.shuffleQuestions)
          : Boolean(initialData.shuffle)
      );
    } else {
      setTitle("");
      setDurationMinutes("");
      setTotalMarks("");
      setSelectedDomains([]);
      setTags([]);
      setQuestions([]);
      setIsPublished(false);
      setShuffleQuestions(false);
    }
    setErrors({});
    setTouched({});
    setShowAllErrors(false);
    setTagInput("");
  }, [mode, initialData]);

  // Derived marks calculations
  const targetTotalMarks = useMemo(() => {
    const val = Number(totalMarks);
    return isNaN(val) || val <= 0 ? 0 : val;
  }, [totalMarks]);

  const assignedQuestionMarks = useMemo(() => {
    return questions.reduce((sum, q) => {
      const m = Number(q.marks);
      return sum + (isNaN(m) ? 0 : m);
    }, 0);
  }, [questions]);

  const remainingMarks = useMemo(() => {
    return targetTotalMarks - assignedQuestionMarks;
  }, [targetTotalMarks, assignedQuestionMarks]);

  const marksValidationStatus = useMemo(() => {
    if (!totalMarks || isNaN(Number(totalMarks)) || Number(totalMarks) <= 0) {
      return { valid: false, message: "Enter a valid positive number for Quiz Total Marks.", type: "error" };
    }
    if (questions.length === 0) {
      return { valid: false, message: "Add at least one question to the quiz.", type: "warning" };
    }
    for (let i = 0; i < questions.length; i++) {
      const m = questions[i].marks;
      if (m === undefined || m === null || String(m).trim() === "") {
        return { valid: false, message: `Question ${i + 1} has empty marks.`, type: "error" };
      }
      const val = Number(m);
      if (isNaN(val) || !Number.isInteger(val) || val <= 0) {
        return { valid: false, message: `Question ${i + 1} marks must be a positive integer.`, type: "error" };
      }
      const exp = questions[i].explanation;
      if (!exp || exp.trim() === "") {
        return { valid: false, message: `Question ${i + 1} requires an explanation.`, type: "error" };
      }
    }
    if (assignedQuestionMarks !== targetTotalMarks) {
      if (assignedQuestionMarks < targetTotalMarks) {
        return { 
          valid: false, 
          message: `Assign the remaining ${remainingMarks} mark${remainingMarks > 1 ? 's' : ''} before saving.`, 
          type: "warning" 
        };
      } else {
        return { 
          valid: false, 
          message: `Exceeded Quiz Total Marks by ${Math.abs(remainingMarks)} mark${Math.abs(remainingMarks) > 1 ? 's' : ''}.`, 
          type: "error" 
        };
      }
    }
    return { valid: true, message: "✓ Marks allocation complete", type: "success" };
  }, [questions, targetTotalMarks, assignedQuestionMarks, totalMarks, remainingMarks]);

  const isFormValid = useMemo(() => {
    const hasValidQuestions = questions.length > 0 && questions.every(
      (q) => q.prompt && q.prompt.trim() !== "" && q.explanation && q.explanation.trim() !== ""
    );
    return (
      title.trim().length >= 3 &&
      Number(durationMinutes) > 0 &&
      targetTotalMarks > 0 &&
      selectedDomains.length > 0 &&
      hasValidQuestions &&
      marksValidationStatus.valid
    );
  }, [title, durationMinutes, targetTotalMarks, selectedDomains, questions, marksValidationStatus]);

  const handleDomainSelect = (val: string, domainObj?: { id: number; name: string }) => {
    const domainName = (domainObj?.name || val).trim();
    if (!domainName) return;
    const exists = selectedDomains.some((d) => d.toUpperCase() === domainName.toUpperCase());
    let updated: string[];
    if (exists) {
      updated = selectedDomains.filter((d) => d.toUpperCase() !== domainName.toUpperCase());
    } else {
      updated = [...selectedDomains, domainName];
    }
    setSelectedDomains(updated);
    if (errors.domains) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.domains;
        return copy;
      });
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    const updated = selectedDomains.filter((d) => d.toUpperCase() !== domainToRemove.toUpperCase());
    setSelectedDomains(updated);
    if (updated.length === 0 && touched.domains) {
      setErrors((prev) => ({ ...prev, domains: "Select at least one domain" }));
    }
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
    setShowAllErrors(true);
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

    const missingExpIdx = questions.findIndex((q) => !q.explanation || q.explanation.trim() === "");
    if (missingExpIdx !== -1) {
      toast.error(`Question ${missingExpIdx + 1} requires an explanation.`);
      hasError = true;
    }

    if (!marksValidationStatus.valid) {
      toast.error(
        assignedQuestionMarks !== targetTotalMarks
          ? "The total of all question marks must exactly equal the Quiz Total Marks."
          : marksValidationStatus.message
      );
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
      return;
    }

    const payload: Record<string, any> = {
      quiz_title: title.trim(),
      title: title.trim(),
      domain: selectedDomains[0] || "GENERAL",
      tags,
      duration: Number(durationMinutes),
      duration_minutes: Number(durationMinutes),
      durationMinutes: Number(durationMinutes),
      total_marks: Number(totalMarks),
      totalMarks: Number(totalMarks),
      status: isPublished ? "published" : "draft",
      is_published: isPublished,
      shuffle_questions: shuffleQuestions,
      questions: questions.map((q) => {
        const correctOpt = q.options.find((o) => o.isCorrect) || q.options[0];
        return {
          question: q.prompt,
          question_text: q.prompt,
          type: q.type === "multiple_choice" ? "mcq" : "true_false",
          options: q.options.map((o) => o.text),
          correct_answer: correctOpt ? correctOpt.text : "",
          marks: Number(q.marks),
          explanation: (q.explanation || "").trim(),
        };
      }),
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
      marks: 1,
      explanation: "",
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
        <section className="rounded-2xl border border-slate-100 bg-white dark:bg-card shadow-sm relative z-20">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 bg-slate-50/50 rounded-t-2xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Categorization</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-foreground">
                Domains <span className="text-red-500">*</span>
              </label>
              <DomainSelect
                value=""
                onChange={handleDomainSelect}
                placeholder="Search and select domains..."
                allowClear={false}
                closeOnSelect={false}
                selectedValues={selectedDomains}
                error={touched.domains && !!errors.domains}
              />
              {selectedDomains.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {selectedDomains.map((dom) => (
                    <Chip
                      key={dom}
                      label={dom}
                      variant="domain"
                      onRemove={() => handleRemoveDomain(dom)}
                    />
                  ))}
                </div>
              )}
              {touched.domains && errors.domains && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.domains}</p>
              )}
            </div>

            <div>
              <TagsInput
                label="Tags"
                variant="tag"
                value={tags}
                onChange={(newTags) => setTags(newTags)}
              />
              <p className="text-xs text-slate-400 font-medium mt-2">Helpful for searching and filtering assessments.</p>
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
            {/* Live Marks Summary Header */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white dark:bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <span className="text-slate-500 font-medium">Quiz Total Marks:</span>{" "}
                    <span className="font-bold text-slate-800">{targetTotalMarks}</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <span className="text-slate-500 font-medium">Assigned Question Marks:</span>{" "}
                    <span className="font-bold text-blue-600">{assignedQuestionMarks}</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <span className="text-slate-500 font-medium">Remaining Marks:</span>{" "}
                    <span
                      className={`font-bold ${
                        remainingMarks === 0
                          ? "text-green-600"
                          : remainingMarks > 0
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {remainingMarks}
                    </span>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      marksValidationStatus.valid
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : marksValidationStatus.type === "warning"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {marksValidationStatus.valid ? (
                      <CheckCircle2 size={14} className="text-green-600" />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    {marksValidationStatus.message}
                  </span>
                </div>
              </div>
            </div>

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
              <QuestionBuilder questions={questions} onChange={setQuestions} showAllErrors={showAllErrors} />
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
            disabled={isPending || !isFormValid}
            className="px-6 py-2.5 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
          >
            {isPending ? "Saving..." : mode === "add" ? "Create Quiz" : "Update Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
