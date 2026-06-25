"use client";
import React, { useState, useEffect } from "react";
import { useStudents, useStudentStats } from "@/hooks/use-students";
import { Student } from "@/types/student";
import { buildStudentColumns } from "./columns";
import StudentFormModal from "./StudentFormModal";
import BulkUploadModal from "./BulkUploadModal";
import StudentDeleteDialog from "./StudentDeleteDialog";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { useRouter, useSearchParams } from "next/navigation";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Users, UserCheck, BookOpen, MoreVertical, Upload, Pencil, Trash2 } from "lucide-react";
import { Toaster } from "react-hot-toast";

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

import { Suspense } from "react";

function StudentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Modal state
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    student?: Student | null;
  }>({
    open: false,
    mode: "add",
    student: null,
  });
  const [bulkModal, setBulkModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    student: Student | null;
  }>({
    open: false,
    student: null,
  });

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setFormModal({ open: true, mode: "add", student: null });
      router.replace("/admin/students");
    }
  }, [searchParams, router]);

  // Filters & Pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
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
  }, [debouncedSearch, status]);

  // Data fetching hooks
  const { data: studentsData, isLoading, isFetching } = useStudents(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    status
  );

  const { data: stats } = useStudentStats();

  const studentsList = Array.isArray(studentsData) ? studentsData : studentsData?.data || [];
  const totalCount = stats?.total_students || (Array.isArray(studentsData) ? studentsData.length : studentsData?.total || studentsList.length || 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // If the backend returned more items than rowsPerPage, it means it didn't paginate, so we slice locally.
  let visibleData = studentsList;
  if (studentsList.length > rowsPerPage) {
    const start = (page - 1) * rowsPerPage;
    visibleData = studentsList.slice(start, start + rowsPerPage);
  }

  // DataTable configs
  const searchConfig = {
    enabled: true,
    placeholder: "Search by name, email, or user ID...",
    value: search,
    onChange: (val: string) => setSearch(val),
  };

  const filterConfig = [
    {
      id: "status",
      label: "Status: All",
      type: "select" as const,
      value: status,
      options: [
        { value: "All", label: "Status: All" },
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
      onChange: (val: string | string[]) => {
        const selected = Array.isArray(val) ? val[0] : val;
        setStatus((selected || "All") as "All" | "Active" | "Inactive");
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const extraHeaderActions = (
    <button
      onClick={() => setBulkModal(true)}
      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-border/70 rounded-lg hover:bg-gray-50 dark:bg-muted/50 bg-white dark:bg-card transition-all text-gray-700 dark:text-foreground shadow-sm"
    >
      <Upload size={16} />
      Bulk Upload CSV
    </button>
  );

  return (
    <ListingScreenTemplate
      headerText="Student Management"
      subHeaderText="Manage enrollments, batches, and student information."
      buttonLabel="Add Student"
      buttonRequired={true}
      buttonOnclick={() => setFormModal({ open: true, mode: "add", student: null })}
      extraActions={extraHeaderActions}
    >
      {isLoading ? (
        <UserPageSkeleton />
      ) : (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex flex-col h-full overflow-hidden">
        <Toaster position="top-right" />
        
        <StatsGrid>
          <StatsCard
            title="TOTAL STUDENTS"
            value={stats?.total_students ?? "..."}
            icon={<Users className="w-5 h-5" />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Total number of registered students"
          />
          <StatsCard
            title="ACTIVE STUDENTS"
            value={stats?.active_students ?? "..."}
            icon={<UserCheck className="w-5 h-5" />}
            iconBgClass="bg-green-50"
            iconColorClass="text-green-600"
            tooltip="Students currently active"
          />
          <StatsCard
            title="AVG. COURSES/STUDENT"
            value={stats?.average_students_per_course !== undefined ? stats.average_students_per_course.toFixed(1) : "..."}
            icon={<BookOpen className="w-5 h-5" />}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-600"
            tooltip="Average number of courses per student"
          />
        </StatsGrid>

        <DataTable<Student>
          columns={buildStudentColumns()}
          data={visibleData}
          loading={isLoading || isFetching}
          search={searchConfig}
          filters={filterConfig}
          actions={(student) => (
            <div className="flex justify-center">
              <ActionMenu 
                onEdit={() => setFormModal({ open: true, mode: "edit", student })}
                onDelete={() => setDeleteDialog({ open: true, student })}
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

      {/* Modals */}
      <StudentFormModal
        open={formModal.open}
        mode={formModal.mode}
        student={formModal.student}
        onClose={() => setFormModal({ open: false, mode: "add", student: null })}
      />
      <BulkUploadModal
        open={bulkModal}
        onClose={() => setBulkModal(false)}
      />
      <StudentDeleteDialog
        open={deleteDialog.open}
        student={deleteDialog.student}
        onClose={() => setDeleteDialog({ open: false, student: null })}
      />
    </ListingScreenTemplate>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<UserPageSkeleton />}>
      <StudentsPageContent />
    </Suspense>
  );
}
