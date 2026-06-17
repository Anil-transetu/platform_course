"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Toaster, toast } from "sonner";

import StatsCard from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import InstitutionPageSkeleton from "@/components/admin/institutions/InstitutionPageSkeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 
  useTutorBatchAttendanceStats, 
  useTutorBatchStudents, 
  useSubmitAttendance 
} from "@/features/tutor/api/attendance-api";
import { buildAttendanceColumns, AttendanceState, Student } from "./columns";
import NotesModal from "./NotesModal";

export default function TutorAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params?.batchId as string;

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [attendanceState, setAttendanceState] = useState<Record<number, AttendanceState>>({});
  
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [activeStudentName, setActiveStudentName] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { 
    data: statsData, 
    isLoading: isLoadingStats, 
    isError: isStatsError,
    error: statsError 
  } = useTutorBatchAttendanceStats(batchId);

  const { 
    data: studentsData, 
    isLoading: isLoadingStudents, 
    isFetching: isFetchingStudents,
    isError: isStudentsError,
    error: studentsError 
  } = useTutorBatchStudents(batchId, page, rowsPerPage, debouncedSearch);

  const submitMutation = useSubmitAttendance();

  useEffect(() => {
    if (isStatsError) {
      toast.error(statsError?.message || "Failed to load attendance statistics.");
    }
  }, [isStatsError, statsError]);

  useEffect(() => {
    if (isStudentsError) {
      toast.error(studentsError?.message || "Failed to load students.");
    }
  }, [isStudentsError, studentsError]);

  // Handle setting initial state for students when they load, if not already set
  useEffect(() => {
    if (studentsData?.data) {
      setAttendanceState((prev) => {
        const newState = { ...prev };
        let hasChanges = false;
        
        studentsData.data.forEach((student: Student) => {
          const sId = Number(student.studentId || student.id || 0);
          if (!newState[sId]) {
            // Defaulting to "Present" if no status from backend, otherwise use student.status
            const initialStatus = (student.status as any) || "Present";
            newState[sId] = { status: initialStatus };
            hasChanges = true;
          }
        });
        
        return hasChanges ? newState : prev;
      });
    }
  }, [studentsData?.data]);

  const handleStatusChange = (studentId: number, status: "Present" | "Absent" | "Late") => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        // Clear notes if changing away from Late
        notes: status === "Late" ? prev[studentId]?.notes : undefined,
      },
    }));
  };

  const handleAddNoteClick = (studentId: number, name: string) => {
    setActiveStudentId(studentId);
    setActiveStudentName(name);
    setNotesModalOpen(true);
  };

  const handleSaveNote = (notes: string) => {
    if (activeStudentId !== null) {
      setAttendanceState((prev) => ({
        ...prev,
        [activeStudentId]: {
          ...prev[activeStudentId],
          notes,
        },
      }));
      toast.success(`Note saved for ${activeStudentName}`);
    }
  };

  const handleBulkAction = (action: "Present" | "Absent") => {
    if (!studentsData?.data) return;

    setAttendanceState((prev) => {
      const newState = { ...prev };
      studentsData.data.forEach((student: Student) => {
        const sId = Number(student.studentId || student.id || 0);
        newState[sId] = {
          status: action,
          notes: undefined, // clear notes on bulk action
        };
      });
      return newState;
    });

    toast.success(`Marked all visible students as ${action}`);
  };

  const handleSubmitAttendance = () => {
    // Only send the ones that exist in our state (which includes at least the loaded ones)
    const attendancePayload = Object.entries(attendanceState).map(([id, state]) => ({
      studentId: Number(id),
      status: state.status,
      notes: state.notes,
    }));

    if (attendancePayload.length === 0) {
      toast.error("No attendance data to submit.");
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    submitMutation.mutate(
      {
        batchId,
        payload: {
          date: today,
          attendance: attendancePayload,
        },
      },
      {
        onSuccess: () => {
          toast.success("Attendance submitted successfully!");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to submit attendance.");
        },
      }
    );
  };

  const columns = buildAttendanceColumns({
    attendanceState,
    onStatusChange: handleStatusChange,
    onAddNote: handleAddNoteClick,
  });

  const studentsList = studentsData?.data || [];
  const totalItems = studentsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const stats = statsData || {};

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6 flex flex-col h-full">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/tutor/dashboard">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Register</h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium text-xs">
              BATCH: {batchId}
            </span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSubmitAttendance} 
            disabled={submitMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitMutation.isPending ? "Submitting..." : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Attendance
              </>
            )}
          </Button>
        </div>
      </div>

      {(isLoadingStats || isLoadingStudents) && studentsList.length === 0 ? (
        <InstitutionPageSkeleton />
      ) : (
        <>
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
            <StatsCard
              title="Total Students"
              value={stats.total_students ?? totalItems}
              icon={<Users size={20} />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
            />
            <StatsCard
              title="Present"
              value={stats.present ?? 0}
              icon={<CheckCircle2 size={20} />}
              iconBgClass="bg-green-50"
              iconColorClass="text-green-600"
            />
            <StatsCard
              title="Absent"
              value={stats.absent ?? 0}
              icon={<XCircle size={20} />}
              iconBgClass="bg-red-50"
              iconColorClass="text-red-600"
            />
            <StatsCard
              title="Late"
              value={stats.late ?? 0}
              icon={<Clock size={20} />}
              iconBgClass="bg-orange-50"
              iconColorClass="text-orange-600"
            />
          </div>

          {/* Table Controls (Bulk Actions) */}
          <div className="flex justify-end mt-4 -mb-4 z-10 relative px-4 pt-4">
             <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium">Quick Actions:</span>
                <Select onValueChange={(val: "Present" | "Absent") => handleBulkAction(val)}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Select Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Present">Mark All Present</SelectItem>
                    <SelectItem value="Absent">Mark All Absent</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>

          {/* Batch Management Table Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <DataTable
              data={studentsList}
              columns={columns}
              loading={isFetchingStudents}
              rowKey={(row) => row.studentId || row.id}
              search={{
                enabled: true,
                value: search,
                onChange: setSearch,
                placeholder: "Search students by name or ID..."
              }}
              currentPage={page}
              rowsPerPage={rowsPerPage}
              totalPages={totalPages}
              onPageChange={setPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setPage(1);
              }}
              paginationInfo={totalItems > 0 ? `Showing ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalItems)} of ${totalItems}` : "0-0 of 0"}
            />
          </div>
        </>
      )}

      {/* Notes Modal */}
      <NotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        studentName={activeStudentName}
        initialNotes={activeStudentId ? attendanceState[activeStudentId]?.notes || "" : ""}
        onSave={handleSaveNote}
      />
    </div>
  );
}
