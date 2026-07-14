"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable from "@/components/reusable/DataTable";
import { activityColumns } from "./columns/activity-columns";
import { useCourseActivity } from "@/hooks/use-course-activity";
import { ActivityType, CourseActivityItem } from "@/types/course-activity";

interface ActivityPageClientProps {
  activityType: ActivityType;
  title: string;
}

export function ActivityPageClient({ activityType, title }: ActivityPageClientProps) {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  // We manage standard state for the datatable
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const apiParams = {
    page: currentPage,
    limit: rowsPerPage,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {})
  };

  const { data: response, isLoading, isFetching, error, refetch } = useCourseActivity(courseId, activityType, apiParams);

  // Extract data and pagination from response
  const rawData = Array.isArray(response) ? response : (response?.data || []);
  const items = Array.isArray(rawData) ? rawData : [];
  
  // Client-side filtering as fallback in case the backend ignores the status param
  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter(item => {
      const itemStatus = (item.status || "").toLowerCase();
      if (statusFilter === "completed") {
        return itemStatus === "completed" || item.progress === 100;
      } else if (statusFilter === "in_progress") {
        return itemStatus.includes("in progress") || itemStatus === "in_progress" || (item.progress >= 0 && item.progress < 100);
      }
      return true;
    });
  }, [items, statusFilter]);

  // Adjust total items if we filtered anything out manually
  const totalItems = (filteredItems.length !== items.length) ? filteredItems.length : (response?.pagination?.total_items || items.length);
  const totalPages = (filteredItems.length !== items.length) ? Math.max(1, Math.ceil(totalItems / rowsPerPage)) : (response?.pagination?.total_pages || Math.max(1, Math.ceil(totalItems / rowsPerPage)));

  if (error) {
    return (
      <ListingScreenTemplate
        headerText={title}
        subHeaderText={`Manage your ${activityType.toLowerCase()}`}
        buttonRequired={false}
      >
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-red-500 mb-4">Failed to load activity data.</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </ListingScreenTemplate>
    );
  }

  return (
    <ListingScreenTemplate
      headerText={title}
      subHeaderText={`Manage your ${activityType.toLowerCase()} performance`}
      buttonRequired={false}
      extraActions={
        <button
          onClick={() => router.push(`/student/courses/${courseId}`)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-border/70 rounded-lg hover:bg-gray-50 dark:bg-muted/50 bg-white dark:bg-card transition-all text-gray-700 dark:text-foreground shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      }
    >
      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden">
        <div className="overflow-hidden bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border/50">
          <DataTable
            data={filteredItems}
            columns={activityColumns}
            rowKey={(row) => String(row.id)}
            loading={isFetching}
            emptyStateMessage={`No ${activityType.toLowerCase()} found.`}
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            paginationInfo={`Showing ${items.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to ${Math.min(currentPage * rowsPerPage, totalItems)} of ${totalItems} entries`}
            showPagination={true}
            bodyHeight="h-auto"
            search={{
              enabled: true,
              placeholder: "Search by name...",
              value: search,
              onChange: setSearch
            }}
            filters={[
              {
                id: "status",
                label: "Status",
                type: "select",
                value: statusFilter,
                onChange: (val) => setStatusFilter(String(val)),
                options: [
                  { value: "all", label: "All" },
                  { value: "completed", label: "Completed" },
                  { value: "in_progress", label: "In Progress" },
                ]
              }
            ]}
          />
        </div>
      </div>
    </ListingScreenTemplate>
  );
}
