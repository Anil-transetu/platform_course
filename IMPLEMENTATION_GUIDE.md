# Production-Ready Implementation Guide

## Complete Architecture & Best Practices

This guide covers the production-ready implementation of:
- Reusable DataTable with TanStack Table
- TanStack Query integration  
- Create/Edit form reuse patterns
- Proper folder structure and organization

---

## 1. Project Structure (Final)

```
src/
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── label.tsx
│   │   └── table.tsx
│   ├── tables/
│   │   └── data-table.tsx           # Reusable DataTable component
│   └── forms/
│       └── form-modal.tsx           # Reusable Create/Edit Modal
├── features/
│   └── students/
│       ├── use-students.ts          # TanStack Query hooks
│       └── page-example.tsx         # Example usage
├── hooks/
│   ├── use-table-state.ts
│   └── use-api-error.ts
├── lib/
│   ├── utils.ts                     # Tailwind utilities
│   ├── query-client.ts              # QueryClient configuration
│   └── api-client.ts                # Centralized API client
├── types/
│   └── common.ts                    # Shared types
```

---

## 2. Setup Instructions

### Install Dependencies

```bash
npm install
```

The `package.json` already includes:
- `@tanstack/react-query` - Data fetching & caching
- `@tanstack/react-table` - Headless table logic
- `@radix-ui/*` - Unstyled UI components
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `class-variance-authority` - CSS class composition

### Environment Variables

Ensure `.env.local` contains:

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

---

## 3. Using the DataTable Component

### Basic Example (Client-side Pagination)

```tsx
import { DataTable } from "@/src/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface User {
  id: number;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
];

const data: User[] = [/* ... */];

export function UserList() {
  return (
    <DataTable columns={columns} data={data} />
  );
}
```

### Server-side Pagination Example

```tsx
import { useTableState } from "@/src/hooks/use-table-state";
import { useGetUsers } from "@/src/features/users/use-users";

export function UserList() {
  const { pagination, handlePaginationChange } = useTableState();
  const { data: response, isLoading } = useGetUsers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  return (
    <DataTable
      columns={columns}
      data={response?.data || []}
      pageCount={response?.pagination.pages}
      rowCount={response?.pagination.total}
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      isLoading={isLoading}
    />
  );
}
```

### Props Reference

```typescript
interface DataTableProps<TData, TValue> {
  // Required
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // Optional - Pagination
  pageSize?: number;                    // Default: 10
  pageCount?: number;                   // For server mode
  rowCount?: number;                    // For server mode
  pagination?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (pagination) => void;

  // Optional - State
  isLoading?: boolean;
}
```

---

## 4. TanStack Query Pattern

### Create Feature Hooks

**File:** `src/features/students/use-students.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api-client";

const QUERY_KEY = ["students"];

// Read
export const useGetStudents = (params: PaginationParams) => {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => apiClient.get("/api/v1/students"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Create
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.post("/api/v1/students", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

// Update
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => 
      apiClient.put(`/api/v1/students/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

// Delete
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/api/v1/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
```

### Key Points

✅ One query key per resource  
✅ Invalidate queries after mutations  
✅ Keep hooks in `src/features/<feature>/`  
✅ Return typed responses  
✅ Handle pagination in the component, not the hook

---

## 5. Create/Edit Form Reuse

### Setup Validation Schema

```tsx
import { z } from "zod";

const studentSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  status: z.enum(["active", "inactive"]),
  notes: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;
```

### Use in Component

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateEditModal } from "@/src/components/forms/form-modal";

export function StudentList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const { mutateAsync: createStudent } = useCreateStudent();
  const { mutateAsync: updateStudent } = useUpdateStudent();

  const handleSubmit = async (data: StudentFormData) => {
    if (mode === "add") {
      await createStudent(data);
    } else {
      await updateStudent({ id: selectedStudent.id, data });
    }
  };

  return (
    <>
      <CreateEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Student"
        mode={mode}
        initialData={selectedStudent}
        form={form}
        fields={[
          {
            name: "first_name",
            label: "First Name",
            type: "text",
            required: true,
          },
          // ... more fields
        ]}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        error={apiError}
      />
    </>
  );
}
```

### Form Field Types Supported

```typescript
"text" | "email" | "password" | "number" | "textarea" | "select"
```

---

## 6. API Client Usage

### Centralized API Client

**File:** `src/lib/api-client.ts`

Handles:
- ✅ Authentication token management
- ✅ Error handling & 401 logout
- ✅ Type-safe requests
- ✅ JSON serialization

### Usage

```typescript
import { apiClient } from "@/src/lib/api-client";

// GET
const users = await apiClient.get<User[]>("/api/v1/users");

// POST
const newUser = await apiClient.post<User>("/api/v1/users", {
  name: "John",
  email: "john@example.com",
});

// PUT
await apiClient.put(`/api/v1/users/${id}`, updatedData);

// PATCH
await apiClient.patch(`/api/v1/users/${id}`, partialData);

// DELETE
await apiClient.delete(`/api/v1/users/${id}`);
```

---

## 7. Best Practices Checklist

### DataTable
- ✅ Memoize `columns` with `useMemo()`
- ✅ Use `isLoading` prop to show loading state
- ✅ Server pagination when `pageCount` or `rowCount` provided
- ✅ Always use server pagination for large datasets

### TanStack Query
- ✅ Use `queryKey` consistently: `[feature, params]`
- ✅ Invalidate queries after mutations
- ✅ Set appropriate `staleTime` (default: 5 min)
- ✅ Use `useQueryClient` for optimistic updates
- ✅ Keep hooks in feature folders

### Forms
- ✅ Single modal for create & edit with `mode` prop
- ✅ Reset form with `useEffect` when data changes
- ✅ Use Zod for validation
- ✅ Show errors in modal  
- ✅ Disable buttons while loading

### General
- ✅ Use TypeScript for all components
- ✅ Extract reusable logic to hooks
- ✅ Keep components focused and small
- ✅ Always handle errors gracefully

---

## 8. Common Patterns

### Pagination + Filtering + Sorting

```tsx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
const [search, setSearch] = useState("");

const { data } = useGetStudents({
  page: pagination.pageIndex + 1,
  limit: pagination.pageSize,
  search,
});

return (
  <>
    <input 
      placeholder="Search..."
      onChange={(e) => {
        setSearch(e.target.value);
        setPagination({ ...pagination, pageIndex: 0 }); // Reset to first page
      }}
    />
    <DataTable
      {...tableProps}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  </>
);
```

### Optimistic Updates

```tsx
const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.put(`/api/v1/students/${id}`, data),
    
    // Optimistic update
    onMutate: (newData) => {
      queryClient.setQueryData(
        ["students", id],
        (old) => ({ ...old, ...newData })
      );
    },
    
    // Revert on error
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["students", id] });
    },
  });
};
```

---

## ✅ Summary

**Production-ready components:**
- DataTable (pagination, sorting, filtering, loading states)
- CreateEditModal (single reusable form for add/edit)
- API Client (auth, errors, type safety)

**Best practices implemented:**
- TanStack Query with proper cache invalidation
- React Hook Form with Zod validation
- shadcn/ui components (styled, accessible)
- Typescript throughout
- Proper folder structure by feature

**Next steps:**
1. Copy `src/features/students/use-students.ts` pattern for each feature
2. Use `DataTable` for all list pages
3. Use `CreateEditModal` for all create/edit flows
4. Keep forms in modals, not separate pages

---

## 🚀 You're ready for production!
