"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  Star,
  UserPlus,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import StatsCard from "@/components/ui/StatsCard";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable from "@/components/reusable/DataTable";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tutor } from "./TutorFormModal";
import TutorFormModal from "./TutorFormModal";
import TutorDeleteDialog from "./TutorDeleteDialog";
import { buildTutorColumns } from "./columns";
import { Toaster } from "react-hot-toast";

const initialTutorsData: Tutor[] = [
  {
    id: 1,
    name: "Sarah Smith",
    email: "s.smith@example.edu",
    phone: "+1 (234) 567-8901",
    domain: ["COMPUTER SCIENCE", "REACT"],
    batches: ["C1-2024-A", "2024-B"],
    status: "Active",
  },
  {
    id: 2,
    name: "Robert Johnson",
    email: "r.johnson@example.edu",
    phone: "+1 (234) 567-8905",
    domain: ["DATA SCIENCE", "PYTHON"],
    batches: ["DR-2024-X"],
    status: "Active",
  },
  {
    id: 3,
    name: "Emily Chen",
    email: "e.chen@example.edu",
    phone: "+1 (234) 567-8912",
    domain: ["UI/UX DESIGN"],
    batches: ["UX-ADV-01"],
    status: "Inactive",
  },
  {
    id: 4,
    name: "David Lee",
    email: "d.lee@example.edu",
    phone: "+1 (234) 567-8920",
    domain: ["JAVA", "SPRING"],
    batches: ["JB-2024"],
    status: "Active",
  },
  {
    id: 5,
    name: "Anusha Reddy",
    email: "anusha@example.edu",
    phone: "+91 9876543210",
    domain: ["MACHINE LEARNING"],
    batches: ["ML-2024"],
    status: "Active",
  },
  {
    id: 6,
    name: "Kiran Kumar",
    email: "kiran@example.edu",
    phone: "+91 9123456780",
    domain: ["ANGULAR"],
    batches: ["ANG-01"],
    status: "Inactive",
  },
];

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

export default function TutorsPage() {
  const [tutorsData, setTutorsData] = useState<Tutor[]>(initialTutorsData);
  
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

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    tutor: Tutor | null;
  }>({
    open: false,
    tutor: null,
  });

  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter tutors
  const filteredData = tutorsData.filter((tutor) => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(search.toLowerCase()) ||
      tutor.domain.some(d => d.toLowerCase().includes(search.toLowerCase())) ||
      String(tutor.id).includes(search);
    
    const matchesDomain = domainFilter === "All" || tutor.domain.includes(domainFilter);
    const matchesStatus = statusFilter === "All" || tutor.status === statusFilter;
    
    return matchesSearch && matchesDomain && matchesStatus;
  });

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visibleData = filteredData.slice(start, start + rowsPerPage);

  const activeTutors = tutorsData.filter((t) => t.status === "Active").length;

  // Extract unique domains for filter dropdown
  const allDomains = Array.from(new Set(tutorsData.flatMap(t => t.domain)));

  // DataTable configs
  const searchConfig = {
    enabled: true,
    placeholder: "Search by name, domain, or ID...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
      setPage(1);
    },
  };

  const filterConfig = [
    {
      id: "domain",
      label: "All Domain",
      type: "select" as const,
      value: domainFilter,
      options: [
        { value: "All", label: "All Domain" },
        ...allDomains.map(d => ({ value: d, label: d }))
      ],
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

  const handleSaveTutor = (data: any) => {
    if (formModal.mode === "add") {
      const newTutor: Tutor = {
        id: Math.max(...tutorsData.map(t => t.id), 0) + 1,
        name: data.name,
        email: data.email,
        phone: data.phone,
        domain: data.domains,
        batches: [],
        status: "Active",
      };
      setTutorsData([newTutor, ...tutorsData]);
    } else if (formModal.tutor) {
      setTutorsData(tutorsData.map(t => 
        t.id === formModal.tutor!.id ? { ...t, ...data, domain: data.domains } : t
      ));
    }
  };

  const handleDeleteTutor = () => {
    if (deleteDialog.tutor) {
      setTutorsData(tutorsData.filter(t => t.id !== deleteDialog.tutor!.id));
    }
  };

  return (
    <ListingScreenTemplate
      headerText="Tutor Management"
      subHeaderText="Add and manage faculty members and their assignments."
      buttonLabel="Add New Tutor"
      buttonRequired={true}
      buttonOnclick={() => setFormModal({ open: true, mode: "add", tutor: null })}
    >
      <div className="flex flex-col gap-6 p-6 overflow-hidden h-full">
        <Toaster position="top-right" />
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
          <StatsCard
            title="Total Tutors"
            value={tutorsData.length}
            icon={<Users className="w-5 h-5" />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            tooltip="Total number of registered tutors"
          />
          <StatsCard
            title="Active Tutors"
            value={activeTutors}
            icon={<CheckCircle className="w-5 h-5" />}
            iconBgClass="bg-green-50"
            iconColorClass="text-green-600"
            tooltip="Tutors currently active"
          />
          <StatsCard
            title="Average Rating"
            value="4.8"
            icon={<Star className="w-5 h-5" />}
            iconBgClass="bg-yellow-50"
            iconColorClass="text-yellow-600"
            tooltip="Average rating of all tutors"
          />
          <StatsCard
            title="New Tutors (Month)"
            value="42"
            icon={<UserPlus className="w-5 h-5" />}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-600"
            tooltip="Tutors onboarded recently"
          />
        </div>

        {/* DATA TABLE */}
        <div className="flex-1 overflow-hidden min-h-0">
          <DataTable<Tutor>
            data={visibleData}
            columns={buildTutorColumns()}
            rowKey={(tutor) => String(tutor.id)}
            search={searchConfig}
            filters={filterConfig}
            actions={(tutor) => (
              <div className="flex justify-center">
                <ActionMenu 
                  onEdit={() => setFormModal({ open: true, mode: "edit", tutor })}
                  onDelete={() => setDeleteDialog({ open: true, tutor })}
                />
              </div>
            )}
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

      <TutorFormModal
        open={formModal.open}
        mode={formModal.mode}
        tutor={formModal.tutor}
        onClose={() => setFormModal({ open: false, mode: "add", tutor: null })}
        onSave={handleSaveTutor}
      />
      
      <TutorDeleteDialog
        open={deleteDialog.open}
        tutor={deleteDialog.tutor}
        onClose={() => setDeleteDialog({ open: false, tutor: null })}
        onConfirm={handleDeleteTutor}
      />
    </ListingScreenTemplate>
  );
}
