"use client";

import { useState, useEffect } from "react";
import { Layers, Users, FileText, CalendarDays, Eye, CheckCircle2 } from "lucide-react";
import StatsCard from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import { buildTutorBatchColumns, TutorBatch } from "./columns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import InstitutionPageSkeleton from "@/components/admin/institutions/InstitutionPageSkeleton";
import { useTutorDashboardStats, useTutorDashboardBatches } from "@/features/tutor/api/dashboard-api";
import { Toaster, toast } from "sonner";

export default function TutorDashboardPage() {
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
  } = useTutorDashboardStats();

  const { 
    data: batchesData, 
    isLoading: isLoadingBatches, 
    isFetching: isFetchingBatches,
    isError: isBatchesError,
    error: batchesError 
  } = useTutorDashboardBatches(page, rowsPerPage, debouncedSearch);

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

  const batchesList = batchesData?.data || [];
  const totalItems = batchesData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const stats = statsData || {};

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6 flex flex-col h-full">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tutor Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, monitor your schedule and session progress.
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
              icon={<Layers size={20} />}
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
              title="Pending Evaluations"
              value={stats.pending_evaluations ?? 0}
              icon={<FileText size={20} />}
              iconBgClass="bg-orange-50"
              iconColorClass="text-orange-600"
            />
            <StatsCard
              title="Today's Sessions"
              value={stats.today_sessions ?? 0}
              icon={<CalendarDays size={20} />}
              iconBgClass="bg-green-50"
              iconColorClass="text-green-600"
            />
          </div>

          {/* Batch Management Table Section */}
          <div className="flex-1 flex flex-col min-h-0 mt-8">
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
