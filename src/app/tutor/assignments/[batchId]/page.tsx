"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { Users, FileCheck, Clock } from "lucide-react";
import StatsCard from "@/components/ui/StatsCard";
import InstitutionPageSkeleton from "@/components/admin/institutions/InstitutionPageSkeleton";
import { useBatchAssignmentStats, useBatchAssignments } from "@/features/tutor/api/batch-assignment-api";
import { buildStudentAssignmentColumns } from "./columns";
import DataTable from "@/components/reusable/DataTable";

export default function BatchAssignmentStatsPage() {
  const params = useParams();
  const batchId = params.batchId as string;

  const searchParams = useSearchParams();
  const batchName = searchParams.get("batch_name") || "";

  const {
    data: statsData,
    isLoading: isLoadingStats,
    isError: isStatsError,
    error: statsError,
  } = useBatchAssignmentStats(batchId);

  useEffect(() => {
    if (isStatsError) {
      toast.error(statsError?.message || "Failed to load assignment statistics.");
    }
  }, [isStatsError, statsError]);

  const stats = statsData || {};
  const totalStudents = stats.totalStudents ?? stats.total_students ?? 0;
  const submittedAssignments = stats.submittedAssignments ?? stats.submitted_assignments ?? stats.total_submissions ?? 0;
  const pendingEvaluations = stats.pendingEvaluations ?? stats.pending_evaluations ?? 0;

  // Table States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const { data: assignmentsData, isFetching: isFetchingAssignments } = useBatchAssignments(
    batchId,
    page,
    rowsPerPage,
    debouncedSearch
  );

  const columns = buildStudentAssignmentColumns(batchId);
  const studentList = assignmentsData?.data || [];
  const totalItems = assignmentsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6 flex flex-col h-full">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Student Assignment List {batchName ? `: ${batchName}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and grade assignment submissions by students in this batch.
        </p>
      </div>

      {isLoadingStats ? (
        <InstitutionPageSkeleton />
      ) : (
        <>
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
            <StatsCard
              title="Total Students"
              value={totalStudents}
              icon={<Users size={20} />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              tooltip="Total number of students enrolled in this batch."
            />

            <StatsCard
              title="Submitted Assignments"
              value={submittedAssignments}
              icon={<FileCheck size={20} />}
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
              tooltip="Total assignment submissions made by students in this batch."
            />

            <StatsCard
              title="Pending Evaluations"
              value={pendingEvaluations}
              icon={<Clock size={20} />}
              iconBgClass="bg-orange-50"
              iconColorClass="text-orange-600"
              tooltip="Total assignment submissions waiting for tutor evaluation in this batch."
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0 mt-8">
            <DataTable
              data={studentList}
              columns={columns}
              loading={isFetchingAssignments}
              rowKey={(row) => row.id || row.studentId}
              search={{
                enabled: true,
                value: search,
                onChange: setSearch,
                placeholder: "Search by student name or email..."
              }}
              currentPage={page}
              rowsPerPage={rowsPerPage}
              totalPages={totalPages}
              onPageChange={setPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setPage(1);
              }}
              paginationInfo={
                totalItems > 0
                  ? `Showing ${(page - 1) * rowsPerPage + 1}-${Math.min(
                      page * rowsPerPage,
                      totalItems
                    )} of ${totalItems}`
                  : "0-0 of 0"
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
