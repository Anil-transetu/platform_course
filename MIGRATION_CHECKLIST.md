# Migration Checklist: Implementing Production-Ready Components

Use this checklist to migrate your existing components to the new production-ready architecture.

---

## Phase 1: Setup (✅ Already Done)

- [x] Install dependencies (shadcn/ui, TanStack Query, React Hook Form, Zod)
- [x] Create folder structure in `src/`
- [x] Create UI components (button, input, select, dialog, form, table, label, textarea)
- [x] Create API client (`lib/api-client.ts`)
- [x] Create Query client configuration (`lib/query-client.ts`)
- [x] Create common hooks (useTableState, useApiError)
- [x] Create reusable components (DataTable, CreateEditModal)

---

## Phase 2: Implement for Each Feature

### For Students Feature (PRIORITY #1)

- [ ] Copy hook pattern: Create `src/features/students/use-students.ts`
  - [ ] useGetStudents() - server pagination
  - [ ] useCreateStudent() - POST
  - [ ] useUpdateStudent() - PUT
  - [ ] useDeleteStudent() - DELETE

- [ ] Update `app/admin/students/page.tsx`
  - [ ] Import hooks from `src/features/students/use-students.ts`
  - [ ] Use DataTable component with server pagination
  - [ ] Setup table columns with useMemo
  - [ ] Implement row actions (edit/delete)

- [ ] Create `src/features/students/create-edit-modal.tsx`
  - [ ] Setup Zod validation schema
  - [ ] Setup react-hook-form with resolver
  - [ ] Use CreateEditModal component
  - [ ] Define form fields
  - [ ] Handle create/update/delete

- [ ] Remove old components:
  - [ ] Delete `components/AddStudentModal.tsx`
  - [ ] Delete `components/EditStudentModal.tsx`
  - [ ] Clean up old API calls

---

### For Other Features (Repeat Pattern)

#### Users Feature
- [ ] Create `src/features/users/use-users.ts` (CRUD hooks)
- [ ] Update `app/admin/users/page.tsx` (DataTable + Modal)
- [ ] Remove old components

#### Institutions Feature
- [ ] Create `src/features/institutions/use-institutions.ts` (CRUD hooks)
- [ ] Update `app/admin/institutions/page.tsx` (DataTable + Modal)
- [ ] Remove old components

#### Courses Feature
- [ ] Create `src/features/courses/use-courses.ts` (CRUD hooks)
- [ ] Update `app/admin/courses/page.tsx` (DataTable + Modal)
- [ ] Remove old components

#### Assignments Feature
- [ ] Create `src/features/assignments/use-assignments.ts` (CRUD hooks)
- [ ] Update `app/admin/assignments/page.tsx` (DataTable + Modal)
- [ ] Remove old components

#### Batches Feature
- [ ] Create `src/features/batches/use-batches.ts` (CRUD hooks)
- [ ] Update `app/admin/batches/page.tsx` (DataTable + Modal)
- [ ] Remove old components

#### Quizzes Feature
- [ ] Create `src/features/quizzes/use-quizzes.ts` (CRUD hooks)
- [ ] Update `app/admin/quizzes/page.tsx` (DataTable + Modal)
- [ ] Remove old components

#### Tutors Feature
- [ ] Create `src/features/tutors/use-tutors.ts` (CRUD hooks)
- [ ] Update `app/admin/tutors/page.tsx` (DataTable + Modal)
- [ ] Remove old components

---

## Phase 3: Student Pages (Views)

- [ ] Update `app/student/dashboard/page.tsx` - Use DataTable
- [ ] Update `app/student/courses/page.tsx` - Use DataTable
- [ ] Update `app/student/assignments/page.tsx` - Use DataTable
- [ ] Update `app/student/attendance/page.tsx` - Use DataTable

---

## Phase 4: Testing & Validation

- [ ] Test Create functionality for each feature
- [ ] Test Update functionality for each feature
- [ ] Test Delete functionality for each feature
- [ ] Test pagination (next/prev page)
- [ ] Test page size changes
- [ ] Test search/filter if implemented
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test form validation
- [ ] Test responsive design

---

## Phase 5: Cleanup

