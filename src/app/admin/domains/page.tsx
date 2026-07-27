"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useDomains, useDomainStats, useUpdateDomainStatus, useDeleteDomain } from "@/features/admin/domains/api/use-domains";
import { Domain } from "@/types/domain";
import { buildDomainColumns } from "./columns";
import DomainFormModal from "./DomainFormModal";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
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
import { Globe, CheckCircle, XCircle, MoreVertical, Pencil, Trash2, Power, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function DomainPageSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[400px] rounded-2xl" />
    </div>
  );
}

function ActionMenu({
  status,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  status: string;
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
          className="p-1.5 hover:bg-gray-100 dark:bg-muted rounded-lg text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:text-foreground transition-colors"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-100 dark:border-border/50 p-1 min-w-[120px] z-50">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted/50 rounded-lg transition-colors outline-none font-medium flex items-center gap-2"
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
            className="cursor-pointer px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors outline-none font-medium flex items-center gap-2"
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
              className="cursor-pointer px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors outline-none font-medium flex items-center gap-2"
            >
              <CheckCircle2 size={14} className="text-emerald-500" />
              Enable
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="cursor-pointer px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors outline-none font-medium flex items-center gap-2"
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

function DomainsPageContent() {
  // Modal states
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    domain?: Domain | null;
  }>({
    open: false,
    mode: "add",
    domain: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    domain: Domain | null;
  }>({
    open: false,
    domain: null,
  });

  const [statusConfirmDialog, setStatusConfirmDialog] = useState<{
    open: boolean;
    domain: Domain | null;
    nextStatus: "active" | "inactive";
  }>({
    open: false,
    domain: null,
    nextStatus: "active",
  });

  const updateDomainStatusMutation = useUpdateDomainStatus();
  const deleteDomainMutation = useDeleteDomain();

  // Filters & Pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // Fetch domain data and statistics
  const { data: domainsData, isLoading, isFetching } = useDomains(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    statusFilter
  );

  const { data: stats } = useDomainStats();

  const domainsList: Domain[] = Array.isArray(domainsData)
    ? domainsData
    : (domainsData as any)?.data || [];
  const apiTotal = (domainsData as any)?.pagination?.total ?? (domainsData as any)?.total;
  const totalCount = apiTotal !== undefined ? apiTotal : domainsList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // Search & Filter configs for DataTable
  const searchConfig = {
    enabled: true,
    placeholder: "Search domains by name...",
    value: search,
    onChange: (val: string) => setSearch(val),
  };

  const filterConfig = [
    {
      id: "status",
      label: "Status: All",
      type: "select" as const,
      value: statusFilter,
      options: [
        { value: "All", label: "All Statuses" },
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
      onChange: (val: string | string[]) => {
        const selected = Array.isArray(val) ? val[0] : val;
        setStatusFilter((selected || "All") as any);
      },
    },
  ];

  const paginationInfo =
    totalCount > 0
      ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
      : "0-0 of 0";

  // Action handlers
  const handleConfirmStatusToggle = () => {
    if (!statusConfirmDialog.domain) return;
    const targetStatus = statusConfirmDialog.nextStatus;
    const targetDomain = statusConfirmDialog.domain;

    setStatusConfirmDialog({ open: false, domain: null, nextStatus: "active" });

    updateDomainStatusMutation.mutate(
      { id: targetDomain.id, status: targetStatus },
      {
        onSettled: () => {
          if (typeof document !== "undefined" && document.body.style.pointerEvents === "none") {
            document.body.style.pointerEvents = "";
          }
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog.domain) return;
    const targetDomain = deleteDialog.domain;

    setDeleteDialog({ open: false, domain: null });

    deleteDomainMutation.mutate(targetDomain.id, {
      onSettled: () => {
        if (typeof document !== "undefined" && document.body.style.pointerEvents === "none") {
          document.body.style.pointerEvents = "";
        }
      },
    });
  };

  return (
    <ListingScreenTemplate
      headerText="Domain Management"
      subHeaderText="Create and manage academic & professional domains across the platform"
      buttonLabel="Add New Domain"
      buttonRequired={true}
      buttonOnclick={() => setFormModal({ open: true, mode: "add", domain: null })}
    >
      {isLoading ? (
        <DomainPageSkeleton />
      ) : (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex flex-col h-full overflow-hidden">
        <Toaster position="top-right" />

        {/* Dashboard Stats */}
        <StatsGrid>
          <StatsCard
            title="Total Domains"
            value={stats?.total_domains ?? stats?.total ?? totalCount}
            icon={<Globe size={20} />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Total registered domains in system"
          />
          <StatsCard
            title="Active Domains"
            value={stats?.active_domains ?? stats?.active ?? 0}
            icon={<CheckCircle size={20} />}
            iconBgClass="bg-green-50"
            iconColorClass="text-green-600"
            tooltip="Domains currently active for course association"
          />
          <StatsCard
            title="Inactive Domains"
            value={stats?.inactive_domains ?? 0}
            icon={<XCircle size={20} />}
            iconBgClass="bg-gray-100"
            iconColorClass="text-gray-500"
            tooltip="Disabled domains unavailable for new courses"
          />
        </StatsGrid>

        {/* Data Table */}
        <DataTable<Domain>
          columns={buildDomainColumns()}
          data={domainsList}
          loading={isLoading || isFetching}
          search={searchConfig}
          filters={filterConfig}
          actions={(domain) => {
            const isActive = (domain.status || "active").toLowerCase() === "active";
            return (
              <div className="flex justify-center">
                <ActionMenu
                  status={domain.status}
                  onEdit={() => setFormModal({ open: true, mode: "edit", domain })}
                  onToggleStatus={() =>
                    setStatusConfirmDialog({
                      open: true,
                      domain,
                      nextStatus: isActive ? "inactive" : "active",
                    })
                  }
                  onDelete={() => setDeleteDialog({ open: true, domain })}
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
      <DomainFormModal
        open={formModal.open}
        mode={formModal.mode}
        domain={formModal.domain}
        onClose={() => setFormModal({ open: false, mode: "add", domain: null })}
      />

      {/* Status Confirmation Dialog */}
      <AlertDialog
        open={statusConfirmDialog.open}
        onOpenChange={(val) => {
          if (!val) {
            setStatusConfirmDialog({ open: false, domain: null, nextStatus: "active" });
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-left sm:text-left space-y-2">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Confirm {statusConfirmDialog.nextStatus === "active" ? "Enable" : "Disable"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-muted-foreground text-sm leading-relaxed">
              Are you sure you want to {statusConfirmDialog.nextStatus === "active" ? "enable" : "disable"} domain{" "}
              <span className="font-semibold text-slate-900 dark:text-foreground">
                {statusConfirmDialog.domain?.name}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel
              onClick={() => setStatusConfirmDialog({ open: false, domain: null, nextStatus: "active" })}
              className="rounded-xl px-5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusToggle}
              disabled={updateDomainStatusMutation.isPending}
              className={`rounded-xl px-5 text-white shadow-sm gap-2 flex items-center ${
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(val) => {
          if (!val) {
            setDeleteDialog({ open: false, domain: null });
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-left sm:text-left space-y-2">
            <AlertDialogTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Domain
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-muted-foreground text-sm leading-relaxed">
              Are you sure you want to delete domain{" "}
              <span className="font-semibold text-slate-900 dark:text-foreground">
                {deleteDialog.domain?.name}
              </span>
              ? Active domains or domains with associated courses cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel
              onClick={() => setDeleteDialog({ open: false, domain: null })}
              className="rounded-xl px-5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteDomainMutation.isPending}
              className="rounded-xl px-5 text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-600/20 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ListingScreenTemplate>
  );
}

export default function DomainsPage() {
  return (
    <Suspense fallback={<DomainPageSkeleton />}>
      <DomainsPageContent />
    </Suspense>
  );
}
