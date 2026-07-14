"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Calendar, Users, FileImage } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DataTable from "@/components/reusable/DataTable";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { useEnrolledCourses } from "@/features/student/courses/api/courses-api";
import { Input } from "@/components/ui/input";
import { buildCourseColumns, EnrolledCourse, getProgressColor } from "./columns";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

export default function StudentCourses() {
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const router = useRouter();
  
  useEffect(() => {
    const stored = localStorage.getItem("course_view_mode");
    if (stored === "card" || stored === "table") {
      setViewMode(stored);
    }
  }, []);

  const handleViewModeChange = (mode: "card" | "table") => {
    setViewMode(mode);
    localStorage.setItem("course_view_mode", mode);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term to avoid hitting the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: apiResponse, isLoading, isFetching, isError } = useEnrolledCourses(page, rowsPerPage, debouncedSearch || undefined);
  
  const coursesRaw: EnrolledCourse[] = Array.isArray(apiResponse) ? apiResponse : apiResponse?.data || [];
  const totalCount = apiResponse?.pagination?.total || apiResponse?.total || (Array.isArray(apiResponse) ? apiResponse.length : coursesRaw.length);
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // If backend returns all records without pagination, locally slice
  let visibleData = coursesRaw;
  if (coursesRaw.length > rowsPerPage) {
    const start = (page - 1) * rowsPerPage;
    visibleData = coursesRaw.slice(start, start + rowsPerPage);
  }

  const paginationInfo = totalCount > 0 
    ? `${(page - 1) * rowsPerPage + 1} - ${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}` 
    : "0 - 0 of 0";

  const extraActions = (
    <div className="flex bg-white dark:bg-card border border-gray-200 dark:border-border/50 rounded-xl p-1 shadow-sm flex-shrink-0 h-[46px]">
      <button 
        onClick={() => handleViewModeChange("card")}
        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "card" ? "bg-slate-900 text-white shadow-md" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
      >
        Card
      </button>
      <button 
        onClick={() => handleViewModeChange("table")}
        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "table" ? "bg-slate-900 text-white shadow-md" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
      >
        Table
      </button>
    </div>
  );

  const searchConfig = {
    enabled: true,
    placeholder: "Search for courses, instructors, or tags...",
    value: searchQuery,
    onChange: (val: string) => setSearchQuery(val)
  };

  return (
    <ListingScreenTemplate
      headerText="Enrolled Courses"
      subHeaderText="Manage your active learning journey and track your progress."
      buttonRequired={false}
      extraActions={extraActions}
    >
      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden">
        {viewMode === "card" && (
           <div className="relative flex-shrink-0">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
             <Input 
               type="text"
               placeholder="Search for courses, instructors, or tags..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 py-5 bg-white dark:bg-card border border-gray-200 dark:border-border/50 rounded-xl text-sm font-medium shadow-sm"
             />
           </div>
        )}

        {isLoading ? (
          viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-[320px] flex flex-col">
                  <Skeleton className="w-full h-32 rounded-xl mb-4" />
                  <div className="flex gap-2 mb-4"><Skeleton className="h-6 w-16 rounded-full" /></div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-auto" />
                  <div className="mt-6 pt-4 border-t border-gray-50">
                    <Skeleton className="h-2 w-full mb-2" />
                    <div className="flex justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden bg-white dark:bg-card border border-gray-100 dark:border-border/50 rounded-2xl shadow-sm p-1">
               <DataTable<any>
                data={[]}
                columns={buildCourseColumns()}
                loading={true}
                search={searchConfig}
                rowsPerPage={rowsPerPage}
                currentPage={1}
                totalPages={1}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                bodyHeight="h-auto"
                actions={(course) => (
                  <button 
                    onClick={() => router.push(`/student/courses/${course.id || course.course_id}`)}
                    className="flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors mx-auto"
                  >
                    <Eye size={14} /> View
                  </button>
                )}
              />
            </div>
          )
        ) : isError ? (
          <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100 font-semibold shadow-sm flex-shrink-0">
            Failed to load enrolled courses. Please try again later.
          </div>
        ) : (
          viewMode === "card" ? (
            visibleData.length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border/50 shadow-sm flex flex-col items-center flex-shrink-0">
                <FileImage size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-2">No courses found</h3>
                <p className="text-gray-500 dark:text-muted-foreground">Try adjusting your search criteria or enroll in a new course.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4">
                  {visibleData.map((course, index) => (
                    <div key={`${course.id || course.course_id || 'course'}-${index}`} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
                      <div className="h-40 bg-slate-50 relative overflow-hidden flex-shrink-0">
                        {course.course_image || course.image ? (
                          <Image src={course.course_image || course.image || ""} alt={course.name} fill className="object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-100 to-slate-200">
                            <FileImage size={40} />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap max-w-[90%]">
                          {course.tags?.slice(0, 2).map((tag, i) => {
                            const isCompleted = tag.toLowerCase() === "completed";
                            return (
                              <Badge 
                                key={i} 
                                className={`${
                                  isCompleted ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                                } font-bold text-[10px] px-2 py-0.5 rounded-md shadow-sm border-none`}
                              >
                                {tag}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-foreground line-clamp-2 mb-auto" title={course.name}>
                          {course.name}
                        </h3>

                        <div className="mt-2 pt-4 border-t border-gray-100 dark:border-border/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                            <span className="text-xs font-bold text-gray-700">{course.completionProgress || 0}%</span>
                          </div>
                          <Progress value={course.completionProgress || 0} className="h-2 bg-slate-100" indicatorClassName={getProgressColor(course.completionProgress || 0)} />
                          <div className="flex justify-between items-center mt-4 text-xs font-medium text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} />
                              <span>{formatDate(course.lastOpened)}</span>
                            </div>
                            {course.batches && (
                               <div className="flex items-center gap-1.5">
                                 <Users size={14} />
                                 <span>{course.batches.completed}/{course.batches.total} BATCHES</span>
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination for Card View */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-border flex-shrink-0">
                    <span className="text-sm text-gray-500">{paginationInfo}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm font-medium border border-gray-200 rounded-md disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-sm font-medium border border-gray-200 rounded-md disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="overflow-hidden bg-white dark:bg-card rounded-2xl">
              <DataTable<any>
                data={visibleData}
                columns={buildCourseColumns()}
                rowKey={(row, index) => String(`${row.id || row.course_id || 'course'}-${index}`)}
                search={searchConfig}
                rowsPerPage={rowsPerPage}
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage} 
                paginationInfo={paginationInfo}
                showPagination={true}
                emptyStateMessage="No courses found."
                loading={isFetching}
                bodyHeight="h-auto"
                actions={(course) => (
                  <button 
                    onClick={() => router.push(`/student/courses/${course.id || course.course_id}`)}
                    className="flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors mx-auto"
                  >
                    <Eye size={14} /> View
                  </button>
                )}
              />
            </div>
          )
        )}
      </div>
    </ListingScreenTemplate>
  );
}