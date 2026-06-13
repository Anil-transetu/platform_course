import { Column } from "@/components/reusable/DataTable";

export interface Course {
  id: number;
  name: string;
  category: string;
  modules: number;
  updated: string;
  status: string;
}

export interface Domain {
  id: number;
  name: string;
  category: string;
  courses: number;
  updated: string;
  status: string;
}

export const buildCourseColumns = (): Column<Course>[] => [
  {
    key: "id",
    label: "ID",
    render: (value, row) => <span className="font-medium text-gray-900">{row.id}</span>,
  },
  {
    key: "name",
    label: "Course Name",
    render: (value, row) => (
      <div className="font-medium text-gray-900">{row.name}</div>
    ),
  },
  {
    key: "category",
    label: "Category",
    render: (value, row) => (
      <span className="text-gray-500">{row.category}</span>
    ),
  },
  {
    key: "modules",
    label: "Total Modules",
    render: (value, row) => (
      <span>{row.modules} Modules</span>
    ),
  },
  {
    key: "updated",
    label: "Last Updated",
    render: (value, row) => (
      <span className="text-gray-500">{row.updated}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value, row) => (
      <span
        className={`px-2.5 py-1 text-xs rounded-full font-medium border ${
          row.status === "Published"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-orange-50 text-orange-700 border-orange-200"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

export const buildDomainColumns = (): Column<Domain>[] => [
  {
    key: "id",
    label: "ID",
    render: (value, row) => <span className="font-medium text-gray-900">{row.id}</span>,
  },
  {
    key: "name",
    label: "Domain Name",
    render: (value, row) => (
      <div className="font-medium text-gray-900">{row.name}</div>
    ),
  },
  {
    key: "category",
    label: "Category",
    render: (value, row) => (
      <span className="text-gray-500">{row.category}</span>
    ),
  },
  {
    key: "courses",
    label: "Total Courses",
    render: (value, row) => (
      <span>{row.courses} Courses</span>
    ),
  },
  {
    key: "updated",
    label: "Last Updated",
    render: (value, row) => (
      <span className="text-gray-500">{row.updated}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value, row) => (
      <span
        className={`px-2.5 py-1 text-xs rounded-full font-medium border ${
          row.status === "Active"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";

const getInitials = (name?: string) => {
  if (!name) return "C";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-orange-200 text-orange-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
  "bg-green-100 text-green-600",
];

const getAvatarColor = (id: string | number) => {
  const index = typeof id === "number" ? id % avatarColors.length : String(id).length % avatarColors.length;
  return avatarColors[index];
};

export interface Course {
  id: number;
  name: string;
  category: string;
  modules: number;
  updated: string;
  status: string;
}

export interface Domain {
  id: number;
  name: string;
  category: string;
  courses: number;
  updated: string;
  status: string;
}

export const buildCourseColumns = (): Column<Course>[] => [
  {
    key: "id",
    label: "ID",
    render: (value, row) => (
      <div className="font-semibold text-slate-600 text-sm">#CRS-{row.id}</div>
    ),
  },
  {
    key: "name",
    label: "COURSE NAME",
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold",
          getAvatarColor(row.id)
        )}>
          {getInitials(row.name)}
        </div>
        <div className="font-semibold text-slate-900 text-sm">{row.name}</div>
      </div>
    ),
  },
  {
    key: "category",
    label: "CATEGORY",
    render: (value, row) => (
      <span className="text-slate-500 text-sm">{row.category}</span>
    ),
  },
  {
    key: "modules",
    label: "TOTAL MODULES",
    render: (value, row) => (
      <span className="text-slate-700 font-medium text-sm">{row.modules} Modules</span>
    ),
  },
  {
    key: "updated",
    label: "LAST UPDATED",
    render: (value, row) => (
      <span className="text-slate-500 text-sm">{row.updated}</span>
    ),
  },
  {
    key: "status",
    label: "STATUS",
    render: (value, row) => {
      const isPublished = row.status === "Published";
      return (
        <Badge className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-bold border-none transition-all",
          isPublished
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
        )}>
          {row.status}
        </Badge>
      );
    },
  },
];

export const buildDomainColumns = (): Column<Domain>[] => [
  {
    key: "id",
    label: "ID",
    render: (value, row) => (
      <div className="font-semibold text-slate-600 text-sm">#DOM-{row.id}</div>
    ),
  },
  {
    key: "name",
    label: "DOMAIN NAME",
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold",
          getAvatarColor(row.id)
        )}>
          {getInitials(row.name)}
        </div>
        <div className="font-semibold text-slate-900 text-sm">{row.name}</div>
      </div>
    ),
  },
  {
    key: "category",
    label: "CATEGORY",
    render: (value, row) => (
      <span className="text-slate-500 text-sm">{row.category}</span>
    ),
  },
  {
    key: "courses",
    label: "TOTAL COURSES",
    render: (value, row) => (
      <span className="text-slate-700 font-medium text-sm">{row.courses} Courses</span>
    ),
  },
  {
    key: "updated",
    label: "LAST UPDATED",
    render: (value, row) => (
      <span className="text-slate-500 text-sm">{row.updated}</span>
    ),
  },
  {
    key: "status",
    label: "STATUS",
    render: (value, row) => {
      const isActive = row.status === "Active";
      return (
        <Badge className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-bold border-none transition-all",
          isActive
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        )}>
          {row.status}
        </Badge>
      );
    },
  },
];
