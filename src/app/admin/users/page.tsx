"use client";
import React, { useState, useEffect } from "react";
import { useUsers, useUserStats } from "@/features/admin/users/api/user-api";
import { User } from "@/types/user";
import { buildUserColumns } from "./columns";
import UserFormModal from "./UserFormModal";
import UserDeleteDialog from "./UserDeleteDialog";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import StatsCard from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ShieldCheck, Users, Building, MoreVertical, Pencil, Trash2, Check, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

function ActionMenu({
  onEdit,
  onDelete,
  isPending
}: {
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
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
        {isPending ? (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                // We'd add an accept user hook here, or it can be done via edit. For now just placeholder to match old UI
              }}
              className="cursor-pointer px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors focus:bg-green-50 outline-none font-medium flex items-center gap-2"
            >
              <Check size={14} className="text-green-500" />
              Accept
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                // Reject is essentially delete
                onDelete();
              }}
              className="cursor-pointer px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:bg-red-50 outline-none font-medium flex items-center gap-2"
            >
              <X size={14} className="text-red-500" />
              Reject
            </DropdownMenuItem>
          </>
        ) : (
          <>
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UsersPage() {
  // Modal state
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    user?: User | null;
  }>({
    open: false,
    mode: "add",
    user: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });

  // Filters & Pagination state
  const [activeTab, setActiveTab] = useState<"accepted" | "pending">("accepted");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search, role, tab, or rowsPerPage changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, activeTab, rowsPerPage]);

  // Data fetching hooks
  // We pass page and limit to useUsers to enable server-side pagination.
  // The API uses these params to fetch the appropriate page.
  const { data: usersData, isLoading, isFetching } = useUsers(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    roleFilter,
    activeTab === "accepted" ? "active" : "pending"
  );

  const { data: stats } = useUserStats();

  const usersList = Array.isArray(usersData) ? usersData : usersData?.data || [];

  const statsTotalUsers = stats ? ((stats.admins || 0) + (stats.representatives || 0)) : 0;
  // Prioritize the API's returned total (which may be nested in `pagination`). If missing, fallback to stats or list length.
  const apiTotal = !Array.isArray(usersData) ? (usersData?.pagination?.total ?? usersData?.total) : undefined;
  const totalCount = apiTotal !== undefined
    ? apiTotal
    : Math.max(statsTotalUsers, usersList.length);
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // Only slice locally if the backend returned more items than rowsPerPage (meaning it didn't paginate properly)
  let visibleData = usersList;
  const start = (page - 1) * rowsPerPage;
  if (usersList.length > rowsPerPage) {
    visibleData = usersList.slice(start, start + rowsPerPage);
  }

  // DataTable configs
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
        { value: "All Roles", label: "All Roles" },
        { value: "Admin", label: "Admin" },
        { value: "Institution Representative", label: "Institution Representative" },
        { value: "Tutor", label: "Tutor" },
      ],
      onChange: (val: string | string[]) => {
        const selected = Array.isArray(val) ? val[0] : val;
        setRoleFilter(selected || "All Roles");
      },
    },
  ];

  const paginationInfo = totalCount > 0
    ? `${start + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  return (
    <ListingScreenTemplate
      headerText="User Management"
      subHeaderText="Oversee administrators and institution representatives."
      buttonLabel="Create New User"
      buttonRequired={true}
      buttonOnclick={() => setFormModal({ open: true, mode: "add", user: null })}
    >
      {isLoading ? (
        <UserPageSkeleton />
      ) : (
        <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
          <Toaster position="top-right" />

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-shrink-0">
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
          </div>

          {/* TABS */}
          <div className="flex items-center gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("accepted")}
              className={`pb-2.5 font-semibold text-sm transition-colors border-b-2
              ${activeTab === "accepted" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}
            `}
            >
              Accepted Requests
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-2.5 font-semibold text-sm transition-colors border-b-2
              ${activeTab === "pending" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}
            `}
            >
              Pending
            </button>
          </div>

          {/* DATA TABLE */}
          <DataTable<User>
            columns={buildUserColumns(activeTab)}
            data={visibleData}
            loading={isLoading || isFetching}
            search={searchConfig}
            filters={filterConfig}
            actions={(user) => (
              <div className="flex justify-center">
                <ActionMenu
                  onEdit={() => setFormModal({ open: true, mode: "edit", user })}
                  onDelete={() => setDeleteDialog({ open: true, user })}
                  isPending={activeTab === "pending"}
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

      {/* MODALS */}
      <UserFormModal
        open={formModal.open}
        mode={formModal.mode}
        user={formModal.user}
        onClose={() => setFormModal({ open: false, mode: "add", user: null })}
      />
      <UserDeleteDialog
        open={deleteDialog.open}
        user={deleteDialog.user}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      />
    </ListingScreenTemplate>
  );
}
