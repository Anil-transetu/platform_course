"use client";
import React, { useState, useEffect } from "react";
import { useStudents, useStudentStats, useUpdateStudentStatus } from "@/features/admin/students/api/student-api";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, UserCheck, BookOpen, MoreVertical, Upload, Pencil, Trash2, Power, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

function ActionMenu({
  status,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  status: string;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const isActive = (status || "").toLowerCase() === "active";

  return (
    <DropdownMenu modal={false}>
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

        {isActive ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus();
            }}
            className="cursor-pointer px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors focus:bg-amber-50 outline-none font-medium flex items-center gap-2"
          >
            <Power size={14} className="text-amber-500" />
            Disable
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus();
              }}
              className="cursor-pointer px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors focus:bg-emerald-50 outline-none font-medium flex items-center gap-2"
            >
              <CheckCircle2 size={14} className="text-emerald-500" />
              Enable
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
          </>
        )}
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

  const [statusConfirmDialog, setStatusConfirmDialog] = useState<{
    open: boolean;
    student: Student | null;
    nextStatus: "active" | "inactive";
  }>({
    open: false,
    student: null,
    nextStatus: "active",
  });

  const updateStudentStatus = useUpdateStudentStatus();

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setFormModal({ open: true, mode: "add", student: null });
      router.replace("/admin/students");
    }
  }, [searchParams, router]);

  // Filters & Pagination state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search, status or rowsPerPage changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, rowsPerPage]);

  // Fetch students with server-side pagination and filtering
  const { data: studentsData, isLoading } = useStudents(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    status === "All" ? undefined : status
  );

  const { data: stats } = useStudentStats();

  const studentsList = React.useMemo(() => {
    return Array.isArray(studentsData) ? studentsData : studentsData?.data || [];
  }, [studentsData]);

  const totalCount = studentsData?.pagination?.total || studentsData?.pagination?.total_records || studentsData?.meta?.total || studentsData?.total || studentsData?.total_records || studentsList.length;
  const totalPages = studentsData?.pagination?.total_pages || studentsData?.pagination?.totalPages || Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;

  const visibleData = studentsList;

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
    ? `${startIndex + 1}-${Math.min(startIndex + visibleData.length, totalCount)} of ${totalCount}`
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

  const handleConfirmStatusToggle = () => {
    if (!statusConfirmDialog.student) return;
    const targetStatus = statusConfirmDialog.nextStatus;
    const targetStudent = statusConfirmDialog.student;

    // Immediately close dialog to ensure Radix UI unmounts overlays and restores focus
    setStatusConfirmDialog({ open: false, student: null, nextStatus: "active" });

    updateStudentStatus.mutate(
      { id: targetStudent.id, status: targetStatus },
      {
        onSuccess: () => {
          toast.success(`Student ${targetStatus === "active" ? "enabled" : "disabled"} successfully!`);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update student status");
        },
        onSettled: () => {
          if (typeof document !== "undefined" && document.body.style.pointerEvents === "none") {
            document.body.style.pointerEvents = "";
          }
        },
      }
    );
  };

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
          loading={isLoading}
          search={searchConfig}
          filters={filterConfig}
          actions={(student) => {
            const isActive = (student.status || "Active").toLowerCase() === "active";
            return (
              <div className="flex justify-center">
                <ActionMenu 
                  status={student.status || "Active"}
                  onEdit={() => setFormModal({ open: true, mode: "edit", student })}
                  onToggleStatus={() =>
                    setStatusConfirmDialog({
                      open: true,
                      student,
                      nextStatus: isActive ? "inactive" : "active",
                    })
                  }
                  onDelete={() => setDeleteDialog({ open: true, student })}
                />
              </div>
            );
          }}
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

      {/* STATUS CONFIRMATION DIALOG */}
      <AlertDialog
        open={statusConfirmDialog.open}
        onOpenChange={(val) => {
          if (!val) {
            setStatusConfirmDialog({ open: false, student: null, nextStatus: "active" });
            if (typeof document !== "undefined" && document.body.style.pointerEvents === "none") {
              document.body.style.pointerEvents = "";
            }
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md" onCloseAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {statusConfirmDialog.nextStatus === "active" ? "Enable" : "Disable"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {statusConfirmDialog.nextStatus === "active" ? "enable" : "disable"} student{" "}
              <span className="font-semibold text-slate-800">{statusConfirmDialog.student?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex sm:justify-center gap-3">
            <AlertDialogCancel
              onClick={() => setStatusConfirmDialog({ open: false, student: null, nextStatus: "active" })}
              className="rounded-xl px-6"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusToggle}
              disabled={updateStudentStatus.isPending}
              className={`rounded-xl px-6 text-white shadow-sm gap-2 flex items-center ${
                statusConfirmDialog.nextStatus === "active"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
              }`}
            >
              {statusConfirmDialog.nextStatus === "active" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              {statusConfirmDialog.nextStatus === "active" ? "Enable" : "Disable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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