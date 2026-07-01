"use client";

import React, { useState, useMemo, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Download,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Loader2
} from "lucide-react";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable, { FilterConfig } from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRepBatchOverview,
  useRepBatchStudents,
  getExportBatchReportUrl,
  downloadAuthenticatedFile
} from "@/features/institutional-representative/api/batches-api";
import { buildBatchStudentColumns } from "./columns";
import { useStudentProfiles, enrichStudentData } from "@/features/institutional-representative/hooks/use-student-profiles";

interface BatchDetailsPageProps {
  params: Promise<{ batchId: string }>;
}

export default function BatchDetailsPage({ params }: BatchDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const batchId = decodeURIComponent(resolvedParams.batchId);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const debouncedSearch = useDebounce(search, 500);

  // Debounce search: reset page and update debounced value together so React
  // batches both into ONE re-render (and ONE API call) instead of two.
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch API hooks
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useRepBatchOverview(batchId);
  const { data: studentsData, isLoading: studentsLoading, isFetching: studentsFetching, error: studentsError } = useRepBatchStudents(
    batchId,
    page,
    rowsPerPage,
    debouncedSearch,
    selectedStatus
  );

  const students = studentsData?.students || [];

  const studentIds = useMemo(() => students.map((s) => s.student_id), [students]);
  const { data: freshProfiles } = useStudentProfiles(studentIds);

  const enrichedStudents = useMemo(() => {
    return enrichStudentData(students, freshProfiles);
  }, [students, freshProfiles]);

  const totalCount = studentsData?.pagination?.total || 0;
  const totalPages = studentsData?.pagination?.totalPages || 1;

  const columns = useMemo(() => buildBatchStudentColumns(), []);

  const searchConfig = {
    enabled: true,
    placeholder: "Search students by name or ID...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
    },
  };

  const filterConfig: FilterConfig[] = [
    {
      id: "status",
      label: "All Statuses",
      type: "select",
      value: selectedStatus,
      options: [
        { value: "All", label: "All Statuses" },
        { value: "on_track", label: "On Track" },
        { value: "at_risk", label: "At Risk" },
        { value: "excellent", label: "Excellent" },
      ],
      onChange: (val: string | string[]) => {
        // Reset page here; React 18 batches this with setSelectedStatus into one render.
        setSelectedStatus(Array.isArray(val) ? val[0] : val);
        setPage(1);
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const extraHeaderActions = (
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.push("/institutional-representative/batches")}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 bg-white transition-all text-gray-700 shadow-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <button
        onClick={() => {
          downloadAuthenticatedFile(getExportBatchReportUrl(batchId), `batch-${batchId}-report.pdf`)
            .catch(err => console.error("Export report error:", err));
        }}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 bg-white transition-all text-gray-700 shadow-sm"
      >
        <Download size={16} className="text-gray-500" />
        Export Full Report
      </button>
    </div>
  );

  if (overviewLoading || studentsLoading) {
    return (
      <ListingScreenTemplate
        headerText={`Batch #${batchId}`}
        subHeaderText={
          <div className="flex items-center gap-2 mt-1">
            <Skeleton className="h-4 w-32" />
            <span>•</span>
            <Skeleton className="h-4 w-24" />
          </div>
        }
        extraActions={extraHeaderActions}
      >
        <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full flex-1 bg-slate-50/50">
          <StatsGrid>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-white dark:bg-card border border-gray-100 dark:border-border/50 flex justify-between items-center shadow-sm">
                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-3" />
                  <Skeleton className="h-8 w-36" />
                </div>
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            ))}
          </StatsGrid>
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border/60 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-6 border-b border-slate-100 dark:border-border/60">
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="p-4 border-b border-gray-100 dark:border-border/50 flex justify-between gap-4">
              <Skeleton className="h-10 w-full sm:w-[300px] rounded-lg" />
              <Skeleton className="h-10 w-[200px] rounded-lg" />
            </div>
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </ListingScreenTemplate>
    );
  }

  if (overviewError) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Batch Not Found</h2>
        <p className="text-muted-foreground mt-2">The batch with ID "{batchId}" could not be loaded.</p>
        <button
          onClick={() => router.push("/institutional-representative/batches")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5"
        >
          Go Back to Batches
        </button>
      </div>
    );
  }

  const currentBatchName = overview?.batch_name || `Batch #${batchId}`;
  const currentCourseName = overview?.course_name && overview.course_name !== "N/A" ? overview.course_name : "General Course";

  return (
    <ListingScreenTemplate
      headerText={`${currentBatchName}: ${currentCourseName}`}
      subHeaderText={
        overviewLoading ? (
          <div className="flex items-center gap-2 mt-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            <span className="text-sm text-muted-foreground">Loading overview stats...</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium border border-slate-200 shadow-sm">
              <Users size={15} />
              Tutor: <span className="font-semibold text-slate-900">{overview?.tutor || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100 shadow-sm">
              <UserCheck size={15} />
              <span className="font-bold">{overview?.total_active_students || 0}</span> Active Students
            </div>
          </div>
        )
      }
      extraActions={extraHeaderActions}
    >
      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full flex-1">
        {/* Performance Metrics Cards */}
        <StatsGrid>
          <StatsCard
            title="Batch Average Score"
            value={overviewLoading ? "..." : `${(overview?.batch_avg_score || 0).toFixed(1)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Average score across all quizzes and assignments in this batch."
          />
          <StatsCard
            title="Assignment Completion"
            value={overviewLoading ? "..." : `${(overview?.assignment_completion_percent || 0).toFixed(1)}%`}
            icon={<CheckCircle className="w-5 h-5" />}
            iconBgClass="bg-green-50"
            iconColorClass="text-green-600"
            tooltip="Percentage of total assignments completed by students."
          />
          <StatsCard
            title="At-Risk Students"
            value={overviewLoading ? "..." : (overview?.at_risk_count ?? 0)}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconBgClass="bg-red-50"
            iconColorClass="text-red-600"
            tooltip="Students whose performance or attendance falls below thresholds."
          />
        </StatsGrid>

        {/* Student Table Container */}
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Student Performance</h2>
          {studentsError ? (
            <div className="p-8 text-center text-red-600 font-medium">
              Error loading students: {studentsError.message}
            </div>
          ) : (
            <div className="flex-1 overflow-hidden min-h-0">
              <DataTable<any>
                data={enrichedStudents}
                columns={columns as any}
                rowKey={(row) => row.student_id}
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(rows) => {
                  setRowsPerPage(rows);
                  setPage(1);
                }}
                paginationInfo={paginationInfo}
                showPagination={true}
                search={searchConfig}
                filters={filterConfig}
                bodyHeight="h-full"
                loading={studentsLoading || studentsFetching}
                actions={(student) => (
                  <button
                    onClick={() => router.push(`/institutional-representative/batches/${batchId}/${student.student_id}`)}
                    className="flex items-center gap-1 bg-white hover:bg-slate-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-gray-200 shadow-sm"
                  >
                    View Profile
                    <ChevronRight size={14} />
                  </button>
                )}
              />
            </div>
          )}
        </div>
      </div>
    </ListingScreenTemplate>
  );
}