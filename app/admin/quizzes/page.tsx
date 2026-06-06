"use client";

import { Search, Plus, ChevronDown, MoreVertical, Pencil, Trash2, FileText, Award, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatsCard from "@/components/ui/StatsCard";

const QUIZZES_STORAGE_KEY = "admin_quizzes";

type QuizItem = {
  id?: string;
  title: string;
  domain: string;
  tags: string[];
  module: string;
  duration: string;
  status: string;
};

const quizRows: QuizItem[] = [
  {
    id: "quiz-001",
    title: "Introduction to Algorithms",
    domain: "Computer Science",
    tags: ["ALGORITHMS", "BASIC"],
    module: "Module 1: Foundations",
    duration: "15 Qs",
    status: "PUBLISHED",
  },
  {
    id: "quiz-002",
    title: "Big O Notation Deep Dive",
    domain: "Computer Science",
    tags: ["COMPLEXITY", "ADVANCED"],
    module: "Module 2: Complexity",
    duration: "10 Qs",
    status: "DRAFT",
  },
  {
    id: "quiz-003",
    title: "Sorting Algorithms Midterm",
    domain: "Data Engineering",
    tags: ["SORTING", "MIDTERM"],
    module: "Module 3: Sorting",
    duration: "40 Qs",
    status: "PUBLISHED",
  },
  {
    id: "quiz-004",
    title: "Final Comprehensive Assessment",
    domain: "Computer Science",
    tags: ["FINAL", "GENERAL"],
    module: "Module 5: Final Project",
    duration: "50 Qs",
    status: "SCHEDULED",
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "PUBLISHED") {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        {status}
      </span>
    );
  }

  if (status === "DRAFT") {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        {status}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
      {status}
    </span>
  );
}

export default function QuizzesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [savedRows, setSavedRows] = useState<QuizItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUIZZES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedRows(parsed);
      }
    } catch {
      setSavedRows([]);
    }
  }, []);

  const allRows = useMemo(() => [...savedRows, ...quizRows], [savedRows]);

  const filteredRows = useMemo(() => {
    return allRows.filter((quiz) => {
      const text = `${quiz.title} ${quiz.domain} ${quiz.tags.join(" ")} ${quiz.module}`.toLowerCase();
      const searchMatch = text.includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === "ALL" || quiz.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [allRows, searchTerm, statusFilter]);

  const totalQuizzes = allRows.length;
  const activeQuizzes = allRows.filter((item) => item.status === "PUBLISHED").length;
  const pendingReviews = allRows.filter((item) => item.status === "DRAFT" || item.status === "SCHEDULED").length;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Quiz Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and organize assessments with domains and tags.
          </p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
        >
          <Plus size={16} />
          Create New Quiz
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Quizzes"
          value={totalQuizzes}
          icon={<FileText size={20} />}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
          tooltip="Total number of quizzes created in all modules"
        />
        <StatsCard
          title="Active Quizzes"
          value={activeQuizzes}
          icon={<Award size={20} />}
          iconBgClass="bg-green-50"
          iconColorClass="text-green-600"
          tooltip="Quizzes currently active and available to students"
        />
        <StatsCard
          title="Pending Reviews"
          value={pendingReviews}
          icon={<HelpCircle size={20} />}
          iconBgClass="bg-orange-50"
          iconColorClass="text-orange-600"
          tooltip="Quizzes that are currently in Draft or Scheduled status"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, domain, tags, or ID"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <span className="whitespace-nowrap">All Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm text-slate-600 outline-none"
            >
              <option value="ALL">All</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
            <ChevronDown size={15} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Quiz Title</th>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Tags</th>
                <th className="px-5 py-3">Module</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((quiz, index) => {
                const rowId = quiz.id ?? `${quiz.title}-${index}`;
                return (
                <tr key={rowId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-800">{quiz.title}</td>
                  <td className="px-5 py-4 text-slate-600">{quiz.domain}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {quiz.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{quiz.module}</td>
                  <td className="px-5 py-4 text-slate-700">{quiz.duration}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={quiz.status} />
                  </td>
                  <td className="relative px-5 py-4 text-right">
                    <button
                      onClick={() => setOpenActionId(openActionId === rowId ? null : rowId)}
                      className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openActionId === rowId && (
                      <div className="absolute right-5 top-12 z-20 w-32 rounded-md border border-slate-200 bg-white py-1 text-left shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenActionId(null);
                            router.push(`/admin/quizzes/edit/${rowId}`);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={13} className="text-slate-400" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenActionId(null);
                            router.push(`/admin/quizzes/delete/step1/${rowId}`);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} className="text-red-400" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )})}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-sm text-slate-500">
                    No quizzes match your search/filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex items-center gap-2">
            Rows per page:
            <button className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-slate-600">
              10
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="inline-flex items-center gap-2">
            <button className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100">Previous</button>
            <span className="rounded-md bg-blue-600 px-2.5 py-1 font-medium text-white">1</span>
            <button className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100">2</button>
            <button className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

