"use client";
import React, { useState, useEffect } from "react";
import { useStudents, useStudentStats } from "@/hooks/use-students";
import { Student } from "@/types/student";
import { studentColumns } from "./columns";
import StudentFormModal from "./StudentFormModal";
import BulkUploadModal from "./BulkUploadModal";
import StudentDeleteDialog from "./StudentDeleteDialog";
import StatsCard from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
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
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-md border border-gray-100 p-1 min-w-[120px] z-50">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:bg-gray-50 outline-none font-medium flex items-center gap-2"
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

export default function StudentsPage() {
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
  const { data: studentsData, isLoading } = useStudents(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    status
  );

  const { data: stats } = useStudentStats();

  const studentsList = Array.isArray(studentsData) ? studentsData : studentsData?.data || [];
  const totalCount = Array.isArray(studentsData) ? studentsData.length : studentsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

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
        { value: "Active", label: "Status: Active" },
        { value: "Inactive", label: "Status: Inactive" },
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
      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 bg-white transition-all text-gray-700 shadow-sm"
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
      <div className="p-6 space-y-6 flex flex-col h-full overflow-y-auto">
        <Toaster position="top-right" />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0">
          <StatsCard
            title="Total Students"
            value={stats?.total_students?.toLocaleString() ?? "0"}
            icon={<Users size={20} />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Total registered students in the system"
          />
          <StatsCard
            title="Active Students"
            value={stats?.active_students?.toLocaleString() ?? "0"}
            icon={<UserCheck size={20} />}
            iconBgClass="bg-green-50"
            iconColorClass="text-green-600"
            tooltip="Students currently active and enrolled"
          />
          <StatsCard
            title="Avg. Courses/Student"
            value={stats?.average_students_per_course ? stats.average_students_per_course.toFixed(1) : "0.0"}
            icon={<BookOpen size={20} />}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-600"
            tooltip="Average number of course enrollments per student"
          />
        </div>

        {/* Data Table */}
        <div className="flex-1 min-h-[350px]">
          <DataTable<Student>
            data={studentsList}
            columns={studentColumns}
            rowKey={(row) => String(row.id)}
            actions={(student) => (
              <ActionMenu
                onEdit={() => setFormModal({ open: true, mode: "edit", student })}
                onDelete={() => setDeleteDialog({ open: true, student })}
              />
            )}
            rowsPerPage={rowsPerPage}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setPage(1);
            }}
            paginationInfo={paginationInfo}
            search={searchConfig}
            filters={filterConfig}
            showPagination={true}
            loading={isLoading}
            emptyStateMessage="No students found matching your criteria."
            bodyHeight="h-auto"
          />
        </div>
      </div>

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
