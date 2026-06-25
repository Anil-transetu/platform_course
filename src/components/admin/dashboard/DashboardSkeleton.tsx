import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="p-8 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
      </div>

      {/* Quick Navigation Header */}
      <Skeleton className="h-6 w-40 mb-4 rounded-md" />

      {/* Quick Navigation Cards */}
      <div className="mb-10">
        <div className="flex overflow-x-auto gap-3 pb-2 md:pb-0 md:grid md:grid-cols-4 md:gap-4 no-scrollbar w-full flex-shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={`stat-${i}`} className="min-w-[180px] xs:min-w-[200px] md:min-w-0 flex-shrink-0 flex-1">
              <div className="bg-card border rounded-2xl p-4 md:p-6 shadow-sm w-full">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
                </div>
                <Skeleton className="h-8 w-24 md:w-32 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creation Hub Header */}
      <Skeleton className="h-6 w-40 mb-4 rounded-md" />

      {/* Creation Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={`hub-${i}`} className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm flex justify-between items-center h-[80px] sm:h-[90px]">
            <div className="flex gap-3 items-center">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
