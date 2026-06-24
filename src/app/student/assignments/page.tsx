"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  BookOpen, 
  CheckSquare, 
  PieChart, 
} from "lucide-react";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { useStudentAssignmentStats, useStudentAssignmentTable } from "@/features/student/assignments/api/assignments-api";
import { Skeleton } from "@/components/ui/skeleton";
import { buildAssignmentColumns, AssignmentRow } from "./columns";

function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-gray-100 dark:border-border/50 shadow-sm p-3 md:p-4 w-full h-[104px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: statsData, isLoading: isLoadingStats, isError: isErrorStats } = useStudentAssignmentStats();
  const { data: tableDataResponse, isLoading: isLoadingTable, isError: isErrorTable } = useStudentAssignmentTable(page, limit, debouncedSearch || undefined);

  const tableData: AssignmentRow[] = tableDataResponse?.data || [];
  const pagination = tableDataResponse?.pagination || {
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  };

  const columns = useMemo(() => buildAssignmentColumns(), []);

  const searchConfig = {
    enabled: true,
    placeholder: "Search assignments...",
    value: searchQuery,
    onChange: (val: string) => setSearchQuery(val)
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">Assignments</h1>
        <p className="text-gray-500 dark:text-muted-foreground font-medium">Manage and track your coursework submissions.</p>
      </div>

      <div className="mb-10">
        {isLoadingStats ? (
          <StatsGrid>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </StatsGrid>
        ) : isErrorStats ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold">
            Failed to load statistics
          </div>
        ) : (
          <StatsGrid>
            <StatsCard
              title="Total Assignments"
              value={statsData?.total_assignment ?? 0}
              icon={<BookOpen size={20} />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              tooltip="Total number of assignments given to you"
            />
            <StatsCard
              title="Completed Assignments"
              value={statsData?.completed_assignments ?? 0}
              icon={<CheckSquare size={20} />}
              iconBgClass="bg-emerald-50"
              iconColorClass="text-emerald-600"
              tooltip="Total assignments you have completed"
            />
            <StatsCard
              title="Completion Percentage"
              value={`${statsData?.assignment_completion_percentage ?? 0}%`}
              icon={<PieChart size={20} />}
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
              tooltip="Percentage of assignments completed"
            />
          </StatsGrid>
        )}
      </div>

      <ListingScreenTemplate
        headerText="Assignments List"
        buttonRequired={false}
      >
        {isErrorTable ? (
          <div className="p-8 text-center text-destructive">
            Failed to load assignments records. Please try again.
          </div>
        ) : (
          <div className="p-0 sm:p-4 flex flex-col">
            <DataTable<any>
              data={tableData}
              columns={columns}
              loading={isLoadingTable}
              search={searchConfig}
              rowsPerPage={limit}
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              onRowsPerPageChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              emptyStateMessage="No assignments found."
              paginationInfo={`Showing ${tableData.length} of ${pagination.totalRecords || 0} assignments`}
              bodyHeight="h-auto"
            />
          </div>
        )}
      </ListingScreenTemplate>
    </div>
  );
}