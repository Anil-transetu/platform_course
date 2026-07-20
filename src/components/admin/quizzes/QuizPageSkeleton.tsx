import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 overflow-hidden h-full">
      {/* STATS CARDS SKELETON */}
      <div className="flex overflow-x-auto gap-4 pb-2 md:pb-0 md:grid md:grid-cols-3 md:gap-4 no-scrollbar flex-shrink-0">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="min-w-[260px] md:min-w-0 p-5 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border/50 flex items-center shadow-sm">
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
        ))}
      </div>

      {/* DATA TABLE SKELETON */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border/70 overflow-hidden flex flex-col flex-1">
        {/* Table Toolbar (Search & Filter) */}
        <div className="p-4 border-b border-gray-100 dark:border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-gray-50 dark:bg-muted/50/50">
          <Skeleton className="h-10 w-full sm:w-[300px] rounded-lg" />
          <Skeleton className="h-10 w-full sm:w-[200px] rounded-lg" />
        </div>

        {/* Table Skeleton Content */}
        <div className="overflow-x-auto w-full">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 dark:border-border/50 bg-gray-50 dark:bg-muted/50/80">
              <Skeleton className="h-4 w-32 col-span-2" /> {/* TITLE */}
              <Skeleton className="h-4 w-20 col-span-1" /> {/* DOMAIN */}
              <Skeleton className="h-4 w-24 col-span-1" /> {/* TAGS */}
              <Skeleton className="h-4 w-16 col-span-1" /> {/* DURATION */}
              <Skeleton className="h-4 w-16 col-span-1" /> {/* STATUS */}
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center">
                  {/* TITLE */}
                  <div className="col-span-2">
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  
                  {/* DOMAIN */}
                  <div className="col-span-1">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  
                  {/* TAGS */}
                  <div className="col-span-1 flex gap-1">
                    <Skeleton className="h-5 w-12 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                  
                  {/* DURATION */}
                  <div className="col-span-1">
                    <Skeleton className="h-4 w-16" />
                  </div>
                  
                  {/* STATUS */}
                  <div className="col-span-1">
                    <Skeleton className="h-6 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="p-4 border-t border-gray-100 dark:border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 dark:bg-muted/50/50">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-8 w-16 rounded-md hidden sm:block" />
            <Skeleton className="h-4 w-16 hidden sm:block" />
            <Skeleton className="h-4 w-32 sm:hidden" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md hidden sm:block" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
