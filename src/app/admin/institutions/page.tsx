"use client";
import React, { useState, useEffect } from "react";
import { useInstitutions, useInstitutionStats, useUpdateInstitutionStatus } from "@/features/admin/institutions/api/use-institutions";
import { Institution } from "@/features/admin/institutions/api/institution-api";
import { buildInstitutionColumns } from "./columns";
import InstitutionFormModal from "./InstitutionFormModal";
import InstitutionDeleteDialog from "./InstitutionDeleteDialog";
import InstitutionPageSkeleton from "@/components/admin/institutions/InstitutionPageSkeleton";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Building, CheckCircle, BookOpen, Clock, MoreVertical, Pencil, Trash2, Landmark, Power, CheckCircle2 } from "lucide-react";

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
          className="cursor-pointer px-3 py-2 text-sm text-gray-700 dark:text-foreground hover:bg-gray-50 dark:bg-muted/50 rounded-lg transition-colors focus:bg-gray-50 dark:bg-muted/50 outline-none font-medium flex items-center gap-2"
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

const renderExpandedRow = (row: Institution) => {
  const contacts = row.contacts || [];
  if (contacts.length === 0) {
    return <div className="p-4 text-center text-slate-500 dark:text-muted-foreground">No point of contacts available.</div>;
  }

  const getTitle = (index: number) => {
    if (index === 0) return "Primary Contact";
    return `Contact-0${index}`;
  };

  return (
    <div className="p-4 sm:p-6 flex flex-nowrap overflow-x-auto gap-4 sm:gap-6 bg-slate-50/50 dark:bg-muted/20 pb-6">
      {contacts.map((contact: any, idx: number) => (
        <div key={idx} className="w-[280px] sm:w-[320px] lg:w-1/3 shrink-0 flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 dark:text-foreground mb-3">{getTitle(idx)}</h4>
          <div className="bg-white dark:bg-card rounded-xl p-4 border border-slate-100 dark:border-border/50 shadow-sm space-y-4 flex-1">
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-muted-foreground uppercase tracking-wider mb-1">NAME</div>
              <div className="bg-slate-50 dark:bg-muted/50 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-foreground break-words">{contact.name || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-muted-foreground uppercase tracking-wider mb-1">ROLE</div>
              <div className="bg-slate-50 dark:bg-muted/50 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-foreground break-words">{contact.role || contact.designation || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-muted-foreground uppercase tracking-wider mb-1">EMAIL</div>
              <div className="bg-slate-50 dark:bg-muted/50 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-foreground break-all">{contact.email || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-muted-foreground uppercase tracking-wider mb-1">PHONE NUMBER</div>
              <div className="bg-slate-50 dark:bg-muted/50 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-foreground break-words">{contact.phone || "-"}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

import { Suspense } from "react";

function InstitutionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Modal state
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    institution?: Institution | null;
  }>({
    open: false,
    mode: "add",
    institution: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    institution: Institution | null;
  }>({
    open: false,
    institution: null,
  });

  const [statusConfirmDialog, setStatusConfirmDialog] = useState<{
    open: boolean;
    institution: Institution | null;
    nextStatus: "active" | "inactive";
  }>({
    open: false,
    institution: null,
    nextStatus: "active",
  });

  const updateInstitutionStatus = useUpdateInstitutionStatus();

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setFormModal({ open: true, mode: "add", institution: null });
      router.replace("/admin/institutions");
    }
  }, [searchParams, router]);

  // Filters & Pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All Institutions" | "Active" | "Inactive">("All Institutions");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search or status changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // Data fetching hooks
  const { data: institutionsData, isLoading, isFetching } = useInstitutions(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    statusFilter
  );

  const { data: stats } = useInstitutionStats();

  const institutionsList = Array.isArray(institutionsData) ? institutionsData : institutionsData?.data || [];
  const meta = !Array.isArray(institutionsData) ? institutionsData?.meta : undefined;
  const totalCount = meta?.total ?? (!Array.isArray(institutionsData) ? institutionsData?.total : undefined) ?? institutionsList.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // Server paginated data: single source of truth from backend
  const visibleData = institutionsList;

  // DataTable configs
  const searchConfig = {
    enabled: true,
    placeholder: "Search by name, email, or institution ID...",
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
        { value: "All Institutions", label: "All Institutions" },
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
      onChange: (val: string | string[]) => {
        const selected = Array.isArray(val) ? val[0] : val;
        setStatusFilter((selected || "All Institutions") as any);
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const handleConfirmStatusToggle = () => {
    if (!statusConfirmDialog.institution) return;
    const targetStatus = statusConfirmDialog.nextStatus;
    const targetInst = statusConfirmDialog.institution;

    // Immediately close dialog to ensure Radix UI unmounts overlays and restores focus
    setStatusConfirmDialog({ open: false, institution: null, nextStatus: "active" });

    updateInstitutionStatus.mutate(
      { id: targetInst.id, status: targetStatus },
      {
        onSuccess: () => {
          toast.success(`Institution ${targetStatus === "active" ? "enabled" : "disabled"} successfully!`);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update institution status");
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
      headerText="Institution Management"
      subHeaderText="Integrated registration and institutional oversight"
      buttonLabel="Add New Institution"
      buttonRequired={true}
      buttonOnclick={() => setFormModal({ open: true, mode: "add", institution: null })}
    >
      {isLoading ? (
        <InstitutionPageSkeleton />
      ) : (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex flex-col h-full overflow-hidden">
          <Toaster position="top-right" />
          <StatsGrid>
            <StatsCard
              title="Total Institutions"
              value={stats?.totalInstitutions ?? 0}
              icon={<Landmark size={20} />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              tooltip="Total number of registered institutions on the platform"
            />
            <StatsCard
              title="Active Institutions"
              value={stats?.activeInstitutions ?? 0}
              icon={<CheckCircle size={20} />}
              iconBgClass="bg-green-50"
              iconColorClass="text-green-600"
              tooltip="Institutions currently active and operational"
            />
            <StatsCard
              title="Avg. Courses / Inst."
              value={stats?.avgCoursesPerInstitution ?? 0}
              icon={<BookOpen size={20} />}
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
              tooltip="Average number of courses offered per institution"
            />
            <StatsCard
              title="Pending Registrations"
              value={stats?.pendingRegistrations ?? 0}
              icon={<Clock size={20} />}
              iconBgClass="bg-orange-50"
              iconColorClass="text-orange-600"
              tooltip="Institutions awaiting approval or registration completion"
            />
          </StatsGrid>

          <DataTable<Institution>
            columns={buildInstitutionColumns()}
            data={visibleData}
            loading={isLoading || isFetching}
            search={searchConfig}
            filters={filterConfig}
            actions={(institution) => {
              const isActive = (institution.status || "Active").toLowerCase() === "active";
              return (
                <div className="flex justify-center">
                  <ActionMenu
                    status={institution.status || "Active"}
                    onEdit={() => setFormModal({ open: true, mode: "edit", institution })}
                    onToggleStatus={() =>
                      setStatusConfirmDialog({
                        open: true,
                        institution,
                        nextStatus: isActive ? "inactive" : "active",
                      })
                    }
                    onDelete={() => setDeleteDialog({ open: true, institution })}
                  />
                </div>
              );
            }}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(newRows) => {
              setRowsPerPage(newRows);
              setPage(1);
            }}
            paginationInfo={paginationInfo}
            showPagination={true}
            renderExpandedRow={renderExpandedRow}
          />
        </div>
      )}

      {/* Modals */}
      <InstitutionFormModal
        open={formModal.open}
        mode={formModal.mode}
        institution={formModal.institution}
        onClose={() => setFormModal({ open: false, mode: "add", institution: null })}
      />

      <InstitutionDeleteDialog
        open={deleteDialog.open}
        institution={deleteDialog.institution}
        onClose={() => setDeleteDialog({ open: false, institution: null })}
      />

      {/* STATUS CONFIRMATION DIALOG */}
      <AlertDialog
        open={statusConfirmDialog.open}
        onOpenChange={(val) => {
          if (!val) {
            setStatusConfirmDialog({ open: false, institution: null, nextStatus: "active" });
            if (typeof document !== "undefined" && document.body.style.pointerEvents === "none") {
              document.body.style.pointerEvents = "";
            }
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md" onCloseAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader className="text-left sm:text-left space-y-2">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Confirm {statusConfirmDialog.nextStatus === "active" ? "Enable" : "Disable"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-muted-foreground text-sm leading-relaxed">
              Are you sure you want to {statusConfirmDialog.nextStatus === "active" ? "enable" : "disable"} institution{" "}
              <span className="font-semibold text-slate-900 dark:text-foreground">{statusConfirmDialog.institution?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel
              onClick={() => setStatusConfirmDialog({ open: false, institution: null, nextStatus: "active" })}
              className="rounded-xl px-5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusToggle}
              disabled={updateInstitutionStatus.isPending}
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
    </ListingScreenTemplate>
  );
}

export default function InstitutionsPage() {
  return (
    <Suspense fallback={<InstitutionPageSkeleton />}>
      <InstitutionsPageContent />
    </Suspense>
  );
}
