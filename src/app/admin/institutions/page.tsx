"use client";
import React, { useState, useEffect } from "react";
import { useInstitutions, useInstitutionStats } from "@/features/admin/institutions/api/use-institutions";
import { Institution } from "@/features/admin/institutions/api/institution-api";
import { buildInstitutionColumns } from "./columns";
import InstitutionFormModal from "./InstitutionFormModal";
import InstitutionDeleteDialog from "./InstitutionDeleteDialog";
import InstitutionPageSkeleton from "@/components/admin/institutions/InstitutionPageSkeleton";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { Toaster } from "@/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Building, CheckCircle, BookOpen, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";

function ActionMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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

const renderExpandedRow = (row: Institution) => {
  const contacts = row.contacts || [];
  if (contacts.length === 0) {
    return <div className="p-4 text-center text-slate-500">No point of contacts available.</div>;
  }

  const getTitle = (index: number) => {
    if (index === 0) return "Primary Contact";
    return `Contact-0${index}`;
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50">
      {contacts.map((contact: any, idx: number) => (
        <div key={idx}>
          <h4 className="text-sm font-bold text-slate-800 mb-3">{getTitle(idx)}</h4>
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NAME</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800">{contact.name || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ROLE</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800">{contact.role || contact.designation || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">EMAIL</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800">{contact.email || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PHONE NUMBER</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800">{contact.phone || "-"}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function InstitutionsPage() {
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
  const apiTotal = !Array.isArray(institutionsData) ? institutionsData?.total : undefined;
  const totalCount = apiTotal !== undefined ? apiTotal : institutionsList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // Local Pagination
  let visibleData = institutionsList;
  const start = (page - 1) * rowsPerPage;
  if (institutionsList.length > rowsPerPage) {
    visibleData = institutionsList.slice(start, start + rowsPerPage);
  }

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
              value={stats?.total_institutions ?? totalCount} 
              icon={<Building size={20} />} 
              iconBgClass="bg-blue-50" 
              iconColorClass="text-blue-600" 
              tooltip="Total number of registered institutions on the platform" 
            />
            <StatsCard 
              title="Active Institutions" 
              value={stats?.active_institutions ?? institutionsList.filter((i: any) => (i.status || "Active").toLowerCase() === "active").length} 
              icon={<CheckCircle size={20} />} 
              iconBgClass="bg-green-50" 
              iconColorClass="text-green-600" 
              tooltip="Institutions currently active and operational" 
            />
            <StatsCard 
              title="Avg. Courses / Inst." 
              value={stats?.average_courses_per_institution?.toFixed(1) ?? "0"} 
              icon={<BookOpen size={20} />} 
              iconBgClass="bg-purple-50" 
              iconColorClass="text-purple-600" 
              tooltip="Average number of courses offered per institution" 
            />
            <StatsCard 
              title="Pending Registrations" 
              value={stats?.pending_registrations ?? 0} 
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
          actions={(institution) => (
            <div className="flex justify-center">
              <ActionMenu 
                onEdit={() => setFormModal({ open: true, mode: "edit", institution })}
                onDelete={() => setDeleteDialog({ open: true, institution })}
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
    </ListingScreenTemplate>
  );
}
