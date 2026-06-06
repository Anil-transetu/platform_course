"use client"

import React, { useState, useEffect } from "react"
import {
  Building,
  CheckCircle,
  BookOpen,
  Clock,
  MoreVertical,
  Users,
  Eye,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  X,
  Search
} from "lucide-react"

import Link from "next/link"

import {
  useInstitutions,
  useInstitutionStats,
  useCreateInstitution,
  useUpdateInstitution,
  useDeleteInstitution
} from "@/features/institutions/use-institutions"
import { Institution, InstitutionContact } from "@/features/institutions/api"
import StatsCard from "@/components/ui/StatsCard"

function ContactCard({ title, contact }: { title: string; contact: InstitutionContact }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm w-72 flex-shrink-0">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 uppercase font-semibold">Name</label>
          <div className="bg-gray-50 rounded-md p-2 mt-1 text-sm text-gray-900 font-medium">
            {contact.name}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase font-semibold">Role</label>
          <div className="bg-gray-50 rounded-md p-2 mt-1 text-sm text-gray-900 font-medium">
            {contact.role || contact.designation || "-"}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
          <div className="bg-gray-50 rounded-md p-2 mt-1 text-sm text-gray-900 font-medium truncate">
            {contact.email}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase font-semibold">Phone Number</label>
          <div className="bg-gray-50 rounded-md p-2 mt-1 text-sm text-gray-900 font-medium">
            {contact.phone}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InstitutionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Institutions")
  
  const [openMenu, setOpenMenu] = useState<string | number | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | number | null>(null)
  
  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [formData, setFormData] = useState<Partial<Institution>>({
    name: "",
    email: "",
    location: "",
    contacts: [{ name: "", email: "", phone: "", role: "" }]
  })

  // Queries
  const { data: institutionsData, isLoading, error } = useInstitutions(debouncedSearch, statusFilter)
  const { data: statsData } = useInstitutionStats()
  
  // Mutations
  const createMutation = useCreateInstitution()
  const updateMutation = useUpdateInstitution()
  const deleteMutation = useDeleteInstitution()

  const institutions = institutionsData?.data || []

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Helpers
  const handleOpenRegister = () => {
    setFormData({ name: "", email: "", location: "", contacts: [{ name: "", email: "", phone: "", role: "" }] })
    setIsRegisterModalOpen(true)
  }

  const handleOpenEdit = (inst: Institution) => {
    const copy = JSON.parse(JSON.stringify(inst))
    if (!copy.contacts || copy.contacts.length === 0) {
      copy.contacts = [{ name: "", email: "", phone: "", role: "" }]
    }
    // Handle potential point_of_contacts from backend if contacts is empty
    if ((!inst.contacts || inst.contacts.length === 0) && (inst as any).point_of_contacts) {
      copy.contacts = (inst as any).point_of_contacts;
    }
    
    setFormData(copy)
    setIsEditModalOpen(true)
    setOpenMenu(null)
  }

  const handleOpenDelete = (inst: Institution) => {
    setSelectedInstitution(inst)
    setIsDeleteModalOpen(true)
    setOpenMenu(null)
  }

  const handleAddContact = () => {
    if ((formData.contacts?.length || 0) < 3) {
      setFormData(prev => ({
        ...prev,
        contacts: [...(prev.contacts || []), { name: "", email: "", phone: "", role: "" }]
      }))
    }
  }

  const handleRemoveContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts?.filter((_, i) => i !== index)
    }))
  }

  const handleContactChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newContacts = [...(prev.contacts || [])]
      newContacts[index] = { ...newContacts[index], [field]: value }
      return { ...prev, contacts: newContacts }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isRegisterModalOpen) {
        await createMutation.mutateAsync(formData)
        setIsRegisterModalOpen(false)
      } else if (isEditModalOpen && formData.id) {
        await updateMutation.mutateAsync({ id: formData.id, data: formData })
        setIsEditModalOpen(false)
      }
    } catch (err: any) {
      console.error("Submission failed", err)
      alert(err?.message || "Failed to submit. Please try again.")
    }
  }

  const handleDelete = async () => {
    if (selectedInstitution?.id) {
      try {
        await deleteMutation.mutateAsync(selectedInstitution.id)
        setIsDeleteModalOpen(false)
      } catch (err) {
        console.error("Delete failed", err)
        alert("Failed to delete.")
      }
    }
  }

  return (
    <div className="space-y-6 bg-[#F8FAFC] min-h-screen p-8 text-[#0F172A]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">
            Institution Management
          </h1>
          <p className="text-[#64748B] mt-1">
            Integrated registration and institutional oversight
          </p>
        </div>
        <button
          onClick={handleOpenRegister}
          className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus size={18} /> Add New Institution
        </button>
      </div>

      {/* Stats Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Institutions" value={statsData?.total_institutions || institutions.length || 0} icon={<Building size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" tooltip="Total number of registered institutions on the platform" />
        <StatsCard title="Active Institutions" value={statsData?.active_institutions || institutions.filter(i => i.status === "Active").length || 0} icon={<CheckCircle size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" tooltip="Institutions currently active and operational" />
        <StatsCard title="Avg. Courses / Institution" value={statsData?.average_courses_per_institution?.toFixed(1) || 12.4} icon={<BookOpen size={20} />} iconBgClass="bg-purple-50" iconColorClass="text-purple-600" tooltip="Average number of courses offered per institution" />
        <StatsCard title="Pending Registrations" value={statsData?.pending_registrations || 0} icon={<Clock size={20} />} iconBgClass="bg-orange-50" iconColorClass="text-orange-600" tooltip="Institutions awaiting approval or registration completion" />
      </div>

      {/* Search + Filter */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="relative w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or institution ID..."
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#64748B]">Filter Status:</span>
          <select
            className="border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Institutions</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="p-4 text-left font-bold text-[#0F172A] uppercase text-xs tracking-wider">Institution ID</th>
              <th className="p-4 text-left font-bold text-[#0F172A] uppercase text-xs tracking-wider">Name</th>
              <th className="p-4 text-left font-bold text-[#0F172A] uppercase text-xs tracking-wider">Email</th>
              <th className="p-4 text-center font-bold text-[#0F172A] uppercase text-xs tracking-wider">Point of Contact</th>
              <th className="p-4 text-left font-bold text-[#0F172A] uppercase text-xs tracking-wider">Location</th>
              <th className="p-4 text-center font-bold text-[#0F172A] uppercase text-xs tracking-wider">Status</th>
              <th className="p-4 text-center font-bold text-[#0F172A] uppercase text-xs tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="p-8 text-center text-red-500">Failed to load data.</td></tr>
            ) : institutions.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No institutions found.</td></tr>
            ) : (
              institutions.map((inst: Institution) => (
                <React.Fragment key={inst.id}>
                  <tr className={`hover:bg-[#F8FAFC] transition-colors ${expandedRow === inst.id ? 'bg-[#F8FAFC]' : ''}`}>
                    <td className="p-4 text-[#64748B] font-medium">{inst.batch_id || inst.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-[#0F172A]">{inst.name}</div>
                    </td>
                    <td className="p-4 text-[#64748B]">{inst.email}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setExpandedRow(expandedRow === inst.id ? null : inst.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${expandedRow === inst.id ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-gray-100'}`}
                      >
                        <Eye size={18} />
                        {expandedRow === inst.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="p-4 text-[#64748B]">{inst.location || inst.address || "-"}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        inst.status === "Active" || !inst.status
                          ? "bg-[#D1FAE5] text-[#065F46]"
                          : "bg-[#FEE2E2] text-[#991B1B]"
                      }`}>
                        {inst.status || "Active"}
                      </span>
                    </td>
                    <td className="p-4 text-center relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === inst.id ? null : inst.id)}
                        className="text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1"
                      >
                        <MoreVertical size={20} />
                      </button>
                      {openMenu === inst.id && (
                        <div className="absolute right-8 top-10 mt-1 w-36 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-10 py-1">
                          <button
                            onClick={() => handleOpenEdit(inst)}
                            className="block w-full text-left px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleOpenDelete(inst)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[#FEE2E2]"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {/* Expanded Row */}
                  {expandedRow === inst.id && (
                    <tr className="bg-[#F8FAFC]">
                      <td colSpan={7} className="p-8 pt-4 pb-8 border-t border-[#E2E8F0]">
                        <div className="flex gap-6 overflow-x-auto">
                          {(() => {
                            const renderContacts = inst.contacts && inst.contacts.length > 0 ? inst.contacts : (inst as any).point_of_contacts || [];
                            
                            if (renderContacts.length === 0) {
                              return <div className="text-sm text-gray-500 italic">No contacts available.</div>
                            }
                            
                            return (
                              <>
                                {renderContacts[0] && <ContactCard title="Primary Contact" contact={renderContacts[0]} />}
                                {renderContacts[1] && <ContactCard title="Contact-01" contact={renderContacts[1]} />}
                                {renderContacts[2] && <ContactCard title="Contact-02" contact={renderContacts[2]} />}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-[#E2E8F0] bg-white">
          <p className="text-sm text-[#64748B]">
            Showing 1 - {institutions.length} of {institutions.length}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#64748B]">Rows per page</span>
            <select className="border border-[#E2E8F0] rounded px-2 py-1 text-sm text-[#0F172A]">
              <option>10</option>
              <option>20</option>
            </select>
            <div className="flex gap-1 ml-4">
              <button className="px-3 py-1 text-sm text-[#94A3B8] font-medium">Previous</button>
              <button className="px-3 py-1 text-sm bg-[#2563EB] text-white rounded-md font-medium">1</button>
              <button className="px-3 py-1 text-sm text-[#94A3B8] font-medium">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Register / Edit Modal */}
      {(isRegisterModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-[#E2E8F0]">
              <h2 className="text-xl font-bold text-[#0F172A]">
                {isEditModalOpen ? "Edit Institution Details" : "Register New Institution"}
              </h2>
              <button onClick={() => { setIsRegisterModalOpen(false); setIsEditModalOpen(false); }} className="text-[#94A3B8] hover:text-[#0F172A]">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="institutionForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1">Institution Name</label>
                    <input
                      required
                      type="text"
                      className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#2563EB] text-[#0F172A]"
                      placeholder="e.g. Oxford Technical Institute"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-1">Official Email Address</label>
                      <input
                        required
                        type="email"
                        className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#2563EB] text-[#0F172A]"
                        placeholder="e.g. admin@oxford.edu"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-1">Location</label>
                      <input
                        type="text"
                        className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#2563EB] text-[#0F172A]"
                        placeholder="e.g. London, UK"
                        value={formData.location || formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value, address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-semibold text-[#0F172A]">Point of Contacts</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#94A3B8]">Max 03 point of contacts only</span>
                      <button
                        type="button"
                        onClick={handleAddContact}
                        disabled={(formData.contacts?.length || 0) >= 3}
                        className="bg-[#2563EB] text-white p-1 rounded-full disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.contacts?.map((contact, index) => (
                      <div key={index} className="border border-[#E2E8F0] rounded-xl p-4 bg-white relative">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveContact(index)}
                            className="absolute right-4 top-4 text-[#94A3B8] hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-[#64748B] mb-1 tracking-wider">Name</label>
                            <input
                              required
                              type="text"
                              className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                              placeholder="e.g. Dr. Helena Vance"
                              value={contact.name}
                              onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-[#64748B] mb-1 tracking-wider">Role</label>
                            <input
                              type="text"
                              className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                              placeholder="e.g. Director"
                              value={contact.role || contact.designation || ""}
                              onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-[#64748B] mb-1 tracking-wider">Email</label>
                            <input
                              required
                              type="email"
                              className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                              placeholder="e.g. helena@oxford.edu"
                              value={contact.email}
                              onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-[#64748B] mb-1 tracking-wider">Phone</label>
                            <input
                              required
                              type="text"
                              className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                              placeholder="e.g. +44 20 7946 0958"
                              value={contact.phone}
                              onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-[#E2E8F0] flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => { setIsRegisterModalOpen(false); setIsEditModalOpen(false); }}
                className="px-5 py-2.5 text-[#64748B] font-semibold hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="institutionForm"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-5 py-2.5 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isEditModalOpen ? "Update Institution" : "Register Institution"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[400px] p-6 text-center animate-in fade-in zoom-in-95">
            <div className="flex justify-end">
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-[#94A3B8] hover:text-[#0F172A]">
                <X size={20} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mt-2 mb-4">Confirm Delete</h2>
            <p className="text-[#64748B] mb-6">
              Are you sure you want to delete institution <span className="font-bold text-[#0F172A]">{selectedInstitution?.name}</span>?
            </p>
            
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-sm text-[#64748B] text-left mb-6 flex items-start gap-3">
               <input type="radio" className="mt-1" />
               <span>Is the Institution associated with any active batches or students?</span>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 text-[#64748B] font-semibold hover:bg-gray-100 rounded-lg transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-6 py-2.5 bg-[#EF4444] text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
