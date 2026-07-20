"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Calendar, 
  TrendingUp, 
  LineChart, 
  AlertTriangle, 
} from "lucide-react";
import DataTable, { FilterConfig } from "@/components/reusable/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import { toast } from "react-hot-toast";
import {
  useRecentReports,
  downloadReportPdf,
  ReportItem,
} from "@/features/institutional-representative/api/reports-api";
import { buildReportColumns } from "./columns";

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

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

  // Fetch recent reports list — uses debouncedSearch so the API is only called after the user stops typing
  const {
    data: reportsData,
    isLoading: isReportsLoading,
    isFetching: isReportsFetching,
    error: reportsError,
  } = useRecentReports(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    selectedCategory
  );

  // Surface API errors via toast — avoids silent failures
  useEffect(() => {
    if (reportsError) {
      toast.error((reportsError as Error).message || "Failed to load reports.");
    }
  }, [reportsError]);

  const reports = reportsData?.reports || [];
  
  const apiTotal = (reportsData as any)?.pagination?.total;
  const apiTotalPages = (reportsData as any)?.pagination?.totalPages;
  const isServerPaginated = apiTotal !== undefined && apiTotalPages !== undefined;

  // Calculate dynamic report counts by category for the cards
  const counts = useMemo(() => {
    let attendance = 0;
    let performance = 0;
    let progress = 0;
    let critical = 0;

    reports.forEach((r) => {
      const type = r.report_type?.toLowerCase();
      if (type === "attendance") attendance++;
      else if (type === "performance") performance++;
      else if (type === "progress") progress++;
      else if (type === "at_risk" || r.category?.toLowerCase() === "critical") critical++;
    });

    return { attendance, performance, progress, critical };
  }, [reports]);

  // Client-side filtering and search (fallback if backend doesn't support server-side pagination)
  const filteredReports = useMemo(() => {
    if (isServerPaginated) {
      return reports;
    }

    let list = [...reports];
    
    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    
    if (selectedCategory !== "All") {
      list = list.filter((r) => r.category.toUpperCase() === selectedCategory.toUpperCase());
    }
    
    return list;
  }, [reports, debouncedSearch, selectedCategory, isServerPaginated]);

  const totalCount = isServerPaginated ? apiTotal : filteredReports.length;
  const totalPages = isServerPaginated ? apiTotalPages : (Math.ceil(totalCount / rowsPerPage) || 1);
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedReports = useMemo(() => {
    if (isServerPaginated) {
      return reports;
    }
    return filteredReports.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredReports, startIndex, rowsPerPage, isServerPaginated]);

  // Handle download reports
  const handleDownload = async (type: string, title: string) => {
    const toastId = toast.loading(`Generating "${title}"...`);
    setDownloadingType(type);
    try {
      const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_report.pdf`;
      await downloadReportPdf(type, filename);
      toast.success("Report downloaded successfully", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to download report", { id: toastId });
    } finally {
      setDownloadingType(null);
    }
  };

  // Predefined templates list
  const templates = [
    {
      type: "attendance",
      title: "Attendance Summary",
      description: "Daily and monthly attendance trends by batch.",
      value: counts.attendance,
      icon: <Calendar className="w-5 h-5" />,
      iconBgClass: "bg-blue-50",
      iconColorClass: "text-blue-600",
      apiTitle: "Attendance Summary Report",
    },
    {
      type: "performance",
      title: "Performance Analytics",
      description: "Detailed quiz scores and overall GPA distributions.",
      value: counts.performance,
      icon: <TrendingUp className="w-5 h-5" />,
      iconBgClass: "bg-emerald-50",
      iconColorClass: "text-emerald-600",
      apiTitle: "Academic Performance Audit",
    },
    {
      type: "progress",
      title: "Batch Progress Report",
      description: "Track curriculum coverage and completion milestones.",
      value: counts.progress,
      icon: <LineChart className="w-5 h-5" />,
      iconBgClass: "bg-purple-50",
      iconColorClass: "text-purple-600",
      apiTitle: "Batch Progress Overview",
    },
    {
      type: "at_risk",
      title: "At-Risk Students Audit",
      description: "Identify students failing to meet minimum criteria.",
      value: counts.critical,
      icon: <AlertTriangle className="w-5 h-5" />,
      iconBgClass: "bg-rose-50",
      iconColorClass: "text-rose-600",
      apiTitle: "At-Risk Student Analysis",
    },
  ];

  // Unique categories for filtering
  const categoryOptions = useMemo(() => {
    const cats = new Set(reports.map((r) => r.category.toUpperCase()));
    return [
      { value: "All", label: "All Categories" },
      ...Array.from(cats).map((c) => ({
        value: c,
        label: c,
      })),
    ];
  }, [reports]);

  // Columns Configuration for reports table
  const columns = useMemo(() => buildReportColumns({ downloadingType, onDownload: handleDownload }), [downloadingType]);

  const paginationInfo = totalCount > 0
    ? `${startIndex + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const searchConfig = {
    enabled: true,
    placeholder: "Search reports...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
      // Page reset is handled by the debouncedSearch useEffect above.
    },
  };

  const filterConfig: FilterConfig[] = [
    {
      id: "category",
      label: "All Categories",
      type: "select",
      value: selectedCategory,
      className: "sm:w-[220px]",
      options: categoryOptions,
      onChange: (val: string | string[]) => {
        setSelectedCategory(Array.isArray(val) ? val[0] : val);
        setPage(1);
      },
    },
  ];

  if (isReportsLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 bg-slate-50/50">
        <div>
          <Skeleton className="h-8 w-64" />
        </div>
        <StatsGrid>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white dark:bg-card border border-gray-100 dark:border-border/50 flex justify-between items-center shadow-sm">
              <div className="flex-1">
                <Skeleton className="h-4 w-28 mb-3" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          ))}
        </StatsGrid>
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border/60 shadow-sm overflow-hidden flex flex-col">
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
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 bg-slate-50/50">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Academic Reports</h1>
      </div>

      {/* Reports Template Cards (Styled as StatsCards) */}
      <StatsGrid>
        {templates.map((tpl) => (
          <div
            key={tpl.type}
            onClick={() => handleDownload(tpl.type, tpl.apiTitle)}
            className="cursor-pointer hover:scale-[1.01] hover:shadow-md transition-all active:scale-[0.99] flex-1 min-w-[180px]"
          >
            <StatsCard
              title={tpl.title}
              value={tpl.value}
              icon={tpl.icon}
              iconBgClass={tpl.iconBgClass}
              iconColorClass={tpl.iconColorClass}
              tooltip={tpl.description}
            />
          </div>
        ))}
      </StatsGrid>

      {/* Recent Reports Table Section */}
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-border/60">
            <h2 className="text-lg font-bold text-slate-800 dark:text-foreground">Recent Reports</h2>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <DataTable<ReportItem>
              data={paginatedReports}
              columns={columns}
              rowKey={(row) => row.report_type + "_" + row.date_generated}
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
              loading={isReportsFetching}
            />
          </div>
        </div>
      </div>
    </div>
  );
}