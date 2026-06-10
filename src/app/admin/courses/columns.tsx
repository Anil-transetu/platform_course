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
