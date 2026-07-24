"use client";
import React, { useState, useEffect } from "react";
import { Batch } from "@/types/batch";
import { buildBatchColumns } from "./columns";
import BatchFormModal from "./BatchFormModal";
import BulkUploadModal from "./BulkUploadModal";
import BatchDeleteDialog from "./BatchDeleteDialog";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import { useRouter, useSearchParams } from "next/navigation";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import { useBatches, useBatchesDashboardStats, useUpdateBatchStatus } from "@/hooks/use-batches";
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
import { Layers, CheckCircle, Users, MoreVertical, Pencil, Trash2, Eye, Upload, Power, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function ActionMenu({
  status,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  status: string;
  onView: () => void;
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

function BatchesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const [statusConfirmDialog, setStatusConfirmDialog] = useState<{
    open: boolean;
    batch: Batch | null;
    nextStatus: "active" | "inactive";
  }>({
    open: false,
    batch: null,
    nextStatus: "active",
  });

  const updateBatchStatus = useUpdateBatchStatus();

  const [bulkModal, setBulkModal] = useState<{ open: boolean; batchId?: string | number }>({
    open: false,
    batchId: undefined,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search or status changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  // Load live data
  const { data: batchesData, isLoading, isFetching } = useBatches(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    status
  );

  const { data: statsData } = useBatchesDashboardStats();

  const batchesList = batchesData?.data || [];
  const totalCount = batchesData?.meta?.total || batchesList.length;
  const totalPages = batchesData?.meta?.totalPages || Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // local paging fallback if backend returned everything without limit
  let visibleData = batchesList;
  if (batchesList.length > rowsPerPage) {
    const start = (page - 1) * rowsPerPage;
    visibleData = batchesList.slice(start, start + rowsPerPage);
  }

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
        const selected = Array.isArray(val) ? val[0] : val;
        setStatus((selected || "All") as "All" | "Active" | "Inactive");
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const totalBatches = Number(statsData?.totalBatches ?? statsData?.total_batches ?? 0);
  const activeBatches = Number(statsData?.activeBatches ?? statsData?.active_batches ?? 0);
  const averageStudents = Number(statsData?.averageStudentsPerBatch ?? statsData?.average_students_per_batch ?? 0);
  const averageStudentsVal = averageStudents % 1 === 0 ? averageStudents : Number(averageStudents.toFixed(1));

  const extraHeaderActions = (
    <button
      onClick={() => setBulkModal({ open: true, batchId: undefined })}
      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-border/70 rounded-lg hover:bg-gray-50 dark:bg-muted/50 bg-white dark:bg-card transition-all text-gray-700 dark:text-foreground shadow-sm"
    >
      <Upload size={16} />
      Bulk Upload CSV
    </button>
  );

  const handleConfirmStatusToggle = () => {
    if (!statusConfirmDialog.batch) return;
    const targetStatus = statusConfirmDialog.nextStatus;
    const targetBatch = statusConfirmDialog.batch;

    // Immediately close dialog to ensure Radix UI unmounts overlays and restores focus
    setStatusConfirmDialog({ open: false, batch: null, nextStatus: "active" });

    updateBatchStatus.mutate(
      { id: targetBatch.id, status: targetStatus },
      {
        onSuccess: () => {
          toast.success(`Batch ${targetStatus === "active" ? "enabled" : "disabled"} successfully!`);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update batch status");
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
      headerText="Batch Management"
      subHeaderText="Efficiently organize batches and enroll existing students"
      buttonLabel="Create New Batch"
      buttonRequired={true}
      buttonOnclick={() => setFormModal({ open: true, mode: "add", batch: null })}
      extraActions={extraHeaderActions}
    >
      {isLoading ? (
        <UserPageSkeleton />
      ) : (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex flex-col h-full overflow-hidden">
        
        <StatsGrid>
          <StatsCard
            title="Total Batches"
            value={totalBatches}
            icon={<Layers className="w-5 h-5" />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Total number of batches created"
          />
          <StatsCard
            title="Active Batches"
            value={activeBatches}
            icon={<CheckCircle className="w-5 h-5" />}
            iconBgClass="bg-green-50"
            iconColorClass="text-green-600"
            tooltip="Currently active batches"
          />
          <StatsCard
            title="Average Students per Batch"
            value={averageStudentsVal}
            icon={<Users className="w-5 h-5" />}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-600"
            tooltip="Average number of students enrolled per batch"
          />
        </StatsGrid>

        <DataTable<Batch>
          columns={buildBatchColumns()}
          data={visibleData}
          loading={isLoading || isFetching}
          search={searchConfig}
          filters={filterConfig}
          actions={(batch) => {
            const isActive = (batch.status || "Active").toLowerCase() === "active";
            return (
              <div className="flex items-center justify-center">
                <ActionMenu 
                  status={batch.status || "Active"}
                  onView={() => router.push(`/admin/batches/${batch.id}?name=${encodeURIComponent(batch.name)}`)}
                  onEdit={() => setFormModal({ open: true, mode: "edit", batch })}
                  onToggleStatus={() =>
                    setStatusConfirmDialog({
                      open: true,
                      batch,
                      nextStatus: isActive ? "inactive" : "active",
                    })
                  }
                  onDelete={() => setDeleteDialog({ open: true, batch })}
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
      {formModal.open && (
        <BatchFormModal
          open={formModal.open}
          mode={formModal.mode}
          batch={formModal.batch}
          onClose={() => setFormModal({ open: false, mode: "add", batch: null })}
        />
      )}

      <BulkUploadModal
        open={bulkModal.open}
        batchId={bulkModal.batchId}
        onClose={() => setBulkModal({ open: false, batchId: undefined })}
      />
      
      <BatchDeleteDialog
        open={deleteDialog.open}
        batch={deleteDialog.batch}
        onClose={() => setDeleteDialog({ open: false, batch: null })}
      />

      {/* STATUS CONFIRMATION DIALOG */}
      <AlertDialog
        open={statusConfirmDialog.open}
        onOpenChange={(val) => {
          if (!val) {
            setStatusConfirmDialog({ open: false, batch: null, nextStatus: "active" });
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
              Are you sure you want to {statusConfirmDialog.nextStatus === "active" ? "enable" : "disable"} batch{" "}
              <span className="font-semibold text-slate-800">{statusConfirmDialog.batch?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex sm:justify-center gap-3">
            <AlertDialogCancel
              onClick={() => setStatusConfirmDialog({ open: false, batch: null, nextStatus: "active" })}
              className="rounded-xl px-6"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusToggle}
              disabled={updateBatchStatus.isPending}
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

export default function BatchesPage() {
  return (
    <Suspense fallback={<UserPageSkeleton />}>
      <BatchesPageContent />
    </Suspense>
  );
}
