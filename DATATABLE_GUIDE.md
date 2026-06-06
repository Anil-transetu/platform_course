# DataTableWithFilters Component - Complete Guide

## Overview

`DataTableWithFilters` is a powerful, reusable React component for displaying data in a table format with integrated search and filter functionality. It provides a complete data management interface with pagination, sorting support, and multiple filter types.

## Features

- ✅ **Search Functionality** - Configurable search with placeholder
- ✅ **Multiple Filter Types** - Select, Multiselect, Text, Date Range
- ✅ **Pagination** - Built-in pagination with customizable rows per page
- ✅ **Dynamic Columns** - Define columns with custom rendering
- ✅ **Actions** - Custom action buttons per row
- ✅ **Loading State** - Visual feedback during data loading
- ✅ **Empty State** - Customizable empty state message
- ✅ **Sortable Headers** - Optional column sorting indicators
- ✅ **Responsive Design** - Mobile-friendly layout

## Installation

The component is already in: `components/reusable/DataTableWithFilters.tsx`

The custom hook is in: `hooks/use-search-filters.ts`

## Component API

### Props Interface

```typescript
interface DataTableWithFiltersProps<T extends Record<string, unknown>> {
  /* DATA & COLUMNS */
  data: T[];
  columns: Column<T>[];
  rowKey?: (row: T, index: number) => string | number;
  actions?: (row: T) => ReactNode;

  /* SEARCH */
  search: SearchConfig;

  /* FILTERS */
  filters?: FilterConfig[];

  /* PAGINATION */
  rowsPerPage: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  paginationInfo?: string;
  showPagination?: boolean;

  /* STYLING */
  bodyHeight?: string;

  /* ADDITIONAL */
  loading?: boolean;
  emptyStateMessage?: string;
}
```

### Types

#### SearchConfig

```typescript
interface SearchConfig {
  enabled: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  searchableFields?: string[]; // Optional: specify which fields to search
}
```

#### FilterConfig

```typescript
interface FilterConfig {
  id: string; // Unique identifier for the filter
  label: string;
  type: "select" | "multiselect" | "text" | "date-range";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  clearable?: boolean;
}
```

#### Column

```typescript
interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  width?: string;
  sortable?: boolean;
}
```

## Usage Examples

### Example 1: Simple Student List with Search and Status Filter

```tsx
"use client";

import { useState } from "react";
import DataTableWithFilters from "@/components/reusable/DataTableWithFilters";
import { useSearchFilters } from "@/hooks/use-search-filters";

interface Student {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  batchId: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "John Doe", email: "john@example.com", status: "active", batchId: "B1" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", status: "inactive", batchId: "B2" },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Use the custom hook for search and filters
  const { search, filters } = useSearchFilters({
    searchable: true,
    searchPlaceholder: "Search by name or email...",
    filterConfigs: [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      },
      {
        id: "batch",
        label: "Batch",
        type: "select",
        options: [
          { value: "B1", label: "Batch 1" },
          { value: "B2", label: "Batch 2" },
        ],
      },
    ],
  });

  const columns = [
    { key: "name" as const, label: "Name", width: "w-1/4", sortable: true },
    { key: "email" as const, label: "Email", width: "w-1/3" },
    {
      key: "status" as const,
      label: "Status",
      width: "w-1/6",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Students</h1>

      <DataTableWithFilters
        data={students}
        columns={columns}
        search={search}
        filters={filters}
        rowsPerPage={rowsPerPage}
        currentPage={currentPage}
        totalPages={Math.ceil(students.length / rowsPerPage)}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        paginationInfo={`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
          currentPage * rowsPerPage,
          students.length
        )} of ${students.length}`}
      />
    </div>
  );
}
```

### Example 2: Admin Assignments with Multiple Filters

