"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  BarChart3, 
  CheckCircle2, 
  Flame, 
} from "lucide-react";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { useStudentAttendanceStats, useStudentAttendanceTable } from "@/features/student/attendance/api/attendance-api";
import { Skeleton } from "@/components/ui/skeleton";
import { buildAttendanceColumns, AttendanceRow } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function AttendancePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [statusFilter, setStatusFilter] = useState<string>("Select status");

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { data: statsData, isLoading: isLoadingStats, isError: isErrorStats } = useStudentAttendanceStats();
  const { data: tableDataResponse, isLoading: isLoadingTable, isError: isErrorTable } = useStudentAttendanceTable(page, limit, statusFilter !== "Select status" ? statusFilter : undefined);

  const tableData: AttendanceRow[] = tableDataResponse?.data || [];
  const pagination = tableDataResponse?.pagination || {
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 5
  };

  const columns = useMemo(() => buildAttendanceColumns(), []);

  const extraActions = (
    <div className="w-[200px] flex flex-row ">

      <p className="text-sm font-medium text-gray-700 mb-2">Filter by Status:</p>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="bg-white dark:bg-card border-gray-200 dark:border-border/50 rounded-lg font-medium h-[42px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="Select status" className="font-medium cursor-pointer text-gray-500">All </SelectItem>
          <SelectItem value="present" className="font-medium cursor-pointer">Present</SelectItem>
          <SelectItem value="absent" className="font-medium cursor-pointer">Absent</SelectItem>
          <SelectItem value="late" className="font-medium cursor-pointer">Late</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">Attendance Tracking</h1>
        <p className="text-gray-500 dark:text-muted-foreground font-medium">Monitor your daily presence and consistency.</p>
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
              title="Total Days Present"
              value={`${statsData?.total_days_present || 0} Days`}
              icon={<CheckCircle2 size={20} />}
              iconBgClass="bg-emerald-50"
              iconColorClass="text-emerald-600"
              tooltip="Total number of days you were present"
            />
            <StatsCard
              title="Average Attendance %"
              value={`${statsData?.average_attendance_percentage || 0}%`}
              icon={<BarChart3 size={20} />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              tooltip="Your overall attendance percentage"
            />
            <StatsCard
              title="Recent Streak"
              value={`${statsData?.streak || 0} Days`}
              icon={<Flame size={20} />}
              iconBgClass="bg-orange-50"
              iconColorClass="text-orange-600"
              tooltip="Consecutive days you have attended"
            />
          </StatsGrid>
        )}
      </div>

      <ListingScreenTemplate
        headerText="Detailed Logs"
        buttonRequired={false}
        extraActions={extraActions}
      >
        {isErrorTable ? (
          <div className="p-8 text-center text-destructive">
            Failed to load attendance records. Please try again.
          </div>
        ) : (
          <div className="p-0 sm:p-4 flex flex-col">
            <DataTable
              data={tableData}
              columns={columns}
              loading={isLoadingTable}
              rowsPerPage={limit}
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              onRowsPerPageChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              emptyStateMessage="No attendance records found."
              paginationInfo={`Showing ${tableData.length} of ${pagination.totalRecords || 0} records`}
              bodyHeight="h-auto"
            />
          </div>
        )}
      </ListingScreenTemplate>
    </div>
  );
}