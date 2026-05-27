"use client"

import { useState, useEffect } from "react"
import { Users, UserCheck, BookOpen, Search, Plus, Filter, Download } from "lucide-react"
import { useStudents, useStudentCounts, type Student } from "@/features/students/api"
import { getStudentColumns } from "@/features/students/columns"
import { TableCards, StatCard } from "@/components/shared/tables/table-cards"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import AddStudentModal from "@/features/students/components/AddStudentModal"
import EditStudentModal from "@/features/students/components/EditStudentModal"
import { useQueryClient } from "@tanstack/react-query"

export default function StudentsPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [courseFilter, setCourseFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | number | null>(null)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [search])

  // TanStack Query Hooks
  const { 
    data: studentsData, 
    isLoading: loading, 
    error: queryError 
  } = useStudents(currentPage, itemsPerPage, debouncedSearch, statusFilter, courseFilter);

  const { data: countsData } = useStudentCounts();

  const students = studentsData?.students || studentsData?.data || [];
  
  // Handlers for the Table Actions
  const handleEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setIsModalOpen(true);
  };

  const handleDelete = (student: Student) => {
    if (confirm(`Are you sure you want to delete ${student.first_name}?`)) {
      // Implement delete logic or call mutation
      console.log("Delete", student.id);
    }
  };

  const handleView = (student: Student) => {
    setViewingStudent(student);
    // Open a view drawer or modal
  };

  const columns = getStudentColumns(handleEdit, handleDelete, handleView);

  const stats: StatCard[] = [
    {
      label: "Total Students",
      value: countsData?.total || 0,
      helperText: "Total number of students enrolled",
      icon: <Users size={18} />,
      accent: "primary",
    },
    {
      label: "Active Students",
      value: countsData?.active || 0,
      helperText: "Students currently active",
      icon: <UserCheck size={18} />,
      accent: "success",
    },
    {
      label: "Students Today",
      value: "0",
      helperText: "New students registered today",
      icon: <BookOpen size={18} />,
      accent: "info",
    },
  ];

  const queryClient = useQueryClient();
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
    queryClient.invalidateQueries({ queryKey: ["studentCounts"] });
  };

  return (
    <div className="p-6">
      <TableCards
        title="Student Management"
        subtitle="Manage enrollments, batches, and student information."
        stats={stats}
        columns={columns}
        data={students}
        isLoading={loading}
        pageSize={itemsPerPage}
        rowCount={countsData?.total || 0}
        toolbarLeft={
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        }
        toolbarRight={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/students/bulk-upload">
                <Download className="mr-2 h-4 w-4" /> Bulk upload
              </Link>
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </div>
        }
        pagination={{
            pageIndex: currentPage - 1,
            pageSize: itemsPerPage
        }}
        onPaginationChange={(p) => {
            setCurrentPage(p.pageIndex + 1)
            setItemsPerPage(p.pageSize)
        }}
      />

      <AddStudentModal 
        isOpen={isModalOpen && !editingStudentId} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
      />
      
      {editingStudentId && (
        <EditStudentModal
          studentId={editingStudentId}
          isOpen={isModalOpen && !!editingStudentId}
          onClose={() => {
            setIsModalOpen(false)
            setEditingStudentId(null)
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
