"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Search, SlidersHorizontal, CircleHelp, X } from "lucide-react";
import { isEmpty, isPositiveNumber, inputErrorClass, errorTextClass } from "@/lib/validation";

const QUIZZES_STORAGE_KEY = "admin_quizzes";
const availableDomains = ["COMPUTER SCI", "DATA SCI", "MATHS", "ENGINEERING"];
const defaultTags = ["ALGORITHMS", "BASICS", "MIDTERM", "FINAL"];

type QuestionType = "multiple_choice" | "true_false" | "short_answer";

type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
};

export default function NewQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>(["COMPUTER SCI"]);
  const [domainSearch, setDomainSearch] = useState("");
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [tagInput, setTagInput] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const filteredDomains = useMemo(
    () =>
      availableDomains.filter(
        (item) =>
          item.toLowerCase().includes(domainSearch.toLowerCase()) && !selectedDomains.includes(item),
      ),
    [domainSearch, selectedDomains],
  );

  const addQuestion = (type: QuestionType) => {
    const label =
      type === "multiple_choice"
        ? "Multiple Choice"
        : type === "true_false"
          ? "True / False"
          : "Short Answer";
    setQuestions((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, type, prompt: `${label} question` },
    ]);
  };

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
        if (isEmpty(value)) error = "Quiz title is required";
        else if (value.trim().length < 3) error = "Title must be at least 3 characters";
        break;
      case "durationMinutes":
        if (isEmpty(value)) error = "Duration is required";
        else if (!isPositiveNumber(value)) error = "Duration must be a positive number";
        break;
      case "totalMarks":
        if (isEmpty(value)) error = "Total marks is required";
        else if (!isPositiveNumber(value)) error = "Marks must be a positive number";
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

  const handleFieldBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
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
    return touched[field] && errors[field] ? `${base} ${inputErrorClass}` : base;
  };

  const handleCreateQuiz = (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!validateAll()) {
      setFormError("Please fix the errors above before creating the quiz.");
      return;
    }

    const payload = {
      id: `quiz-${Date.now()}`,
      title: title.trim(),
      domain: selectedDomains[0] || "GENERAL",
      tags,
      module: "Custom Module",
      duration: `${questions.length || 0} Qs`,
      status: "DRAFT",
      durationMinutes,
      totalMarks,
      questionsCount: questions.length,
    };

    try {
      const existingRaw = localStorage.getItem(QUIZZES_STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify([payload, ...existing]));
      setFormSuccess("Quiz created successfully. Redirecting...");
      setTimeout(() => router.push("/admin/quizzes"), 300);
    } catch {
      setFormError("Could not save quiz. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/admin/quizzes" className="hover:text-slate-700">
          Quizzes
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium text-slate-700">Create New Quiz</span>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">Create New Quiz</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the details below to set up a new student assessment.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleCreateQuiz}>
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quiz Details
            </h2>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quiz Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleFieldChange("title", e.target.value, setTitle)}
                onBlur={() => handleFieldBlur("title", title)}
                placeholder="e.g. Introduction to Data Structures Midterm"
                className={getInputClass("title", "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2 transition-all duration-200")}
              />
              {touched.title && errors.title && (
                <p className={errorTextClass}>
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Duration (Minutes) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => handleFieldChange("durationMinutes", e.target.value, setDurationMinutes)}
                onBlur={() => handleFieldBlur("durationMinutes", durationMinutes)}
                min={0}
                placeholder="e.g. 60"
                className={getInputClass("durationMinutes", "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2 transition-all duration-200")}
              />
              {touched.durationMinutes && errors.durationMinutes && (
                <p className={errorTextClass}>
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  {errors.durationMinutes}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Marks <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => handleFieldChange("totalMarks", e.target.value, setTotalMarks)}
                onBlur={() => handleFieldBlur("totalMarks", totalMarks)}
                min={0}
                placeholder="e.g. 100"
                className={getInputClass("totalMarks", "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2 transition-all duration-200")}
              />
              {touched.totalMarks && errors.totalMarks && (
                <p className={errorTextClass}>
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  {errors.totalMarks}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Categorization
            </h2>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Domains <span className="text-red-400">*</span>
              </label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {selectedDomains.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-blue-700"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedDomains((prev) => prev.filter((domain) => domain !== item))
                      }
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={domainSearch}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredDomains.length > 0) {
                      e.preventDefault();
                      const firstDomain = filteredDomains[0];
                      setSelectedDomains((prev) => [...prev, firstDomain]);
                      setDomainSearch("");
                    }
                  }}
                  onChange={(e) => setDomainSearch(e.target.value)}
                  placeholder="Search domains..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
                />
              </div>
              {filteredDomains.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {filteredDomains.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSelectedDomains((prev) => [...prev, item]);
                        setDomainSearch("");
                      }}
                      className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-600 hover:bg-slate-50"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-slate-400">Assign your quiz category tags by domain.</p>
              {touched.domains && errors.domains && (
                <p className={errorTextClass}>
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  {errors.domains}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tags
              </label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-blue-700"
                  >
                    {item}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== item))}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type and press Enter"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
              />
              <div className="mt-2">
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Add Tag
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">Helpful in searching and filtering assessments.</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quiz Content</h2>
            <button
              type="button"
              onClick={() => addQuestion("multiple_choice")}
              className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
            >
              <Plus size={12} />
              Add Question
            </button>
          </div>

          <div className="p-5">
            {questions.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <CircleHelp size={18} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No questions added yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Start building your quiz by adding multiple choice, true/false, or short answer
                  questions.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => addQuestion("multiple_choice")}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
                  >
                    <SlidersHorizontal size={12} />
                    Multiple Choice
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuestion("true_false")}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
                  >
                    <SlidersHorizontal size={12} />
                    True / False
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuestion("short_answer")}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
                  >
                    <SlidersHorizontal size={12} />
                    Short Answer
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Question {index + 1} - {question.type.replace("_", " ")}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setQuestions((prev) => prev.filter((item) => item.id !== question.id))
                        }
                        className="text-xs text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      value={question.prompt}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((item) =>
                            item.id === question.id ? { ...item, prompt: e.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        {formSuccess && <p className="text-sm text-emerald-600">{formSuccess}</p>}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            href="/admin/quizzes"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create Quiz
          </button>
        </div>
      </form>
    </div>
  );
}
