"use client";

import { useState } from "react";
import Link from "next/link";
import { isEmpty, inputErrorClass, errorTextClass } from "@/lib/validation";

export default function CreateBatchPage() {

  const [batchName, setBatchName] = useState("");
  const [institution, setInstitution] = useState("");
  const [course, setCourse] = useState("");
  const [instructor, setInstructor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");



  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState("");
  console.log(formError); // Use formError to avoid unused warning



  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const validateField = (field: string, value: string): string => {
    let error = "";

    switch (field) {
      case "batchName":
        if (isEmpty(value)) error = "Batch name is required";
        break;
      case "institution":
        if (value === "" || value === "Select Institution") error = "Please select an institution";
        break;
      case "course":
        if (value === "" || value === "Select Course") error = "Please select a course";
        break;
      case "instructor":
        if (isEmpty(value)) error = "Instructor is required";
        break;
      case "startDate":
        if (isEmpty(value)) error = "Start date is required";
        break;
      case "endDate":
        if (isEmpty(value)) error = "End date is required";
        else if (startDate && value < startDate) error = "End date must be after start date";
        break;
    }

    setErrors((prev) => {
      if (error) return { ...prev, [field]: error };
      const next = { ...prev };
      delete next[field];
      return next;
    });

    return error;
  };

  const validateAll = (): boolean => {
    const validations: [string, string][] = [
      ["batchName", batchName],
      ["institution", institution],
      ["course", course],
      ["instructor", instructor],
      ["startDate", startDate],
      ["endDate", endDate],
    ];

    const allTouched: Record<string, boolean> = {};
    let hasError = false;

    for (const [field, value] of validations) {
      allTouched[field] = true;
      const error = validateField(field, value);
      if (error) hasError = true;
    }

    setTouched((prev) => ({ ...prev, ...allTouched }));
    return !hasError;
  };

  const handleSubmit = () => {
    setFormError("");
    if (!validateAll()) {
      setFormError("Please fix the errors above before creating the batch.");
      return;
    }
    // Submit logic here
    console.log("Batch created:", { batchName, institution, course, instructor, startDate, endDate });

  };

  const getInputClass = (field: string) => {
    const base = "w-full mt-1 border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";
    return touched[field] && errors[field] ? `${base} ${inputErrorClass}` : base;
  };

  const getSelectClass = (field: string) => {
    const base = "w-full mt-1 border rounded-lg p-3 text-gray-800 transition-all duration-200";
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

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">

      <div className="bg-white w-[850px] rounded-xl shadow-xl p-8">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-semibold text-gray-800">
            Create New Batch
          </h2>

          <Link
            href="/admin/batches"
            className="text-gray-700 hover:text-gray-700 text-xl"
          >
            ✕
          </Link>

        </div>


        {/* FORM */}

        <div className="space-y-5">

          {/* BATCH NAME */}

          <div>
            <label className="text-sm text-gray-600 font-medium">
              Batch Name <span className="text-red-400">*</span>
            </label>

            <input
              type="text"
              placeholder="e.g. Computer Science - 2024 - Section A"
              value={batchName}
              onChange={(e)=>setBatchName(e.target.value)}
              onBlur={() => handleBlur("batchName", batchName)}
              className={getInputClass("batchName")}
            />
            <ErrorMsg field="batchName" />
          </div>


          {/* SELECT ROW */}

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Select Institution <span className="text-red-400">*</span>
              </label>

              <select
                value={institution}
                onChange={(e) => { setInstitution(e.target.value); if (errors.institution) { setErrors(prev => { const n = {...prev}; delete n.institution; return n; }); } }}
                onBlur={() => handleBlur("institution", institution)}
                className={getSelectClass("institution")}
              >
                <option value="">Select Institution</option>
                <option>ABC University</option>
                <option>XYZ College</option>
              </select>
              <ErrorMsg field="institution" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Select Course <span className="text-red-400">*</span>
              </label>

              <select
                value={course}
                onChange={(e) => { setCourse(e.target.value); if (errors.course) { setErrors(prev => { const n = {...prev}; delete n.course; return n; }); } }}
                onBlur={() => handleBlur("course", course)}
                className={getSelectClass("course")}
              >
                <option value="">Select Course</option>
                <option>Computer Science</option>
                <option>Data Science</option>
              </select>
              <ErrorMsg field="course" />
            </div>

          </div>


          {/* INSTRUCTOR + STUDENTS */}

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Instructor <span className="text-red-400">*</span>
              </label>

              <input
                type="text"
                placeholder="Search and select instructor..."
                value={instructor}
                onChange={(e) => { setInstructor(e.target.value); if (errors.instructor) { setErrors(prev => { const n = {...prev}; delete n.instructor; return n; }); } }}
                onBlur={() => handleBlur("instructor", instructor)}
                className={getInputClass("instructor")}
              />
              <ErrorMsg field="instructor" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Enroll Students
              </label>

              <input
                type="text"
                placeholder="Search by name or ID..."
                className="w-full mt-1 border rounded-lg p-3 text-gray-800"
              />
            </div>

          </div>


          {/* DATE ROW */}

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Start Date <span className="text-red-400">*</span>
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); if (errors.startDate) { setErrors(prev => { const n = {...prev}; delete n.startDate; return n; }); } }}
                onBlur={() => handleBlur("startDate", startDate)}
                className={getInputClass("startDate")}
              />
              <ErrorMsg field="startDate" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                End Date <span className="text-red-400">*</span>
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); if (errors.endDate) { setErrors(prev => { const n = {...prev}; delete n.endDate; return n; }); } }}
                onBlur={() => handleBlur("endDate", endDate)}
                className={getInputClass("endDate")}
              />
              <ErrorMsg field="endDate" />
            </div>

          </div>





          {/* FORM ERROR */}
          {formError && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              {formError}
            </p>
          )}

          {/* FOOTER BUTTONS */}

          <div className="flex justify-end gap-3 pt-4">

            <Link
              href="/admin/batches"
              className="px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Link>

            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Batch
            </button>

          </div>

        </div>

      </div>

    </div>

  );
}
