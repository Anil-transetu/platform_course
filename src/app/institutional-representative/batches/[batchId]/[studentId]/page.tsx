"use client";

import React, { useState, useMemo, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  CheckCircle,
  Award,
  CalendarCheck
} from "lucide-react";
import DataTable, { Column, FilterConfig } from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useRepStudentStats,
  useRepStudentAcademicPerformance,
  Submission
} from "@/features/institutional-representative/api/batches-api";
import { getAvatarColorClass } from "@/lib/avatar";

interface StudentProfilePageProps {
  params: Promise<{ batchId: string; studentId: string }>;
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const batchId = decodeURIComponent(resolvedParams.batchId);
  const studentId = decodeURIComponent(resolvedParams.studentId);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search: reset page and update debounced value together so React
  // batches both into ONE re-render (and ONE API call) instead of two.
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // No separate useEffect needed for filter page-reset.
  // setPage(1) is called directly inside the filter onChange handler below,
  // which React 18 batches with the filter state update into one render.

  // Fetch backend data
  const { data: statsData, isLoading: statsLoading, error: statsError } = useRepStudentStats(batchId, studentId);
  const { data: performanceData, isLoading: performanceLoading, isFetching: performanceFetching, error: performanceError } = useRepStudentAcademicPerformance(
    batchId,
    studentId,
    page,
    rowsPerPage,
    selectedType === "All" ? "all" : selectedType,
    debouncedSearch
  );

  const submissions = performanceData?.submissions || [];
  const totalCount = performanceData?.pagination?.total || 0;
  const totalPages = performanceData?.pagination?.totalPages || 0;

