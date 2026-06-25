"use client";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import StatsCard from "@/components/ui/StatsCard";
import { Layers, FileText, Users, CalendarDays, Eye, CheckCircle2 } from "lucide-react";
import { useTutorQuizManagementStats, useTutorQuizManagementBatches } from "@/features/tutor/api/quizmanagement-api";
import InstitutionPageSkeleton from "@/components/admin/institutions/InstitutionPageSkeleton";
import DataTable from "@/components/reusable/DataTable";
import { buildTutorBatchColumns, TutorBatch } from "../dashboard/columns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TutorQuizzesPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const columns = buildTutorBatchColumns();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    isError: isStatsError,
    error: statsError
  } = useTutorQuizManagementStats();


  const {
    data: batchesData,
    isLoading: isLoadingBatches,
    isFetching: isFetchingBatches,
    isError: isBatchesError,
    error: batchesError
  } = useTutorQuizManagementBatches(page, rowsPerPage, debouncedSearch);

  useEffect(() => {
    if (isStatsError) {
      toast.error(statsError?.message || "Failed to load dashboard statistics.");
    }
  }, [isStatsError, statsError]);

  useEffect(() => {
    if (isBatchesError) {
      toast.error(batchesError?.message || "Failed to load batches.");
    }
  }, [isBatchesError, batchesError]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const actions = (row: TutorBatch) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 shadow-lg border-border">
        <DropdownMenuItem asChild>
          <Link href={`/tutor/courses/${row.id}`} className="cursor-pointer flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-500" />
            <span className="font-medium text-slate-700">View Course</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/tutor/batches/${row.id}/attendance`} className="cursor-pointer flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-slate-700">Mark Attendance</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );


  const stats = statsData || {};

  const batchesList = batchesData?.data || [];
  const totalItems = batchesData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6 flex flex-col h-full">
      <Toaster position="top-right" />
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quiz Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and track quiz performance across your batches.
        </p>
      </div>

      {(isLoadingStats || isLoadingBatches) ? (
        <InstitutionPageSkeleton />
      ) : (
        <>
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
            <StatsCard
              title="Total Assigned Batches"
              value={stats.total_assigned_batches ?? 0}
              icon={<Users size={20} />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
            />
            <StatsCard
              title="Total Students"
              value={stats.total_students ?? 0}
              icon={<Users size={20} />}
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
            />
            <StatsCard
              title="Pending Review"
              value={stats.pending_reviews ?? 0}
              icon={<FileText size={20} />}
              iconBgClass="bg-orange-50"
              iconColorClass="text-orange-600"
            />
            <StatsCard
              title="Total Quizzes"
              value={stats.total_quizzes ?? 0}
              icon={<CalendarDays size={20} />}
              iconBgClass="bg-green-50"
              iconColorClass="text-green-600"
            />
            <StatsCard
              title="Average Score"
              value={stats.average_score ?? 0}
              icon={<CalendarDays size={20} />}
              iconBgClass="bg-green-50"
              iconColorClass="text-green-600"
            />
          </div>
          {/* Batch Management Table Section */}
          <div className="flex justify-between items-center mb-8">
            <DataTable
              data={batchesList}
              columns={columns}
              loading={isFetchingBatches}
              actions={actions}
              rowKey={(row) => row.id}
              search={{
                enabled: true,
                value: search,
                onChange: handleSearchChange,
                placeholder: "Search by batch name or course..."
              }}
              currentPage={page}
              rowsPerPage={rowsPerPage}
              totalPages={totalPages}
              onPageChange={setPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setPage(1);
              }}
              paginationInfo={totalItems > 0 ? `Showing ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalItems)} of ${totalItems}` : "0-0 of 0"}
            />
          </div>
        </>
      )}

    </div>
  );
}
