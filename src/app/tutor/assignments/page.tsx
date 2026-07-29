"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import StatsCard from "@/components/ui/StatsCard";
import { FileText, Users, Clock } from "lucide-react";
import { useTutorAssignmentStats, useTutorAssignmentBatches } from "@/features/tutor/api/assignmentmanagement-api";
import InstitutionPageSkeleton from "@/components/admin/institutions/InstitutionPageSkeleton";
import DataTable from "@/components/reusable/DataTable";
import { buildAssignmentColumns } from "./columns";

export default function TutorAssignmentsPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const columns = buildAssignmentColumns();

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
  } = useTutorAssignmentStats();

  const {
    data: batchesData,
    isLoading: isLoadingBatches,
    isFetching: isFetchingBatches,
    isError: isBatchesError,
    error: batchesError
  } = useTutorAssignmentBatches(page, rowsPerPage, debouncedSearch);

  useEffect(() => {
    if (isStatsError) {
      toast.error(statsError?.message || "Failed to load assignment statistics.");
    }
  }, [isStatsError, statsError]);

  useEffect(() => {
    if (isBatchesError) {
      toast.error(batchesError?.message || "Failed to load assignment batches.");
    }
  }, [isBatchesError, batchesError]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const stats = statsData || {};
  const totalBatches = stats.totalBatches ?? stats.total_batches ?? 0;
  const totalSubmissions = stats.totalAssignmentSubmissions ?? stats.total_assignment_submissions ?? stats.total_submissions ?? 0;
  const pendingEvaluations = stats.pendingEvaluations ?? stats.pending_evaluations ?? 0;

  const batchesList = Array.isArray(batchesData) ? batchesData : batchesData?.data || [];
  const totalItems = batchesData?.total || batchesList.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6 flex flex-col h-full">
      <Toaster position="top-right" />
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assignment Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and grade student assignments across your assigned batches.
        </p>
      </div>

      {(isLoadingStats || isLoadingBatches) ? (
        <InstitutionPageSkeleton />
      ) : (
        <>
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
            <StatsCard
              title="Total Batches"
              value={totalBatches}
              icon={<Users size={20} />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              tooltip="Total number of batches assigned to you."
            />
            <StatsCard
              title="Total Assignment Submissions"
              value={totalSubmissions}
              icon={<FileText size={20} />}
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
              tooltip="Total number of assignment submissions across all batches."
            />
            <StatsCard
              title="Pending Evaluations"
              value={pendingEvaluations}
              icon={<Clock size={20} />}
              iconBgClass="bg-orange-50"
              iconColorClass="text-orange-600"
              tooltip="Total assignment submissions waiting for tutor evaluation."
            />
          </div>

          {/* Batch Management Table Section */}
          <div className="flex-1 flex flex-col min-h-0 mt-8">
            <DataTable
              data={batchesList}
              columns={columns}
              loading={isFetchingBatches}
              rowKey={(row) => row.id || row.batch_id}
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
