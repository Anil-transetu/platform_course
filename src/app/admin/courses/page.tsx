"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  CheckCircle, 
  FileText, 
  Eye, 
  MoreVertical, 
  Pencil, 
  Trash2
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable, { Column } from "@/components/reusable/DataTable";
import CourseDeleteDialog from "./CourseDeleteDialog";
import { buildCourseColumns, Course } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useCourses,
  useCourseStats,
  useDeleteCourse
} from "@/features/admin/courses/api/course-api";
import CourseDetailViewer from "./CourseDetailViewer";
import AssignmentDetailViewer from "./AssignmentDetailViewer";
import { useCourseStore } from "@/store/useCourseStore";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

function CoursePageSkeleton() {
  return (
    <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden w-full">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 flex-shrink-0">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm">
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <Skeleton className="h-10 w-[300px] rounded-lg" />
          <Skeleton className="h-10 w-[200px] rounded-lg" />
        </div>
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 bg-gray-50/80">
          <Skeleton className="h-4 w-16 col-span-1" />
          <Skeleton className="h-4 w-32 col-span-2" />
          <Skeleton className="h-4 w-24 col-span-1" />
          <Skeleton className="h-4 w-24 col-span-1" />
          <Skeleton className="h-4 w-20 col-span-1" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center">
              <div className="col-span-1"><Skeleton className="h-4 w-16" /></div>
              <div className="col-span-2"><Skeleton className="h-4 w-40" /></div>
              <div className="col-span-1"><Skeleton className="h-4 w-24" /></div>
              <div className="col-span-1"><Skeleton className="h-4 w-24" /></div>
              <div className="col-span-1"><Skeleton className="h-6 w-20 rounded-lg" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionMenu({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 hover:bg-gray-100 dark:bg-muted rounded-lg text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:text-foreground transition-colors"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-100 dark:border-border/50 p-1 min-w-[120px] z-50">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-gray-700 dark:text-foreground hover:bg-gray-50 dark:bg-muted/50 rounded-lg transition-colors focus:bg-gray-50 dark:bg-muted/50 outline-none font-medium flex items-center gap-2"
        >
          <Eye size={14} className="text-gray-400" />
          View
        </DropdownMenuItem>
        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="cursor-pointer px-3 py-2 text-sm text-gray-700 dark:text-foreground hover:bg-gray-50 dark:bg-muted/50 rounded-lg transition-colors focus:bg-gray-50 dark:bg-muted/50 outline-none font-medium flex items-center gap-2"
          >
            <Pencil size={14} className="text-gray-400" />
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:bg-red-50 outline-none font-medium flex items-center gap-2"
        >
          <Trash2 size={14} className="text-red-500" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewId = searchParams.get("view");

  // Track course selected for details viewing
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [viewingAssignmentId, setViewingAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    if (viewId) {
      router.push(`/admin/courses/view?id=${viewId}`);
    }
  }, [viewId, router]);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: Course | null;
  }>({
    open: false,
    item: null,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const debouncedSearch = useDebounce(search, 300);
  const [queriesReady, setQueriesReady] = useState(false);

  useEffect(() => {
    setQueriesReady(true);
  }, []);
  
  // Courses React Query hook
  const {
    data: coursesResponse,
    isLoading: isLoadingCourses,
    isFetching: isFetchingCourses,
    error: coursesError
  } = useCourses(
    page,
    rowsPerPage,
    debouncedSearch,
    statusFilter,
    { enabled: queriesReady && !viewingCourse && !viewingAssignmentId && !viewId }
  );

  useEffect(() => {
    if (coursesError) {
      toast.error(coursesError.message || "Failed to load courses");
    }
  }, [coursesError]);

  const getEmptyStateMessage = () => {
    return coursesError
      ? "Failed to load courses. Please try again."
      : "No courses found.";
  };

  const { data: courseStatsRaw } = useCourseStats({
    enabled: queriesReady && !viewingCourse && !viewingAssignmentId && !viewId
  });
  const deleteCourseMutation = useDeleteCourse();

  const coursesList = coursesResponse?.data || [];
  const totalCoursesCount = coursesResponse?.pagination?.total || coursesResponse?.total || coursesList.length;

  const handleDelete = async () => {
    const isOffline = typeof window !== "undefined" && !navigator.onLine;
    if (isOffline) {
      toast.error("Network disconnected. Please check your connection.");
      return;
    }
    if (deleteDialog.item) {
      try {
        await deleteCourseMutation.mutateAsync(deleteDialog.item.id);
        toast.success("Course deleted successfully!");
        setDeleteDialog({ open: false, item: null });
      } catch (err) {
        const error = err as Error;
        toast.error(error.message || "Failed to delete course");
      }
    }
  };

  const totalPages = coursesResponse?.pagination?.totalPages || Math.max(1, Math.ceil(totalCoursesCount / rowsPerPage));
  const start = (page - 1) * rowsPerPage;

  const searchConfig = {
    enabled: true,
    placeholder: "Search courses...",
    value: search,
    onChange: (val: string) => {
      setSearch(val);
      setPage(1);
    },
  };

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Published", label: "Published" },
    { value: "Draft", label: "Draft" },
  ];

  const filterConfig = [
    {
      id: "status",
      label: "All Status",
      type: "select" as const,
      value: statusFilter,
      options: statusOptions,
      onChange: (val: string | string[]) => {
        setStatusFilter(Array.isArray(val) ? val[0] : val);
        setPage(1);
      },
    },
  ];

  const paginationInfo = totalCoursesCount > 0
    ? `${start + 1}-${Math.min(start + rowsPerPage, totalCoursesCount)} of ${totalCoursesCount}`
    : "0-0 of 0";

  // Render Assignment Detail View
  if (viewingAssignmentId) {
    return (
      <AssignmentDetailViewer
        assignmentId={viewingAssignmentId}
        onBack={() => setViewingAssignmentId(null)}
      />
    );
  }

  // Render Course Detail View
  if (viewingCourse) {
    return (
      <CourseDetailViewer 
        courseId={viewingCourse.id} 
        onBack={() => {
          setViewingCourse(null);
          router.push("/admin/courses");
        }} 
        onEdit={() => router.push(`/admin/courses/edit/${viewingCourse.id}`)}
      />
    );
  }

  return (
    <ListingScreenTemplate
      headerText="Course Management"
      subHeaderText="Manage and monitor all courses"
      buttonLabel="Create New Course"
      buttonRequired={true}
      buttonOnclick={() => {
        useCourseStore.getState().resetCourse();
        router.push("/admin/courses/create");
      }}
    >
      {isLoadingCourses ? (
        <CoursePageSkeleton />
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full">
          {/* STATS CARDS */}
          <StatsGrid>
            <StatsCard title="Total Courses" value={courseStatsRaw?.total_courses ?? courseStatsRaw?.total ?? totalCoursesCount} icon={<BookOpen size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" tooltip="All courses available on the platform" />
            <StatsCard title="Active Courses" value={courseStatsRaw?.active_courses ?? courseStatsRaw?.active ?? coursesList.filter((c: Course) => c.status === "Published").length} icon={<CheckCircle size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" tooltip="Courses currently published and accessible to students" />
            <StatsCard title="Draft Courses" value={courseStatsRaw?.draft_courses ?? courseStatsRaw?.draft ?? coursesList.filter((c: Course) => c.status === "Draft").length} icon={<FileText size={20} />} iconBgClass="bg-orange-50" iconColorClass="text-orange-600" tooltip="Courses saved as draft and not yet published" />
          </StatsGrid>

          {/* DATA TABLE */}
          <div className="flex-grow min-h-0">
            <DataTable<Course>
              data={coursesList}
              columns={buildCourseColumns()}
              loading={isLoadingCourses || isFetchingCourses || search !== debouncedSearch}
              rowKey={(item) => String(item.id)}
              search={searchConfig}
              filters={filterConfig}
              actions={(item) => (
                <div className="flex justify-center">
                  <ActionMenu 
                    onView={() => router.push(`/admin/courses/view?id=${item.id}`)}
                    onEdit={() => router.push(`/admin/courses/edit/${item.id}`)}
                    onDelete={() => setDeleteDialog({ open: true, item })}
                  />
                </div>
              )}
              bodyHeight="h-full"
              rowsPerPage={rowsPerPage}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setPage(1);
              }}
              paginationInfo={paginationInfo}
              showPagination={true}
              emptyStateMessage={getEmptyStateMessage()}
            />
          </div>
        </div>
      )}
      
      <CourseDeleteDialog
        open={deleteDialog.open}
        item={deleteDialog.item}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        loading={deleteCourseMutation.isPending}
      />
    </ListingScreenTemplate>
  );
}
