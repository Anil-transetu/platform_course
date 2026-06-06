"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Plus, X, Info, LayoutGrid, Pencil, Trash2, Check,
} from "lucide-react";
import Link from "next/link";
import { isEmpty, isPositiveNumber, inputErrorClass, errorTextClass } from "@/lib/validation";

const availableDomains = ["Computer Science", "Data Engineering", "Mathematics", "Engineering"];

type QuestionType = "multiple_choice" | "true_false" | "short_answer";
type Question = { id: string; type: QuestionType; prompt: string };

const defaultQuestions: Question[] = [
  { id: "q1", type: "multiple_choice", prompt: "What is the time complexity of a Binary Search algorithm?" },
  { id: "q2", type: "true_false", prompt: "A Linked List allows constant time access to its elements by index." },
];

interface EditFormProps {
  id: string;
}

export default function EditForm({ id }: EditFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("Introduction to Algorithms");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [totalMarks, setTotalMarks] = useState("100");
  const [domain, setDomain] = useState("Computer Science");
  const [tags, setTags] = useState<string[]>(["ALGORITHMS", "BASICS"]);
  const [tagInput, setTagInput] = useState("");
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [isPublished, setIsPublished] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);

  const addTag = () => {
    const normalized = tagInput.trim().toUpperCase();
    if (!normalized || tags.includes(normalized)) return;
    setTags((prev) => [...prev, normalized]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const addQuestion = (type: QuestionType) => {
    const labels = { multiple_choice: "Multiple Choice", true_false: "True / False", short_answer: "Short Answer" };
    setQuestions((prev) => [
      ...prev,
      { id: `${Date.now()}`, type, prompt: `${labels[type]} question` },
    ]);
  };

  const removeQuestion = (id: string) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string): string => {
    let error = "";
    switch (field) {
      case "title":
        if (isEmpty(value)) error = "Quiz title is required";
        else if (value.trim().length < 3) error = "Title must be at least 3 characters";
        break;
      case "durationMinutes":
        if (isEmpty(value)) error = "Duration is required";
        else if (!isPositiveNumber(value)) error = "Must be a positive number";
        break;
      case "totalMarks":
        if (isEmpty(value)) error = "Total marks is required";
        else if (!isPositiveNumber(value)) error = "Must be a positive number";
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

  const handleBlur = (field: string, value: string) => {
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
    const allTouched: Record<string, boolean> = {};
    let hasError = false;
    for (const [field, value] of [["title", title], ["durationMinutes", durationMinutes], ["totalMarks", totalMarks]] as [string, string][]) {
      allTouched[field] = true;
      const error = validateField(field, value);
      if (error) hasError = true;
    }
    setTouched((prev) => ({ ...prev, ...allTouched }));
    return !hasError;
  };

  const getInputClass = (field: string, base: string) => {
    return touched[field] && errors[field] ? `${base} ${inputErrorClass}` : base;
  };

  const ErrorMsg = ({ field }: { field: string }) => {
    if (!touched[field] || !errors[field]) return null;
    return (
      <p className={errorTextClass}>
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        {errors[field]}
      </p>
    );
  };

  const handleUpdate = () => {
    if (!validateAll()) {
      return;
    }
    console.log("Updating quiz ID:", id);
    router.push("/admin/quizzes");
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/admin/quizzes" className="hover:text-slate-700">Quizzes</Link>
        <ChevronRight size={14} />
        <span className="font-medium text-slate-700">Edit Quiz</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Quiz (ID: {id})</h1>
          <p className="mt-1 text-sm text-slate-500">Update assessment details and questions for the existing quiz.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/quizzes")}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
          >
            Update Quiz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
              <Info size={15} className="text-blue-500" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-blue-500">Basic Information</h2>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Quiz Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleFieldChange("title", e.target.value, setTitle)}
                  onBlur={() => handleBlur("title", title)}
                  className={getInputClass("title", "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2 transition-all duration-200")}
                />
                <ErrorMsg field="title" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Duration (Minutes) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => handleFieldChange("durationMinutes", e.target.value, setDurationMinutes)}
                  onBlur={() => handleBlur("durationMinutes", durationMinutes)}
                  className={getInputClass("durationMinutes", "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2 transition-all duration-200")}
                />
                <ErrorMsg field="durationMinutes" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Total Marks <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => handleFieldChange("totalMarks", e.target.value, setTotalMarks)}
                  onBlur={() => handleBlur("totalMarks", totalMarks)}
                  className={getInputClass("totalMarks", "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2 transition-all duration-200")}
                />
                <ErrorMsg field="totalMarks" />
              </div>
            </div>
          </section>

          {/* Quiz Content */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div className="flex items-center gap-2">
                <LayoutGrid size={15} className="text-blue-500" />
                <h2 className="text-xs font-bold uppercase tracking-wide text-blue-500">Quiz Content</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addQuestion("multiple_choice")}
                  className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <Plus size={12} /> Add Question
                </button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {questions.map((q, i) => (
                <div key={q.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {q.type.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">{q.prompt}</p>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
                  <p className="text-sm font-semibold text-slate-700">No questions added yet</p>
                  <p className="mt-1 text-xs text-slate-500">Click &quot;Add Question&quot; to start building your quiz.</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" onClick={() => addQuestion("multiple_choice")} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">+ Multiple Choice</button>
                <button type="button" onClick={() => addQuestion("true_false")} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">+ True / False</button>
                <button type="button" onClick={() => addQuestion("short_answer")} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">+ Short Answer</button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Categorization */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Categorization</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Domains</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                >
                  {availableDomains.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-blue-700">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-blue-900">
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Add new tag..."
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Visibility & Settings */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Visibility & Settings</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Published</p>
                  <p className="text-xs text-slate-400">Quiz is visible to students</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                    isPublished
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  <Check size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Shuffle Questions</p>
                  <p className="text-xs text-slate-400">Randomize question order</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShuffleQuestions(!shuffleQuestions)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                    shuffleQuestions
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
