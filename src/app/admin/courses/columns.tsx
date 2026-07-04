import { Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";
import { Domain } from "@/types/domain";
export type { Domain };

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


export const buildCourseColumns = (): Column<Course>[] => [
  {
    key: "id",
    label: "ID",
    render: (value, row) => <span className="font-medium text-gray-900 dark:text-foreground">{row.id}</span>,
  },
  {
    key: "name",
    label: "Course Name",
    render: (value, row) => (
      <div className="flex items-center gap-3 max-w-[280px]">
        <div className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
          getAvatarColor(row.id)
        )}>
          {getInitials(row.name)}
        </div>
        <div className="font-semibold text-slate-900 dark:text-foreground text-sm whitespace-normal break-words leading-tight">
          {row.name}
        </div>
      </div>
    ),
  },
  {
    key: "category",
    label: "Category",
    render: (value, row) => (
      <span className="text-gray-500 dark:text-muted-foreground">{row.category}</span>
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
      <span className="text-gray-500 dark:text-muted-foreground">{row.updated}</span>
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
    render: (value, row) => <span className="font-medium text-gray-900 dark:text-foreground">{row.id}</span>,
  },
  {
    key: "name",
    label: "Domain Name",
    render: (value, row) => (
      <div className="flex items-center gap-3 max-w-[240px]">
        <div className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
          getAvatarColor(row.id)
        )}>
          {getInitials(row.name)}
        </div>
        <div className="font-semibold text-slate-900 dark:text-foreground text-sm whitespace-normal break-words leading-tight">
          {row.name}
        </div>
      </div>
    ),
  },
  {
    key: "category",
    label: "Category",
    render: (value, row) => (
      <span className="text-gray-500 dark:text-muted-foreground">{row.category}</span>
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
      <span className="text-gray-500 dark:text-muted-foreground">{row.updated}</span>
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
            : "bg-gray-50 dark:bg-muted/50 text-gray-700 dark:text-foreground border-gray-200 dark:border-border/70"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];