"use client";

import React, { useState, useEffect } from "react";
import { useUsers, useUserStats, useUpdateUserStatus } from "@/features/admin/users/api/user-api";
import { User } from "@/types/user";
import { buildUserColumns } from "./columns";
import UserFormModal from "./UserFormModal";
import UserDeleteDialog from "./UserDeleteDialog";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
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
import { ShieldCheck, Users, Building, MoreVertical, Pencil, Trash2, Power, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-md border border-gray-100 p-1 min-w-[120px] z-50">
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

export default function AcceptedUsersTab({
  formModal,
  setFormModal,
  deleteDialog,
  setDeleteDialog,
  tabsElement
}: {
  formModal: any;
  setFormModal: any;
  deleteDialog: any;
  setDeleteDialog: any;
  tabsElement: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [statusConfirmDialog, setStatusConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
    nextStatus: "active" | "inactive";
  }>({
    open: false,
    user: null,
    nextStatus: "active",
  });

  const updateUserStatus = useUpdateUserStatus();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search, role, statusFilter, or rowsPerPage changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter, rowsPerPage]);

  const { data: usersData, isLoading, isFetching } = useUsers(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    roleFilter,
    statusFilter
  );

  const { data: stats } = useUserStats();

  const usersList = Array.isArray(usersData) ? usersData : usersData?.data || [];

  const statsTotalUsers = stats ? ((stats.admins || 0) + (stats.representatives || 0)) : 0;
  const apiTotal = !Array.isArray(usersData) ? (usersData?.pagination?.total ?? usersData?.total) : undefined;
  const totalCount = apiTotal !== undefined
    ? apiTotal
    : Math.max(statsTotalUsers, usersList.length);
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  let visibleData = usersList;
  const start = (page - 1) * rowsPerPage;
  if (usersList.length > rowsPerPage) {
    visibleData = usersList.slice(start, start + rowsPerPage);
  }

  const searchConfig = {
    enabled: true,
    placeholder: "Search by name, email, or user ID...",
    value: search,
    onChange: (val: string) => setSearch(val),
  };

  const filterConfig = [
    {
      id: "role",
      label: "Role: All Roles",
      type: "select" as const,
      value: roleFilter,
      options: [
        { value: "All Roles", label: "Select Roles" },
        { value: "Admin", label: "Admin" },
        { value: "Institution Representative", label: "Institution Representative" }
      ],
      onChange: (val: string | string[]) => {
        const selected = Array.isArray(val) ? val[0] : val;
        setRoleFilter(selected || "All Roles");
      },
    },
    {
      id: "status",
      label: "Status: All",
      type: "select" as const,
      value: statusFilter,
      options: [
        { value: "All", label: "All Status" },
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
      onChange: (val: string | string[]) => {
        const selected = Array.isArray(val) ? val[0] : val;
        setStatusFilter(selected || "All");
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${start + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const handleConfirmStatusToggle = () => {
    if (!statusConfirmDialog.user) return;
    const targetStatus = statusConfirmDialog.nextStatus;
    const targetUser = statusConfirmDialog.user;

    setStatusConfirmDialog({ open: false, user: null, nextStatus: "active" });

    updateUserStatus.mutate(
      { id: targetUser.id, status: targetStatus },
      {
        onSuccess: () => {
          toast.success(`User ${targetStatus === "active" ? "enabled" : "disabled"} successfully!`);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update user status");
        },
        onSettled: () => {
          if (typeof document !== "undefined" && document.body.style.pointerEvents === "none") {
            document.body.style.pointerEvents = "";
          }
        },
      }
    );
  };

  if (isLoading && !usersData) {
    return <UserPageSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 flex flex-col h-full overflow-hidden mt-2">
      {/* STATS CARDS */}
      <StatsGrid>
        <StatsCard
          title="TOTAL ADMINS"
          value={stats?.admins ?? "..."}
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
          tooltip="Administrators with full system access"
        />
        <StatsCard
          title="INSTITUTION REPS"
          value={stats?.representatives ?? "..."}
          icon={<Users className="w-5 h-5" />}
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-600"
          tooltip="Users representing their respective institutions"
        />
        <StatsCard
          title="TOTAL INSTITUTIONS"
          value={stats?.institutions ?? "..."}
          icon={<Building className="w-5 h-5" />}
          iconBgClass="bg-green-50"
          iconColorClass="text-green-600"
          tooltip="Total institutions linked to registered users"
        />
      </StatsGrid>

      {tabsElement}

      {/* DATA TABLE */}
      <DataTable<User>
        columns={buildUserColumns("accepted")}
        data={visibleData}
        loading={isLoading || isFetching}
        search={searchConfig}
        filters={filterConfig}
        actions={(user) => {
          const isActive = (user.status || "").toLowerCase() === "active";
          return (
            <div className="flex justify-center">
              <ActionMenu
                status={user.status || "active"}
                onEdit={() => setFormModal({ open: true, mode: "edit", user })}
                onToggleStatus={() =>
                  setStatusConfirmDialog({
                    open: true,
                    user,
                    nextStatus: isActive ? "inactive" : "active",
                  })
                }
                onDelete={() => setDeleteDialog({ open: true, user })}
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

      {/* STATUS CONFIRMATION DIALOG */}
      <AlertDialog
        open={statusConfirmDialog.open}
        onOpenChange={(val) => {
          if (!val) {
            setStatusConfirmDialog({ open: false, user: null, nextStatus: "active" });
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
              Are you sure you want to {statusConfirmDialog.nextStatus === "active" ? "enable" : "disable"} user{" "}
              <span className="font-semibold text-slate-800">{statusConfirmDialog.user?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex sm:justify-center gap-3">
            <AlertDialogCancel
              onClick={() => setStatusConfirmDialog({ open: false, user: null, nextStatus: "active" })}
              className="rounded-xl px-6"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusToggle}
              disabled={updateUserStatus.isPending}
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
    </div>
  );
}
