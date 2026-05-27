/**
 * Complete example page component using the reusable DataTable, TanStack Query, and Create/Edit Modal
 * This demonstrates best practices for production-ready code
 */

"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/data-table";
import { CreateEditModal } from "@/components/forms/form-modal";
import { Button } from "@/components/ui/button";
import { useTableState } from "@/hooks/use-table-state";
import { useApiError } from "@/hooks/use-api-error";

// Import your feature hooks
import {
  useGetStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  type Student,
} from "@/features/students/use-students";

// Validation schema
const studentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile_number: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  notes: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

/**
 * Example: Students page component with DataTable and Create/Edit functionality
 */
export default function StudentsPage() {
  const { pagination, handlePaginationChange } = useTableState();
  const { error: apiError, setError: setApiError, clearError } = useApiError();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch students with pagination
  const { data: response, isLoading } = useGetStudents({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const students = response?.data || [];
  const pageCount = response?.pagination.pages || 1;
  const rowCount = response?.pagination.total || 0;

  // Mutations
  const { mutateAsync: createStudent, isPending: isCreating } =
    useCreateStudent();
  const { mutateAsync: updateStudent, isPending: isUpdating } =
    useUpdateStudent();
  const { mutateAsync: deleteStudent } = useDeleteStudent();

  // Form setup
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      mobile_number: "",
      status: "active",
      notes: "",
    },
  });

  // Table columns (memoized for performance)
  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        accessorKey: "first_name",
        header: "First Name",
      },
      {
        accessorKey: "last_name",
        header: "Last Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "mobile_number",
        header: "Mobile",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded text-sm ${
              row.original.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditClick(row.original)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(row.original.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // Handlers
  const handleAddClick = () => {
    clearError();
    setModalMode("add");
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (student: Student) => {
    clearError();
    setModalMode("edit");
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id);
      } catch (err) {
        setApiError(
          err instanceof Error ? err.message : "Failed to delete student"
        );
      }
    }
  };

  const handleFormSubmit = async (data: StudentFormData) => {
    try {
      if (modalMode === "add") {
        await createStudent(data);
      } else if (selectedStudent) {
        await updateStudent({
          id: selectedStudent.id,
          data,
        });
      }
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : `Failed to ${modalMode} student`
      );
      throw err; // Re-throw to prevent modal from closing on error
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students</h1>
        <Button onClick={handleAddClick}>Add Student</Button>
      </div>

      {apiError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* DataTable with server-side pagination */}
      <DataTable
        columns={columns}
        data={students}
        pageCount={pageCount}
        rowCount={rowCount}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={isLoading}
      />

      {/* Create/Edit Modal */}
      <CreateEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Student"
        mode={modalMode}
        initialData={selectedStudent as StudentFormData | null}
        form={form}
        fields={[
          {
            name: "first_name",
            label: "First Name",
            type: "text",
            placeholder: "John",
            required: true,
          },
          {
            name: "last_name",
            label: "Last Name",
            type: "text",
            placeholder: "Doe",
            required: true,
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "john@example.com",
            required: true,
          },
          {
            name: "mobile_number",
            label: "Mobile Number",
            type: "text",
            placeholder: "+1234567890",
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            required: true,
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Add any notes...",
          },
        ]}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
        error={apiError}
      />
    </div>
  );
}
