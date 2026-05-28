"use client"

import { useState, useEffect } from "react"
import { Users, UserCheck, BookOpen, Search, Plus } from "lucide-react"
import { useStudents, useStudentCounts, type Student } from "@/features/students/api"
import { getStudentColumns } from "@/features/students/columns"
import { TableCards, StatCard } from "@/components/shared/tables/table-cards"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import StudentActionModal from "@/features/students/components/StudentActionModal"
import BulkUploadModal from "@/features/students/components/BulkUploadModal"
import { useQueryClient } from "@tanstack/react-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function StudentsPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [courseFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "delete";
    student: Student | null;
  }>({
    isOpen: false,
    mode: "create",
    student: null
  })

  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)

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
  } = useStudents(currentPage, itemsPerPage, debouncedSearch, statusFilter, courseFilter);

  const mockStudents: Student[] = [
    // Page 1
    { id: 88210, first_name: "Ethan", last_name: "Richards", email: "ethan.r@example.com", status: "Active", course_name: "CS-2024-A, DS-102" },
    { id: 88211, first_name: "Sarah", last_name: "Miller", email: "sarah.m@example.com", status: "Active", course_name: "UX-PRO-24" },
    { id: 88212, first_name: "James", last_name: "Lee", email: "j.lee@academy.edu", status: "Inactive", course_name: "CS-2024-A" },
    { id: 88213, first_name: "Olivia", last_name: "Adams", email: "olivia.adams@cloud.com", status: "Inactive", course_name: "MKT-101, CS-2024-B" },
    { id: 88214, first_name: "Liam", last_name: "Wilson", email: "liam.w@example.com", status: "Active", course_name: "CS-2024-A" },
    // Page 2
    { id: 88215, first_name: "Emma", last_name: "Taylor", email: "emma.t@example.com", status: "Active", course_name: "UI-2024-A" },
    { id: 88216, first_name: "Noah", last_name: "Johnson", email: "noah.j@example.com", status: "Active", course_name: "BE-2024-A" },
    { id: 88217, first_name: "Ava", last_name: "Brown", email: "ava.b@example.com", status: "Inactive", course_name: "FE-2024-A" },
    { id: 88218, first_name: "Sophia", last_name: "Davis", email: "sophia.d@example.com", status: "Active", course_name: "CS-2024-B" },
    { id: 88219, first_name: "Lucas", last_name: "Martinez", email: "lucas.m@example.com", status: "Active", course_name: "DS-2024-A" },
    // Page 3
    { id: 88220, first_name: "Isabella", last_name: "Garcia", email: "isabella.g@example.com", status: "Active", course_name: "ML-2024-A" },
    { id: 88221, first_name: "Mason", last_name: "Rodriguez", email: "mason.r@example.com", status: "Inactive", course_name: "WEB-2024-A" },
    { id: 88222, first_name: "Mia", last_name: "Wilson", email: "mia.w@example.com", status: "Active", course_name: "CS-2024-A" },
    { id: 88223, first_name: "Logan", last_name: "Anderson", email: "logan.a@example.com", status: "Active", course_name: "AI-2024-A" },
    { id: 88224, first_name: "Charlotte", last_name: "Thomas", email: "charlotte.t@example.com", status: "Active", course_name: "CS-2024-C" },
  ];

  const { data: countsData } = useStudentCounts();

  // Paginate mock students
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMockStudents = mockStudents.slice(startIndex, endIndex);

  const students = studentsData?.data?.length ? studentsData.data : (Array.isArray(studentsData) && studentsData.length ? studentsData : paginatedMockStudents);
  
  // Handlers for the Table Actions
  const handleEdit = (student: Student) => {
    setModalState({ isOpen: true, mode: "edit", student });
  };

  const handleDelete = (student: Student) => {
    setModalState({ isOpen: true, mode: "delete", student });
  };

  const handleCreate = () => {
    setModalState({ isOpen: true, mode: "create", student: null });
  };

  const columns = getStudentColumns(handleEdit, handleDelete, () => {});

  const stats: StatCard[] = [
    {
      label: "Total Students",
      value: "12,482",
      helperText: "Total number of students enrolled",
      icon: <Users size={20} className="text-blue-600" />,
      accent: "primary",
    },
    {
      label: "Active Students",
      value: "11,204",
      helperText: "Students currently active",
      icon: <UserCheck size={20} className="text-emerald-600" />,
      accent: "success",
    },
    {
      label: "Avg. Courses/Student",
      value: "3.4",
      helperText: "Engagement metric",
      icon: <BookOpen size={20} className="text-purple-600" />,
      accent: "info",
    },
  ];

  const queryClient = useQueryClient();
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
    queryClient.invalidateQueries({ queryKey: ["studentCounts"] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <StudentActionModal 
          isOpen={modalState.isOpen}
          mode={modalState.mode}
          student={modalState.student}
          onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
          onSuccess={handleSuccess}
        />
        
        <BulkUploadModal 
          isOpen={isBulkUploadOpen}
          onClose={() => setIsBulkUploadOpen(false)}
          onSuccess={handleSuccess}
        />

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Student Management</h1>
            <p className="text-slate-500 font-medium mt-2">Manage enrollments, batches, and student information.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsBulkUploadOpen(true)}
              className="h-11 px-6 rounded-lg border-slate-200 text-slate-600 font-semibold flex items-center gap-2 hover:bg-slate-100 shadow-sm bg-white transition-all"
            >
              <Plus size={18} />
              Bulk Upload CSV
            </Button>
            <Button 
              onClick={handleCreate}
              className="h-11 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
            >
              <Plus size={18} />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-slate-200">
              <div className="flex items-start gap-3">
                {stat.icon && (
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center flex-shrink-0">
                    {stat.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center gap-4 bg-gradient-to-r from-slate-50/50 to-transparent">
            <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <Input 
                placeholder="Search by name, email, or user ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 font-medium text-sm transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 uppercase">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[100px] h-10 rounded-lg bg-slate-50 border-slate-200 shadow-none font-medium text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-100 shadow-lg">
                  <SelectItem value="All" className="rounded-lg font-medium text-sm">All</SelectItem>
                  <SelectItem value="Active" className="rounded-lg font-medium text-emerald-600 text-sm">Active</SelectItem>
                  <SelectItem value="Inactive" className="rounded-lg font-medium text-slate-400 text-sm">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="px-6 flex-1 overflow-y-auto">
            <TableCards
              title=""
              subtitle=""
              stats={[]}
              columns={columns}
              data={students}
              isLoading={loading}
              rowCount={countsData?.total || 0}
              pageCount={Math.ceil(mockStudents.length / itemsPerPage)}
              pagination={{
                pageIndex: currentPage - 1,
                pageSize: itemsPerPage
              }}
              onPaginationChange={(p) => {
                setCurrentPage(p.pageIndex + 1)
                setItemsPerPage(p.pageSize)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
