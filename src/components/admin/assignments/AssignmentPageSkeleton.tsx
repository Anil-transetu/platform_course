import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentPageSkeleton() {
  return (
    <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
      {/* STATS CARDS SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm">
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
        ))}
      </div>

      {/* DATA TABLE SKELETON */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
        {/* Table Toolbar (Search & Filter) */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <Skeleton className="h-10 w-[300px] rounded-lg" />
          <Skeleton className="h-10 w-[200px] rounded-lg" />
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 bg-gray-50/80">
          <Skeleton className="h-4 w-24 col-span-2" /> {/* ASSIGNMENT TITLE */}
          <Skeleton className="h-4 w-20 col-span-1" /> {/* COURSE */}
          <Skeleton className="h-4 w-20 col-span-1" /> {/* DOMAIN & TAGS */}
          <Skeleton className="h-4 w-16 col-span-1" /> {/* MARKS */}
          <Skeleton className="h-4 w-20 col-span-1" /> {/* TYPE */}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center">
              {/* ASSIGNMENT TITLE */}
              <div className="col-span-2 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-20" />
              </div>
              
              {/* COURSE */}
              <div className="col-span-1">
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
              
              {/* DOMAIN & TAGS */}
              <div className="col-span-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              
              {/* MARKS */}
              <div className="col-span-1">
                <Skeleton className="h-5 w-10" />
              </div>
              
              {/* TYPE */}
              <div className="col-span-1">
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
