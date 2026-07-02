"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layers, Users, AlertTriangle, TrendingUp, ChevronRight, Download, Loader2 } from "lucide-react";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable, { Column, FilterConfig } from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRepBatches, useRepBatchStats, getDownloadBatchListUrl, BatchItem, downloadAuthenticatedFile } from "@/features/institutional-representative/api/batches-api";
import { getAvatarColorClass } from "@/lib/avatar";

// Static fallback department options used when the backend returns none.
// Defined outside the component so the reference is stable across renders.
const FALLBACK_DEPARTMENTS = ["Design", "Computer Science", "Data Science", "Software Engineering"];

export default function BatchesListingPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("All");
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

  // By default, if department is selected, we filter by department.
  // Otherwise, we query with status=active filter field/value.
  const filterField = selectedDept !== "All" ? "department" : "status";
  const filterValue = selectedDept !== "All" ? selectedDept : "active";

  const { data, isLoading, isFetching, error } = useRepBatches(
    page,
    rowsPerPage,
    debouncedSearch,
    filterField,
    filterValue
  );

  const { data: statsData, isLoading: statsLoading } = useRepBatchStats();

  const batches = data?.batches || [];
  const totalCount = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  // Department choices: backend values merged with static fallbacks.
  // Depends only on the filters slice so it stays stable across page/search changes.
  const departmentOptions = useMemo(() => {
    const backendDepts = data?.filters?.departments || [];
    const deptsSet = new Set(["All", ...backendDepts, ...FALLBACK_DEPARTMENTS]);
    return Array.from(deptsSet).map((dept) => ({
      value: dept,
      label: dept === "All" ? "All Departments" : dept,
    }));
  }, [data?.filters?.departments]);

  // Summary statistics from stats API with fallback calculation
  const stats = useMemo(() => {
    if (statsData) {
      return {
        totalBatches: statsData.total_batches || 0,
        activeStudents: statsData.active_students || 0,
        avgProgress: statsData.avg_progress_percent || 0,
        atRiskStudents: statsData.at_risk_students || 0,
      };
    }
    
    // Fallback if stats API fails or is loading initially and we have batches
    const total = totalCount || batches.length;
    const activeStudents = batches.reduce((acc, b) => acc + (b.total_students || 0), 0);
    const avgProgress = batches.length > 0 
      ? Math.round(batches.reduce((acc, b) => acc + (b.progress_percentage || 0), 0) / batches.length)
      : 0;
    
    const atRiskCount = batches.filter(b => b.progress_status === "at_risk").length;
    
    return {
      totalBatches: total,
      activeStudents,
      avgProgress,
      atRiskStudents: atRiskCount || 0,
    };
  }, [batches, totalCount, statsData]);

  // Columns Configuration
  const columns: Column<BatchItem>[] = useMemo(() => [
    {
      key: "batch_id",
      label: "Batch ID",
      render: (value, row) => (
        <span className="font-semibold text-slate-600 text-sm">{row.batch_id || `#${row.id}`}</span>
      ),
    },
    {
      key: "batch_name",
      label: "Batch & Course Name",
      width: "w-1/3",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm",
            getAvatarColorClass(row.id)
          )}>
            {row.batch_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-sm truncate block">
              {row.batch_name}
            </span>
            <span className="text-xs text-muted-foreground truncate block">
              {row.course || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (value, row) => (
        <span className="text-slate-600 font-medium text-sm">{row.department}</span>
      ),
    },
    {
      key: "tutor",
      label: "Assigned Tutor",
      render: (value, row) => (
        <span className="text-slate-600 font-medium text-sm">{row.tutor || "N/A"}</span>
      ),
    },
    {
      key: "total_students",
      label: "Total Students",
      render: (value, row) => (
        <span className="text-slate-600 font-medium text-sm">{row.total_students} Students</span>
      ),
    },
    {
      key: "progress_percentage",
      label: "Average Progress",
      width: "w-[180px]",
      render: (value, row) => (
        <div className="flex flex-col gap-1 w-full max-w-[150px]">
          <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
            <span>Progress</span>
            <span className="text-blue-600">{row.progress_percentage || 0}%</span>
          </div>
          <Progress value={row.progress_percentage || 0} className="h-1.5" indicatorClassName="bg-blue-600" />
        </div>
      ),
    },
  ], []);

  const searchConfig = {
    enabled: true,
    placeholder: "Search batches, courses, or tutors...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
    },
  };

  const filterConfig: FilterConfig[] = [
    {
      id: "department",
      label: "All Departments",
      type: "select",
      value: selectedDept,
      options: departmentOptions,
      onChange: (val: string | string[]) => {
        // Reset page here; React 18 batches this with setSelectedDept into one render.
        setSelectedDept(Array.isArray(val) ? val[0] : val);
        setPage(1);
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const extraHeaderActions = (
    <button
      onClick={() => {
        downloadAuthenticatedFile(getDownloadBatchListUrl("pdf"), "batches-list.pdf")
          .catch(err => console.error("PDF download error:", err));
      }}
      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 bg-white transition-all text-gray-700 shadow-sm"
    >
      <Download size={16} className="text-gray-500" />
      Download PDF
    </button>
  );

  if (isLoading) {
    return (
      <ListingScreenTemplate
        headerText="Batch Management"
        subHeaderText="Monitor progress, attendance, and performance across your institution's active cohorts."
        extraActions={extraHeaderActions}
      >
        <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full flex-1 bg-slate-50/50">
          <StatsGrid>
            {[...Array(4)].map((_, i) => (
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

  return (
    <ListingScreenTemplate
      headerText="Batch Management"
      subHeaderText="Monitor progress, attendance, and performance across your institution's active cohorts."
      extraActions={extraHeaderActions}
    >
      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full flex-1">
        {/* Statistics Grid */}
        <StatsGrid>
          <StatsCard
            title="Total Batches"
            value={statsLoading ? "..." : stats.totalBatches}
            icon={<Layers className="w-5 h-5" />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Total learning cohorts assigned to your institution."
          />
          <StatsCard
            title="Active Students"
            value={statsLoading ? "..." : stats.activeStudents}
            icon={<Users className="w-5 h-5" />}
            iconBgClass="bg-green-50"
            iconColorClass="text-green-600"
            tooltip="Total students enrolled across all active cohorts."
          />
          <StatsCard
            title="Avg Progress"
            value={statsLoading ? "..." : `${stats.avgProgress}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            iconBgClass="bg-yellow-50"
            iconColorClass="text-yellow-600"
            tooltip="Average completion rate across all courses."
          />
          <StatsCard
            title="At-Risk Students"
            value={statsLoading ? "..." : stats.atRiskStudents}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-600"
            tooltip="Students whose performance or attendance is below threshold."
          />
        </StatsGrid>

        {/* Batches Table Container */}
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Active Batches</h2>
          {error ? (
            <div className="p-8 text-center text-red-600 font-medium">
              Error loading batches: {error.message}
            </div>
          ) : (
            <div className="flex-1 overflow-hidden min-h-0">
              <DataTable<any>
                data={batches}
                columns={columns as any}
                rowKey={(row) => row.id}
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
                loading={isLoading || isFetching}
                actions={(batch) => (
                  <button
                    onClick={() => router.push(`/institutional-representative/batches/${batch.id}`)}
                    className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                  >
                    View Details
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
