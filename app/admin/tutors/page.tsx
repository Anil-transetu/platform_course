"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Users, CheckCircle, Star, UserPlus, MoreVertical, Edit, Trash } from "lucide-react";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable, { Column } from "@/components/reusable/DataTable";

// Dummy tutor data
const DUMMY_TUTORS = [
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
  {
    id: 7,
    name: "Priya Sharma",
    email: "priya.sharma@example.edu",
    phone: "+91 8765432109",
    domain: ["iOS Development", "Swift"],
    batches: ["iOS-2024", "MOBILE-01"],
    status: "Active",
  },
  {
    id: 8,
    name: "Michael Brown",
    email: "m.brown@example.edu",
    phone: "+1 (456) 789-1234",
    domain: ["DevOps", "Docker"],
    batches: ["DEVOPS-ADV"],
    status: "Active",
  },
  {
    id: 9,
    name: "Lisa Wong",
    email: "l.wong@example.edu",
    phone: "+1 (555) 234-5678",
    domain: ["Cloud Architecture"],
    batches: ["CLOUD-2024"],
    status: "Inactive",
  },
  {
    id: 10,
    name: "Arjun Patel",
    email: "arjun.patel@example.edu",
    phone: "+91 9765432101",
    domain: ["Blockchain"],
    batches: ["BLOCKCHAIN-01"],
    status: "Active",
  },
];

export default function TutorsPage() {
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
  const filtered = DUMMY_TUTORS.filter((tutor) =>
    tutor.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const visibleData = filtered.slice(start, start + rowsPerPage);

  // Stats
  const activeTutors = DUMMY_TUTORS.filter(t => t.status === "Active").length;

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
            <p className="text-xs text-gray-500 truncate">ID: #{String(row.id).padStart(4, "0")}</p>
          </div>
        </div>
      ),
    },
    {
      key: "domain",
      label: "Domain/Tags",
      width: "w-1/5",
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          {row.domain.map((d) => (
            <span
              key={d}
              className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded w-fit"
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
      width: "w-1/5",
      render: (_, row) => (
        <div>
          <p className="text-sm text-gray-900 font-medium truncate">{row.email}</p>
          <p className="text-xs text-gray-500 truncate">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "batches",
      label: "Assigned Batches",
      width: "w-1/5",
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          {row.batches.map((b) => (
            <span
              key={b}
              className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded w-fit"
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
      width: "w-1/10",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              row.status === "Active" ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              row.status === "Active"
                ? "text-green-700"
                : "text-gray-500"
            }`}
          >
            {row.status}
          </span>
        </div>
      ),
    },
  ];

  // Action column renderer
  const renderActions = (tutor: Tutor) => (
    <div className="relative">
      <button
        onClick={() =>
          setOpenMenu(openMenu === tutor.id ? null : tutor.id)
        }
        className="text-gray-400 hover:text-gray-600 transition p-1 inline-flex"
      >
        <MoreVertical size={18} />
      </button>

      {openMenu === tutor.id && (
        <div
          ref={menuRef}
          className="absolute right-8 top-10 bg-white shadow-lg border border-gray-200 rounded-lg w-32 py-2 z-20 text-left flex flex-col"
        >
          <Link
            href={`/admin/tutors/edit/${tutor.id}`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            <Edit size={14} className="text-gray-400" /> Edit
          </Link>
          <Link
            href={`/admin/tutors/delete/${tutor.id}`}
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
      buttonOnclick={() => console.log("Add tutor clicked")}
    >
      {/* Page Content */}
      <div className="flex flex-col gap-6 p-6 overflow-hidden h-full">
        {/* STATS CARDS */}
        <div className="grid grid-cols-4 gap-4 flex-shrink-0">
          <StatsCard title="Total Tutors" value={DUMMY_TUTORS.length} icon={<Users className="w-5 h-5" />} color="blue" />
          <StatsCard title="Active Tutors" value={activeTutors} icon={<CheckCircle className="w-5 h-5" />} color="green" />
          <StatsCard title="Average Rating" value="4.8" icon={<Star className="w-5 h-5" />} color="yellow" />
          <StatsCard title="New Tutors (Month)" value="42" icon={<UserPlus className="w-5 h-5" />} color="purple" />
        </div>

        {/* FILTERS */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-4 flex-shrink-0">
          <div className="flex-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, domain, tags, or ID"
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
            <option>All r tatus</option>
          </select>
        </div>

        {/* DATA TABLE - Takes remaining space with flex-1 */}
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
            paginationInfo={`${start + 1}-${Math.min(start + rowsPerPage, filtered.length)} of ${filtered.length}`}
            showPagination={true}
          />
        </div>
      </div>
    </ListingScreenTemplate>
  );
}

type Tutor = (typeof DUMMY_TUTORS)[0];

/* STATS CARD COMPONENT */
function StatsCard({
  title,
  value,
  icon,
  color = "blue",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    yellow: "text-yellow-600 bg-yellow-100",
    purple: "text-purple-600 bg-purple-100",
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-xs font-medium">{title}</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{value}</h2>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color] || ""}`}>{icon}</div>
      </div>
    </div>
  );
}