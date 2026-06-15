"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { buildEnrolledStudentColumns } from "./columns";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import { ArrowLeft, Users, UserCheck, UserMinus, Download } from "lucide-react";
import StatsCard from "@/components/ui/StatsCard";
import { Toaster, toast } from "react-hot-toast";
import {
  useBatch,
  useBatchStudents,
  useBatchStudentsStats,
} from "@/hooks/use-batches";
import { getBatchStudentsExportPdfUrl } from "@/features/admin/batches/api/batch-api";

export default function EnrolledStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const batchId = resolvedParams.id;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"All" | "ACTIVE" | "COMPLETED">("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search
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

  // API hooks
  const { data: batchDetail } = useBatch(batchId);
  const { data: studentsResponse, isLoading: isStudentsLoading, isFetching: isStudentsFetching } = useBatchStudents(
    batchId,
    page,
    rowsPerPage,
    status
  );
  const { data: batchStats } = useBatchStudentsStats(batchId);

  const studentsList = studentsResponse?.data || [];
  const totalCount = studentsResponse?.meta?.total || studentsList.length;
  const totalPages = studentsResponse?.meta?.totalPages || Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // fallback to local client pagination if backend does not slice
  let visibleData = studentsList;
  if (studentsList.length > rowsPerPage) {
    const start = (page - 1) * rowsPerPage;
    visibleData = studentsList.slice(start, start + rowsPerPage);
  }

  const searchConfig = {
    enabled: true,
    placeholder: "Search students by name or email...",
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
        { value: "All", label: "All Students" },
        { value: "ACTIVE", label: "Active" },
        { value: "COMPLETED", label: "Completed" },
      ],
      onChange: (val: string | string[]) => {
        const selected = Array.isArray(val) ? val[0] : val;
        setStatus((selected || "All") as "All" | "ACTIVE" | "COMPLETED");
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const handleExport = async () => {
    try {
      let token = "";
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^| )token=([^;]+)/);
        if (match) token = match[2];
      }
      
      const response = await fetch(getBatchStudentsExportPdfUrl(batchId), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Batch-${batchId}-Students.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF exported successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to export PDF");
    }
  };

  const extraHeaderActions = (
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.push("/admin/batches")}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 bg-white transition-all text-gray-700 shadow-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 bg-white transition-all text-gray-700 shadow-sm"
      >
        <Download size={16} className="text-gray-500" />
        Export List
      </button>
    </div>
  );

  const batchName = batchDetail?.name || "Loading Batch...";

  return (
    <ListingScreenTemplate
      headerText="Enrolled Students"
      subHeaderText={
        <span className="text-slate-500">
          Managing students for <span className="text-blue-500 font-semibold">{batchName}</span>
        </span>
      }
      buttonLabel=""
      buttonRequired={false}
      extraActions={extraHeaderActions}
    >
      {isStudentsLoading ? (
        <UserPageSkeleton />
      ) : (
      <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
        <Toaster position="top-right" />
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          <StatsCard
            title="Total Students"
            value={batchStats?.total_students ?? 0}
            icon={<Users />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Total number of students enrolled in this batch"
          />
          <StatsCard
            title="Completed Course"
            value={batchStats?.completed_course_count ?? 0}
            icon={<UserCheck />}
            iconBgClass="bg-emerald-50"
            iconColorClass="text-emerald-600"
            tooltip="Number of students who have successfully completed the course"
          />
          <StatsCard
            title="Not Completed Course"
            value={batchStats?.not_completed_course_count ?? 0}
            icon={<UserMinus />}
            iconBgClass="bg-red-50"
            iconColorClass="text-red-600"
            tooltip="Number of students currently in progress or yet to complete the course"
          />
        </div>

        <DataTable<any>
          columns={buildEnrolledStudentColumns()}
          data={visibleData}
          loading={isStudentsLoading || isStudentsFetching}
          search={searchConfig}
          filters={filterConfig}
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
    </ListingScreenTemplate>
  );
}
