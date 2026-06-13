"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { EnrolledStudent, DUMMY_ENROLLED_STUDENTS } from "./dummyData";
import { buildEnrolledStudentColumns } from "./columns";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import { ArrowLeft, Users, UserCheck, UserMinus, Download } from "lucide-react";
import StatsCard from "@/components/ui/StatsCard";
import { Toaster } from "react-hot-toast";

export default function EnrolledStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const batchId = resolvedParams.id;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"All" | "ACTIVE" | "COMPLETED">("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  // Local filtering based on dummy data
  const filteredData = DUMMY_ENROLLED_STUDENTS.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = status === "All" || student.status === status;
    return matchesSearch && matchesStatus;
  });

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visibleData = filteredData.slice(start, start + rowsPerPage);

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
    ? `${start + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const handleExport = () => {
    // Dummy export action
    console.log("Exporting list...");
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

  const activeStudents = DUMMY_ENROLLED_STUDENTS.filter(s => s.status === "ACTIVE").length;
  const inactiveStudents = DUMMY_ENROLLED_STUDENTS.filter(s => s.status !== "ACTIVE").length;

  return (
    <ListingScreenTemplate
      headerText="Enrolled Students"
      subHeaderText={
        <span className="text-slate-500">
          Managing students for <span className="text-blue-500 font-semibold">Java Development Batch #{batchId}</span>
        </span>
      }
      buttonLabel=""
      buttonRequired={false}
      extraActions={extraHeaderActions}
    >
      {isLoading ? (
        <UserPageSkeleton />
      ) : (
      <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
        <Toaster position="top-right" />
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          <StatsCard
            title="Total Students"
            value={10}
            icon={<Users />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
          />
          <StatsCard
            title="Completed Course"
            value={0}
            icon={<UserCheck />}
            iconBgClass="bg-emerald-50"
            iconColorClass="text-emerald-600"
          />
          <StatsCard
            title="Not Completed Course"
            value={10}
            icon={<UserMinus />}
            iconBgClass="bg-red-50"
            iconColorClass="text-red-600"
          />
        </div>

        <DataTable<EnrolledStudent>
          columns={buildEnrolledStudentColumns()}
          data={visibleData}
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
