"use client";

import React, { useEffect, useRef } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useCourseDetails, useCourseCurriculum } from "@/features/admin/courses/api/course-api";
import { useCourseStore } from "@/store/useCourseStore";
import CourseCreationLayout from "../../create/layout";
import { Loader2, AlertCircle } from "lucide-react";

export default function CourseEditLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params.id as string;
  const normalizedPathname = pathname ? pathname.replace(/\/$/, "") : "";
  const isConfigPage = normalizedPathname === `/admin/courses/edit/${id}`;

  const {
    data: courseDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useCourseDetails(id, { enabled: isConfigPage });

  const {
    data: fetchedCurriculum,
    isLoading: isLoadingCurriculum,
    error: curriculumError,
  } = useCourseCurriculum(id, undefined, undefined, { enabled: !isConfigPage });

  const { setCourse, setCourseMetadata, resetCourse } = useCourseStore();
  const lastInitializedIdRef = useRef<string | null>(null);
  const lastSyncedDetailsJsonRef = useRef<string | null>(null);
  const lastSyncedCurriculumJsonRef = useRef<string | null>(null);

  // Reset store when switching to a different course
  useEffect(() => {
    const currentCourseId = useCourseStore.getState().course.id;
    if (currentCourseId && String(currentCourseId) !== String(id)) {
      resetCourse();
      lastInitializedIdRef.current = null;
      lastSyncedDetailsJsonRef.current = null;
      lastSyncedCurriculumJsonRef.current = null;
    }
  }, [id, resetCourse]);

  // Sync course details API → store (configuration page)
  useEffect(() => {
    if (!isConfigPage || !courseDetails) return;

    const detailsJson = JSON.stringify(courseDetails);
    if (detailsJson === lastSyncedDetailsJsonRef.current) return;

    setCourseMetadata(courseDetails);
    lastSyncedDetailsJsonRef.current = detailsJson;
    lastInitializedIdRef.current = String(id);
  }, [isConfigPage, courseDetails, id, setCourseMetadata]);

  // Sync curriculum API → store (curriculum builder pages)
  useEffect(() => {
    if (isConfigPage || !fetchedCurriculum) return;

    const isInitialLoad = lastInitializedIdRef.current !== String(id);
    const curriculumJson = JSON.stringify(fetchedCurriculum);
    const hasCurriculumChanged = curriculumJson !== lastSyncedCurriculumJsonRef.current;

    if (isInitialLoad || hasCurriculumChanged) {
      setCourse(fetchedCurriculum, { force: isInitialLoad });
      lastSyncedCurriculumJsonRef.current = curriculumJson;

      if (isInitialLoad) {
        lastInitializedIdRef.current = String(id);
      }
    }
  }, [isConfigPage, fetchedCurriculum, id, setCourse]);

  const handleBack = () => {
    router.push("/admin/courses");
  };

  const isLoading = isConfigPage ? isLoadingDetails : isLoadingCurriculum;
  const error = isConfigPage ? detailsError : curriculumError;
  const hasData = isConfigPage ? !!courseDetails : !!fetchedCurriculum;

  if (isLoading) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-semibold text-sm">Loading course details...</p>
      </div>
    );
  }

  if (error || (!isLoading && !hasData)) {
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

  return <CourseCreationLayout>{children}</CourseCreationLayout>;
}
