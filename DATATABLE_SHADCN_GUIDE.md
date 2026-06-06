# DataTable Component with shadcn/ui - Complete Guide

## 🎨 Component Overview

The rebuilt `DataTable` component now uses **shadcn/ui** components instead of plain HTML elements for a cohesive, professional design system.

### Components Used

| Feature | shadcn/ui Component | File |
|---------|-------------------|------|
| **Buttons** | `Button` | `/components/ui/button.tsx` |
| **Search Input** | `Input` | `/components/ui/input.tsx` |
| **Filters** | `Select` | `/components/ui/select.tsx` |
| **Table** | `Table` | `/components/ui/table.tsx` |
| **Status Badges** | `Badge` | `/components/ui/badge.tsx` |
| **Icons** | Lucide React | lucide-react |

---

## 📦 Included shadcn/ui Components

The following shadcn/ui components are already configured in your project:

- ✅ Button
- ✅ Input
- ✅ Select
- ✅ Table
- ✅ Badge
- ✅ Dialog
- ✅ Checkbox
- ✅ Label
- ✅ Textarea
- ✅ Form
- ✅ Dropdown Menu

All use Radix UI primitives and Tailwind CSS for styling.

---

## 🔧 DataTable Props

```typescript
interface DataTableProps<T extends Record<string, unknown>> {
  // Data & Columns
  data: T[];
  columns: Column<T>[];
  rowKey?: (row: T, index: number) => string | number;
  actions?: (row: T) => ReactNode;

  // Pagination
  rowsPerPage: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  paginationInfo?: string;
  showPagination?: boolean;

  // Search (NEW - shadcn/ui powered)
  search?: SearchConfig;

  // Filters (NEW - shadcn/ui powered)
  filters?: FilterConfig[];

  // States
  loading?: boolean;
  emptyStateMessage?: string;
  bodyHeight?: string;
}
```

---

## 🔍 Search Configuration

```typescript
interface SearchConfig {
  enabled: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}
```

**Features:**
- Search icon from Lucide React
- Integrated with shadcn/ui Input
- Responsive and accessible

---

## 🎯 Filter Configuration

```typescript
interface FilterConfig {
  id: string;
  label: string;
  type: "select" | "multiselect" | "text" | "date-range";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  clearable?: boolean;
}
```

### Filter Types

#### 1. **Select** - Single Selection
```typescript
{
  id: "status",
  label: "Status",
  type: "select",
  options: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
  clearable: true,
}
```

#### 2. **Multiselect** - Multiple Selection
```typescript
{
  id: "categories",
  label: "Categories",
  type: "multiselect",
  options: [
    { value: "cat1", label: "Category 1" },
    { value: "cat2", label: "Category 2" },
  ],
}
```

#### 3. **Text** - Text Input
```typescript
{
  id: "searchText",
  label: "Custom Search",
  type: "text",
  placeholder: "Type here...",
}
```

#### 4. **Date Range** - Date Picker
```typescript
{
  id: "dateRange",
  label: "Date",
  type: "date-range",
  clearable: true,
}
```

---

## 🪝 useSearchFilters Hook

Custom hook for managing search and filter state:

```typescript
import { useSearchFilters } from "@/hooks/use-search-filters";

const { search, filters, filterValues, searchValue, resetAll, resetFilters, resetSearch } = useSearchFilters({
  searchable: true,
  searchPlaceholder: "Search...",
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
  ],
});
```

### Returned Values

| Property | Type | Description |
|----------|------|-------------|
| `search` | `SearchConfig` | Search state object |
| `filters` | `FilterConfig[]` | Filter objects ready for component |
| `searchValue` | `string` | Current search text |
| `filterValues` | `Record<string, string \| string[]>` | Current filter values |
| `resetSearch()` | `() => void` | Reset search to empty |
| `resetFilters()` | `() => void` | Reset all filters to empty |
| `resetAll()` | `() => void` | Reset search and filters |

---

## 📋 Column Configuration

```typescript
interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  width?: string;
  sortable?: boolean;
}
```

