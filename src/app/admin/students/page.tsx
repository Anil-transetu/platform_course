"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Trophy, BarChart2, TrendingUp } from "lucide-react"
import { useStudents, useStudentCounts, type Student } from "@/features/admin/students/api/student-api"
import { buildStudentColumns } from "@/app/admin/students/columns"
import { TableCards } from "@/components/shared/tables/table-cards"
import StatsCard from "@/components/ui/StatsCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import StudentActionModal from "@/app/admin/students/components/StudentActionModal"
import BulkUploadModal from "@/app/admin/students/components/BulkUploadModal"
import { useQueryClient } from "@tanstack/react-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function StudentsPage() {
  const router = useRouter()
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

  const students = (studentsData?.data || []) as Student[];
  const totalRows = ((studentsData as Record<string, unknown>)?.meta as Record<string, unknown>)?.total as number || ((studentsData as Record<string, unknown>)?.total as number) || ((studentsData as Record<string, unknown>)?.pagination as Record<string, unknown>)?.total as number || students.length;
  
  // Calculate stats based on real data
  const activeStudentsCount = students.filter((s: Student) => s.status?.toLowerCase() === 'active').length;
  const avgCourses = 1.0;

  // Handlers for the Table Actions
  const handleEdit = (student: Student) => {
    router.push(`/admin/students/${student.id}?mode=edit`);
  };

  const handleDelete = (student: Student) => {
    router.push(`/admin/students/${student.id}?mode=delete`);
  };

  const handleCreate = () => {
    setModalState({ isOpen: true, mode: "create", student: null });
  };

  const columns = buildStudentColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });



  const queryClient = useQueryClient();
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
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
            <h1 className="text-4xl font-bold text-foreground">Student Management</h1>
            <p className="text-muted-foreground font-medium mt-2">Manage enrollments, batches, and student information.</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsBulkUploadOpen(true)}
              className="h-11 px-6 rounded-lg border-border text-muted-foreground font-semibold flex items-center gap-2 hover:bg-accent shadow-sm bg-card transition-all"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatsCard title="Highest Performer" value="98%" icon={<Trophy size={20} />} iconBgClass="bg-yellow-50" iconColorClass="text-yellow-600" tooltip="Top scoring student across all batches this semester" />
          <StatsCard title="Class Average" value="76%" icon={<BarChart2 size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" tooltip="Average score across all students and batches" />
          <StatsCard title="Most Improved" value="+15%" icon={<TrendingUp size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" tooltip="Student showing the highest score improvement this semester" />
        </div>

        {/* Table Card */}
        <div className="bg-card rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center gap-4 bg-gradient-to-r from-slate-50/50 to-transparent">
            <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={18} />
              <Input
                placeholder="Search by name, email, or user ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-muted border-border rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 font-medium text-sm transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[100px] h-10 rounded-lg bg-muted border-border shadow-none font-medium text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-100 shadow-lg">
                  <SelectItem value="All" className="rounded-lg font-medium text-sm">All</SelectItem>
                  <SelectItem value="Active" className="rounded-lg font-medium text-emerald-600 text-sm">Active</SelectItem>
                  <SelectItem value="Inactive" className="rounded-lg font-medium text-muted-foreground text-sm">Inactive</SelectItem>
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
              rowCount={totalRows}
              pageCount={Math.max(1, Math.ceil(totalRows / itemsPerPage))}
              pagination={{
                pageIndex: currentPage - 1,
                pageSize: itemsPerPage
              }}
              onPaginationChange={(p) => {
                setCurrentPage(p.pageIndex + 1)
                setItemsPerPage(p.pageSize)
              }}
              emptyState={
                <div className="flex flex-col items-center justify-center text-center p-8 h-full w-full">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {search ? `No students found for "${search}"` : "No students found"}
                  </h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    {search 
                      ? "We couldn't find any students matching your search criteria." 
                      : "We couldn't find any students matching your filters in the database."
                    } Please try adjusting your settings.
                  </p>
                  {(search || statusFilter !== "All" || courseFilter) && (
                    <Button 
                      onClick={() => { setSearch(""); setStatusFilter("All"); }}
                      variant="outline"
                      className="bg-card"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
