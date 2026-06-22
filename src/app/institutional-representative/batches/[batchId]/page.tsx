"use client";

import React, { useState, useMemo, use } from "react";
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
import DataTable, { Column, FilterConfig } from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useRepBatchOverview,
  useRepBatchStudents,
  getExportBatchReportUrl,
  BatchStudent,
  downloadAuthenticatedFile
} from "@/features/institutional-representative/api/batches-api";

interface BatchDetailsPageProps {
  params: Promise<{ batchId: string }>;
}

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-orange-200 text-orange-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
  "bg-green-100 text-green-600",
];

const getAvatarColorClass = (id: string | number) => {
  if (typeof id === "number") {
    return avatarColors[id % avatarColors.length];
  }
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

export default function BatchDetailsPage({ params }: BatchDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const batchId = decodeURIComponent(resolvedParams.batchId);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch API hooks
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useRepBatchOverview(batchId);
  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useRepBatchStudents(
    batchId,
    page,
    rowsPerPage,
    search,
    selectedStatus
  );

  const students = studentsData?.students || [];
  const totalCount = studentsData?.pagination?.total || 0;
  const totalPages = studentsData?.pagination?.totalPages || 1;

  // Columns Configuration
  const columns: Column<BatchStudent>[] = useMemo(() => [
    {
      key: "student_name",
      label: "Student Name",
      width: "w-1/4",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm transition-transform hover:scale-105",
            getAvatarColorClass(row.student_id)
          )}>
            {row.student_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-sm truncate block">
              {row.student_name}
            </span>
            <span className="text-xs text-muted-foreground truncate block">
              ID: #{row.student_id}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "attendance_percent",
      label: "Attendance %",
      width: "w-[180px]",
      render: (value, row) => {
        const attendance = row.attendance_percent || 0;
        let barColor = "bg-green-500";
        if (attendance < 70) {
          barColor = "bg-rose-500";
        } else if (attendance < 90) {
          barColor = "bg-blue-600";
        }

        return (
          <div className="flex flex-col gap-1 w-full max-w-[150px]">
            <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
              <span>Attendance</span>
              <span className="text-foreground">{attendance}%</span>
            </div>
            <Progress value={attendance} className="h-1.5" indicatorClassName={barColor} />
          </div>
        );
      },
    },
    {
      key: "quiz_avg",
      label: "Quiz Average",
      render: (value, row) => (
        <span className="font-bold text-slate-800 text-sm">
          {(row.quiz_avg || 0).toFixed(1)}%
        </span>
      ),
    },
    {
      key: "assignments",
      label: "Assignments",
      render: (value, row) => (
        <span className="text-slate-600 font-semibold text-sm">
          {row.assignments_completed || 0} / {row.assignments_total || 0}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => {
        const status = row.status || "active";
        const statusLower = status.toLowerCase();

        let badgeStyles = "bg-blue-50 text-blue-700 hover:bg-blue-100 border-none";
        if (statusLower === "at_risk" || statusLower === "at risk") {
          badgeStyles = "bg-red-50 text-red-700 hover:bg-red-100 border-none";
        } else if (statusLower === "excellent") {
          badgeStyles = "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none";
        }

        return (
          <Badge className={cn("px-3 py-1 text-[10px] font-bold tracking-wider uppercase", badgeStyles)}>
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
  ], []);

  const searchConfig = {
    enabled: true,
    placeholder: "Search students by name or ID...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
      setPage(1);
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
          <div className="flex items-center gap-2 mt-1">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            <span className="text-xs text-muted-foreground">Loading overview stats...</span>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Users size={14} />
              Tutor: <span className="font-semibold text-foreground">{overview?.tutor || "N/A"}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <UserCheck size={14} />
              {overview?.total_active_students || 0} Active Students
            </span>
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
                data={students}
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
                loading={studentsLoading}
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
