"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isEmpty, isValidEmail, isValidPhone, hasMinLength, inputErrorClass, errorTextClass } from "@/lib/validation";

export default function AddTutorPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    domains: "",
    tags: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, form[name as keyof typeof form]);
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "name":
        if (isEmpty(value)) error = "Full name is required";
        else if (!hasMinLength(value, 2)) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (isEmpty(value)) error = "Email address is required";
        else if (!isValidEmail(value)) error = "Please enter a valid email address";
        break;
      case "phone":
        if (isEmpty(value)) error = "Contact number is required";
        else if (!isValidPhone(value)) error = "Please enter a valid phone number (10+ digits)";
        break;
      case "password":
        if (isEmpty(value)) error = "Password is required";
        else if (!hasMinLength(value, 6)) error = "Password must be at least 6 characters";
        break;
      case "domains":
        if (isEmpty(value)) error = "At least one domain is required";
        break;
    }

    setErrors((prev) => {
      if (error) return { ...prev, [name]: error };
      const next = { ...prev };
      delete next[name];
      return next;
    });

    return error;
  };

  const validateAll = (): boolean => {
    const fields = ["name", "email", "phone", "password", "domains"];
    const allTouched: Record<string, boolean> = {};
    let hasError = false;

    for (const field of fields) {
      allTouched[field] = true;
      const error = validateField(field, form[field as keyof typeof form]);
      if (error) hasError = true;
    }

    setTouched((prev) => ({ ...prev, ...allTouched }));
    return !hasError;
  };

  const handleSubmit = () => {
    if (!validateAll()) return;

    console.log("Tutor Added:", form);
    router.push("/admin/tutors");
  };

  const getInputClass = (field: string) => {
    const base = "border p-2 rounded-lg text-gray-900 transition-all duration-200";
    return touched[field] && errors[field] ? `${base} ${inputErrorClass}` : base;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-sm">

      {/* MODAL */}
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-6">

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Register New Tutor
        </h2>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-4">

          <div>
            <input
              name="name"
              placeholder="Full Name *"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass("name") + " w-full"}
            />
            {touched.name && errors.name && (
              <p className={errorTextClass}>
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <input
              name="email"
              placeholder="Email Address *"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass("email") + " w-full"}
            />
            {touched.email && errors.email && (
              <p className={errorTextClass}>
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <input
              name="phone"
              placeholder="Contact Number *"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass("phone") + " w-full"}
            />
            {touched.phone && errors.phone && (
              <p className={errorTextClass}>
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password *"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass("password") + " w-full"}
            />
            {touched.password && errors.password && (
              <p className={errorTextClass}>
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {errors.password}
              </p>
            )}
          </div>

        </div>

        {/* DOMAIN */}
        <div className="mt-4">
          <label className="text-sm text-gray-700">Domains *</label>
          <input
            name="domains"
            placeholder="e.g. React, Java"
            value={form.domains}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass("domains") + " w-full mt-1"}
          />
          {touched.domains && errors.domains && (
            <p className={errorTextClass}>
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              {errors.domains}
            </p>
          )}
        </div>

        {/* TAGS */}
        <div className="mt-4">
          <label className="text-sm text-gray-700">Tags</label>
          <input
            name="tags"
            placeholder="e.g. Frontend, Backend"
            value={form.tags}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg mt-1 text-gray-900"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={() => router.push("/admin/tutors")}
            className="px-4 py-2 text-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Register Tutor
          </button>

        </div>

      </div>
    </div>
  );
}
