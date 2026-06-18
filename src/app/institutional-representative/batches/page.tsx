"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layers, Users, AlertTriangle, TrendingUp, ChevronRight, Download } from "lucide-react";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable, { FilterConfig } from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepBatches, useRepBatchStats, getDownloadBatchListUrl, downloadAuthenticatedFile } from "@/features/institutional-representative/api/batches-api";
import { buildRepBatchColumns } from "./columns";

export default function BatchesListingPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("All");
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

  // Filter by course/domain when selected, otherwise no extra filter.
  const filterField = selectedCourse !== "All" ? "course" : undefined;
  const filterValue = selectedCourse !== "All" ? selectedCourse : undefined;

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

  // ============================================
  // CLIENT-SIDE FILTERING (Fallback when API filter doesn't work)
  // ============================================
  const filteredBatches = useMemo(() => {
    if (selectedCourse === "All") return batches;
    return batches.filter(
      (b) => b.course && b.course.trim() === selectedCourse.trim()
    );
  }, [batches, selectedCourse]);

  // Recalculate pagination based on client-side filtered results
  const filteredTotalCount = filteredBatches.length;
  const filteredTotalPages = Math.max(
    1,
    Math.ceil(filteredTotalCount / rowsPerPage)
  );
  const currentFilteredPage = Math.min(page, filteredTotalPages);

  // Slice for current page display
  const paginatedBatches = useMemo(() => {
    const start = (currentFilteredPage - 1) * rowsPerPage;
    return filteredBatches.slice(start, start + rowsPerPage);
  }, [filteredBatches, currentFilteredPage, rowsPerPage]);

  // Build course/domain options dynamically from the fetched batches.
  const courseOptions = useMemo(() => {
    const coursesSet = new Set<string>(["All"]);
    batches.forEach((b) => {
      if (b.course && b.course.trim() !== "") {
        coursesSet.add(b.course.trim());
      }
    });
    return Array.from(coursesSet).map((course) => ({
      value: course,
      label: course === "All" ? "All Courses / Domains" : course,
    }));
  }, [batches]);

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
  const columns = useMemo(() => buildRepBatchColumns(), []);

  const searchConfig = {
    enabled: true,
    placeholder: "Search batches, courses, or tutors...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
    },
  };

  // Filter by course / domain
  const filterConfig: FilterConfig[] = [
    {
      id: "course",
      label: "All Courses / Domains",
      type: "select",
      value: selectedCourse,
      options: courseOptions,
      onChange: (val: string | string[]) => {
        const newValue = Array.isArray(val) ? val[0] : val;
        setSelectedCourse(newValue);
        setPage(1);
      },
    },
  ];

  // Use client-side filtered counts for pagination display
  const displayTotalCount = selectedCourse !== "All" ? filteredTotalCount : totalCount;
  const displayTotalPages = selectedCourse !== "All" ? filteredTotalPages : totalPages;
  const displayPage = selectedCourse !== "All" ? currentFilteredPage : page;

  const paginationInfo = displayTotalCount > 0
    ? `${(displayPage - 1) * rowsPerPage + 1}-${Math.min(displayPage * rowsPerPage, displayTotalCount)} of ${displayTotalCount}`
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
    <div className="p-8 h-full min-h-[70vh] flex flex-col justify-center items-center">
      <div className="max-w-md w-full border-2 border-dashed border-slate-200 dark:border-border/60 rounded-[32px] p-12 text-center flex flex-col items-center justify-center gap-4 bg-white dark:bg-card/40 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
          <Layers size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">Batches Module</h2>
        <p className="text-sm text-slate-500 dark:text-muted-foreground max-w-xs leading-relaxed">
          The Batches module is coming soon. Features are currently under development.
        </p>
      </div>
    </div>
  );
}
