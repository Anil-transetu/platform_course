"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Users, Layers, CheckCircle, XCircle } from "lucide-react";
import StatsCard from "@/components/ui/StatsCard";

interface Batch {
  id: string | number;
  name: string;
  instructor: string;
  students: number;
  status: string;
  institutionId?: string;
}

export default function BatchesPage() {

  const batches: Batch[] = [];

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openMenu, setOpenMenu] = useState<string | number | null>(null);

  const totalPages = Math.ceil(batches.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const visibleData = batches.slice(start, start + rowsPerPage);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-card-foreground">
          Batches Dashboard
        </h1>

        <Link href="/admin/batches/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow">
            + Add Batch
          </button>
        </Link>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Batches"
          value={batches.length}
          icon={<Layers className="w-5 h-5" />}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
          tooltip="Total number of batches created"
        />
        <StatsCard
          title="Active Batches"
          value="7"
          icon={<CheckCircle className="w-5 h-5" />}
          iconBgClass="bg-green-50"
          iconColorClass="text-green-600"
          tooltip="Currently active batches"
        />
        <StatsCard
          title="Inactive Batches"
          value="3"
          icon={<XCircle className="w-5 h-5" />}
          iconBgClass="bg-red-50"
          iconColorClass="text-red-600"
          tooltip="Batches that are currently inactive"
        />
        <StatsCard
          title="Total Students"
          value="205"
          icon={<Users className="w-5 h-5" />}
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-600"
          tooltip="Total students enrolled across all batches"
        />
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-xl shadow-md border overflow-hidden">

        <table className="w-full">
          <thead className="bg-muted border-b">
            <tr className="text-card-foreground text-sm">
              <th className="p-4 text-left font-semibold">Batch Name</th>
              <th className="p-4 text-left font-semibold">Instructor</th>
              <th className="p-4 text-left font-semibold">Students</th>
              <th className="p-4 text-left font-semibold">Status</th>
              <th className="p-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleData.map((batch) => (
              <tr key={batch.id} className="border-b hover:bg-muted transition">

                <td className="p-4 text-card-foreground font-medium">{batch.name}</td>
                <td className="p-4 text-card-foreground">{batch.instructor}</td>
                <td className="p-4 text-card-foreground">{batch.students}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      batch.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {batch.status}
                  </span>
                </td>

                <td className="p-4 relative">

                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === batch.id ? null : batch.id)
                    }
                    className="text-card-foreground hover:text-foreground"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === batch.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-card border rounded-lg shadow-lg z-10">

                      {/* EDIT */}
                      <Link href={`/admin/batches/${batch.id}?mode=edit`}>
                        <button
                          onClick={() => setOpenMenu(null)}
                          className="w-full text-left px-4 py-2 hover:bg-accent text-sm text-card-foreground"
                        >
                          Edit
                        </button>
                      </Link>

                      {/* DELETE ✅ */}
                      <Link href={`/admin/batches/${batch.id}?mode=delete`}>
                        <button
                          onClick={() => setOpenMenu(null)}
                          className="w-full text-left px-4 py-2 hover:bg-accent text-red-600 text-sm"
                        >
                          Delete
                        </button>
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
      <div className="flex justify-between items-center mt-6">

        <div className="flex items-center gap-2 text-card-foreground">
          <span>Rows per page</span>

          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-2 py-1 text-card-foreground"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>

        <div className="flex gap-2">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded bg-card text-card-foreground hover:bg-accent disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNumber = i + 1;

            return (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`px-3 py-1 border rounded ${
                  page === pageNumber
                    ? "bg-blue-600 text-white"
                    : "bg-card text-card-foreground hover:bg-accent"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded bg-card text-card-foreground hover:bg-accent disabled:opacity-40"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
}
