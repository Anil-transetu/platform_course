"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle, FileText, Plus, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateDomainModal from "@/components/sidebar/CreateDomainModel";
import StatsCard from "@/components/ui/StatsCard";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable from "@/components/reusable/DataTable";
import CourseDeleteDialog from "./CourseDeleteDialog";
import { buildCourseColumns, buildDomainColumns, Course, Domain } from "./columns";
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
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-border/70 rounded-lg hover:bg-gray-50 dark:bg-muted/50 bg-white dark:bg-card transition-all text-gray-700 dark:text-foreground shadow-sm"
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
      <div className="flex flex-col gap-6 p-6 overflow-hidden h-full">
        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0">
          <StatsCard title="Total Courses" value={coursesData.length} icon={<BookOpen size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" tooltip="All courses available on the platform" />
          <StatsCard title="Active Courses" value={coursesData.filter(c => c.status === "Published").length} icon={<CheckCircle size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" tooltip="Courses currently published and accessible to students" />
          <StatsCard title="Draft Courses" value={coursesData.filter(c => c.status === "Draft").length} icon={<FileText size={20} />} iconBgClass="bg-orange-50" iconColorClass="text-orange-600" tooltip="Courses saved as draft and not yet published" />
        </div>

        {/* TABS */}
        <div className="flex gap-6 border-b flex-shrink-0">
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-2 font-medium transition-all text-sm ${
              activeTab === "courses"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:text-foreground"
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab("domains")}
            className={`pb-2 font-medium transition-all text-sm ${
              activeTab === "domains"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:text-foreground"
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