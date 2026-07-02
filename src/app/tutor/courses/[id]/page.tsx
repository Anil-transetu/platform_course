"use client";

import React, { useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useBatch } from "@/hooks/use-batches";
import { useCourse } from "@/features/admin/courses/api/course-api";
import CourseView from "@/components/admin/courses/CourseView";
import CourseNotesSidebar from "@/components/tutor/courses/CourseNotesSidebar";
import { Loader2, AlertCircle } from "lucide-react";

function TutorCourseViewContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  // The id in the route is the batch ID
  const batchId = params.id as string;

  // Workaround to hide the global RolesSidebar by forcing ?view=true in URL query parameters.
  // The roles-sidebar.tsx component automatically hides itself if searchParams has "view".
  useEffect(() => {
    if (batchId && searchParams.get("view") !== "true") {
      router.replace(`/tutor/courses/${batchId}?view=true`);
    }
  }, [batchId, searchParams, router]);

  // 1. Fetch batch details using batchId to get the allocated course_id
  const { 
    data: batchData, 
    isLoading: isLoadingBatch, 
    error: batchError 
  } = useBatch(batchId || "");

  const courseId = batchData?.course_id;

  // 2. Fetch course structure using courseId
  const { 
    data: courseData, 
    isLoading: isLoadingCourse, 
    error: courseError 
  } = useCourse(courseId ?? undefined);

  const handleBack = () => {
    router.push("/tutor/dashboard");
  };

  const isLoading = isLoadingBatch || (!!courseId && isLoadingCourse);
  const error = batchError || courseError;

  if (!batchId) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Missing Batch ID</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">No batch ID was specified. Please return to the Dashboard.</p>
        <button 
          onClick={handleBack}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-semibold text-sm">Loading course player...</p>
      </div>
    );
  }

  if (error || !batchData) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Failed to Load Batch</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">
          {(error as any)?.message || "The requested batch details could not be retrieved."}
        </p>
        <button 
          onClick={handleBack}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Course Allocated</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">
          This batch does not have an allocated course to display.
        </p>
        <button 
          onClick={handleBack}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Failed to Load Course</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">
          The course content could not be retrieved from the server.
        </p>
        <button 
          onClick={handleBack}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // 3-Column Layout Composition:
  // Render CourseView (Columns 1 & 2 internally: left CourseViewSidebar + center main viewer)
  // side-by-side with CourseNotesSidebar (Column 3) inside a parent flex wrapper.
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <div className="flex-1 overflow-hidden h-full">
        <CourseView course={courseData} onBack={handleBack} />
      </div>
      <CourseNotesSidebar courseId={courseId} />
    </div>
  );
}

export default function TutorCourseViewPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-semibold text-sm">Loading course page...</p>
      </div>
    }>
      <TutorCourseViewContent />
    </Suspense>
  );
}