### Example: Using Badge for Status

```tsx
import { Badge } from "@/components/ui/badge";

const columns = [
  {
    key: "status" as const,
    label: "Status",
    render: (value: unknown) => (
      <Badge variant={value === "active" ? "default" : "secondary"}>
        {String(value).toUpperCase()}
      </Badge>
    ),
  },
];
```

---

## 💻 Complete Usage Example

```tsx
"use client";

import { useState, useMemo } from "react";
import DataTable from "@/components/reusable/DataTable";
import { useSearchFilters } from "@/hooks/use-search-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
}

const USERS: User[] = [
  { id: "1", name: "John", email: "john@example.com", role: "admin", status: "active" },
  { id: "2", name: "Jane", email: "jane@example.com", role: "user", status: "inactive" },
];

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { search, filters, filterValues, searchValue } = useSearchFilters({
    searchable: true,
    searchPlaceholder: "Search users...",
    filterConfigs: [
      {
        id: "role",
        label: "Role",
        type: "select",
        options: [
          { value: "admin", label: "Admin" },
          { value: "user", label: "User" },
        ],
        clearable: true,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
        clearable: true,
      },
    ],
  });

  // Filter data
  const filteredData = useMemo(() => {
    let result = USERS;

    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    if (filterValues.role) {
      result = result.filter((user) => user.role === filterValues.role);
    }

    if (filterValues.status) {
      result = result.filter((user) => user.status === filterValues.status);
    }

    return result;
  }, [searchValue, filterValues]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const columns = [
    { key: "name" as const, label: "Name", sortable: true },
    { key: "email" as const, label: "Email" },
    {
      key: "role" as const,
      label: "Role",
      render: (value: unknown) => (
        <Badge variant="outline">{String(value)}</Badge>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: unknown) => (
        <Badge variant={value === "active" ? "default" : "destructive"}>
          {String(value)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      <DataTable
        data={filteredData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        )}
        columns={columns}
        search={search}
        filters={filters}
        actions={(user: Record<string, unknown>) => (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        )}
        rowsPerPage={rowsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        paginationInfo={`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
          currentPage * rowsPerPage,
          filteredData.length
        )} of ${filteredData.length}`}
      />
    </div>
  );
}
```

---

## 🎨 Customization with shadcn/ui

### Button Variants

```tsx
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Button Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

### Badge Variants

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

---

## 🌟 Features

✅ **Search Bar** - With Lucide React search icon
✅ **Multiple Filter Types** - Select, Multiselect, Text, Date
✅ **Clear Filters** - Each filter has a clear button
✅ **Pagination** - With first/previous/next/last buttons
✅ **Loading State** - Animated loading indicator
✅ **Sortable Columns** - Indicators for sortable columns
✅ **Responsive** - Mobile-friendly layout
✅ **Accessible** - WCAG compliant with Radix UI
✅ **Dark Mode Ready** - Uses CSS variables from tailwind theme
✅ **TypeScript** - Full type safety

---

## 🚀 Best Practices

1. **Always use the custom hook** for state management
2. **Memoize filtered data** to prevent unnecessary re-renders
3. **Use Badge component** for status displays
4. **Use Button component** for all actions
5. **Pass Record<string, unknown>** for data type compatibility
6. **Implement search logic** on the parent component
7. **Calculate pagination** based on filtered data length

---

## 📱 Responsive Design

The DataTable is fully responsive:

- **Desktop**: Full width with all columns visible
- **Tablet**: Columns with wider widths may stack
- **Mobile**: Horizontal scroll available, filters stack vertically

---

## 🔗 Related Files

- Component: `/components/reusable/DataTable.tsx`
- Hook: `/hooks/use-search-filters.ts`
- Example: `/components/reusable/DataTable.example.tsx`
- UI Components: `/components/ui/`

---

## 💡 Tips

- Use `clearable: true` for filters you want users to reset
- Use `sortable: true` on columns that should support sorting
- Combine multiple filters for advanced filtering
- Use `emptyStateMessage` for better UX
- Always calculate `totalPages` from filtered data, not all data

