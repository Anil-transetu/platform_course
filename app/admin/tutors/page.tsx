"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link"; // ✅ IMPORTANT
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

export default function TutorsPage() {
  const tutorsData = [
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

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(3);
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

  const filtered = tutorsData.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const visibleData = filtered.slice(start, start + rowsPerPage);

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tutor Management</h1>
          <p className="text-gray-600 text-sm">
            Add and manage faculty members and their assignments.
          </p>
        </div>

        {/* ✅ UPDATED BUTTON WITH LINK */}
        <Link href="/admin/tutors/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 font-medium">
            + Add New Tutor
          </button>
        </Link>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          value="4"
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
          title="New Tutors"
          value="42"
          icon={<UserPlus className="w-5 h-5" />}
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-600"
          tooltip="Tutors onboarded recently"
        />
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
        />

        <select className="border border-gray-300 px-3 py-2 rounded-lg text-gray-700">
          <option>All Domain</option>
        </select>

        <select className="border border-gray-300 px-3 py-2 rounded-lg text-gray-700">
          <option>All Status</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700 text-sm font-semibold">
            <tr>
              <th className="p-4 text-left">Tutor Info</th>
              <th className="p-4 text-left">Domain</th>
              <th className="p-4 text-left">Contact</th>
              <th className="p-4 text-left">Batches</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleData.map((tutor) => (
              <tr key={tutor.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">
                  <p className="font-bold text-gray-900 leading-tight">
                    {tutor.name}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                    ID: {tutor.id}
                  </p>
                </td>
                <td className="p-4">
                  <p className="text-gray-900 font-medium">{tutor.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tutor.phone}</p>
                </td>
                <td className="p-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {tutor.domain.map((d: string) => (
                      <span
                        key={d}
                        className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {tutor.batches.map((b: string) => (
                      <span
                        key={b}
                        className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      tutor.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tutor.status}
                  </span>
                </td>
                <td className="p-4 text-center relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === tutor.id ? null : tutor.id)
                    }
                    className="text-gray-400 hover:text-gray-600 transition p-1"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === tutor.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-8 top-10 bg-white shadow-xl border border-gray-100 rounded-lg w-32 py-2 z-10 text-left flex flex-col"
                    >
                      <Link
                        href={`/admin/tutors/edit/${tutor.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-slate-50 transition"
                      >
                        <Edit size={14} className="text-gray-400" /> Edit
                      </Link>
                      <Link
                        href={`/admin/tutors/delete/${tutor.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash size={14} className="text-red-400" /> Delete
                      </Link>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2 text-gray-700">
          <span>Rows per page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border px-2 py-1 rounded"
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 border rounded ${
                  page === p ? "bg-blue-600 text-white" : ""
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}


