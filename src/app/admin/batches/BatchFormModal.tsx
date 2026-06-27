"use client";
import React, { useEffect, useState, useRef } from "react";
import { Batch } from "@/types/batch";
import { Modal } from "@/components/ui/modal";
import { Search, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBatch, useUpdateBatch, useBatch, useCoursesLookup, useDomainsLookup } from "@/hooks/use-batches";
import InstitutionSelect from "../users/InstitutionSelect";
import { useTutors } from "@/features/admin/tutor/api/tutor-api";
import { useStudents } from "@/hooks/use-students";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  batch?: Batch | null;
}

export default function BatchFormModal({ open, onClose, mode, batch }: Props) {
  const [form, setForm] = useState({
    name: "",
    institution_id: "",
    tutor_id: "",
    course_id: "",
    domain_id: "",
    start_date: "",
    end_date: "",
    status: "active",
  });

  const [selectedStudents, setSelectedStudents] = useState<{ id: number; name: string }[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [instructorSearch, setInstructorSearch] = useState("");
  const [instructorDropdownOpen, setInstructorDropdownOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const tutorDropdownRef = useRef<HTMLDivElement>(null);
  const prevInstitutionIdRef = useRef(form.institution_id);

  // API hooks
  const { data: courses } = useCoursesLookup();
  const { data: domains } = useDomainsLookup();
  const { data: tutorsData } = useTutors(1, 100);
  const { data: studentsData } = useStudents(
    1,
    500,
    undefined,
    undefined,
    undefined,
    form.institution_id || undefined
  );
  const { data: fullBatch } = useBatch(open && mode === "edit" ? batch?.id || "" : "");

  const createMutation = useCreateBatch();
  const updateMutation = useUpdateBatch();

  const tutors = tutorsData?.data || (Array.isArray(tutorsData) ? tutorsData : []);
  const allStudents = form.institution_id
    ? (studentsData?.data || (Array.isArray(studentsData) ? studentsData : []))
    : [];

  // Click outside listener for student and tutor search dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (tutorDropdownRef.current && !tutorDropdownRef.current.contains(event.target as Node)) {
        setInstructorDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prepopulate form on open / mode change
  useEffect(() => {
    if (open) {
      const activeBatch = mode === "edit" ? (fullBatch || batch) : null;
      if (activeBatch) {
        setForm({
          name: activeBatch.name || "",
          institution_id: activeBatch.institution_id ? String(activeBatch.institution_id) : "",
          tutor_id: activeBatch.tutor_id ? String(activeBatch.tutor_id) : "",
          course_id: activeBatch.course_id ? String(activeBatch.course_id) : "",
          domain_id: activeBatch.domain_id ? String(activeBatch.domain_id) : "",
          start_date: activeBatch.start_date || "",
          end_date: activeBatch.end_date || "",
          status: activeBatch.status?.toLowerCase() === "inactive" ? "inactive" : "active",
        });

        if (activeBatch.Enrollments) {
          setSelectedStudents(
            activeBatch.Enrollments.map((e: any) => ({
              id: Number(e.student_id),
              name: e.student ? `${e.student.first_name} ${e.student.last_name}` : `Student #${e.student_id}`,
            }))
          );
        } else {
          setSelectedStudents([]);
        }
        prevInstitutionIdRef.current = activeBatch.institution_id ? String(activeBatch.institution_id) : "";
      } else {
        setForm({
          name: "",
          institution_id: "",
          tutor_id: "",
          course_id: "",
          domain_id: "",
          start_date: "",
          end_date: "",
          status: "active",
        });
        setSelectedStudents([]);
        prevInstitutionIdRef.current = "";
      }
      setStudentSearch("");
      setInstructorSearch("");
      setDropdownOpen(false);
      setInstructorDropdownOpen(false);
      setErrors({});
    }
  }, [open, mode, batch, fullBatch]);

  // Clear selected students if institution changes after initial load
  useEffect(() => {
    if (open && form.institution_id !== prevInstitutionIdRef.current) {
      setSelectedStudents([]);
      prevInstitutionIdRef.current = form.institution_id;
    }
  }, [form.institution_id, open]);

  // Filter students based on search input
  const filteredStudents = allStudents.filter(
    (s: any) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Filter tutors based on search input
  const filteredTutors = tutors.filter(
    (t: any) =>
      t.name.toLowerCase().includes(instructorSearch.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(instructorSearch.toLowerCase()))
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const nameStr = form.name.trim();
    if (!nameStr) {
      newErrors.name = "Batch Name is required";
    } else if (nameStr.length < 3) {
      newErrors.name = "Batch Name must be at least 3 characters long";
    }

    // Emoji regex checking
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    if (emojiRegex.test(nameStr)) {
      newErrors.name = "Batch Name cannot contain emojis";
    }

    if (!form.institution_id) newErrors.institution_id = "Institution is required";
    
    if (!form.course_id && !form.domain_id) {
      newErrors.course_id = "Select either Course or Domain";
      newErrors.domain_id = "Select either Course or Domain";
    }
    
    if (!form.tutor_id) newErrors.tutor_id = "Instructor is required";
    if (selectedStudents.length === 0) {
      newErrors.enroll_students = "Enroll Students is required";
    }
    if (!form.start_date.trim()) newErrors.start_date = "Start Date is required";
    if (!form.end_date.trim()) newErrors.end_date = "End Date is required";
    if (!form.status.trim()) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }
    
    const payload: Record<string, unknown> = {
      name: form.name,
      institution_id: form.institution_id ? Number(form.institution_id) : null,
      tutor_id: form.tutor_id ? Number(form.tutor_id) : null,
      start_date: form.start_date,
      end_date: form.end_date,
      enroll_students: selectedStudents.map(s => s.id),
      status: form.status,
    };

    // Only include course_id / domain_id when they have a real value
    // (backend Joi schema rejects null/empty values for these fields)
    if (form.course_id) payload.course_id = Number(form.course_id);
    if (form.domain_id) payload.domain_id = Number(form.domain_id);

    if (mode === "add") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
        }
      });
    } else if (batch?.id) {
      updateMutation.mutate({ id: batch.id, data: payload }, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  const selectedTutor = tutors.find((t: any) => String(t.id) === form.tutor_id);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "add" ? "Create New Batch" : "Edit Batch"}
      size="2xl"
    >
      <div className="space-y-4 mt-1">
        
        {/* BATCH NAME & STATUS */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              BATCH NAME <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Computer Science - 2024 - Section A"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 transition-colors ${errors.name ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>
          <div className="w-[180px]">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              STATUS <span className="text-red-500">*</span>
            </label>
            <Select value={form.status} onValueChange={(val) => setForm({...form, status: val})}>
              <SelectTrigger className={`w-full h-[42px] px-4 rounded-xl border ${errors.status ? "border-red-500" : "border-gray-200"} bg-gray-50/50 text-slate-700 text-sm`}>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.status}</p>}
          </div>
        </div>

        {/* SELECT INSTITUTION */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            SELECT INSTITUTION <span className="text-red-500">*</span>
          </label>
          <InstitutionSelect
            value={form.institution_id}
            onChange={(val) => setForm({ ...form, institution_id: val })}
            initialName={mode === "edit" ? (fullBatch?.institution || batch?.institution) : undefined}
            error={!!errors.institution_id}
          />
          {errors.institution_id && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.institution_id}</p>}
        </div>

        {/* SELECT COURSE & SELECT DOMAINS */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              SELECT COURSE {!form.domain_id && <span className="text-red-500">*</span>}
            </label>
            <Select value={form.course_id || "none"} onValueChange={(val) => setForm({...form, course_id: val === "none" ? "" : val})}>
              <SelectTrigger className={`w-full h-[42px] px-4 rounded-xl border ${errors.course_id ? "border-red-500" : "border-gray-200"} bg-gray-50/50 text-slate-700 text-sm`}>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (No Course)</SelectItem>
                {(courses || []).map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.course_id && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.course_id}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              SELECT DOMAINS {!form.course_id && <span className="text-red-500">*</span>}
            </label>
            <Select value={form.domain_id || "none"} onValueChange={(val) => setForm({...form, domain_id: val === "none" ? "" : val})}>
              <SelectTrigger className={`w-full h-[42px] px-4 rounded-xl border ${errors.domain_id ? "border-red-500" : "border-gray-200"} bg-gray-50/50 text-slate-700 text-sm`}>
                <SelectValue placeholder="Select Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (No Domain)</SelectItem>
                {(domains || []).map((d: any) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.domain_id && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.domain_id}</p>}
          </div>
        </div>

        {/* INSTRUCTOR & ENROLL STUDENTS */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Instructor search-select */}
          <div ref={tutorDropdownRef} className="relative">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              INSTRUCTOR <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={instructorSearch || (selectedTutor ? selectedTutor.name : "")}
                onChange={(e) => {
                  setInstructorSearch(e.target.value);
                  setInstructorDropdownOpen(true);
                }}
                onFocus={() => {
                  setInstructorSearch("");
                  setInstructorDropdownOpen(true);
                }}
                placeholder="Search and select instructor..."
                className={`w-full border rounded-xl pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 transition-colors ${errors.tutor_id ? "border-red-500" : "border-gray-200"}`}
              />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {errors.tutor_id && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.tutor_id}</p>}

            {/* Instructor Dropdown */}
            {instructorDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1">
                {filteredTutors.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">No instructors found</div>
                ) : (
                  filteredTutors.map((tutor: any) => (
                    <div
                      key={tutor.id}
                      onClick={() => {
                        setForm({ ...form, tutor_id: String(tutor.id) });
                        setInstructorSearch(tutor.name);
                        setInstructorDropdownOpen(false);
                      }}
                      className="px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-slate-50 text-slate-800 transition-colors"
                    >
                      {tutor.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Enroll Students search-select */}
          <div ref={studentDropdownRef} className="relative">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              ENROLL STUDENTS <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                disabled={!form.institution_id}
                placeholder={form.institution_id ? "Search by name or ID..." : "Select institution first..."}
                className={`w-full border rounded-xl pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 transition-colors ${!form.institution_id ? "cursor-not-allowed opacity-60" : ""} ${errors.enroll_students ? "border-red-500" : "border-gray-200"}`}
              />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {errors.enroll_students && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.enroll_students}</p>}

            {/* Students Dropdown */}
            {dropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1">
                {!form.institution_id ? (
                  <div className="p-3 text-sm text-gray-500 text-center font-medium">Please select an institution first</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">No students found</div>
                ) : (
                  filteredStudents.map((student: any) => {
                    const isSelected = selectedStudents.some(s => s.id === Number(student.id));
                    return (
                      <div
                        key={student.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedStudents(selectedStudents.filter(s => s.id !== Number(student.id)));
                          } else {
                            setSelectedStudents([...selectedStudents, { id: Number(student.id), name: student.name }]);
                          }
                        }}
                        className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Student Badges */}
        {selectedStudents.length > 0 && (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50/30">
            {selectedStudents.map(student => (
              <span
                key={student.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"
              >
                {student.name}
                <button
                  type="button"
                  onClick={() => setSelectedStudents(selectedStudents.filter(s => s.id !== student.id))}
                  className="text-blue-400 hover:text-blue-600 font-bold transition-colors ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        {/* START DATE & END DATE */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              START DATE <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-slate-700 transition-colors ${errors.start_date ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.start_date && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.start_date}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              END DATE <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-slate-700 transition-colors ${errors.end_date ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.end_date && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.end_date}</p>}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            type="button"
            className="text-sm rounded-xl text-gray-500 hover:text-gray-700 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            type="button"
            className="px-6 py-2.5 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow-sm"
          >
            {isPending
              ? "Saving..."
              : mode === "add"
              ? "Create Batch"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
