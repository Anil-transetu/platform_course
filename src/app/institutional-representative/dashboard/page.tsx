"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  CheckCircle,
  Star,
  UserPlus,
} from "lucide-react";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable, { FilterConfig } from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import { cn } from "@/lib/utils";
import {
  useRepDashboardStats,
  useRepMonitoringList,
  MonitoringStudent,
} from "@/features/institutional-representative/api/rep-api";
import { toast } from "react-hot-toast";
import { buildMonitoringStudentColumns } from "./columns";
import { useStudentProfiles, enrichStudentData } from "@/features/institutional-representative/hooks/use-student-profiles";

export default function InstitutionalDashboard() {
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // API query integrations
  const { data: stats, isLoading: isStatsLoading } = useRepDashboardStats();
  const { 
    data: listData, 
    isLoading: isListLoading, 
    isFetching: isListFetching 
  } = useRepMonitoringList(page, rowsPerPage, search, selectedBatch);

  const students = listData?.students || [];

  // Consolidate duplicate students who are in multiple batches
  const displayStudents = useMemo(() => {
    const map = new Map<number, MonitoringStudent>();
    for (const student of students) {
      const existing = map.get(student.student_id);
      const batchInfo = {
        id: student.batch_id,
        name: student.batch_name,
        status: student.status
      };
      
      if (existing) {
        if (!existing.all_batches) {
          existing.all_batches = [{
            id: existing.batch_id,
            name: existing.batch_name,
            status: existing.status
          }];
        }
        if (!existing.all_batches.some((b: any) => b.id === student.batch_id)) {
          existing.all_batches.push(batchInfo);
        }
        // If any consolidated batch is critical, the student status should be critical
        if (student.status?.toLowerCase() === "critical") {
          existing.status = student.status;
        }
      } else {
        map.set(student.student_id, {
          ...student,
          all_batches: [batchInfo]
        });
      }
    }
    return Array.from(map.values());
  }, [students]);

  const studentIds = useMemo(() => displayStudents.map((s) => s.student_id), [displayStudents]);
  const { data: freshProfiles } = useStudentProfiles(studentIds);

  const enrichedDisplayStudents = useMemo(() => {
    return enrichStudentData(displayStudents, freshProfiles);
  }, [displayStudents, freshProfiles]);

  const totalCount = listData?.pagination?.total || 0;
  const totalPages = listData?.pagination?.totalPages || 1;
  const startIndex = (page - 1) * rowsPerPage;

  // Columns Configuration
  const columns = useMemo(() => buildMonitoringStudentColumns(), []);

  const paginationInfo = totalCount > 0
    ? `${startIndex + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const searchConfig = {
    enabled: true,
    placeholder: "Search students by name...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
      setPage(1);
    },
  };

  const filterConfig: FilterConfig[] = [
    {
      id: "batch",
      label: "All Batches",
      type: "select",
      value: selectedBatch,
      className: "sm:w-[260px]",
      options: [
        { value: "All", label: "All Batches" },
        ...Array.from(
          new Map(
            (listData?.batch_filters || [])
              .map((b: any) => {
                if (typeof b === "string") {
                  return { value: b, label: b };
                }
                const bId = String(b?.batch_id || b?.id || b?._id || "");
                const bName = String(b?.batch_name || b?.name || b?.batchName || bId);
                return { value: bId, label: bName };
              })
              .filter((opt) => opt.value && opt.value.trim() !== "")
              .map((opt) => [opt.value, opt] as [string, { value: string; label: string }])
          ).values()
        )
      ],
      onChange: (val: string | string[]) => {
        setSelectedBatch(Array.isArray(val) ? val[0] : val);
        setPage(1);
      },
    },
  ];

  return (
    <ListingScreenTemplate
      headerText="Institutional Hub"
      subHeaderText="Overview of your institution's batches and student performance."
    >
      {isStatsLoading || isListLoading ? (
        <UserPageSkeleton />
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full flex-1">
          {/* Stats Cards */}
          <StatsGrid>
            <StatsCard
              title="Avg Quiz Score"
              value={`${stats?.avg_quiz_score?.value ?? 0}%`}
              icon={<Users className="w-5 h-5" />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              tooltip={`Average score across all quizzes taken by your students (Trend: ${stats?.avg_quiz_score?.trend ?? "0.0"} - ${stats?.avg_quiz_score?.trend_direction ?? "stable"})`}
            />
            <StatsCard
              title="Completion Rate"
              value={`${stats?.completion_rate?.value ?? 0}%`}
              icon={<CheckCircle className="w-5 h-5" />}
              iconBgClass="bg-green-50"
              iconColorClass="text-green-600"
              tooltip={`Average course completion rate (Status: ${stats?.completion_rate?.label ?? "N/A"})`}
            />
            <StatsCard
              title="Total Batches"
              value={stats?.total_batches?.active_count ?? 0}
              icon={<Star className="w-5 h-5" />}
              iconBgClass="bg-yellow-50"
              iconColorClass="text-yellow-600"
              tooltip={`Active batches assigned to your institution (${stats?.total_batches?.pending_graduation ?? 0} pending graduation)`}
            />
            <StatsCard
              title="At Risk Students"
              value={stats?.at_risk_students?.count ?? 0}
              icon={<UserPlus className="w-5 h-5" />}
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
              tooltip={`Students requiring immediate academic support (Urgency: ${stats?.at_risk_students?.urgency_label ?? "N/A"})`}
            />
          </StatsGrid>

          {/* Student Performance Table Container */}
          <div className="flex-1 overflow-hidden min-h-0 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground">Student Monitoring List</h2>
            <div className="flex-1 overflow-hidden min-h-0">
              <DataTable<MonitoringStudent>
                data={enrichedDisplayStudents}
                columns={columns}
                rowKey={(row) => String(row.student_id || row.id || row._id || Math.random())}
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
                loading={isListFetching || isListLoading}
              />
            </div>
          </div>
        </div>
      )}
    </ListingScreenTemplate>
  );
}