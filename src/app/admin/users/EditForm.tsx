"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { fetchUserById, updateUser, User } from "@/features/admin/users/api/user-api";
import { isEmpty, isValidEmail, inputErrorClass, errorTextClass } from "@/lib/validation";

interface EditFormProps {
  id: string;
}

export default function EditForm({ id }: EditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    institution: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsFetching(true);
        const data = await fetchUserById(id);
        setUser(data);
        
        let role = data.role || "";
        const lowerRole = role.toLowerCase();
        if (lowerRole.includes("institution rep")) {
          role = "Institution Representative";
        } else if (lowerRole === "admin") {
          role = "Admin";
        } else if (lowerRole === "tutor") {
          role = "Tutor";
        }

        setFormData({
          name: data.full_name || data.name || "",
          email: data.email || "",
          password: "",
          role: role,
          institution: data.institution || ""
        });
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      } finally {
        setIsFetching(false);
      }
    };
    loadUser();
  }, [id]);

  const validateField = (field: string, value: string): string => {
    let error = "";
    if (field === "name" && isEmpty(value)) error = "Name is required";
    if (field === "email") {
      if (isEmpty(value)) error = "Email is required";
      else if (!isValidEmail(value)) error = "Invalid email format";
    }
    if (field === "role" && isEmpty(value)) error = "Role is required";
    
    setErrors(prev => {
      if (error) return { ...prev, [field]: error };
      const n = { ...prev }; delete n[field]; return n;
    });
    return error;
  };

  const handleValidation = () => {
    const fields = ["name", "email", "role", "institution"];
    let hasError = false;
    fields.forEach(f => {
      setTouched(prev => ({ ...prev, [f]: true }));
      if (validateField(f, formData[f as keyof typeof formData])) hasError = true;
    });
    return !hasError;
  };

  const handleEditSubmit = async () => {
    if (handleValidation() && user) {
      setIsLoading(true);
      try {
        let apiRole = formData.role.toLowerCase();
        if (apiRole.includes("institution representative")) {
          apiRole = "institution_rep";
        }
        
        const payload: Record<string, unknown> = {
          full_name: formData.name,
          name: formData.name,
          email: formData.email,
          role: apiRole,
          institution: (formData.institution === "N/A" || !formData.institution) ? "" : formData.institution
        };

        if (formData.password && formData.password.trim() !== "") {
          payload.password = formData.password;
        }

        await updateUser(id, payload);
        alert("User updated successfully!");
        router.push("/admin/users");
      } catch (error: unknown) {
        console.error("Update user error details:", error);
        const message = error instanceof Error ? error.message : "Failed to update user";
        alert(`Error: ${message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    router.push("/admin/users");
  };

  if (isFetching) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 font-medium">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 pt-0 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text" value={formData.name}
              onChange={(e) => { setFormData(p => ({ ...p, name: e.target.value })); if(errors.name){setErrors(p=>{const n={...p};delete n.name;return n;})} }}
              onBlur={() => {setTouched(p => ({...p, name: true})); validateField("name", formData.name);}}
              className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${touched.name && errors.name ? inputErrorClass : "border-gray-200"}`}
            />
            {touched.name && errors.name && <p className={errorTextClass}>{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email" value={formData.email}
              onChange={(e) => { setFormData(p => ({ ...p, email: e.target.value })); if(errors.email){setErrors(p=>{const n={...p};delete n.email;return n;})} }}
              onBlur={() => {setTouched(p => ({...p, email: true})); validateField("email", formData.email);}}
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
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none pr-10 border-gray-200 focus:ring-2 focus:ring-blue-100"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Leave blank to keep current password</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Role <span className="text-red-500">*</span></label>
            <select
              value={formData.role}
              onChange={(e) => { setFormData(p => ({ ...p, role: e.target.value })); if(errors.role){setErrors(p=>{const n={...p};delete n.role;return n;})} }}
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">Institution</label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => { setFormData(p => ({ ...p, institution: e.target.value })); }}
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none border-gray-200 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter institution name"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button onClick={handleClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
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
  );
}