  // Columns Configuration
  const columns: Column<Submission>[] = useMemo(() => [
    {
      key: "title",
      label: "Title",
      width: "w-2/5",
      render: (value, row) => {
        const moduleName = row.moduleName || row.module_name;
        return (
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-sm truncate block">
              {row.title}
            </span>
            {moduleName && (
              <span className="text-xs text-muted-foreground truncate block mt-0.5">
                {moduleName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      width: "w-[12%]",
      render: (value, row) => {
        const isQuiz = String(row.type).toLowerCase() === "quiz";
        return (
          <Badge className={cn(
            "px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border-none",
            isQuiz 
              ? "bg-purple-50 text-purple-700 hover:bg-purple-100" 
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          )}>
            {row.type}
          </Badge>
        );
      },
    },
    {
      key: "submissionDate",
      label: "Submission Date",
      width: "w-1/4",
      render: (value, row) => {
        const dateStr = row.submissionDate || row.submission_date || "N/A";
        // Format if it's ISO date
        let formattedDate = dateStr;
        if (dateStr.includes("T")) {
          formattedDate = new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
        }
        return (
          <span className="text-slate-600 font-medium text-sm">
            {formattedDate}
          </span>
        );
      },
    },
    {
      key: "score",
      label: "Score / Marks",
      width: "w-1/5",
      render: (value, row) => {
        const score = row.score || 0;
        const maxScore = row.maxScore ?? row.max_score ?? 100;
        const percent = row.percentage ?? (maxScore > 0 ? Math.round((score / maxScore) * 100) : 0);
        return (
          <span className="font-bold text-slate-800 text-sm">
            {score}/{maxScore} <span className="text-xs text-muted-foreground font-normal">({percent}%)</span>
          </span>
        );
      },
    },
  ], []);

  const searchConfig = {
    enabled: true,
    placeholder: "Search assignments or quizzes...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
    },
  };

  const filterConfig: FilterConfig[] = [
    {
      id: "type",
      label: "All Types",
      type: "select",
      value: selectedType,
      options: [
        { value: "All", label: "All Types" },
        { value: "Quiz", label: "Quizzes" },
        { value: "Assignment", label: "Assignments" },
      ],
      onChange: (val: string | string[]) => {
        // Reset page here; React 18 batches this with setSelectedType into one render.
        setSelectedType(Array.isArray(val) ? val[0] : val);
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
        onClick={() => router.push(`/institutional-representative/batches/${batchId}`)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 bg-white transition-all text-gray-700 shadow-sm"
      >
        <ArrowLeft size={16} />
        Back to Batch
      </button>
      <button
        onClick={() => router.push(`/institutional-representative/batches/${batchId}/${studentId}/attendance`)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 h-auto gap-2 flex items-center text-xs sm:text-sm shadow-sm transition-colors"
      >
        <CalendarCheck size={16} />
        View Attendance
      </button>
    </div>
  );

  if (statsLoading || performanceLoading) {
    return (
      <ListingScreenTemplate
        headerText="Student Profile"
        extraActions={extraHeaderActions}
      >
        <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full flex-1 bg-slate-50/50">
          {/* Banner Skeleton */}
          <div className="bg-card rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white">
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
            <div className="flex-1 text-center sm:text-left min-w-0">
              <Skeleton className="h-6 w-48 mb-2 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
            </div>
          </div>
          
          {/* Stats Grid Skeleton */}
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
          
          {/* Table Skeleton */}
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

  if (statsError) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Profile Not Found</h2>
        <p className="text-muted-foreground mt-2">The profile could not be loaded.</p>
        <button
          onClick={() => router.push(`/institutional-representative/batches/${batchId}`)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5"
        >
          Go Back
        </button>
      </div>
    );
  }

  const studentInfo = statsData?.student_info;
  const attendance = statsData?.attendance;
  const assessments = statsData?.assessments;
  const quizzes = statsData?.quizzes;

  const currentStudentName = studentInfo?.student_name || "Student Profile";
  const currentStudentId = studentInfo?.student_id || studentId;
  const currentEmail = studentInfo?.email || "N/A";
  const currentStatus = studentInfo?.status || "active";

  return (
    <ListingScreenTemplate
      headerText="Student Profile"
      extraActions={extraHeaderActions}
    >
      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full flex-1">
        
        {/* Student Details Banner */}
        <div className="bg-card rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white">
          <div className={cn(
            "w-16 h-16 sm:w-20 sm:h-20 rounded-full font-bold text-2xl flex items-center justify-center shrink-0 shadow-sm",
            getAvatarColorClass(studentId)
          )}>
            {currentStudentName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">{currentStudentName}</h2>
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 w-fit mx-auto sm:mx-0">
                {currentStatus}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1.5">
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                ID: {currentStudentId}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Mail size={14} className="text-gray-400" />
                {currentEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Attendance, Assessment, and Quiz Metrics Grid */}
        <StatsGrid>
          <StatsCard
            title="Overall Attendance"
            value={statsLoading ? "..." : (attendance ? `${attendance.attendance_percent}%` : "0%")}
            icon={<Calendar className="w-5 h-5" />}
            iconBgClass="bg-emerald-50"
            iconColorClass="text-emerald-600"
            tooltip={attendance?.attendance_label || "Overall attendance rate across the course."}
          />

          <StatsCard
            title="Completed Assessments"
            value={statsLoading ? "..." : (assessments ? `${assessments.assignments_submitted}/${assessments.assignments_total}` : "0/0")}
            icon={<CheckCircle className="w-5 h-5" />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Percentage of assignments completed."
          />

          <StatsCard
            title="Completed Quizzes"
            value={statsLoading ? "..." : (quizzes ? `${quizzes.quizzes_submitted}/${quizzes.quizzes_total}` : "0/0")}
            icon={<Award className="w-5 h-5" />}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-600"
            tooltip={quizzes?.proficiency_label || "Percentage of quizzes completed."}
          />
        </StatsGrid>

        {/* Academic Performance Table Container */}
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Academic Performance</h2>
          {performanceError ? (
            <div className="p-8 text-center text-red-600 font-medium">
              Error loading academic performance: {performanceError.message}
            </div>
          ) : (
            <div className="flex-1 overflow-hidden min-h-0">
              <DataTable<any>
                data={submissions}
                columns={columns as any}
                rowKey={(row) => row.id || row.title}
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
                bodyHeight="h-52"
                loading={performanceLoading || performanceFetching}
              />
            </div>
          )}
        </div>

      </div>
    </ListingScreenTemplate>
  );
}
