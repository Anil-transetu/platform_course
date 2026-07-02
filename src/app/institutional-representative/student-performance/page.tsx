"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Trophy, FileText, TrendingUp, ArrowUpRight, Search } from "lucide-react";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import CircleChart from "@/components/reusable/CircleChart";
import DataTable, { Column, FilterConfig } from "@/components/reusable/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import {
  useStudentPerformanceSummary,
  useTopStudents,
  TopStudent,
} from "@/features/institutional-representative/api/student-performance-api";

// Circular color list for student avatars
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

export default function StudentPerformancePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search — 300ms delay matching the Admin module pattern
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 only when the debounced value actually changes (not every keystroke)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // API query integrations
  const { data: summaryData, isLoading: isSummaryLoading, error: summaryError } = useStudentPerformanceSummary();

  // Fetch top students — uses debouncedSearch so the API is only called after the user stops typing
  const { 
    data: topStudentsData, 
    isLoading: isTopStudentsLoading, 
    isFetching: isTopStudentsFetching,
    error: topStudentsError,
  } = useTopStudents(page, rowsPerPage, debouncedSearch || undefined, selectedBatch);

  // Surface API errors via toast — avoids silent failures
  useEffect(() => {
    if (summaryError) {
      toast.error((summaryError as Error).message || "Failed to load performance summary.");
    }
  }, [summaryError]);

  useEffect(() => {
    if (topStudentsError) {
      toast.error((topStudentsError as Error).message || "Failed to load top students.");
    }
  }, [topStudentsError]);

  const kpis = summaryData?.kpi;
  const tiers = summaryData?.distribution_tiers || [];
  const students = topStudentsData?.students || [];

  const apiTotal = (topStudentsData as any)?.pagination?.total;
  const apiTotalPages = (topStudentsData as any)?.pagination?.totalPages;
  const isServerPaginated = apiTotal !== undefined && apiTotalPages !== undefined;

  // Consolidate duplicate students who are in multiple batches
  const allDisplayStudents = useMemo(() => {
    const map = new Map<number, TopStudent>();
    for (const student of students) {
      const existing = map.get(student.student_id);
      const batchInfo = { id: student.batch_id, name: student.batch_name };
      if (existing) {
        if (!existing.all_batches) {
          existing.all_batches = [{ id: existing.batch_id, name: existing.batch_name }];
        }
        if (!existing.all_batches.some((b: any) => b.name === student.batch_name)) {
          existing.all_batches.push(batchInfo);
        }
      } else {
        map.set(student.student_id, { ...student, all_batches: [batchInfo] });
      }
    }
    return Array.from(map.values());
  }, [students]);

  // Derive unique batch names from ALL students (not filtered) for dropdown
  const batchOptions = useMemo(() => {
    const batchNames = new Set<string>();
    allDisplayStudents.forEach((student) => {
      if (student.batch_name) batchNames.add(student.batch_name);
      if (student.all_batches) {
        student.all_batches.forEach((b: any) => { if (b.name) batchNames.add(b.name); });
      }
    });
    return [
      { value: "All", label: "All Batches" },
      ...Array.from(batchNames).map((name) => ({ value: name, label: name })),
    ];
  }, [allDisplayStudents]);

  // Client-side filtering: apply search and batch filter (fallback if not server paginated)
  const filteredStudents = useMemo(() => {
    if (isServerPaginated) {
      return allDisplayStudents;
    }

    let result = allDisplayStudents;

    // Filter by search term (case-insensitive match on student name)
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((s) =>
        s.student_name?.toLowerCase().includes(term)
      );
    }

    // Filter by batch name
    if (selectedBatch && selectedBatch !== "All") {
      result = result.filter((s) => {
        const batches = s.all_batches || [{ name: s.batch_name }];
        return batches.some((b: any) => b.name === selectedBatch);
      });
    }

    return result;
  }, [allDisplayStudents, search, selectedBatch, isServerPaginated]);

  // Client-side pagination on filtered results (fallback if not server paginated)
  const totalCount = isServerPaginated ? apiTotal : filteredStudents.length;
  const totalPages = isServerPaginated ? apiTotalPages : Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedDisplayStudents = useMemo(() => {
    if (isServerPaginated) {
      return filteredStudents;
    }
    return filteredStudents.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredStudents, startIndex, rowsPerPage, isServerPaginated]);



  // Columns Configuration for top students
  const columns: Column<TopStudent>[] = useMemo(() => [
    {
      key: "student_name",
      label: "Student Name",
      render: (value, row) => {
        const sId = row.student_id;
        const sName = row.student_name || "Unknown";
        return (
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm transition-transform hover:scale-105",
              getAvatarColorClass(sId)
            )}>
              {sName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-foreground text-sm truncate block">
                {sName}
              </span>
              <span className="text-xs text-muted-foreground truncate block">
                ID: #{String(sId).padStart(4, "0")}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "batch_name",
      label: "Batch",
      render: (value, row) => {
        const allBatches = row.all_batches || [{ id: row.batch_id, name: row.batch_name || value }];
        return (
          <div className="flex gap-1.5 flex-wrap items-center max-w-[220px]">
            {allBatches.map((b: any, index: number) => {
              // Generate consistent color for each batch
              const batchColorIndex = (b.id || index) % avatarColors.length;
              const batchColor = avatarColors[batchColorIndex];
              return (
                <span
                  key={b.id || index}
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase whitespace-normal break-words inline-block",
                    batchColor
                  )}
                >
                  {b.name || "N/A"}
                </span>
              );
            })}
          </div>
        );
      }
    },
    {
      key: "avg_quiz_score",
      label: "Avg. Quiz Score",
      render: (value) => {
        const score = typeof value === "number" ? value : 0;
        return (
          <span className="font-semibold text-foreground text-sm">
            {score}%
          </span>
        );
      }
    },
    {
      key: "assignments_completed",
      label: "Assignments Completed",
      render: (value, row) => (
        <span className="font-medium text-slate-600 text-sm">
          {row.assignments_completed}/{row.assignments_total}
        </span>
      ),
    },
    {
      key: "overall_grade",
      label: "Overall Grade",
      render: (value) => {
        const grade = String(value || "F");
        let badgeStyles = "bg-red-50 text-red-600 border-red-100";
        if (grade.startsWith("A")) {
          badgeStyles = "bg-emerald-50 text-emerald-600 border-emerald-100";
        } else if (grade.startsWith("B")) {
          badgeStyles = "bg-blue-50 text-blue-600 border-blue-100";
        } else if (grade.startsWith("C")) {
          badgeStyles = "bg-amber-50 text-amber-600 border-amber-100";
        } else if (grade.startsWith("D")) {
          badgeStyles = "bg-orange-50 text-orange-600 border-orange-100";
        }
        return (
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-bold border",
            badgeStyles
          )}>
            {grade}
          </span>
        );
      }
    }
  ], []);

  // FIX: Pagination info shows correct range
  const paginationInfo = totalCount > 0
    ? `${startIndex + 1}-${Math.min(startIndex + paginatedDisplayStudents.length, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const searchConfig = {
    enabled: true,
    placeholder: "Search students...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
      // Page reset is handled by the debouncedSearch useEffect above.
    },
  };

  const filterConfig: FilterConfig[] = [
    {
      id: "batch",
      label: "All Batches",
      type: "select",
      value: selectedBatch,
      className: "sm:w-[260px]",
      options: batchOptions,
      onChange: (val: string | string[]) => {
        setSelectedBatch(Array.isArray(val) ? val[0] : val);
        setPage(1);
      },
    },
  ];

  // Helper to resolve tiers color type
  const getTierColorType = (key: string) => {
    switch (key.toLowerCase()) {
      case "high":
        return "green";
      case "average":
        return "blue";
      case "below_average":
        return "orange";
      case "at_risk":
      default:
        return "red";
    }
  };

  const isPageLoading = isSummaryLoading || isTopStudentsLoading;

  if (isPageLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 bg-slate-50/50">
        <div>
          <Skeleton className="h-8 w-64" />
        </div>
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
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border/60 shadow-sm p-6">
          <div className="mb-6">
            <Skeleton className="h-6 w-52 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-[130px] h-[130px] rounded-full mb-4" />
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-border/60">
            <Skeleton className="h-6 w-60" />
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
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 bg-slate-50/50">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Student Performance</h1>
      </div>

      {/* KPI Cards Grid */}
      <div>
        <StatsGrid>
          <StatsCard
            title="Highest Performer"
            value={
              <span className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-foreground">
                  {kpis?.highest_performer?.score_percent ?? 0}%
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {kpis?.highest_performer?.student_name || "Unknown"}
                </span>
              </span> as any
            }
            icon={<Trophy className="w-5 h-5" />}
            iconBgClass="bg-amber-50"
            iconColorClass="text-amber-500"
            tooltip="Highest average quiz score achieved by a student in the current term."
          />
          <StatsCard
            title="Class Average"
            value={
              <span className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-foreground">
                  {kpis?.class_average?.average_percent ?? 0}%
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  All Batches
                </span>
              </span> as any
            }
            icon={<FileText className="w-5 h-5" />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-500"
            tooltip="Overall average quiz score across all batches."
          />
          <StatsCard
            title="Most Improved"
            value={
              kpis?.most_improved ? (
                <span className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-foreground">
                    +{kpis.most_improved.improvement_percent}%
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {kpis.most_improved.student_name}
                  </span>
                </span> as any
              ) : (
                <span className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-muted-foreground">
                    N/A
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    No data available
                  </span>
                </span> as any
              )
            }
            icon={<TrendingUp className="w-5 h-5" />}
            iconBgClass="bg-emerald-50"
            iconColorClass="text-emerald-500"
            tooltip="Highest score percentage improvement compared to previous assessments."
          />
        </StatsGrid>
      </div>

      {/* Student Distribution Tiers Chart Card */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border/60 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-foreground">Student Distribution Tiers</h2>
          <p className="text-sm text-muted-foreground">Global overview of population performance categories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center py-4">
          {tiers.map((tier) => (
            <CircleChart
              key={tier.tier_key}
              percentage={tier.percentage}
              label={tier.label}
              subLabel={`${tier.student_count} Students`}
              colorType={getTierColorType(tier.tier_key)}
            />
          ))}
        </div>
      </div>

      {/* Student Performance Metrics Table */}
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-border/60">
            <h2 className="text-lg font-bold text-slate-800 dark:text-foreground">Student Performance Metrics</h2>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <DataTable<TopStudent>
              data={paginatedDisplayStudents}
              columns={columns}
              rowKey={(row) => String(row.student_id || Math.random())}
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
              loading={isTopStudentsFetching}
            />
          </div>
        </div>
      </div>
    </div>
  );
}