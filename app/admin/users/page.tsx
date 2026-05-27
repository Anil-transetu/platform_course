"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { X, Pencil, Trash2, Eye, EyeOff, Loader2, Plus, Search, MoreVertical } from "lucide-react";
import { isEmpty, isValidEmail, inputErrorClass, errorTextClass } from "@/lib/validation";
import { createUser, fetchUsers, deleteUser, updateUser, fetchUserById, User, fetchAdminCount, fetchRepresentativeCount, fetchInstitutionCount } from "@/features/users/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string;
  joinedDate: string;
  avatar: string;
  status: string;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"accepted" | "pending">("accepted");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [adminCount, setAdminCount] = useState<number | string>("...");
  const [representativeCount, setRepresentativeCount] = useState<number | string>("...");
  const [institutionCount, setInstitutionCount] = useState<number | string>("...");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "", institution: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsFetching(true);
    try {
      // Fetch users, admin count, representative count and institution count in parallel
      const [result, count, repCount, instCount] = await Promise.all([
        fetchUsers(),
        fetchAdminCount().catch(err => {
          console.error("Admin count fetch failed:", err);
          return 0; // Fallback to 0
        }),
        fetchRepresentativeCount().catch(err => {
          console.error("Representative count fetch failed:", err);
          return 0; // Fallback to 0
        }),
        fetchInstitutionCount().catch(err => {
          console.error("Institution count fetch failed:", err);
          return 0; // Fallback to 0
        })
      ]);
      
      console.log("Raw API response:", result);
      console.log("Admin count:", count);
      console.log("Representative count:", repCount);
      console.log("Institution count:", instCount);
      setAdminCount(count);
      setRepresentativeCount(repCount);
      setInstitutionCount(instCount);
      
      // Handle different possible response structures
      const usersArray = Array.isArray(result) ? result : ((result as Record<string, unknown>)?.data || (result as Record<string, unknown>)?.users || []);
      
      if (Array.isArray(usersArray)) {
        const mappedUsers = usersArray.map((u: User) => {
          let status = u.status;
          if (!status) {
            const idStr = u.id?.toString() || "";
            status = idStr.startsWith("REQ-") ? "pending" : "active";
          }

          // Normalize role for UI dropdown matching
          let role = u.role || "N/A";
          const lowerRole = role.toLowerCase();
          if (lowerRole.includes("institution rep")) {
            role = "Institution Representative";
          } else if (lowerRole === "admin") {
            role = "Admin";
          } else if (lowerRole === "tutor") {
            role = "Tutor";
          }

          return {
            id: u.id?.toString() || "N/A",
            name: u.full_name || u.name || "N/A",
            email: u.email || "N/A",
            role: role,
            institution: u.institution || "N/A",
            joinedDate: u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A",
            avatar: `https://i.pravatar.cc/150?u=${u.id}`,
            status: status
          };
        });
        console.log("Mapped users for UI:", mappedUsers);
        setUsers(mappedUsers);
      } else {
        console.warn("API returned non-array data for users:", result);
        setUsers([]);
      }
    } catch (error: unknown) {
      console.error("Error loading users:", error);
      setUsers([]);
    } finally {
      setIsFetching(false);
    }
  };

  const validateField = (field: string, value: string, isEdit = false): string => {
    let error = "";
    if (field === "name" && isEmpty(value)) error = "Name is required";
    if (field === "email") {
      if (isEmpty(value)) error = "Email is required";
      else if (!isValidEmail(value)) error = "Invalid email format";
    }
    if (field === "password" && !isEdit && isEmpty(value)) error = "Password is required";
    if (field === "role" && isEmpty(value)) error = "Role is required";
    if (field === "institution" && isEmpty(value) && !isEdit) error = "Institution is required";
    // For edit, we allow empty institution if it's N/A or admin
    if (field === "institution" && isEdit && isEmpty(value)) {
       // Only require if not admin (but UI shows N/A anyway)
    }
    
    setErrors(prev => {
      if (error) return { ...prev, [field]: error };
      const n = { ...prev }; delete n[field]; return n;
    });
    return error;
  };

  const handleValidation = (isEdit = false) => {
    const fields = ["name", "email", "password", "role", "institution"];
    const allTouched: Record<string, boolean> = {};
    let hasError = false;
    fields.forEach(f => {
      allTouched[f] = true;
      if (validateField(f, formData[f as keyof typeof formData], isEdit)) hasError = true;
    });
    setTouched(prev => ({ ...prev, ...allTouched }));
    return !hasError;
  };

  const handleCreateSubmit = async () => {
    if (handleValidation(false)) {
      setIsLoading(true);
      try {
        // Map the role back to what the backend expects (lowercase)
        let apiRole = formData.role.toLowerCase();
        if (apiRole.includes("institution representative")) {
          apiRole = "institution_rep";
        }
        
        const payload: Record<string, unknown> = {
          full_name: formData.name,
          name: formData.name, // Send both to be safe
          email: formData.email,
          password: formData.password,
          role: apiRole,
          institution: (formData.institution === "N/A" || !formData.institution) ? "" : formData.institution
        };

        // Clean payload: remove undefined values
        Object.keys(payload).forEach(key => {
          if (payload[key] === undefined) {
            delete payload[key];
          }
        });

        console.log("Creating user with payload:", payload);
        await createUser(payload as Record<string, unknown>);
        setIsCreateModalOpen(false);
        loadUsers(); // Refresh the list
        alert("User created successfully!");
      } catch (error: unknown) {
        console.error("Create user error details:", error);
        const message = error instanceof Error ? error.message : "Failed to create user";
        alert(`Error: ${message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (handleValidation(true) && editUser) {
      setIsLoading(true);
      try {
        // Map the role back to what the backend expects (lowercase)
        let apiRole = formData.role.toLowerCase();
        if (apiRole.includes("institution representative")) {
          apiRole = "institution_rep";
        }
        
        // ONLY send fields that the backend expects for an update
        // Using PUT as required by the backend. 
        // We align with create payload structure to avoid 400 errors.
        const payload: Record<string, unknown> = {
          full_name: formData.name,
          name: formData.name, // Include both for compatibility
          email: formData.email,
          role: apiRole,
          institution: (formData.institution === "N/A" || !formData.institution) ? "" : formData.institution
        };

        // Only add password if changed and not empty
        if (formData.password && formData.password.trim() !== "") {
          payload.password = formData.password;
        }

        // Clean payload: remove undefined values
        Object.keys(payload).forEach(key => {
          if (payload[key] === undefined) {
            delete payload[key];
          }
        });

        console.log("Updating user (PUT):", editUser.id, "with payload:", payload);

        await updateUser(editUser.id, payload as Record<string, unknown>);
        setEditUser(null);
        loadUsers(); // Refresh the list
        alert("User updated successfully!");
      } catch (error: unknown) {
        console.error("Update user error details:", error);
        const message = error instanceof Error ? error.message : "Failed to update user";
        alert(`Error: ${message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteSubmit = async () => {
    if (userToDelete) {
      setIsLoading(true);
      try {
        await deleteUser(userToDelete.id);
        setUserToDelete(null);
        loadUsers(); // Refresh the list
        alert("User deleted successfully!");
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to delete user";
        alert(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleViewUser = async (id: string) => {
    setIsViewing(true);
    setIsViewModalOpen(true);
    try {
      const data = await fetchUserById(id);
      setViewUser(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch user details";
      alert(message);
      setIsViewModalOpen(false);
    } finally {
      setIsViewing(false);
    }
  };

  const roles = ["All Roles", "Admin", "Institution Representative", "Tutor"];
  const currentData = users; // Use real data from API

  const filtered = currentData.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Roles are already normalized in loadUsers
    const matchesRole = roleFilter === "All Roles" || u.role === roleFilter;

    // Filter by tab status
    const matchesTab = activeTab === "accepted" ? u.status === "active" : u.status === "pending";

    return matchesSearch && matchesRole && matchesTab;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage;
  const data = filtered.slice(start, start + rowsPerPage);

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900 w-full relative">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
            User Management <span className="text-[10px] font-normal text-gray-300">v1.1</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Oversee administrators and institution representatives
          </p>
        </div>

        <button 
          onClick={() => { setFormData({ name: "", email: "", password: "", role: "Institution Representative", institution: "" }); setErrors({}); setTouched({}); setIsCreateModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New User
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1 flex items-center gap-1">Total Admins <span className="w-3 h-3 text-gray-300 border border-current rounded-full inline-flex items-center justify-center text-[8px]">i</span></p>
            <h2 className="text-3xl font-bold">{adminCount}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1 flex items-center gap-1">Institution Representatives <span className="w-3 h-3 text-gray-300 border border-current rounded-full inline-flex items-center justify-center text-[8px]">i</span></p>
            <h2 className="text-3xl font-bold">{representativeCount}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1 flex items-center gap-1">Total Institutions <span className="w-3 h-3 text-gray-300 border border-current rounded-full inline-flex items-center justify-center text-[8px]">i</span></p>
            <h2 className="text-3xl font-bold">{institutionCount}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* TABS & FILTERS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          
          <div className="flex items-center gap-6 border-b border-gray-200">
            <button
              onClick={() => { setActiveTab("accepted"); setCurrentPage(1); }}
              className={`pb-2.5 font-medium text-sm transition-colors border-b-2
                ${activeTab === "accepted" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}
              `}
            >
              Accepted Requests
            </button>
            <button
              onClick={() => { setActiveTab("pending"); setCurrentPage(1); }}
              className={`pb-2.5 font-medium text-sm transition-colors border-b-2
                ${activeTab === "pending" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}
              `}
            >
              Pending
            </button>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                placeholder="Search by name, email, or User ID..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">Role:</span>
              <select
                value={roleFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border border-gray-200 text-sm rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              >
                {roles.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto min-h-[300px] relative">
          {isFetching && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
               <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="pb-4 px-4 font-semibold text-xs tracking-wider uppercase">USER ID</th>
                <th className="pb-4 px-4 font-semibold text-xs tracking-wider uppercase">USER</th>
                <th className="pb-4 px-4 font-semibold text-xs tracking-wider uppercase">ROLE</th>
                <th className="pb-4 px-4 font-semibold text-xs tracking-wider uppercase">
                  {activeTab === "accepted" ? "JOINED DATE" : "REQUESTED DATE"}
                </th>
                <th className="pb-4 px-4 font-semibold text-xs tracking-wider uppercase text-center w-24">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-4 text-gray-500 font-medium">{u.id}</td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-gray-400 text-xs">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-gray-700 font-medium">{u.role}</td>

                  <td className="py-4 px-4 text-gray-500">
                    {activeTab === "pending" ? `Requested: ${u.joinedDate}` : u.joinedDate}
                  </td>

                  {/* ACTION */}
                  <td className="py-4 px-4 text-center relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>

                    {openMenu === u.id && (
                      <div className="absolute right-6 top-10 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg w-32 py-1 z-10 animate-in fade-in zoom-in-95 duration-100 block">
                         {activeTab === "pending" ? (
                           <>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                onClick={() => setOpenMenu(null)}
                              >
                                Accept
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={() => setOpenMenu(null)}
                              >
                                Reject
                              </button>
                           </>
                         ) : (
                           <>
                              <button
                                onClick={() => {
                                  handleViewUser(u.id);
                                  setOpenMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye size={14} className="text-gray-500" /> View Details
                              </button>
                              <button
                                onClick={async () => {
                                  setOpenMenu(null);
                                  setIsLoading(true);
                                  try {
                                    const fullUser = await fetchUserById(u.id);
                                    setFormData({ 
                                      name: fullUser.full_name || fullUser.name || u.name, 
                                      email: fullUser.email || u.email, 
                                      password: "", 
                                      role: u.role, 
                                      institution: fullUser.institution || u.institution 
                                    });
                                    setErrors({}); 
                                    setTouched({}); 
                                    setEditUser(u);
                                  } catch {
                                    alert("Failed to fetch user details for editing");
                                  } finally {
                                    setIsLoading(false);
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Pencil size={14} className="text-gray-500" /> Edit
                              </button>
                              <button
                                onClick={() => { setUserToDelete(u); setOpenMenu(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} className="text-red-500" /> Delete
                              </button>
                           </>
                         )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-8 text-center text-gray-500">
                      No users found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
               value={rowsPerPage}
               onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                 setRowsPerPage(Number(e.target.value));
                 setCurrentPage(1);
               }}
               className="border border-gray-200 rounded px-2 py-1 bg-transparent"
             >
               <option>5</option>
               <option>10</option>
               <option>20</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
               onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
               disabled={currentPage === 1}
               className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
            >
               Previous
            </button>
            <div className="flex items-center gap-1">
               {Array.from({ length: totalPages }).map((_, idx) => {
                 const p = idx + 1;
                 return (
                   <button
                     key={p}
                     onClick={() => setCurrentPage(p)}
                     className={`w-7 h-7 rounded flex items-center justify-center font-medium transition-colors ${
                       currentPage === p
                         ? "bg-blue-600 text-white"
                         : "text-gray-600 hover:bg-gray-100"
                     }`}
                   >
                     {p}
                   </button>
                 );
               })}
            </div>
            <button
               onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
               disabled={currentPage >= totalPages}
               className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
            >
               Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text" value={formData.name}
                  onChange={(e) => { setFormData(p => ({ ...p, name: e.target.value })); if(errors.name){setErrors(p=>{const n={...p};delete n.name;return n;})} }}
                  onBlur={() => {setTouched(p => ({...p, name: true})); validateField("name", formData.name, false);}}
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${touched.name && errors.name ? inputErrorClass : "border-gray-200"}`}
                  placeholder="e.g. John Doe"
                />
                {touched.name && errors.name && <p className={errorTextClass}>{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email" value={formData.email}
                  onChange={(e) => { setFormData(p => ({ ...p, email: e.target.value })); if(errors.email){setErrors(p=>{const n={...p};delete n.email;return n;})} }}
                  onBlur={() => {setTouched(p => ({...p, email: true})); validateField("email", formData.email, false);}}
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${touched.email && errors.email ? inputErrorClass : "border-gray-200"}`}
                  placeholder="john.doe@example.com"
                />
                {touched.email && errors.email && <p className={errorTextClass}>{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Initial Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} value={formData.password}
                    onChange={(e) => { setFormData(p => ({ ...p, password: e.target.value })); if(errors.password){setErrors(p=>{const n={...p};delete n.password;return n;})} }}
                    onBlur={() => {setTouched(p => ({...p, password: true})); validateField("password", formData.password, false);}}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 pr-10 ${touched.password && errors.password ? inputErrorClass : "border-gray-200"}`}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {touched.password && errors.password && <p className={errorTextClass}>{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Role <span className="text-red-500">*</span></label>
                <select
                  value={formData.role}
                  onChange={(e) => { setFormData(p => ({ ...p, role: e.target.value })); if(errors.role){setErrors(p=>{const n={...p};delete n.role;return n;})} }}
                  onBlur={() => {setTouched(p => ({...p, role: true})); validateField("role", formData.role, false);}}
                  className={`w-full border bg-white rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${touched.role && errors.role ? inputErrorClass : "border-gray-200"}`}
                >
                  <option value="">Select a role...</option>
                  <option>Institution Representative</option>
                  <option>Admin</option>
                  <option>Tutor</option>
                </select>
                {touched.role && errors.role && <p className={errorTextClass}>{errors.role}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Institution <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => { setFormData(p => ({ ...p, institution: e.target.value })); if(errors.institution){setErrors(p=>{const n={...p};delete n.institution;return n;})} }}
                  onBlur={() => {setTouched(p => ({...p, institution: true})); validateField("institution", formData.institution, false);}}
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${touched.institution && errors.institution ? inputErrorClass : "border-gray-200"}`}
                  placeholder="Enter institution name"
                />
                {touched.institution && errors.institution && <p className={errorTextClass}>{errors.institution}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button 
                onClick={handleCreateSubmit} 
                disabled={isLoading}
                className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text" value={formData.name}
                  onChange={(e) => { setFormData(p => ({ ...p, name: e.target.value })); if(errors.name){setErrors(p=>{const n={...p};delete n.name;return n;})} }}
                  onBlur={() => {setTouched(p => ({...p, name: true})); validateField("name", formData.name, true);}}
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${touched.name && errors.name ? inputErrorClass : "border-gray-200"}`}
                />
                {touched.name && errors.name && <p className={errorTextClass}>{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email" value={formData.email}
                  onChange={(e) => { setFormData(p => ({ ...p, email: e.target.value })); if(errors.email){setErrors(p=>{const n={...p};delete n.email;return n;})} }}
                  onBlur={() => {setTouched(p => ({...p, email: true})); validateField("email", formData.email, true);}}
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${touched.email && errors.email ? inputErrorClass : "border-gray-200"}`}
                />
                {touched.email && errors.email && <p className={errorTextClass}>{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} value={formData.password}
                    onChange={(e) => { setFormData(p => ({ ...p, password: e.target.value })); if(errors.password){setErrors(p=>{const n={...p};delete n.password;return n;})} }}
                    onBlur={() => {setTouched(p => ({...p, password: true})); validateField("password", formData.password, true);}}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 pr-10 ${touched.password && errors.password ? inputErrorClass : "border-gray-200"}`}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Leave blank to keep current password</p>
                {touched.password && errors.password && <p className={errorTextClass}>{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Role <span className="text-red-500">*</span></label>
                <select
                  value={formData.role}
                  onChange={(e) => { setFormData(p => ({ ...p, role: e.target.value })); if(errors.role){setErrors(p=>{const n={...p};delete n.role;return n;})} }}
                  onBlur={() => {setTouched(p => ({...p, role: true})); validateField("role", formData.role, true);}}
                  className={`w-full border bg-white rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${touched.role && errors.role ? inputErrorClass : "border-gray-200"}`}
                >
                  <option value="">Select a role...</option>
                  <option>Institution Representative</option>
                  <option>Admin</option>
                  <option>Tutor</option>
                </select>
                {touched.role && errors.role && <p className={errorTextClass}>{errors.role}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Institution <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => { setFormData(p => ({ ...p, institution: e.target.value })); if(errors.institution){setErrors(p=>{const n={...p};delete n.institution;return n;})} }}
                  onBlur={() => {setTouched(p => ({...p, institution: true})); validateField("institution", formData.institution, true);}}
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${touched.institution && errors.institution ? inputErrorClass : "border-gray-200"}`}
                  placeholder="Enter institution name"
                />
                {touched.institution && errors.institution && <p className={errorTextClass}>{errors.institution}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <button onClick={() => setEditUser(null)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button 
                onClick={handleEditSubmit} 
                disabled={isLoading}
                className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button onClick={() => setUserToDelete(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-gray-600">Are you sure you want to delete user {userToDelete.name}?</p>
            </div>
            <div className="flex justify-center gap-3 p-6 pt-0">
              <button onClick={() => setUserToDelete(null)} className="px-6 py-2 border border-gray-200 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteSubmit} className="px-6 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm transition-colors flex items-center gap-2">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* VIEW USER MODAL */}
      {isViewModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {isViewing ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-500">Fetching user details...</p>
                </div>
              ) : viewUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
                    <div className="relative w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-50">
                      <span className="text-2xl font-bold text-blue-600">
                        {(viewUser.full_name || viewUser.name || "N").charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{viewUser.full_name || viewUser.name || "N/A"}</h3>
                      <p className="text-sm text-gray-500">{viewUser.role}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-gray-900 font-medium">{viewUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">User ID</p>
                      <p className="text-gray-900 font-medium">{viewUser.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Institution</p>
                      <p className="text-gray-900 font-medium">{viewUser.institution || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Created At</p>
                      <p className="text-gray-900 font-medium">
                        {viewUser.created_at ? new Date(viewUser.created_at).toLocaleString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        viewUser.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {viewUser.status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No user data found.</p>
              )}
            </div>
            <div className="p-6 pt-0 flex justify-end">
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="px-6 py-2 bg-gray-100 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
