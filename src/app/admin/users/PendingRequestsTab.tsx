"use client";

import React, { useState, useEffect } from "react";
import { useContactRequests, useContactRequestStats } from "@/features/admin/users/api/contact-requests-api";
import { ContactRequest } from "@/types/contact-request";
import { buildPendingColumns } from "./columns-pending";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import { Users, UserPlus, Building, MoreVertical, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

function ActionMenu({
  onAccept,
  onReject,
}: {
  onAccept: () => void;
  onReject: () => void;
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
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onAccept();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors focus:bg-green-50 outline-none font-medium flex items-center gap-2"
        >
          <Check size={14} className="text-green-500" />
          Accept
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onReject();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:bg-red-50 outline-none font-medium flex items-center gap-2"
        >
          <X size={14} className="text-red-500" />
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function PendingRequestsTab({
  tabsElement
}: {
  tabsElement: React.ReactNode;
}) {
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

  // Reset page when search, role, or rowsPerPage changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, rowsPerPage]);

  const { data: requestsData, isLoading, isFetching } = useContactRequests(
    page,
    rowsPerPage,
    debouncedSearch || undefined,
    roleFilter
  );

  const { data: stats } = useContactRequestStats();

  const requestsList = requestsData?.data?.records || [];
  const totalCount = requestsData?.data?.pagination?.total_records || 0;
  const totalPages = requestsData?.data?.pagination?.total_pages || 1;

  const searchConfig = {
    enabled: true,
    placeholder: "Search by name, email, or user ID...",
    value: search,
    onChange: (val: string) => setSearch(val),
  };

  const filterConfig = [
    {
      id: "role",
      label: "Role: Select Roles",
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
  ];

  const start = (page - 1) * rowsPerPage;
  const paginationInfo = totalCount > 0
    ? `${start + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  if (isLoading && !requestsData) {
    return <UserPageSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 flex flex-col h-full overflow-hidden mt-2">
      {/* STATS CARDS */}
      <StatsGrid>
        <StatsCard
          title="TOTAL REQUESTS"
          value={stats?.total_requests ?? "..."}
          icon={<Users className="w-5 h-5" />}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
          tooltip="Total number of pending contact requests"
        />
        <StatsCard
          title="ADMIN REQUESTS"
          value={stats?.admin_requests ?? "..."}
          icon={<UserPlus className="w-5 h-5" />}
          iconBgClass="bg-orange-50"
          iconColorClass="text-orange-600"
          tooltip="Pending requests for Admin role"
        />
        <StatsCard
          title="INSTITUTION REPS"
          value={stats?.institution_representative_requests ?? "..."}
          icon={<Building className="w-5 h-5" />}
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-600"
          tooltip="Pending requests for Institution Representative role"
        />
      </StatsGrid>

      {tabsElement}

      {/* DATA TABLE */}
      <DataTable<ContactRequest>
        columns={buildPendingColumns()}
        data={requestsList}
        loading={isLoading || isFetching}
        search={searchConfig}
        filters={filterConfig}
        actions={(request) => (
          <div className="flex justify-center">
            <ActionMenu
              onAccept={() => {
                // To be implemented or leave as placeholder to match existing pattern
              }}
              onReject={() => {
                // To be implemented
              }}
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
  );
}
