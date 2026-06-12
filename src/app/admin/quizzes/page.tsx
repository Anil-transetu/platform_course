"use client";

import { FileText, Award, HelpCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import StatsCard from "@/components/ui/StatsCard";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable, { Column } from "@/components/reusable/DataTable";
import DeleteDialog from "@/components/reusable/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuizzes, useQuizStats, useDeleteQuiz } from "@/features/admin/quizzes/api/use-quizzes";
import { Quiz } from "@/features/admin/quizzes/api/quiz-api";
import QuizPageSkeleton from "@/components/admin/quizzes/QuizPageSkeleton";

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  if (s === "PUBLISHED" || s === "ACTIVE") {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        PUBLISHED
      </span>
    );
  }
  if (s === "DRAFT") {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        DRAFT
      </span>
    );
  }
  return (
    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
      {s || "UNKNOWN"}
    </span>
  );
}

export default function QuizzesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const { data: quizzesData, isLoading, isFetching } = useQuizzes(
    currentPage,
    rowsPerPage,
    debouncedSearch || undefined,
    statusFilter
  );

  const { data: stats } = useQuizStats();
  const deleteMutation = useDeleteQuiz();

  const quizzesList = Array.isArray(quizzesData) ? quizzesData : quizzesData?.data || [];
  const apiTotal = !Array.isArray(quizzesData) ? quizzesData?.total : undefined;
  const totalCount = apiTotal !== undefined ? apiTotal : quizzesList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // Local Pagination
  let visibleData = quizzesList;
  const start = (currentPage - 1) * rowsPerPage;
  if (quizzesList.length > rowsPerPage) {
    visibleData = quizzesList.slice(start, start + rowsPerPage);
  }

  const paginationInfoStr = totalCount > 0
    ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Quiz deleted successfully");
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete quiz");
        setDeleteId(null);
      }
    });
  };

  const columns: Column<Quiz>[] = [
    {
      key: "title",
      label: "Quiz Title",
      width: "w-1/4",
      render: (_, row) => (
        <span className="font-semibold text-card-foreground">{row.title}</span>
      ),
    },
    {
      key: "domain",
      label: "Domain",
      render: (_, row) => <span className="text-muted-foreground">{row.domain}</span>,
    },
    {
      key: "tags",
      label: "Tags",
      render: (_, row) => (
        <div className="flex flex-wrap gap-1.5">
          {(row.tags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-blue-700"
            >
              {tag}
            </span>
          ))}
          {(row.tags || []).length > 3 && (
            <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-gray-600">
              +{(row.tags || []).length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      render: (_, row) => <span className="text-card-foreground">{row.durationMinutes ? `${row.durationMinutes} Min` : row.duration || "-"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => <StatusBadge status={row.status} />,
    },
  ];

  const searchConfig = {
    enabled: true,
    placeholder: "Search by name, domain, or tags",
    value: searchTerm,
    onChange: setSearchTerm,
  };

  const filtersConfig = [
    {
      id: "status",
      label: "All Status",
      type: "select" as const,
      options: [
        { value: "ALL", label: "All Status" },
        { value: "PUBLISHED", label: "Published" },
        { value: "DRAFT", label: "Draft" },
      ],
      value: statusFilter,
      onChange: (val: string | string[]) => setStatusFilter(val as string),
    },
  ];

  return (
    <ListingScreenTemplate
      headerText="Quiz Management"
      subHeaderText="Manage and organize assessments with domains and tags."
      buttonLabel="Create New Quiz"
      buttonRequired={true}
      buttonOnclick={() => router.push("/admin/quizzes/new")}
    >
      <Toaster position="top-right" />
      {isLoading ? (
        <QuizPageSkeleton />
      ) : (
        <div className="flex flex-col gap-6 p-6 overflow-hidden h-full">
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0">
            <StatsCard
              title="Total Quizzes"
              value={stats?.total_quizzes ?? totalCount}
              icon={<FileText size={20} />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              tooltip="Total number of quizzes created in all modules"
            />
            <StatsCard
              title="Active Quizzes"
              value={stats?.active_quizzes ?? 0}
              icon={<Award size={20} />}
              iconBgClass="bg-green-50"
              iconColorClass="text-green-600"
              tooltip="Quizzes currently active and available to students"
            />
            <StatsCard
              title="Pending Reviews"
              value={stats?.pending_reviews ?? 0}
              icon={<HelpCircle size={20} />}
              iconBgClass="bg-orange-50"
              iconColorClass="text-orange-600"
              tooltip="Quizzes that are currently in Draft status"
            />
          </div>

          {/* DataTable Wrapper */}
          <div className="flex-1 overflow-hidden min-h-0">
            <DataTable<Quiz>
              data={visibleData}
              columns={columns}
              rowKey={(r) => r.id}
              loading={isLoading || isFetching}
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
              actions={(row: Quiz) => (
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-md hover:bg-muted text-muted-foreground">
                        <span className="sr-only">Open actions</span>
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onSelect={() => router.push(`/admin/quizzes/${row.id}?mode=edit`)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-card-foreground cursor-pointer"
                      >
                        <Pencil size={13} className="text-muted-foreground" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setDeleteId(row.id.toString())}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={13} className="text-red-500" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              emptyStateMessage="No quizzes match your search/filter."
            />
          </div>
        </div>
      )}

      <DeleteDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onSubmit={handleDelete}
        itemName={visibleData.find((r) => r.id.toString() === deleteId)?.title || "this quiz"}
        isLoading={deleteMutation.isPending}
        title="Delete Quiz"
      />
    </ListingScreenTemplate>
  );
}
