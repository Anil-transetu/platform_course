import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CourseFullSkeleton() {
  return (
    <ListingScreenTemplate
      headerText="Course Viewer"
      subHeaderText="Loading course content..."
      buttonRequired={false}
      buttonOnclick={() => {}}
      extraActions={
        <Link 
          href="/student/courses"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-border/70 rounded-lg hover:bg-gray-50 dark:bg-muted/50 bg-white dark:bg-card transition-all text-gray-700 dark:text-foreground shadow-sm"
        >
          <ArrowLeft size={16} /> Back
        </Link>
      }
    >
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-140px)] bg-slate-50/50">
        {/* Sidebar Skeleton */}
        <aside className="w-[320px] border-r border-gray-200/80 bg-white flex flex-col shrink-0 p-4 space-y-4 hidden md:flex">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-3/4 rounded-xl ml-4" />
          <Skeleton className="h-10 w-3/4 rounded-xl ml-4" />
        </aside>

        {/* Viewer Skeleton */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </main>
      </div>
    </ListingScreenTemplate>
  );
}

export function ViewerSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      <Skeleton className="h-32 w-full rounded-3xl" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-60 w-full rounded-3xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
