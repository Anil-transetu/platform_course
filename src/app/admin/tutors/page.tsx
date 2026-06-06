"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle,
  Star,
  UserPlus,
  MoreVertical,
  Edit,
  Trash,
} from "lucide-react";
import StatsCard from "@/components/ui/StatsCard";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable, { Column } from "@/components/reusable/DataTable";

interface Tutor extends Record<string, any> {
  id: number;
  name: string;
  email: string;
  phone: string;
  domain: string[];
  batches: string[];
  status: string;
}

const tutorsData: Tutor[] = [
  {
    id: 1,
    name: "Sarah Smith",
    email: "s.smith@example.edu",
    phone: "+1 (234) 567-8901",
    domain: ["Computer Science", "React"],
    batches: ["C1-2024-A", "2024-B"],
    status: "Active",
  },
  {
    id: 2,
    name: "Robert Johnson",
    email: "r.johnson@example.edu",
    phone: "+1 (234) 567-8905",
    domain: ["Data Science", "Python"],
    batches: ["Dr-2024-X"],
    status: "Active",
  },
  {
    id: 3,
    name: "Emily Chen",
    email: "e.chen@example.edu",
    phone: "+1 (234) 567-8912",
    domain: ["UI/UX Design"],
    batches: ["UX-ADV-01"],
    status: "Inactive",
  },
  {
    id: 4,
    name: "David Lee",
    email: "d.lee@example.edu",
    phone: "+1 (234) 567-8920",
    domain: ["Java", "Spring"],
    batches: ["JB-2024"],
    status: "Active",
  },
  {
    id: 5,
    name: "Anusha Reddy",
    email: "anusha@example.edu",
    phone: "+91 9876543210",
    domain: ["Machine Learning"],
    batches: ["ML-2024"],
    status: "Active",
  },
  {
    id: 6,
    name: "Kiran Kumar",
    email: "kiran@example.edu",
    phone: "+91 9123456780",
    domain: ["Angular"],
    batches: ["ANG-01"],
    status: "Inactive",
  },
];

export default function TutorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter tutors based on search
  const filtered = tutorsData.filter((tutor) =>
    tutor.name.toLowerCase().includes(search.toLowerCase()) ||
    tutor.domain.some(d => d.toLowerCase().includes(search.toLowerCase())) ||
    String(tutor.id).includes(search)
  );

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visibleData = filtered.slice(start, start + rowsPerPage);

  // Stats
  const activeTutors = tutorsData.filter((t) => t.status === "Active").length;

  // Column definitions for DataTable
  const columns: Column<Tutor>[] = [
    {
      key: "name",
      label: "Tutor Info",
      width: "w-1/5",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-blue-600">
              {row.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {row.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              ID: #{String(row.id).padStart(4, "0")}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "domain",
      label: "Domain",
      render: (_, row) => (
        <div className="flex gap-1.5 flex-wrap">
          {row.domain.map((d: string) => (
            <span
              key={d}
              className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide"
            >
              {d}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (_, row) => (
        <div>
          <p className="text-gray-900 font-medium">{row.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "batches",
      label: "Batches",
      render: (_, row) => (
        <div className="flex gap-1.5 flex-wrap">
          {row.batches.map((b: string) => (
            <span
              key={b}
              className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide"
            >
              {b}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
            row.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const renderActions = (tutor: Tutor) => (
    <div className="relative flex justify-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenu(openMenu === tutor.id ? null : tutor.id);
        }}
        className="text-gray-400 hover:text-gray-600 transition p-1"
      >
        <MoreVertical size={18} />
      </button>

      {openMenu === tutor.id && (
        <div
          ref={menuRef}
          className="absolute right-8 top-0 bg-white shadow-lg border border-gray-200 rounded-lg w-32 py-2 z-20 text-left flex flex-col"
        >
          <Link
            href={`/admin/tutors/${tutor.id}?mode=edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            <Edit size={14} className="text-gray-400" /> Edit
          </Link>
          <Link
            href={`/admin/tutors/${tutor.id}?mode=delete`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <Trash size={14} className="text-red-400" /> Delete
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <ListingScreenTemplate
      headerText="Tutor Management"
      subHeaderText="Add and manage faculty members and their assignments."
      buttonLabel="Add New Tutor"
      buttonRequired={true}
      buttonOnclick={() => router.push("/admin/tutors/new")}
    >
      <div className="flex flex-col gap-6 p-6 overflow-hidden h-full">
        {/* STATS CARDS */}
        <div className="grid grid-cols-4 gap-4 flex-shrink-0">
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

        {/* FILTERS */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-4 flex-shrink-0">
          <div className="flex-1 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, domain, or ID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 bg-transparent border-0 text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
            />
          </div>

          <select className="border border-gray-300 px-4 py-2.5 rounded-lg text-gray-700 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Domain</option>
          </select>

          <select className="border border-gray-300 px-4 py-2.5 rounded-lg text-gray-700 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
          </select>
        </div>

        {/* DATA TABLE */}
        <div className="flex-1 overflow-hidden min-h-0">
          <DataTable<Tutor>
            data={visibleData}
            columns={columns}
            rowKey={(tutor) => tutor.id}
            actions={renderActions}
            bodyHeight="h-full"
            rowsPerPage={rowsPerPage}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setPage(1);
            }}
            paginationInfo={`${start + 1}-${Math.min(
              start + rowsPerPage,
              filtered.length
            )} of ${filtered.length}`}
            showPagination={true}
          />
        </div>
      </div>
    </ListingScreenTemplate>
  );
}