- [ ] Delete all old modal components from `components/`
- [ ] Delete duplicate API files from `features/`
- [ ] Remove unused imports
- [ ] Update `components/providers/QueryProvider.tsx` if needed
- [ ] Verify no TypeScript errors
- [ ] Verify no console warnings

---

## Template: Creating a New Feature Hook

Use this template for each new feature:

```typescript
// src/features/[feature]/use-[feature].ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api-client";
import { PaginationParams, ApiResponse } from "@/src/types/common";

export interface [Feature] {
  id: string | number;
  // ... other fields
}

const QUERY_KEY = ["[features]"];

export const useGet[Features] = (params: PaginationParams) => {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => apiClient.get(`/api/v1/[features]`),
  });
};

export const useCreate[Feature] = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post(`/api/v1/[features]`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdate[Feature] = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/api/v1/[features]/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDelete[Feature] = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/api/v1/[features]/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
```

---

## Template: Creating a Page Component

Use this template for list pages:

```tsx
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { DataTable } from "@/src/components/tables/data-table";
import { CreateEditModal } from "@/src/components/forms/form-modal";
import { Button } from "@/src/components/ui/button";
import { useTableState } from "@/src/hooks/use-table-state";
import { useApiError } from "@/src/hooks/use-api-error";
import { useGet[Features], useCreate[Feature], useUpdate[Feature], useDelete[Feature] } from "@/src/features/[feature]/use-[feature]";

const schema = z.object({
  // ... fields
});

type FormData = z.infer<typeof schema>;

export default function [Features]Page() {
  const { pagination, handlePaginationChange } = useTableState();
  const { error, setError, clearError } = useApiError();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selected, setSelected] = useState(null);

  const { data: response, isLoading } = useGet[Features]({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const { mutateAsync: create } = useCreate[Feature]();
  const { mutateAsync: update } = useUpdate[Feature]();
  const { mutateAsync: delete } = useDelete[Feature]();

  const columns = useMemo(() => [
    // ... column definitions
  ], []);

  const handleAdd = () => {
    clearError();
    setMode("add");
    setSelected(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    clearError();
    setMode("edit");
    setSelected(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    try {
      if (mode === "add") await create(data);
      else await update({ id: selected.id, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      throw err;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">[Features]</h1>
        <Button onClick={handleAdd}>Add</Button>
      </div>
      <DataTable
        columns={columns}
        data={response?.data || []}
        pageCount={response?.pagination.pages}
        rowCount={response?.pagination.total}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={isLoading}
      />
      <CreateEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={mode}
        initialData={selected}
        form={form}
        fields={[]}
        onSubmit={handleSubmit}
        error={error}
      />
    </div>
  );
}
```

---

## Useful Commands

```bash
# Check for TypeScript errors
npm run build

# Run linting
npm run lint

# Format code
npx prettier --write src/

# Check for unused dependencies
npm ls
```

---

## Support Reference Files

- **API Client:** `src/lib/api-client.ts`
- **Query Client:** `src/lib/query-client.ts`
- **DataTable:** `src/components/tables/data-table.tsx`
- **CreateEditModal:** `src/components/forms/form-modal.tsx`
- **Example Hooks:** `src/features/students/use-students.ts`
- **Example Page:** `src/features/students/page-example.tsx`

---

## ✅ Progress Tracking

```
Phase 1: Setup               ✅ 100%
Phase 2: Features            0/7 (0%)
  - Students                 0/3
  - Users                    0/3
  - Institutions             0/3
  - Courses                  0/3
  - Assignments              0/3
  - Batches                  0/3
  - Quizzes                  0/3
  - Tutors                   0/3
Phase 3: Student Pages       0/4 (0%)
Phase 4: Testing             0/10 (0%)
Phase 5: Cleanup             0/4 (0%)
```

Update this as you complete each feature!

---

## Need Help?

Refer to:
1. `IMPLEMENTATION_GUIDE.md` - Detailed patterns and examples
2. `src/features/students/page-example.tsx` - Full working example
3. `src/components/tables/data-table.tsx` - DataTable API reference
4. `src/components/forms/form-modal.tsx` - Form modal API reference
