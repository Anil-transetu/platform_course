"use client";

import { useParams, useRouter } from "next/navigation";
import { useCourseCurriculum, useCourseDetails } from "@/features/admin/courses/api/course-api";
import CourseView from "@/components/admin/courses/CourseView";
import { Loader2, AlertCircle } from "lucide-react";
import React from "react";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: fetchedCourse, isLoading, error } = useCourseCurriculum(id || "");
  const { data: detailsCourse } = useCourseDetails(id || "", { enabled: !!id });

  const effectiveCourse = React.useMemo(() => {
    if (!fetchedCourse && !detailsCourse) return null;
    const fa = detailsCourse?.final_assessment || detailsCourse?.finalAssessment || fetchedCourse?.final_assessment || fetchedCourse?.finalAssessment || null;
    const faId = detailsCourse?.final_assessment_id ?? detailsCourse?.finalAssessment?.id ?? fetchedCourse?.final_assessment_id ?? fetchedCourse?.finalAssessment?.id ?? null;
    
    return {
      ...detailsCourse,
      ...fetchedCourse,
      final_assessment: fa,
      final_assessment_id: faId,
    };
  }, [fetchedCourse, detailsCourse]);

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
        <p className="text-slate-500 text-sm mt-1 max-w-sm">No course ID was specified. Please return to Course Management.</p>
        <button 
          onClick={handleBack}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (isLoading && !effectiveCourse) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-semibold text-sm">Loading course details...</p>
      </div>
    );
  }

  if ((error && !effectiveCourse) || !effectiveCourse) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Failed to Load Course</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">
          {(error as Error)?.message || "The requested course could not be retrieved from the server."}
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
      course={effectiveCourse}
      onBack={handleBack}
    />
  );
}