```tsx
"use client";

import { useState, useMemo } from "react";
import DataTableWithFilters from "@/components/reusable/DataTableWithFilters";
import { useSearchFilters } from "@/hooks/use-search-filters";

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: "pending" | "completed" | "overdue";
  submissionCount: number;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "React Basics",
      course: "Web Development",
      dueDate: "2024-06-15",
      status: "completed",
      submissionCount: 25,
    },
    {
      id: "2",
      title: "Database Design",
      course: "Backend Development",
      dueDate: "2024-06-20",
      status: "pending",
      submissionCount: 18,
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Use the custom hook for search and filters
  const { search, filters } = useSearchFilters({
    searchable: true,
    searchPlaceholder: "Search assignments...",
    filterConfigs: [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "pending", label: "Pending" },
          { value: "completed", label: "Completed" },
          { value: "overdue", label: "Overdue" },
        ],
      },
      {
        id: "course",
        label: "Course",
        type: "select",
        options: [
          { value: "web", label: "Web Development" },
          { value: "backend", label: "Backend Development" },
        ],
      },
      {
        id: "dueDate",
        label: "Due Date",
        type: "date-range",
        clearable: true,
      },
    ],
  });

  const columns = [
    {
      key: "title" as const,
      label: "Title",
      width: "w-1/4",
      sortable: true,
      render: (value: unknown, row: Assignment) => (
        <div>
          <p className="font-semibold">{value}</p>
          <p className="text-sm text-gray-500">{row.course}</p>
        </div>
      ),
    },
    {
      key: "dueDate" as const,
      label: "Due Date",
      width: "w-1/6",
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: "status" as const,
      label: "Status",
      width: "w-1/6",
      render: (value) => {
        const statusConfig = {
          pending: "bg-yellow-100 text-yellow-800",
          completed: "bg-green-100 text-green-800",
          overdue: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusConfig[value as keyof typeof statusConfig]
            }`}
          >
            {String(value).toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "submissionCount" as const,
      label: "Submissions",
      width: "w-1/6",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assignments</h1>

      <DataTableWithFilters
        data={assignments}
        columns={columns}
        search={search}
        filters={filters}
        rowsPerPage={rowsPerPage}
        currentPage={currentPage}
        totalPages={Math.ceil(assignments.length / rowsPerPage)}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        loading={loading}
        emptyStateMessage="No assignments found"
        paginationInfo={`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
          currentPage * rowsPerPage,
          assignments.length
        )} of ${assignments.length}`}
      />
    </div>
  );
}
```

### Example 3: Using Custom Hook `useSearchFilters`

```tsx
import { useSearchFilters } from "@/hooks/use-search-filters";

export default function MyPage() {
  const { search, filters, resetAll, filterValues } = useSearchFilters({
    searchable: true,
    filterConfigs: [
      {
        id: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "cat1", label: "Category 1" },
          { value: "cat2", label: "Category 2" },
        ],
      },
      {
        id: "tags",
        label: "Tags",
        type: "multiselect",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      },
    ],
  });

  // Access current values
  console.log(search.value); // Current search text
  console.log(filterValues); // All filter values

  return (
    <div>
      <button onClick={resetAll}>Reset All Filters</button>

      <DataTableWithFilters
        data={data}
        columns={columns}
        search={search}
        filters={filters}
        // ... other props
      />
    </div>
  );
}
```

## Filter Types

### 1. Select (Single Selection)

```typescript
{
  id: "status",
  label: "Status",
  type: "select",
  options: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
}
```

### 2. Multiselect (Multiple Selection)

```typescript
{
  id: "tags",
  label: "Tags",
  type: "multiselect",
  options: [
    { value: "tag1", label: "JavaScript" },
    { value: "tag2", label: "React" },
  ],
}
```

### 3. Text Input

```typescript
{
  id: "email",
  label: "Email",
  type: "text",
  placeholder: "Enter email...",
}
```

### 4. Date Range

```typescript
{
  id: "dateRange",
  label: "Date",
  type: "date-range",
  clearable: true,
}
```

## Custom Hook: `useSearchFilters`

The `useSearchFilters` hook simplifies state management for search and filters.

### Features

- Automatic state initialization
- Reset functions (individual filters, search, or all)
- Memoized values for performance
- Type-safe filter values

### Usage

```typescript
const { search, filters, resetAll, filterValues } = useSearchFilters({
  searchable: true,
  searchPlaceholder: "Search...",
  filterConfigs: [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [...],
    },
  ],
});
```

## Styling & Customization

### CSS Classes

- Table container: `bg-white rounded-lg shadow-sm border border-gray-200`
- Headers: `bg-gray-50 border-gray-200`
- Rows: `border-b border-gray-100 hover:bg-gray-50`
- Pagination: `bg-white border-t border-gray-200`

### Tailwind Customization

All styling uses Tailwind CSS classes. You can customize by:

1. Modifying the component directly
2. Creating wrapper components with custom styling
3. Using CSS modules with Tailwind

## Best Practices

1. **Use the Hook** - Always use `useSearchFilters` for consistent state management
2. **Memoize Data** - Memoize expensive computations on the main page
3. **Unique Keys** - Provide unique `rowKey` for list rendering
4. **Type Safety** - Always define proper TypeScript interfaces for your data
5. **Error Boundaries** - Wrap in error boundaries for production apps
6. **Pagination Logic** - Calculate `totalPages` based on filtered data length

## Performance Tips

- Use `rowKey` prop to help React identify which items have changed
- Memoize filter options to prevent unnecessary re-renders
- Use `useMemo` for computed pagination values
- Consider virtualizing large lists (100+ items)

## Common Issues & Solutions

### Issue: Filters not updating data
**Solution**: Implement filtering logic on the main page based on `filterValues`

### Issue: Search not working
**Solution**: Ensure your component implements search filtering logic based on `search.value`

### Issue: Pagination showing wrong count
**Solution**: Ensure `totalPages` is calculated correctly based on filtered data

## Future Enhancements

- [ ] Built-in sorting
- [ ] Export to CSV/Excel
- [ ] Column resizing
- [ ] Advanced date range picker
- [ ] Bulk actions
- [ ] Row selection

