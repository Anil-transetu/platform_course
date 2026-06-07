"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { isEmpty, isValidEmail, isValidPhone, inputErrorClass, errorTextClass } from "@/lib/validation";

interface EditFormProps {
  id: string;
}

export default function EditForm({ id }: EditFormProps) {
  const router = useRouter();
  const tutorId = id;

  const [tutor, setTutor] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    domain: [] as string[],
    batches: [] as string[],
    status: "Active"
  });

  const [domainInput, setDomainInput] = useState("");
  const [batchInput, setBatchInput] = useState("");

  /* LOAD TUTOR DATA */
  useEffect(() => {
    const storedTutors = JSON.parse(localStorage.getItem("tutors") || "[]");
    const found = storedTutors.find((t: Record<string, unknown>) => t.id == tutorId);
    if (found) {
      setTutor(found as typeof tutor);
    }
  }, [tutorId]);

  /* HANDLE INPUT */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTutor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.currentTarget;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, tutor[name as keyof typeof tutor] as string);
  };

  const validateField = (name: string, value: string): string => {
    let error = "";
    switch (name) {
      case "name":
        if (isEmpty(value)) error = "Full name is required";
        break;
      case "email":
        if (isEmpty(value)) error = "Email is required";
        else if (!isValidEmail(value)) error = "Invalid email format";
        break;
      case "phone":
        if (isEmpty(value)) error = "Phone is required";
        else if (!isValidPhone(value)) error = "Invalid phone number";
        break;
    }
    setErrors(prev => {
      if (error) return { ...prev, [name]: error };
      const n = { ...prev }; delete n[name]; return n;
    });
    return error;
  };

  const validateAll = (): boolean => {
    const fields = ["name", "email", "phone"];
    const allTouched: Record<string, boolean> = {};
    let hasError = false;
    for (const field of fields) {
      allTouched[field] = true;
      if (validateField(field, tutor[field as keyof typeof tutor] as string)) hasError = true;
    }
    setTouched(prev => ({ ...prev, ...allTouched }));
    return !hasError;
  };

  const getInputClass = (field: string) => {
    const base = "border rounded-lg w-full px-3 py-2 text-foreground transition-all duration-200";
    return touched[field] && errors[field] ? `${base} ${inputErrorClass}` : base;
  };

  const ErrorMsg = ({ field }: { field: string }) => {
    if (!touched[field] || !errors[field]) return null;
    return (
      <p className={errorTextClass}>
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        {errors[field]}
      </p>
    );
  };

  const addDomain = () => {
    if (domainInput.trim() && !tutor.domain.includes(domainInput.trim())) {
      setTutor(prev => ({
        ...prev,
        domain: [...prev.domain, domainInput.trim()]
      }));
      setDomainInput("");
    }
  };

  const removeDomain = (domainToRemove: string) => {
    setTutor(prev => ({
      ...prev,
      domain: prev.domain.filter(d => d !== domainToRemove)
    }));
  };

  const addBatch = () => {
    if (batchInput.trim() && !tutor.batches.includes(batchInput.trim())) {
      setTutor(prev => ({
        ...prev,
        batches: [...prev.batches, batchInput.trim()]
      }));
      setBatchInput("");
    }
  };

  const removeBatch = (batchToRemove: string) => {
    setTutor(prev => ({
      ...prev,
      batches: prev.batches.filter(b => b !== batchToRemove)
    }));
  };

  const updateTutor = () => {
    if (!validateAll()) return;

    const storedTutors = JSON.parse(localStorage.getItem("tutors") || "[]");
    const updatedTutors = storedTutors.map((t: Record<string, unknown>) => {
      if (t.id == tutorId) return tutor;
      return t;
    });
    localStorage.setItem("tutors", JSON.stringify(updatedTutors));
    alert("Tutor updated successfully!");
    router.push("/admin/tutors");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="relative bg-card rounded-xl shadow-lg w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => router.push("/admin/tutors")}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-foreground mb-6">
          Edit Tutor
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-card-foreground">Tutor ID</label>
            <input
              type="text"
              name="id"
              value={tutor.id}
              disabled
              className="border rounded-lg w-full px-3 py-2 bg-gray-100 text-card-foreground"
            />
          </div>

          <div>
            <label className="text-sm text-card-foreground">Full Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="name"
              value={tutor.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass("name")}
            />
            <ErrorMsg field="name" />
          </div>

          <div>
            <label className="text-sm text-card-foreground">Email <span className="text-red-400">*</span></label>
            <input
              type="email"
              name="email"
              value={tutor.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass("email")}
            />
            <ErrorMsg field="email" />
          </div>

          <div>
            <label className="text-sm text-card-foreground">Phone <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="phone"
              value={tutor.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass("phone")}
            />
            <ErrorMsg field="phone" />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-card-foreground">Domain</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Add domain"
                className="border rounded-lg flex-1 px-3 py-2 text-foreground"
                onKeyPress={(e) => e.key === 'Enter' && addDomain()}
              />
              <button
                onClick={addDomain}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tutor.domain.map((d, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {d}
                  <button
                    onClick={() => removeDomain(d)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="text-sm text-card-foreground">Batches</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="Add batch"
                className="border rounded-lg flex-1 px-3 py-2 text-foreground"
                onKeyPress={(e) => e.key === 'Enter' && addBatch()}
              />
              <button
                onClick={addBatch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tutor.batches.map((b, i) => (
                <span
                  key={i}
                  className="bg-gray-200 text-card-foreground px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {b}
                  <button
                    onClick={() => removeBatch(b)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-card-foreground">Status</label>
            <select
              name="status"
              value={tutor.status}
              onChange={handleChange}
              className="border rounded-lg w-full px-3 py-2 text-foreground"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => router.push("/admin/tutors")}
            className="border px-5 py-2 rounded-lg text-card-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={updateTutor}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Update Tutor
          </button>
        </div>
      </div>
    </div>
  );
}
