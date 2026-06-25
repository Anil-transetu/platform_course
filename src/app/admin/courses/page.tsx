"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  CheckCircle, 
  FileText, 
  Plus, 
  Eye, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  Terminal, 
  Settings, 
  ExternalLink 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateDomainModal from "@/components/sidebar/CreateDomainModel";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import DataTable from "@/components/reusable/DataTable";
import CourseDeleteDialog from "./CourseDeleteDialog";
import { buildCourseColumns, buildDomainColumns, Course } from "./columns";
import { Domain } from "@/types/domain";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "react-hot-toast";
import {
  useDomains,
  useDomainStats,
  useCreateDomain,
  useUpdateDomain,
  useDeleteDomain
} from "@/features/admin/domains/api/domain-api";
import { useAssignments } from "@/features/admin/assignments/api/use-assignments";

const getInitials = (name?: string) => {
  if (!name) return "C";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const avatarColors = [
  "bg-blue-100 text-blue-600 border border-blue-200",
  "bg-orange-200 text-orange-600 border border-orange-300",
  "bg-purple-100 text-purple-600 border border-purple-200",
  "bg-pink-100 text-pink-600 border border-pink-200",
  "bg-green-100 text-green-600 border border-green-200",
];

const getAvatarColor = (id: string | number) => {
  const index = typeof id === "number" ? id % avatarColors.length : String(id).length % avatarColors.length;
  return avatarColors[index];
};

// Master list of all possible courses to map tags and associate course details
const ALL_COURSES_DETAILS = [
  { id: "CRS-001", name: "Advanced Web Development", category: "Web Development", modules: 12, status: "Active" },
  { id: "CRS-014", name: "React & Redux Masterclass", category: "Frontend Frameworks", modules: 8, status: "Active" },
  { id: "CRS-022", name: "Cloud Architecture on AWS", category: "Infrastructure", modules: 15, status: "Draft" },
  { id: "CRS-035", name: "DevOps Pipelines for Beginners", category: "DevOps", modules: 10, status: "Active" },
  { id: "CRS-042", name: "Python for Machine Learning", category: "Data Science", modules: 8, status: "Active" },
  { id: "CRS-056", name: "Ethical Hacking Fundamentals", category: "Cybersecurity", modules: 15, status: "Active" },
  { id: "CRS-078", name: "UI/UX Strategy & Design", category: "Design", modules: 6, status: "Active" },
  { id: "CRS-090", name: "MERN Stack Bootcamp", category: "Web Development", modules: 14, status: "Draft" },
];

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
  
  // Track domain selected for details viewing
  const [viewingDomain, setViewingDomain] = useState<Domain | null>(null);

  // States for Associated Courses list in Domain Detail View
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState("All");
  const [coursePage, setCoursePage] = useState(1);
  const courseRowsPerPage = 5;

  // Domain Modals state
  const [domainModal, setDomainModal] = useState<{
    open: boolean;
    mode: "add" | "edit" | "view";
    domain: Domain | null;
  }>({
    open: false,
    mode: "add",
    domain: null,
  });

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
  
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);

  // Queries & Mutations for domains
  const {
    data: domainsResponse,
    isLoading: isDomainsLoading,
    isFetching: isDomainsFetching
  } = useDomains(
    activeTab === "domains" ? page : 1,
    rowsPerPage,
    search,
    statusFilter
  );

  const { data: domainStats } = useDomainStats();
  const { data: assignmentsRes } = useAssignments(1, 100);
  const availableAssignments = assignmentsRes?.data || [];

  const createDomainMutation = useCreateDomain();
  const updateDomainMutation = useUpdateDomain();
  const deleteDomainMutation = useDeleteDomain();

  // Normalize Domain List
  const domainsList: Domain[] = domainsResponse?.data || (Array.isArray(domainsResponse) ? domainsResponse : []);
  const totalDomainsCount = domainsResponse?.pagination?.total || domainsResponse?.total || domainsList.length;

  // Simulate courses initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingCourses(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulate courses fetching on filter changes
  useEffect(() => {
    if (isLoadingCourses) return;
    setIsFetchingCourses(true);
    const timer = setTimeout(() => {
      setIsFetchingCourses(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter, isLoadingCourses]);

  // Reset page & filters when switching tabs
  useEffect(() => {
    setPage(1);
    setStatusFilter("All");
    setSearch("");
  }, [activeTab]);

  const handleSaveDomain = async (data: Record<string, any>) => {
    try {
      if (domainModal.mode === "add") {
        await createDomainMutation.mutateAsync(data);
        toast.success("Domain created successfully");
      } else if (domainModal.domain) {
        await updateDomainMutation.mutateAsync({ id: domainModal.domain.id, data });
        toast.success("Domain updated successfully");
        
        // Update local viewing state if currently viewing this domain
        if (viewingDomain && viewingDomain.id === domainModal.domain.id) {
          setViewingDomain({
            ...viewingDomain,
            name: data.name || viewingDomain.name,
            description: data.description || viewingDomain.description,
            tags: data.tags || viewingDomain.tags,
            assignment_ids: data.assignment_ids || viewingDomain.assignment_ids,
            status: data.status || viewingDomain.status
          });
        }
      }
      setDomainModal({ open: false, mode: "add", domain: null });
    } catch (err: any) {
      toast.error(err.message || "Failed to save domain");
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.type === "course") {
      setCoursesData(coursesData.filter(c => c.id !== deleteDialog.item?.id));
      toast.success("Course deleted successfully (local simulation)");
    } else if (deleteDialog.item) {
      try {
        await deleteDomainMutation.mutateAsync(deleteDialog.item.id);
        toast.success("Domain deleted successfully");
        if (viewingDomain && viewingDomain.id === deleteDialog.item.id) {
          setViewingDomain(null);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to delete domain");
      }
    }
  };

  const filteredCourses = coursesData.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentData = activeTab === "courses" ? filteredCourses : domainsList;
  const totalCount = activeTab === "courses" ? filteredCourses.length : totalDomainsCount;
  const totalPages = activeTab === "courses" 
    ? Math.max(1, Math.ceil(filteredCourses.length / rowsPerPage))
    : Math.max(1, Math.ceil(totalDomainsCount / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visibleData = activeTab === "courses" ? currentData.slice(start, start + rowsPerPage) : currentData;

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
    ? `${start + 1}-${Math.min(start + (activeTab === "courses" ? rowsPerPage : visibleData.length), totalCount)} of ${totalCount}`
    : "0-0 of 0";

  const extraHeaderActions = (
    <div className="flex gap-3">
      <button 
        onClick={() => setDomainModal({ open: true, mode: "add", domain: null })}
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

  const isScreenLoading = activeTab === "courses" ? isLoadingCourses : isDomainsLoading;

  // Render Domain Detail View
  if (viewingDomain) {
    // Determine courses associated with the domain tags
    const associatedCoursesList = ALL_COURSES_DETAILS.filter(c => 
      viewingDomain.tags?.some(tag => tag.toLowerCase() === c.name.toLowerCase())
    );

    // Apply local search and status filtering on the Associated Courses
    const filteredAssociatedCourses = associatedCoursesList.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(courseSearch.toLowerCase());
      const matchesStatus = courseStatusFilter === "All" || c.status.toLowerCase() === courseStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    const courseTotalCount = filteredAssociatedCourses.length;
    const courseTotalPages = Math.max(1, Math.ceil(courseTotalCount / courseRowsPerPage));
    const courseStart = (coursePage - 1) * courseRowsPerPage;
    const visibleCourses = filteredAssociatedCourses.slice(courseStart, courseStart + courseRowsPerPage);

    const coursePaginationInfo = courseTotalCount > 0
      ? `${courseStart + 1}-${Math.min(courseStart + courseRowsPerPage, courseTotalCount)} of ${courseTotalCount} courses`
      : "0-0 of 0 courses";

    const associatedCourseColumns = [
      {
        key: "id",
        label: "ID",
        render: (val: any, row: any) => <span className="text-slate-500 font-medium">{row.id}</span>
      },
      {
        key: "name",
        label: "COURSE NAME",
        render: (val: any, row: any) => <span className="font-bold text-slate-800 text-sm">{row.name}</span>
      },
      {
        key: "category",
        label: "CATEGORY",
        render: (val: any, row: any) => <span className="text-slate-500 text-sm">{row.category}</span>
      },
      {
        key: "modules",
        label: "TOTAL MODULES",
        render: (val: any, row: any) => <span className="text-slate-600 font-medium text-sm text-center block w-full">{row.modules}</span>
      },
      {
        key: "status",
        label: "STATUS",
        render: (val: any, row: any) => {
          const isActive = row.status === "Active" || row.status === "active";
          return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              isActive ? "bg-green-50 text-green-600 border border-green-100" : "bg-orange-50 text-orange-600 border border-orange-100"
            }`}>
              {isActive ? "Active" : "Draft"}
            </span>
          );
        }
      }
    ];

    // Find Final Assignment details
    const matchedAssignment = availableAssignments.find(a => 
      viewingDomain.assignment_ids?.includes(Number(a.id))
    );
    const finalAssignmentName = matchedAssignment 
      ? matchedAssignment.title || matchedAssignment.assignment_title 
      : `Capstone Project: ${viewingDomain.name}`;

    const associatedCoursesSearchConfig = {
      enabled: true,
      placeholder: "Search courses in domain...",
      value: courseSearch,
      onChange: (val: string) => {
        setCourseSearch(val);
        setCoursePage(1);
      }
    };

    const associatedCoursesFilterConfig = [
      {
        id: "status",
        label: "Status: All",
        type: "select" as const,
        value: courseStatusFilter,
        options: [
          { value: "All", label: "Status: All" },
          { value: "Active", label: "Active" },
          { value: "Draft", label: "Draft" },
        ],
        onChange: (val: string | string[]) => {
          setCourseStatusFilter(Array.isArray(val) ? val[0] : val);
          setCoursePage(1);
        }
      }
    ];

    const handleOpenAssignment = () => {
      if (viewingDomain.assignment_ids && viewingDomain.assignment_ids.length > 0) {
        router.push(`/admin/assignments/${viewingDomain.assignment_ids[0]}`);
      } else {
        toast.error("No final assignment assigned to this domain yet.");
      }
    };

    return (
      <ListingScreenTemplate
        headerText="Course Management"
        subHeaderText="Manage and monitor all courses and domains"
        buttonRequired={false}
        buttonOnclick={() => {}}
        extraActions={
          <button 
            onClick={() => setViewingDomain(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-border/70 rounded-lg hover:bg-gray-50 dark:bg-muted/50 bg-white dark:bg-card transition-all text-gray-700 dark:text-foreground shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Domains
          </button>
        }
      >
        <div className="p-4 sm:p-6 space-y-6 flex flex-col overflow-y-auto h-full">
          

          {/* Domain card info */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex gap-4 items-start">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${getAvatarColor(viewingDomain.id)}`}>
              {getInitials(viewingDomain.name)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{viewingDomain.name}</h2>
                  <p className="text-slate-500 text-sm mt-1">{viewingDomain.description || "No description provided."}</p>
                </div>
                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  viewingDomain.status === "Active" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                }`}>
                  {viewingDomain.status}
                </span>
              </div>
              
              {viewingDomain.tags && viewingDomain.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mr-1">Related Tags:</span>
                  {viewingDomain.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Associated Courses Card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800">Associated Courses</h2>
            
            {/* Courses Table using reusable DataTable built-in search and filters */}
            <div className="border border-gray-100 rounded-xl overflow-hidden flex flex-col">
              <DataTable<any>
                data={visibleCourses}
                columns={associatedCourseColumns}
                loading={false}
                rowKey={(item) => String(item.id)}
                bodyHeight="auto"
                rowsPerPage={courseRowsPerPage}
                currentPage={coursePage}
                totalPages={courseTotalPages}
                onPageChange={setCoursePage}
                onRowsPerPageChange={() => {}}
                paginationInfo={coursePaginationInfo}
                showPagination={true}
                search={associatedCoursesSearchConfig}
                filters={associatedCoursesFilterConfig}
                actions={(course) => (
                  <button 
                    onClick={() => router.push(`/admin/courses/create?id=${course.id}`)}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
                  >
                    <Eye size={14} />
                    View
                  </button>
                )}
              />
            </div>
          </div>

          {/* Final Assessment Card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Final Assessment</h2>
              <p className="text-base font-bold text-slate-800 pt-1">
                {finalAssignmentName}
              </p>
            </div>

            <button
              onClick={handleOpenAssignment}
              className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-sm text-sm font-semibold flex items-center gap-2 transition-colors self-start sm:self-center flex-shrink-0"
            >
              <ExternalLink size={16} /> Open Assignment
            </button>
          </div>
        </div>

        <CreateDomainModal 
          isOpen={domainModal.open} 
          onClose={() => setDomainModal({ open: false, mode: "add", domain: null })} 
          onSubmit={handleSaveDomain} 
          mode={domainModal.mode}
          domain={domainModal.domain}
        />
      </ListingScreenTemplate>
    );
  }

  return (
    <ListingScreenTemplate
      headerText="Course Management"
      subHeaderText="Manage and monitor all courses and domains"
      buttonLabel="Create New Course"
      buttonRequired={false}
      buttonOnclick={() => {}}
      extraActions={extraHeaderActions}
    >
      <Toaster position="top-right" />
      {isScreenLoading ? (
        <CoursePageSkeleton />
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden h-full">
        {/* CARDS */}
        {activeTab === "courses" ? (
          <StatsGrid>
            <StatsCard title="Total Courses" value={coursesData.length} icon={<BookOpen size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" tooltip="All courses available on the platform" />
            <StatsCard title="Active Courses" value={coursesData.filter(c => c.status === "Published").length} icon={<CheckCircle size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" tooltip="Courses currently published and accessible to students" />
            <StatsCard title="Draft Courses" value={coursesData.filter(c => c.status === "Draft").length} icon={<FileText size={20} />} iconBgClass="bg-orange-50" iconColorClass="text-orange-600" tooltip="Courses saved as draft and not yet published" />
          </StatsGrid>
        ) : (
          <StatsGrid>
            <StatsCard title="Total Domains" value={domainStats?.total || totalCount} icon={<BookOpen size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" tooltip="All academic domains managed" />
            <StatsCard title="Active Domains" value={domainStats?.active || domainsList.filter(d => d.status === "Active").length} icon={<CheckCircle size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" tooltip="Domains currently active" />
            <StatsCard title="Inactive Domains" value={(domainStats?.total || totalCount) - (domainStats?.active || domainsList.filter(d => d.status === "Active").length)} icon={<FileText size={20} />} iconBgClass="bg-orange-50" iconColorClass="text-orange-600" tooltip="Domains currently inactive" />
          </StatsGrid>
        )}

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
            loading={activeTab === "courses" ? (isLoadingCourses || isFetchingCourses) : (isDomainsLoading || isDomainsFetching)}
            rowKey={(item) => String(item.id)}
            search={searchConfig}
            filters={filterConfig}
            actions={(item) => (
              <div className="flex justify-center">
                <ActionMenu 
                  onView={() => {
                    if (activeTab === "courses") {
                      router.push("/admin/courses/create");
                    } else {
                      setViewingDomain(item);
                    }
                  }}
                  onEdit={() => {
                    if (activeTab === "courses") {
                      router.push(`/admin/courses/create?id=${item.id}`);
                    } else {
                      setDomainModal({ open: true, mode: "edit", domain: item });
                    }
                  }}
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

      <CreateDomainModal 
        isOpen={domainModal.open} 
        onClose={() => setDomainModal({ open: false, mode: "add", domain: null })} 
        onSubmit={handleSaveDomain} 
        mode={domainModal.mode}
        domain={domainModal.domain}
      />
      
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