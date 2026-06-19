"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  CheckCircle,
  Star,
  UserPlus,
} from "lucide-react";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable, { Column, FilterConfig } from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useRepDashboardStats,
  useRepMonitoringList,
  MonitoringStudent,
} from "@/features/institutional-representative/api/rep-api";

// Circular color list for student avatars - matches tutor management exactly
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

  const totalCount = listData?.pagination?.total || 0;
  const totalPages = listData?.pagination?.totalPages || 1;
  const startIndex = (page - 1) * rowsPerPage;

  // Columns Configuration
  const columns: Column<MonitoringStudent>[] = useMemo(() => [
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
        const allBatches = row.all_batches || [{ id: row.batch_id, name: row.batch_name, status: row.status }];
        
        // Filter to only include critical facing batches
        const criticalBatches = allBatches.filter((b: any) => b.status?.toLowerCase() === "critical");
        
        // Fallback to all batches if none are critical
        const displayBatches = criticalBatches.length > 0 ? criticalBatches : allBatches;
        
        const maxVisible = 3;
        const visibleBatches = displayBatches.slice(0, maxVisible);
        const extraCount = displayBatches.length - maxVisible;
        
        return (
          <div className="flex gap-1.5 flex-wrap items-center max-w-[360px]">
            {visibleBatches.map((b: any, index: number) => (
              <span
                key={b.id || index}
                className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase whitespace-normal break-words inline-block max-w-[180px]"
              >
                {b.name || "N/A"}
              </span>
            ))}
            {extraCount > 0 && (
              <span
                title={displayBatches.slice(maxVisible).map((b: any) => b.name).join(", ")}
                className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase whitespace-nowrap cursor-help font-semibold"
              >
                +{extraCount}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "avg_quiz_score",
      label: "Avg Quiz Score",
      render: (value, row) => {
        const score = typeof row.avg_quiz_score === "number" ? row.avg_quiz_score : 0;
        return (
          <span className="font-semibold text-foreground text-sm">
            {score}%
          </span>
        );
      }
    },
    {
      key: "attendance_percent",
      label: "Attendance %",
      render: (value, row) => {
        const att = typeof row.attendance_percent === "number" ? row.attendance_percent : 0;
        return (
          <span className="font-semibold text-foreground text-sm">
            {att}%
          </span>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => {
        const status = row.status || "Normal";
        const statusLower = status.toLowerCase();
        
        let statusStyles = "";
        if (statusLower === "critical") {
          statusStyles = "bg-[#FEE2E2] text-[#991B1B]";
        } else if (statusLower === "warning") {
          statusStyles = "bg-[#FFEDD5] text-[#9A3412]";
        } else {
          statusStyles = "bg-[#DCFCE7] text-[#166534]";
        }
        
        return (
          <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center justify-center min-w-[90px] text-center",
            statusStyles
          )}>
            {status}
          </span>
        );
      }
    }
  ], []);

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
                data={displayStudents}
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