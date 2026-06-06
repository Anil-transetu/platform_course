"use client"

import { useState, useEffect } from "react"
import {
  Building,
  CheckCircle,
  BookOpen,
  Clock,
  MoreVertical,
  Users
} from "lucide-react"

import Link from "next/link"

import { fetchInstitutions, Institution, InstitutionContact } from "@/features/institutions/api"
import StatsCard from "@/components/ui/StatsCard"

export default function InstitutionsPage() {

  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [openContacts, setOpenContacts] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const loadInstitutions = async (query?: string) => {
    try {
      setIsLoading(true)
      const data = await fetchInstitutions(query)
      setInstitutions(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to load institutions:", message)
      setError(message || "Failed to load institutions")
      
      // Fallback to localStorage if API fails (for local testing without backend)
      const stored = JSON.parse(localStorage.getItem("institutions") || "[]")
      if (stored.length > 0) {
        setInstitutions(stored)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInstitutions()
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        loadInstitutions(searchQuery)
      } else {
        loadInstitutions()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  return (

    <div className="space-y-6 bg-gray-50 min-h-screen p-6">

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-semibold text-gray-900">
            Institution Management
          </h1>

          <p className="text-sm text-gray-700">
            Integrated registration and institutional oversight
          </p>

        </div>

        <Link
          href="/admin/institutions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add New Institution
        </Link>

      </div>

      {/* Stats Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Institutions" value={42} icon={<Building size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" tooltip="Total number of registered institutions on the platform" />
        <StatsCard title="Active Institutions" value={38} icon={<CheckCircle size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" tooltip="Institutions currently active and operational" />
        <StatsCard title="Avg. Courses / Institution" value={12.4} icon={<BookOpen size={20} />} iconBgClass="bg-purple-50" iconColorClass="text-purple-600" tooltip="Average number of courses offered per institution" />
        <StatsCard title="Pending Registrations" value="04" icon={<Clock size={20} />} iconBgClass="bg-orange-50" iconColorClass="text-orange-600" tooltip="Institutions awaiting approval or registration completion" />
      </div>

      {/* Search + Filter */}

      <div className="flex justify-between items-center">

        <input
          type="text"
          placeholder="Search by name, email, or institution ID..."
          className="border rounded-lg px-4 py-2 w-96 text-gray-900 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="border rounded-lg px-4 py-2 text-gray-900 bg-white"
        >

          <option>All Institutions</option>
          <option>Active</option>
          <option>Inactive</option>

        </select>

      </div>

      {/* Table */}

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-900">

            <tr>

              <th className="p-4 text-left">
                Institution ID
              </th>

              <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Email
              </th>

              <th className="p-4 text-left">
                Location
              </th>

              <th className="p-4 text-left">
                Contacts
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                  Loading institutions...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-red-500">
                  {error}. Using cached data if available.
                </td>
              </tr>
            ) : institutions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No institutions found.
                </td>
              </tr>
            ) : (
              institutions.map((inst, index) => (

              <tr
                key={index}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-4 text-gray-900">
                  {inst.id}
                </td>

                <td className="p-4 font-medium text-gray-900">
                  {inst.name}
                </td>

                <td className="p-4 text-gray-800">
                  {inst.email}
                </td>

                <td className="p-4 text-gray-800">
                  {inst.location}
                </td>

                <td className="p-4 text-gray-800 relative">
                  <button 
                    onClick={() => setOpenContacts(openContacts === index ? null : index)}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Users size={16} />
                    <span className="text-xs font-semibold">{inst.contacts?.length || 0}</span>
                  </button>

                  {openContacts === index && (
                    <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95">
                      <div className="bg-gray-50 border-b px-4 py-2 flex justify-between items-center">
                         <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Points of Contact</span>
                         <button onClick={() => setOpenContacts(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                      </div>
                      <div className="max-h-64 overflow-y-auto w-full">
                        {inst.contacts && inst.contacts.length > 0 ? (
                          <div className="divide-y divide-gray-50">
                            {inst.contacts.map((contact: InstitutionContact, i: number) => (
                              <div key={i} className="p-3 hover:bg-gray-50/50 transition-colors">
                                <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{contact.email}</p>
                                <p className="text-xs text-gray-500">{contact.phone}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-xs text-gray-500">No contacts available.</div>
                        )}
                      </div>
                    </div>
                  )}
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      inst.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >

                    {inst.status}

                  </span>

                </td>

                {/* Actions */}

                <td className="p-4 text-center relative">

                  <button
                    onClick={() =>
                      setOpenMenu(
                        openMenu === index
                          ? null
                          : index
                      )
                    }
                  >

                    <MoreVertical className="text-gray-900 cursor-pointer" />

                  </button>

                  {openMenu === index && (

                    <div className="absolute right-6 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">

                      <Link
                        href={`/admin/institutions/edit/${inst.id}`}
                        className="block px-4 py-2 text-gray-900 hover:bg-gray-100"
                      >
                        Edit
                      </Link>

                      <Link
                        href={`/admin/institutions/delete/${inst.id}`}
                        className="block px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </Link>

                    </div>

                  )}

                </td>

              </tr>
            )))}
          </tbody>

        </table>

      </div>

      {/* Pagination */}

      <div className="flex justify-between items-center">

        <p className="text-sm text-gray-900">

          Showing 1–{institutions.length} of {institutions.length} institutions

        </p>

        <div className="flex gap-2">

          <button className="px-3 py-1 border rounded-lg text-gray-900 hover:bg-gray-100">
            Previous
          </button>

          <button className="px-3 py-1 border rounded-lg bg-blue-600 text-white">
            1
          </button>

          <button className="px-3 py-1 border rounded-lg text-gray-900 hover:bg-gray-100">
            Next
          </button>

        </div>

      </div>

    </div>

  )

}
