"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
// Link removed (not used) - using router.push for navigation
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable, { Column, SearchConfig, FilterConfig } from "@/components/reusable/DataTable";
import DeleteDialog from "@/components/reusable/DeleteDialog";

const QUIZZES_STORAGE_KEY = "admin_quizzes";

type QuizItem = {
  id: string;
  title: string;
  domain: string;
  tags: string[];
  module: string;
  duration: string;
  status: string;
};

const initialRows: QuizItem[] = (() => {
  const seeds: QuizItem[] = [
    {
      id: "quiz-001",
      title: "Introduction to Algorithms",
      domain: "Computer Science",
      tags: ["ALGORITHMS", "BASICS"],
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

  const statuses = ["PUBLISHED", "DRAFT", "SCHEDULED"] as const;
  const domains = ["Computer Science", "Data Engineering", "Mathematics", "Physics"];

  // generate additional dummy rows up to 30 items
  const rows: QuizItem[] = [...seeds];
  for (let i = 5; i <= 30; i++) {
    const id = `quiz-${String(i).padStart(3, "0")}`;
    const title = `Sample Quiz ${i}`;
    const domain = domains[i % domains.length];
    const tags = [`TAG${i % 5}`, i % 2 === 0 ? "PRACTICE" : "THEORY"];
    const moduleName = `Module ${((i - 1) % 6) + 1}: Topic ${((i - 1) % 10) + 1}`;
    const duration = `${10 + ((i - 1) % 5) * 5} Qs`;
    const status = statuses[i % statuses.length];
    rows.push({ id, title, domain, tags, module: moduleName, duration, status });
  }

  return rows;
})();

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
  const [statusFilter, setStatusFilter] = useState<string | string[]>("ALL");
  const [rows, setRows] = useState<QuizItem[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    // load from localStorage (optional) and merge with initial rows
    try {
      const raw = localStorage.getItem(QUIZZES_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const combined = Array.isArray(parsed) && parsed.length > 0 ? [...parsed, ...initialRows] : [...initialRows];
      // dedupe by id (keep first occurrence)
      const map = new Map<string, QuizItem>();
      for (const r of combined) {
        if (!map.has(r.id)) map.set(r.id, r);
      }
      setRows(Array.from(map.values()));
      return;
    } catch {
      // ignore
    }
    // fallback
    setRows(initialRows);
  }, []);

  useEffect(() => {
    // persist to localStorage so delete survives refresh for demo
    try {
      localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(rows));
    } catch {}
    // if current page becomes out of range after rows change, clamp it
    const total = Math.max(1, Math.ceil(rows.length / rowsPerPage));
    if (currentPage > total) setCurrentPage(total);
  }, [rows, rowsPerPage, currentPage]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const text = `${r.title} ${r.domain} ${r.tags.join(" ")} ${r.module}`.toLowerCase();
      const matchesText = !q || text.includes(q);
      const matchesStatus =
        statusFilter === "ALL" || statusFilter === "" || (Array.isArray(statusFilter) ? statusFilter.includes(r.status) : r.status === statusFilter);
      return matchesText && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const paginationInfoStr = (() => {
    const start = filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(filtered.length, currentPage * rowsPerPage);
    return `${start}-${end} of ${filtered.length}`;
  })();

  const stats = useMemo(
    () => [
      { label: "TOTAL QUIZZES", value: String(rows.length) },
      { label: "ACTIVE QUIZZES", value: String(rows.filter((r) => r.status === "PUBLISHED").length) },
      { label: "PENDING REVIEWS", value: String(rows.filter((r) => r.status === "DRAFT" || r.status === "SCHEDULED").length) },
    ],
    [rows],
  );

  const columns: Column<QuizItem>[] = [
    { key: "title", label: "Quiz Title", width: "w-72", sortable: true },
    { key: "domain", label: "Domain" },
    {
      key: "tags",
      label: "Tags",
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.map((t) => (
            <span key={t} className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {t}
            </span>
          ))}
        </div>
      ),
    },
    { key: "module", label: "Module" },
    { key: "duration", label: "Questions" },
    {
      key: "status",
      label: "Status",
      render: (v: unknown) => <StatusBadge status={String(v)} />,
    },
  ];

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    // simulate API call
    await new Promise((r) => setTimeout(r, 700));
    setRows((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    setIsDeleting(false);
  };

  const searchConfig: SearchConfig = {
    enabled: true,
    placeholder: "Search by name, domain, tags, or ID",
    value: searchTerm,
    onChange: (v) => setSearchTerm(v as string),
  };

  const filtersConfig: FilterConfig[] = [
    {
      id: "status",
      label: "All Status",
      type: "select",
      options: [
        { value: "ALL", label: "All" },
        { value: "PUBLISHED", label: "Published" },
        { value: "DRAFT", label: "Draft" },
        { value: "SCHEDULED", label: "Scheduled" },
      ],
      value: Array.isArray(statusFilter) ? statusFilter : statusFilter || "ALL",
      onChange: (v) => setStatusFilter(v),
      clearable: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6">
      <ListingScreenTemplate
        headerText="Quiz Management"
        subHeaderText="Manage and organize student assessments with domains and tags."
        buttonRequired
        buttonLabel="Create New Quiz"
        buttonOnclick={() => {}}
      >
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-slate-400">{stat.label}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                <span className="rounded-md border border-blue-100 bg-blue-50 p-1 text-blue-600">
                  <Plus size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <DataTable
            data={paginated}
            columns={columns}
            rowKey={(r) => r.id}
            rowsPerPage={rowsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n);
              setCurrentPage(1);
            }}
            paginationInfo={paginationInfoStr}
            showPagination
            search={searchConfig}
            filters={filtersConfig}
            actions={(row: QuizItem) => (
              <div className="flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-md hover:bg-slate-50 text-slate-500">
                      <span className="sr-only">Open actions</span>
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => router.push(`/admin/quizzes/edit/${row.id}`)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700"
                    >
                      <Pencil size={13} className="text-slate-400" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setDeleteId(row.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600"
                    >
                      <Trash2 size={13} className="text-red-400" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            emptyStateMessage="No quizzes match your search/filter."
          />
        </div>
      </ListingScreenTemplate>

      <DeleteDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onSubmit={handleDelete}
        itemName={rows.find((r) => r.id === deleteId)?.title}
        isLoading={isDeleting}
        title="Delete Quiz"
      />
    </div>
  );
}

