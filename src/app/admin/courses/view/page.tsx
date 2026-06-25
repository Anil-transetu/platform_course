"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCourse } from "@/features/admin/courses/api/course-api";
import CourseView from "@/components/admin/courses/CourseView";
import { Loader2, AlertCircle } from "lucide-react";
import React, { Suspense } from "react";

function CourseViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: fetchedCourse, isLoading, error } = useCourse(id || "");

  const handleBack = () => {
    router.push("/admin/courses");
  };

  if (!id) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Missing Course ID</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">No course ID was specified in the URL. Please return to Course Management.</p>
        <button 
          onClick={handleBack}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-semibold text-sm">Loading course details...</p>
      </div>
    );
  }

  if (error || !fetchedCourse) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Failed to Load Course</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">
          {(error as any)?.message || "The requested course could not be retrieved from the server."}
        </p>
        <button 
          onClick={handleBack}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <CourseView 
      course={fetchedCourse}
      onBack={handleBack}
    />
  );
}

export default function CourseViewPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-semibold text-sm">Loading course page...</p>
      </div>
    }>
      <CourseViewContent />
    </Suspense>
  );
}
