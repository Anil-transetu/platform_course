"use client";

import React, { useState, useEffect } from "react";
import { useAssignments, useAssignmentStats } from "@/features/admin/assignments/api/use-assignments";
import { Assignment } from "@/features/admin/assignments/api/assignment-api";
import { useRouter } from "next/navigation";
import { buildAssignmentColumns } from "./columns";
import AssignmentDeleteDialog from "./AssignmentDeleteDialog";
import AssignmentPageSkeleton from "@/components/admin/assignments/AssignmentPageSkeleton";
import StatsCard from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { Toaster } from "@/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FileText, CheckCircle, ClipboardList, Star, MoreVertical, Pencil, Trash2 } from "lucide-react";

function ActionMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 hover:bg-gray-100 dark:bg-muted rounded-lg text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:text-foreground transition-colors"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-100 dark:border-border/50 p-1 min-w-[120px] z-50">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-gray-700 dark:text-foreground hover:bg-gray-50 dark:bg-muted/50 rounded-lg transition-colors focus:bg-gray-50 dark:bg-muted/50 outline-none font-medium flex items-center gap-2"
        >
          <Pencil size={14} className="text-gray-400" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:bg-red-50 outline-none font-medium flex items-center gap-2"
        >
          <Trash2 size={14} className="text-red-500" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AssignmentsPage() {
  const router = useRouter();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    assignment: Assignment | null;
  }>({
    open: false,
    assignment: null,
  });

  // Filters & Pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Draft">("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search or status changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // Data fetching hooks
  const { data: assignmentsData, isLoading, isFetching } = useAssignments(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    statusFilter
  );

  const { data: stats } = useAssignmentStats();

  const assignmentsList = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData?.data || [];
  const apiTotal = !Array.isArray(assignmentsData) ? assignmentsData?.total : undefined;
  const totalCount = apiTotal !== undefined ? apiTotal : assignmentsList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // Local Pagination
  let visibleData = assignmentsList;
  const start = (page - 1) * rowsPerPage;
  if (assignmentsList.length > rowsPerPage) {
    visibleData = assignmentsList.slice(start, start + rowsPerPage);
  }

  // DataTable configs
  const searchConfig = {
    enabled: true,
    placeholder: "Search by assignment title...",
    value: search,
    onChange: (val: string) => setSearch(val),
  };

  const filterConfig = [
    {
      id: "status",
      label: "Status: All",
      type: "select" as const,
      value: statusFilter,
      options: [
        { value: "All", label: "All" },
        { value: "Active", label: "Active" },
        { value: "Draft", label: "Draft" },
      ],
      onChange: (val: string | string[]) => {
        const selected = Array.isArray(val) ? val[0] : val;
        setStatusFilter((selected || "All") as any);
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  return (
    <ListingScreenTemplate
      headerText="Assignment Management"
      subHeaderText="Create, manage, and evaluate student assignments"
      buttonLabel="Create Assignment"
      buttonRequired={true}
      buttonOnclick={() => router.push("/admin/assignments/new")}
    >
      {isLoading ? (
        <AssignmentPageSkeleton />
      ) : (
        <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
          <Toaster position="top-right" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
            <StatsCard
              title="Total Assignments"
              value={stats?.total_assignments ?? totalCount}
              icon={<FileText size={20} />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              tooltip="Total number of assignments created"
            />
            <StatsCard
              title="Active Assignments"
              value={stats?.active_assignments ?? assignmentsList.filter((a: any) => (a.status || "Active").toLowerCase() === "active").length}
              icon={<CheckCircle size={20} />}
              iconBgClass="bg-green-50"
              iconColorClass="text-green-600"
              tooltip="Assignments currently active"
            />
            <StatsCard
              title="Submissions Pending"
              value={stats?.submissions_pending ?? 0}
              icon={<ClipboardList size={20} />}
              iconBgClass="bg-orange-50"
              iconColorClass="text-orange-600"
              tooltip="Submitted assignments awaiting grading"
            />
            <StatsCard
              title="Avg. Score"
              value={stats?.average_score ? `${stats.average_score}%` : "0%"}
              icon={<Star size={20} />}
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
              tooltip="Average grade score across all submissions"
            />
          </div>

          <DataTable<Assignment>
            columns={buildAssignmentColumns()}
            data={visibleData}
            loading={isLoading || isFetching}
            search={searchConfig}
            filters={filterConfig}
            actions={(assignment) => (
              <div className="flex justify-center">
                <ActionMenu 
                  onEdit={() => router.push(`/admin/assignments/${assignment.id}`)}
                  onDelete={() => setDeleteDialog({ open: true, assignment })}
                />
              </div>
            )}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            paginationInfo={paginationInfo}
            showPagination={true}
          />
        </div>
      )}


      <AssignmentDeleteDialog
        open={deleteDialog.open}
        assignment={deleteDialog.assignment}
        onClose={() => setDeleteDialog({ open: false, assignment: null })}
      />
    </ListingScreenTemplate>
  );
}
