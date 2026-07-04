"use client";
import React, { useEffect, useState, useRef } from "react";
import { Batch } from "@/types/batch";
import { Modal } from "@/components/ui/modal";
import { FileText, Download, Search, ChevronDown, Info, X, Calendar as CalendarIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBatch, useUpdateBatch, useBatch } from "@/hooks/use-batches";
import { useInstitutionsOutlook } from "@/features/admin/institutions/api/use-institutions";
import { useTutors } from "@/features/admin/tutor/api/tutor-api";
import { useStudents } from "@/hooks/use-students";
import { useCourseLookup } from "@/features/admin/courses/api/course-api";
import { useDebounce } from "@/hooks/use-debounce";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  batch?: Batch | null;
}

const parseDateString = (str: string) => {
  if (!str) return undefined;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDateString = (date: Date | undefined) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getDisplayValue = (val?: string) => {
  if (!val || val === "N/A") return "None";
  return val;
};

export default function BatchFormModal({ open, onClose, mode, batch }: Props) {
  const [form, setForm] = useState({
    name: "",
    institution_id: "",
    tutor_id: "",
    course_id: "",
    domain_id: "",
    department: "",
    start_date: "",
    end_date: "",
    status: "",
  });

  const [selectedStudents, setSelectedStudents] = useState<{ id: number; name: string }[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [instructorSearch, setInstructorSearch] = useState("");
  const [instructorDropdownOpen, setInstructorDropdownOpen] = useState(false);

  const [courseSearch, setCourseSearch] = useState("");
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const debouncedCourseSearch = useDebounce(courseSearch, 300);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const tutorDropdownRef = useRef<HTMLDivElement>(null);
  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const prevInstitutionIdRef = useRef(form.institution_id);

  // API hooks
  const { data: studentsLookupData, isLoading: isStudentsLoading } = useStudentLookup(
    form.institution_id ? Number(form.institution_id) : "",
    debouncedSearch,
    { enabled: !!form.institution_id && dropdownOpen }
  );
  
  const { data: fullBatch } = useBatch(open && mode === "edit" ? batch?.id || "" : "");
  
  const { data: lookupCourses } = useCourseLookup(
    debouncedCourseSearch,
    10,
    { enabled: open && (courseDropdownOpen || !!debouncedCourseSearch) }
  );

  const createMutation = useCreateBatch();
  const updateMutation = useUpdateBatch();

  const allStudents = studentsLookupData || [];

  // Click outside listener for student, tutor and course search dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (tutorDropdownRef.current && !tutorDropdownRef.current.contains(event.target as Node)) {
        setInstructorDropdownOpen(false);
      }
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setCourseDropdownOpen(false);
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
          department: activeBatch.department || "",
          start_date: activeBatch.start_date || "",
          end_date: activeBatch.end_date || "",
          status: activeBatch.status?.toLowerCase() === "inactive" ? "inactive" : "active",
        });
        setSelectedCourseName(activeBatch.course || activeBatch.Course?.name || "");

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
      } else {
        setForm({
          name: "",
          institution_id: "",
          tutor_id: "",
          course_id: "",
          domain_id: "",
          department: "",
          start_date: "",
          end_date: "",
          status: "",
        });
        setSelectedCourseName("");
        setSelectedStudents([]);
      }
      setStudentSearch("");
      setInstructorSearch("");
      setCourseSearch("");
      setDropdownOpen(false);
      setErrors({});
    }
  }, [open, mode, batch, fullBatch]);

  // Filter students based on search input
  const filteredStudents = allStudents.filter(
    (s: any) =>
      (s.name || "").toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(studentSearch.toLowerCase())
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const nameStr = form.name.trim();
    if (!nameStr) {
      newErrors.name = "Batch Name is required";
    } else if (nameStr.length < 3) {
      newErrors.name = "Batch Name must be at least 3 characters long";
    }

    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    if (emojiRegex.test(nameStr)) {
      newErrors.name = "Batch Name cannot contain emojis";
    }

    if (!form.institution_id) newErrors.institution_id = "Institution is required";
    if (!form.tutor_id) newErrors.tutor_id = "Instructor is required";
    
    // Exactly one of courseId or domainId must be selected.
    // Both selected at the same time is prevented by the UI, but we guard here anyway.
    if (!form.course_id && !form.domain_id) {
      newErrors.association = "You must select either a Course or a Domain";
    }

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
    
    // Enforce mutual exclusivity in the payload:
    // exactly one of course_id / domain_id will be non-null.
    const payload = {
      name: form.name,
      institution_id: form.institution_id ? Number(form.institution_id) : null,
      tutor_id: form.tutor_id ? Number(form.tutor_id) : null,
      course_id: form.course_id ? Number(form.course_id) : null,
      domain_id: form.domain_id ? Number(form.domain_id) : null,
      department: form.department || undefined,
      start_date: form.start_date,
      end_date: form.end_date,
      enroll_students: selectedStudents.map(s => s.id),
      status: form.status,
    };

    // Double-safety: ensure both are never non-null simultaneously
    if (payload.course_id && payload.domain_id) {
      payload.domain_id = null;
    }

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

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "add" ? "Create New Batch" : "Edit Batch"}
      size="2xl"
    >
      <div className="space-y-4 mt-1">
        
        {/* ROW 1: BATCH NAME & SELECT INSTITUTION */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              BATCH NAME <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. CS - 2024 - Sec A"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 transition-colors ${errors.name ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              SELECT INSTITUTION <span className="text-red-500">*</span>
            </label>
            <BatchInstitutionSelect
              value={form.institution_id}
              onChange={(val) => {
                setForm({ ...form, institution_id: val, tutor_id: "" });
                setSelectedStudents([]); // Reset selected students when institution changes!
                setStudentSearch("");
                setDropdownOpen(false);
              }}
              initialName={mode === "edit" ? (fullBatch || batch)?.institution : undefined}
              error={!!errors.institution_id}
            />
            {errors.institution_id && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.institution_id}</p>}
          </div>
        </div>

        {/* ROW 2: ASSOCIATION — Course OR Domain (mutually exclusive) */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                COURSE
              </label>
              <CourseSelect
                value={form.course_id}
                onChange={(val) => {
                  // Selecting a course clears the domain
                  setForm({ ...form, course_id: val, domain_id: "" });
                  if (errors.association) setErrors(prev => ({ ...prev, association: "" }));
                }}
                initialName={mode === "edit" && !form.domain_id ? (fullBatch || batch)?.course : undefined}
                error={!!errors.association}
                disabled={!!form.domain_id}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                DOMAIN
              </label>
              <DomainSelect
                value={form.domain_id}
                onChange={(val) => {
                  // Selecting a domain clears the course
                  setForm({ ...form, domain_id: val, course_id: "" });
                  if (errors.association) setErrors(prev => ({ ...prev, association: "" }));
                }}
                initialName={mode === "edit" && !form.course_id ? (fullBatch || batch)?.domain : undefined}
                error={!!errors.association}
                disabled={!!form.course_id}
              />
            </div>
          </div>
          {errors.association && (
            <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.association}</p>
          )}
        </div>

        {/* ROW 3: INSTRUCTOR & STATUS */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              INSTRUCTOR <span className="text-red-500">*</span>
            </label>
            <TutorSelect
              value={form.tutor_id}
              onChange={(val) => setForm({ ...form, tutor_id: val })}
              initialName={mode === "edit" ? (fullBatch || batch)?.instructor : undefined}
              error={!!errors.tutor_id}
              institutionId={form.institution_id}
            />
            {errors.tutor_id && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.tutor_id}</p>}
          </div>
          <div>
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

        {/* ROW 4: START DATE & END DATE */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              START DATE <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between border bg-white dark:bg-card rounded-xl px-4 h-[42px] text-sm cursor-pointer text-left ${
                    errors.start_date ? "border-red-500" : "border-gray-200"
                  } bg-gray-50/50 text-slate-700 transition-colors`}
                >
                  <span className={form.start_date ? "text-slate-800" : "text-gray-400"}>
                    {form.start_date ? format(parseDateString(form.start_date)!, "PPP") : "Select Start Date"}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parseDateString(form.start_date)}
                  onSelect={(date) => setForm({ ...form, start_date: formatDateString(date) })}
                  className="rounded-lg border"
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            {errors.start_date && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.start_date}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              END DATE <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between border bg-white dark:bg-card rounded-xl px-4 h-[42px] text-sm cursor-pointer text-left ${
                    errors.end_date ? "border-red-500" : "border-gray-200"
                  } bg-gray-50/50 text-slate-700 transition-colors`}
                >
                  <span className={form.end_date ? "text-slate-800" : "text-gray-400"}>
                    {form.end_date ? format(parseDateString(form.end_date)!, "PPP") : "Select End Date"}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parseDateString(form.end_date)}
                  onSelect={(date) => setForm({ ...form, end_date: formatDateString(date) })}
                  className="rounded-lg border"
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            {errors.end_date && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.end_date}</p>}
          </div>
        </div>

        {/* ROW 5: ENROLL STUDENTS (full-width) */}
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
              onFocus={() => {
                if (form.institution_id) {
                  setDropdownOpen(true);
                } else {
                  toast.error("Please select an institution first.");
                }
              }}
              readOnly={!form.institution_id}
              placeholder={form.institution_id ? "Search students by name or email..." : "Please select an institution first..."}
              className={`w-full border rounded-xl pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 transition-colors ${errors.enroll_students ? "border-red-500" : "border-gray-200"} ${!form.institution_id ? "cursor-pointer" : ""}`}
            />
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            
            {!form.institution_id && (
              <div 
                className="absolute inset-0 cursor-pointer z-10" 
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast.error("Please select an institution first.");
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            )}
          </div>
          {errors.enroll_students && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.enroll_students}</p>}

          {/* Students Dropdown */}
          {dropdownOpen && form.institution_id && (
            <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1">
              {isStudentsLoading ? (
                <div className="p-3 text-sm text-gray-500 text-center">Loading students...</div>
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

      {mode === "edit" && batch?.id && (
        <BulkUploadModal
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          batchId={batch?.id}
        />
      )}
    </Modal>
  );
}