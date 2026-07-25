"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  CheckCircle,
  Star,
  UserPlus,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable from "@/components/reusable/DataTable";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tutor } from "@/types/tutor";
import TutorFormModal from "./TutorFormModal";
import { useDomainLookup } from "@/features/admin/domains/api/use-domains";
import TutorDeleteDialog from "./TutorDeleteDialog";
import { buildTutorColumns } from "./columns";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  useTutors,
  useTutorStats,
  useCreateTutor,
  useUpdateTutor,
  useDeleteTutor,
  useUpdateTutorStatus,
} from "@/features/admin/tutor/api/tutor-api";
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
import { Power, CheckCircle2 } from "lucide-react";

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

const PREDEFINED_DOMAINS = [
  "HTML",
  "CSS",
  "JAVASCRIPT",
  "REACT",
  "NEXT.JS",
  "NODE.JS",
  "PYTHON",
  "THREE.JS"
];

import { Suspense } from "react";

function TutorsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, domainFilter, statusFilter]);

  // Modal state
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    tutor?: Tutor | null;
  }>({
    open: false,
    mode: "add",
    tutor: null,
  });

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setFormModal({ open: true, mode: "add", tutor: null });
      router.replace("/admin/tutors");
    }
  }, [searchParams, router]);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    tutor: Tutor | null;
  }>({
    open: false,
    tutor: null,
  });

  const [statusConfirmDialog, setStatusConfirmDialog] = useState<{
    open: boolean;
    tutor: Tutor | null;
    nextStatus: "active" | "inactive";
  }>({
    open: false,
    tutor: null,
    nextStatus: "active",
  });

  // Queries & Mutations
  const { data: tutorsData, isLoading, isFetching } = useTutors(page, rowsPerPage, debouncedSearch, statusFilter, domainFilter);
  const { data: tutorStats, isLoading: isStatsLoading } = useTutorStats();

  const createTutor = useCreateTutor();
  const updateTutor = useUpdateTutor();
  const deleteTutor = useDeleteTutor();
  const updateTutorStatus = useUpdateTutorStatus();

  const tutorsList: Tutor[] = Array.isArray(tutorsData?.data) ? tutorsData.data : (Array.isArray(tutorsData) ? tutorsData : []);
  const totalCount = tutorsData?.total || tutorsData?.pagination?.total || tutorsList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const start = (page - 1) * rowsPerPage;

  const dynamicDomains = Array.from(new Set(tutorsList.flatMap(t => t.domains || [])))
    .filter(Boolean)
    .filter(d => !PREDEFINED_DOMAINS.some(pd => pd.toLowerCase() === d.toLowerCase()));

  let displayTutors = tutorsList;
  if (domainFilter !== "All") {
    displayTutors = displayTutors.filter(t => 
      t.domains && t.domains.some(d => d.toLowerCase() === domainFilter.toLowerCase())
    );
  }

  const [isDomainFilterOpen, setIsDomainFilterOpen] = useState(false);

  // DataTable configs
  const searchConfig = {
    enabled: true,
    placeholder: "Search by name, domain, or ID...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
    },
  };

  const { data: domainsLookup = [] } = useDomainLookup(undefined, {
    enabled: isDomainFilterOpen || (domainFilter !== "All" && domainFilter !== "All Domains")
  });

  const domainOptions = [
    { value: "All", label: "All Domains" },
    ...(Array.isArray(domainsLookup)
      ? domainsLookup.map((d: any) => ({
          value: String(d.name || d.id),
          label: d.name,
        }))
      : []),
  ];

  const filterConfig = [
    {
      id: "domain",
      label: "All Domains",
      type: "select" as const,
      value: domainFilter,
      options: domainOptions,
      onOpenChange: (open: boolean) => {
        if (open) setIsDomainFilterOpen(true);
      },
      onChange: (val: string | string[]) => {
        setDomainFilter(Array.isArray(val) ? val[0] : val);
        setPage(1);
      },
    },
    {
      id: "status",
      label: "All Status",
      type: "select" as const,
      value: statusFilter,
      options: [
        { value: "All", label: "All Status" },
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
      onChange: (val: string | string[]) => {
        setStatusFilter(Array.isArray(val) ? val[0] : val);
        setPage(1);
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${start + 1}-${Math.min(start + rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const handleSaveTutor = async (data: any) => {
    try {
      if (formModal.mode === "add") {
        await createTutor.mutateAsync(data);
        toast.success("Tutor registered successfully");
      } else if (formModal.tutor) {
        await updateTutor.mutateAsync({ id: formModal.tutor.id, data, originalTutor: formModal.tutor });
        toast.success("Tutor updated successfully");
      }
      setFormModal({ open: false, mode: "add", tutor: null });
    } catch (err: any) {
      toast.error(err.message || "Failed to save tutor");
    }
  };

  const handleDeleteTutor = async () => {
    if (deleteDialog.tutor) {
      try {
        await deleteTutor.mutateAsync({ id: deleteDialog.tutor.id, tutor: deleteDialog.tutor });
        toast.success("Tutor deleted successfully");
        setDeleteDialog({ open: false, tutor: null });
      } catch (err: any) {
        toast.error(err.message || "Failed to delete tutor");
      }
    }
  };

  const handleConfirmStatusToggle = () => {
    if (!statusConfirmDialog.tutor) return;
    const targetStatus = statusConfirmDialog.nextStatus;
    const targetTutor = statusConfirmDialog.tutor;

    // Immediately close dialog to ensure Radix UI unmounts overlays and restores focus
    setStatusConfirmDialog({ open: false, tutor: null, nextStatus: "active" });

    updateTutorStatus.mutate(
      { id: targetTutor.id, status: targetStatus },
      {
        onSuccess: () => {
          toast.success(`Tutor ${targetStatus === "active" ? "enabled" : "disabled"} successfully!`);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update tutor status");
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
      headerText="Tutor Management"
      subHeaderText="Add and manage faculty members and their assignments."
      buttonLabel="Add New Tutor"
      buttonRequired={true}
      buttonOnclick={() => setFormModal({ open: true, mode: "add", tutor: null })}
    >
      {isLoading ? (
        <UserPageSkeleton />
      ) : (
      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full">
        <Toaster position="top-right" />
        
        {/* STATS CARDS */}
        <StatsGrid>
          <StatsCard
            title="Total Tutors"
            value={isStatsLoading ? "..." : (tutorStats?.total || totalCount || 0)}
            icon={<Users className="w-5 h-5" />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Total number of registered tutors"
          />
          <StatsCard
            title="Active Tutors"
            value={isStatsLoading ? "..." : (tutorStats?.active || tutorsList.filter(t => t.status?.toLowerCase() === 'active').length || 0)}
            icon={<CheckCircle className="w-5 h-5" />}
            iconBgClass="bg-green-50"
            iconColorClass="text-green-600"
            tooltip="Tutors currently active"
          />
          <StatsCard
            title="New Tutors (Month)"
            value={isStatsLoading ? "..." : (tutorStats?.newTutors || 0)}
            icon={<UserPlus className="w-5 h-5" />}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-600"
            tooltip="Tutors onboarded recently"
          />
        </StatsGrid>

        {/* DATA TABLE */}
        <div className="flex-1 overflow-hidden min-h-0">
          <DataTable<Tutor>
            data={displayTutors}
            columns={buildTutorColumns()}
            loading={isLoading || isFetching}
            rowKey={(tutor) => String(tutor.id)}
            search={searchConfig}
            filters={filterConfig}
            actions={(tutor) => {
              const isActive = (tutor.status || "active").toLowerCase() === "active";
              return (
                <div className="flex justify-center">
                  <ActionMenu 
                    status={tutor.status || "active"}
                    onEdit={() => setFormModal({ open: true, mode: "edit", tutor })}
                    onToggleStatus={() =>
                      setStatusConfirmDialog({
                        open: true,
                        tutor,
                        nextStatus: isActive ? "inactive" : "active",
                      })
                    }
                    onDelete={() => setDeleteDialog({ open: true, tutor })}
                  />
                </div>
              );
            }}
            bodyHeight="h-full"
            rowsPerPage={rowsPerPage}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setPage(1);
            }}
            paginationInfo={paginationInfo}
            showPagination={true}
          />
        </div>
      </div>
      )}

      {formModal.open && (
        <TutorFormModal
          open={formModal.open}
          mode={formModal.mode}
          tutor={formModal.tutor}
          onClose={() => setFormModal({ open: false, mode: "add", tutor: null })}
          onSave={handleSaveTutor}
        />
      )}
      
      <TutorDeleteDialog
        open={deleteDialog.open}
        tutor={deleteDialog.tutor}
        onClose={() => setDeleteDialog({ open: false, tutor: null })}
        onConfirm={handleDeleteTutor}
      />

      {/* STATUS CONFIRMATION DIALOG */}
      <AlertDialog
        open={statusConfirmDialog.open}
        onOpenChange={(val) => {
          if (!val) {
            setStatusConfirmDialog({ open: false, tutor: null, nextStatus: "active" });
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
              Are you sure you want to {statusConfirmDialog.nextStatus === "active" ? "enable" : "disable"} tutor{" "}
              <span className="font-semibold text-slate-900 dark:text-foreground">{statusConfirmDialog.tutor?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel
              onClick={() => setStatusConfirmDialog({ open: false, tutor: null, nextStatus: "active" })}
              className="rounded-xl px-5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusToggle}
              disabled={updateTutorStatus.isPending}
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

export default function TutorsPage() {
  return (
    <Suspense fallback={<UserPageSkeleton />}>
      <TutorsPageContent />
    </Suspense>
  );
}