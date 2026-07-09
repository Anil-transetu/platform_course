"use client";

import React, { useState, useEffect } from "react";
import { useContactRequests, useContactRequestStats, useDeleteContactRequest } from "@/features/admin/users/api/contact-requests-api";
import { toast } from "sonner";
import { ContactRequest } from "@/types/contact-request";
import { buildPendingColumns } from "./columns-pending";
import UserPageSkeleton from "@/components/users/UserPageSkeleton";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import DeleteDialog from "@/components/reusable/DeleteDialog";
import { Users, UserPlus, Building, MoreVertical, Eye, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function ActionMenu({
  onView,
  onDelete,
}: {
  onView: () => void;
  onDelete: () => void;
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
            onView();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors focus:bg-slate-50 outline-none font-medium flex items-center gap-2"
        >
          <Eye size={14} className="text-slate-500" />
          View
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
  
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [itemToView, setItemToView] = useState<ContactRequest | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ContactRequest | null>(null);

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
  const deleteMutation = useDeleteContactRequest();

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
              onView={() => {
                setItemToView(request);
                setViewDialogOpen(true);
              }}
              onDelete={() => {
                setItemToDelete(request);
                setDeleteDialogOpen(true);
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

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSubmit={() => {
          if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.id, {
              onSuccess: () => {
                toast.success("Contact request deleted successfully");
                setDeleteDialogOpen(false);
              },
              onError: (err: any) => toast.error(err.message || "Failed to delete contact request"),
            });
          }
        }}
        itemName={itemToDelete?.full_name || itemToDelete?.first_name ? `${itemToDelete.first_name || ''} ${itemToDelete.last_name || ''}`.trim() || itemToDelete?.full_name : "this pending request"}
        isLoading={deleteMutation.isPending}
      />

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] p-0 overflow-hidden flex flex-col w-[95vw] sm:w-full">
          <div className="overflow-y-auto p-6 space-y-4 w-full">
            <DialogHeader>
              <DialogTitle>View Pending Request</DialogTitle>
              <DialogDescription className="sr-only">
                Read-only details for the selected pending request.
              </DialogDescription>
            </DialogHeader>
            
            {itemToView && (
              <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="view-fullname">Full Name</Label>
                  <Input 
                    id="view-fullname" 
                    value={itemToView.full_name || (itemToView.first_name ? `${itemToView.first_name} ${itemToView.last_name}` : "N/A")} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="view-email">Email</Label>
                  <Input 
                    id="view-email" 
                    value={itemToView.email || "N/A"} 
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="view-role">Role</Label>
                  <Input 
                    id="view-role" 
                    value={itemToView.role || "N/A"} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="view-date">Created Date</Label>
                  <Input 
                    id="view-date" 
                    value={itemToView.created_at ? new Date(itemToView.created_at).toLocaleDateString() : "N/A"} 
                    readOnly 
                  />
                </div>
              </div>

              {itemToView.institution_name && (
                <div className="space-y-2">
                  <Label htmlFor="view-institution">Institution Name</Label>
                  <Input 
                    id="view-institution" 
                    value={itemToView.institution_name} 
                    readOnly 
                  />
                </div>
              )}

              {itemToView.phone_number && (
                <div className="space-y-2">
                  <Label htmlFor="view-phone">Phone Number</Label>
                  <Input 
                    id="view-phone" 
                    value={itemToView.phone_number} 
                    readOnly 
                  />
                </div>
              )}

              <div className="space-y-2">
                  <Label htmlFor="view-message">Message</Label>
                  <Textarea 
                    id="view-message" 
                    value={itemToView.message || "N/A"} 
                    readOnly 
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
