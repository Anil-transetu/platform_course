"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle, FileText, Plus, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateDomainModal from "@/components/sidebar/CreateDomainModel";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable from "@/components/reusable/DataTable";
import CourseDeleteDialog from "./CourseDeleteDialog";
import { buildCourseColumns, buildDomainColumns, Course, Domain } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="flex items-center gap-6 border-b border-gray-200">
        <Skeleton className="h-6 w-20 mb-2" />
        <Skeleton className="h-6 w-20 mb-2" />
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const initialCourses: Course[] = [
  { id: 1, name: "Advanced Full-Stack Development", category: "Web Development", modules: 12, updated: "Oct 24, 2023", status: "Published" },
  { id: 2, name: "Python for Machine Learning", category: "Data Science", modules: 8, updated: "Oct 20, 2023", status: "Draft" },
  { id: 3, name: "Ethical Hacking Fundamentals", category: "Cybersecurity", modules: 15, updated: "Oct 18, 2023", status: "Published" },
  { id: 4, name: "UI/UX Strategy & Design", category: "Design", modules: 6, updated: "Oct 15, 2023", status: "Published" },
];

const initialDomains: Domain[] = [
  { id: 1, name: "Web Development", category: "Technology", courses: 12, updated: "Oct 24, 2023", status: "Active" },
  { id: 2, name: "Data Science", category: "Science", courses: 8, updated: "Oct 20, 2023", status: "Active" },
  { id: 3, name: "Cybersecurity", category: "Security", courses: 15, updated: "Oct 18, 2023", status: "Active" },
  { id: 4, name: "Design", category: "Creative", courses: 6, updated: "Oct 15, 2023", status: "Active" },
];

function ActionMenu({ onView, onDelete }: { onView: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-md border border-gray-100 p-1 min-w-[120px] z-50">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:bg-gray-50 outline-none font-medium flex items-center gap-2"
        >
          <Eye size={14} className="text-gray-400" />
          View
        </DropdownMenuItem>
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
  const [activeTab, setActiveTab] = useState<"courses" | "domains">("courses");
  const [coursesData, setCoursesData] = useState<Course[]>(initialCourses);
  const [domainsData, setDomainsData] = useState<Domain[]>(initialDomains);
  const [isDomainOpen, setIsDomainOpen] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: Course | Domain | null;
    type: "course" | "domain";
  }>({
    open: false,
    item: null,
    type: "course"
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate fetching on filter/tab changes
  useEffect(() => {
    if (isLoading) return;
    setIsFetching(true);
    const timer = setTimeout(() => {
      setIsFetching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, activeTab, statusFilter, isLoading]);

  // Reset page & filters when switching tabs
  useEffect(() => {
    setPage(1);
    setStatusFilter("All");
    setSearch("");
  }, [activeTab]);

  const handleCreateDomain = (newDomain: Record<string, unknown>) => {
    const nextId = domainsData.length ? Math.max(...domainsData.map(d => d.id)) + 1 : 1;
    setDomainsData([...domainsData, { 
      id: nextId,
      name: newDomain.name as string,
      category: newDomain.category as string,
      courses: (newDomain.courses as number) || 0,
      updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: (newDomain.status as string) || "Active"
    }]);
  };

  const handleDelete = () => {
    if (deleteDialog.type === "course") {
      setCoursesData(coursesData.filter(c => c.id !== deleteDialog.item?.id));
    } else {
      setDomainsData(domainsData.filter(d => d.id !== deleteDialog.item?.id));
    }
  };

  const filteredCourses = coursesData.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDomains = domainsData.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentData = activeTab === "courses" ? filteredCourses : filteredDomains;
  const totalCount = currentData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visibleData = currentData.slice(start, start + rowsPerPage);

  const searchConfig = {
    enabled: true,
    placeholder: `Search ${activeTab}...`,
    value: search,
    onChange: (val: string) => {
      setSearch(val);
      setPage(1);
    },
  };

  const statusOptions = activeTab === "courses" 
    ? [
        { value: "All", label: "All Status" },
        { value: "Published", label: "Published" },
        { value: "Draft", label: "Draft" },
      ]
    : [
        { value: "All", label: "All Status" },
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
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

  const paginationInfo = totalCount > 0
    ? `${start + 1}-${Math.min(start + rowsPerPage, totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const extraHeaderActions = (
    <div className="flex gap-3">
      <button 
        onClick={() => setIsDomainOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 bg-white transition-all text-gray-700 shadow-sm"
      >
        <Plus size={16} /> Create New Domain
      </button>
      <Link href="/admin/courses/create">
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm font-semibold">
          <Plus size={16} /> Create New Course
        </button>
      </Link>
    </div>
  );

  return (
    <ListingScreenTemplate
      headerText="Course Management"
      subHeaderText="Manage and monitor all courses and domains"
      buttonLabel="Create New Course"
      buttonRequired={false}
      buttonOnclick={() => {}}
      extraActions={extraHeaderActions}
    >
      {isLoading ? (
        <CoursePageSkeleton />
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full">
        {/* CARDS */}
        <StatsGrid>
          <StatsCard title="Total Courses" value={coursesData.length} icon={<BookOpen size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" tooltip="All courses available on the platform" />
          <StatsCard title="Active Courses" value={coursesData.filter(c => c.status === "Published").length} icon={<CheckCircle size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" tooltip="Courses currently published and accessible to students" />
          <StatsCard title="Draft Courses" value={coursesData.filter(c => c.status === "Draft").length} icon={<FileText size={20} />} iconBgClass="bg-orange-50" iconColorClass="text-orange-600" tooltip="Courses saved as draft and not yet published" />
        </StatsGrid>

        {/* TABS */}
        <div className="flex gap-6 border-b flex-shrink-0">
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-2 font-medium transition-all text-sm ${
              activeTab === "courses"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab("domains")}
            className={`pb-2 font-medium transition-all text-sm ${
              activeTab === "domains"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Domains
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="flex-1 overflow-hidden min-h-0">
          <DataTable<any>
            data={visibleData}
            columns={activeTab === "courses" ? buildCourseColumns() : buildDomainColumns()}
            loading={isLoading || isFetching}
            rowKey={(item) => String(item.id)}
            search={searchConfig}
            filters={filterConfig}
            actions={(item) => (
              <div className="flex justify-center">
                <ActionMenu 
                  onView={() => router.push(activeTab === "courses" ? "/admin/courses/create" : "#")}
                  onDelete={() => setDeleteDialog({ open: true, item, type: activeTab === "courses" ? "course" : "domain" })}
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
          />
        </div>
      </div>
      )}

      <CreateDomainModal isOpen={isDomainOpen} onClose={() => setIsDomainOpen(false)} onSubmit={handleCreateDomain} />
      
      <CourseDeleteDialog
        open={deleteDialog.open}
        item={deleteDialog.item}
        type={deleteDialog.type}
        onClose={() => setDeleteDialog({ open: false, item: null, type: "course" })}
        onConfirm={handleDelete}
      />
    </ListingScreenTemplate>
  );
}