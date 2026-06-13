"use client";
import React, { useState, useEffect } from "react";
import { Batch } from "@/types/batch";
import { buildBatchColumns } from "./columns";
import BatchFormModal from "./BatchFormModal";
import BatchDeleteDialog from "./BatchDeleteDialog";
import StatsCard from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import { useRouter } from "next/navigation";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Layers, CheckCircle, XCircle, Users, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { Toaster } from "react-hot-toast";

// Dummy data for batches
const DUMMY_BATCHES: Batch[] = [
  {
    id: "101",
    name: "Computer Science - 2024 - Section A",
    instructor: "Dr. Robert Wilson",
    students: 45,
    status: "Active",
    institution: "Global Tech Institute",
    course: "Java Development"
  },
  {
    id: "102",
    name: "Web Development Bootcamp",
    instructor: "Sarah Jenkins",
    students: 32,
    status: "Active",
    institution: "National University",
    course: "Web Development"
  },
  {
    id: "103",
    name: "Data Science Fundamentals",
    instructor: "Michael Chang",
    students: 28,
    status: "Inactive",
    institution: "Global Tech Institute",
    course: "Data Science"
  }
];

function ActionMenu({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) {
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
            onView();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:bg-gray-50 outline-none font-medium flex items-center gap-2"
        >
          <Eye size={14} className="text-gray-400" />
          View
        </DropdownMenuItem>
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

export default function BatchesPage() {
  const router = useRouter();
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    batch?: Batch | null;
  }>({
    open: false,
    mode: "add",
    batch: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    batch: Batch | null;
  }>({
    open: false,
    batch: null,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Debounce search and simulate fetching
  useEffect(() => {
    if (!isLoading) {
      setIsFetching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (!isLoading) {
        setIsFetching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, isLoading]);

  // Reset page when search or status changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  // Filter data locally
  const filteredData = DUMMY_BATCHES.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          (b.instructor?.toLowerCase() || "").includes(debouncedSearch.toLowerCase());
    const matchesStatus = status === "All" || b.status === status;
    return matchesSearch && matchesStatus;
  });

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visibleData = filteredData.slice(start, start + rowsPerPage);

  const searchConfig = {
    enabled: true,
    placeholder: "Search by batch name or instructor...",
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
        setIsFetching(true);
        const selected = Array.isArray(val) ? val[0] : val;
        setStatus((selected || "All") as "All" | "Active" | "Inactive");
        setTimeout(() => setIsFetching(false), 400);
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  return (
    <ListingScreenTemplate
      headerText="Batches Dashboard"
      subHeaderText="Manage batches, institutions, courses, and enrollments."
      buttonLabel="Add Batch"
      buttonRequired={true}
      buttonOnclick={() => setFormModal({ open: true, mode: "add", batch: null })}
    >
      {isLoading ? (
        <UserPageSkeleton />
      ) : (
      <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
        <Toaster position="top-right" />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 flex-shrink-0">
          <StatsCard
            title="Total Batches"
            value={DUMMY_BATCHES.length}
            icon={<Layers className="w-5 h-5" />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Total number of batches created"
          />
          <StatsCard
            title="Active Batches"
            value={DUMMY_BATCHES.filter(b => b.status === "Active").length}
            icon={<CheckCircle className="w-5 h-5" />}
            iconBgClass="bg-green-50"
            iconColorClass="text-green-600"
            tooltip="Currently active batches"
          />
          <StatsCard
            title="Inactive Batches"
            value={DUMMY_BATCHES.filter(b => b.status === "Inactive").length}
            icon={<XCircle className="w-5 h-5" />}
            iconBgClass="bg-red-50"
            iconColorClass="text-red-600"
            tooltip="Batches that are currently inactive"
          />
          <StatsCard
            title="Total Students"
            value={DUMMY_BATCHES.reduce((sum, b) => sum + b.students, 0)}
            icon={<Users className="w-5 h-5" />}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-600"
            tooltip="Total students enrolled across all batches"
          />
        </div>

        <DataTable<Batch>
          columns={buildBatchColumns()}
          data={visibleData}
          loading={isLoading || isFetching}
          search={searchConfig}
          filters={filterConfig}
          actions={(batch) => (
            <div className="flex justify-center">
              <ActionMenu 
                onView={() => router.push(`/admin/batches/${batch.id}`)}
                onEdit={() => setFormModal({ open: true, mode: "edit", batch })}
                onDelete={() => setDeleteDialog({ open: true, batch })}
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
      <BatchFormModal
        open={formModal.open}
        mode={formModal.mode}
        batch={formModal.batch}
        onClose={() => setFormModal({ open: false, mode: "add", batch: null })}
      />
      
      <BatchDeleteDialog
        open={deleteDialog.open}
        batch={deleteDialog.batch}
        onClose={() => setDeleteDialog({ open: false, batch: null })}
      />
      
    </ListingScreenTemplate>
  );
}
