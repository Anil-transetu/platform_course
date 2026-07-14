"use client";

import React, { useEffect } from "react";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Course View Error:", error);
  }, [error]);

  return (
    <ListingScreenTemplate
      headerText="Course Viewer"
      subHeaderText="Error loading details"
      buttonRequired={false}
      extraActions={
        <Link 
          href="/student/courses"
          className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg bg-card hover:bg-muted transition-colors"
        >
          <ArrowLeft size={16} /> Back to Courses
        </Link>
      }
    >
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 min-h-[400px] flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-600">Failed to load course details</h2>
        <p className="text-gray-500">
          {error?.message || "The course could not be found or fetched."}
        </p>
        <div className="flex gap-4 mt-6">
          <button 
            onClick={() => reset()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <Link 
            href="/student/courses"
            className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </ListingScreenTemplate>
  );
}
