# Reusable Table + TanStack Query + Form Reuse Guide

This document is a single place to understand the reusable **DataTable**, how **TanStack Query** is installed/used in this repo, and how to **reuse the same UI components for both Create & Edit forms**.

---

## 1) Reusable `DataTable` (what it is and how to use it)

**File:** `src/components/reusable/DataTable.tsx`  
**UI atoms:** `src/components/ui/table.tsx`, `button.tsx`, `select.tsx`  
**Core libs:** `@tanstack/react-table`, `@dnd-kit/*`

### ✅ What this table already supports
- **Client-side and server-side pagination**
- **Sorting & filtering** (client-side by default, **manual** when server mode)
- **Row selection & expanded rows**
- **Row click handler** (safe guard for buttons/inputs)
- **Drag & drop row reordering** (optional)
- **Custom row detail** (expandable row rendering)

### ✅ Props contract (pin-to-pin)

```ts
DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  renderRowDetail?: (row: TData) => React.ReactNode;
  expandedRowKey?: string | null; // (present but not used internally)

  // Server pagination
  pageCount?: number;
  rowCount?: number;
  pagination?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;

  // DnD
  enableDragAndDrop?: boolean;
  onReorder?: (newOrder: TData[]) => void;
  getRowId?: (row: TData) => string;
}
```

### ✅ How it decides server vs client mode
The table goes **server-side** when **`rowCount` or `pageCount` is passed**.  
That turns on:
- `manualPagination`
- `manualSorting`
- `manualFiltering`

Otherwise it stays fully client-side.

### ✅ Pagination logic (exact flow)
- `pagination` prop overrides local state (controlled mode)
- If not provided, component keeps **internal pagination**
- `rowCount` (server) drives "Showing x–y of n"
- Page size dropdown triggers `table.setPageSize`

### ✅ Row click logic (safe)
- Click is ignored if the target is inside `button`, `a`, or `input`
- When `renderRowDetail` is provided, clicking toggles expansion

### ✅ DnD logic (when enabled)
- Uses `@dnd-kit` with `SortableContext`
- You should include a column with id **`drag-handle`** to attach the grab
- You **must** pass `getRowId` when your row's unique id isn't `row.id`

### ✅ Example usage (actual repo pattern)

From `src/app/admin/users/page.tsx`:
```tsx
<DataTable
  columns={columns}
  data={displayUsers}
  pageCount={pageCount}
  rowCount={data?.data?.pagination?.total || 0}
  pagination={pagination}
  onPaginationChange={setPagination}
/>
```

### ✅ Best-practice notes for DataTable
- **Memoize `columns`** with `useMemo` to avoid re-renders.
- For server pagination, send `pageIndex + 1` to the API if it expects 1-based pages.
- For large datasets, avoid client filtering and sorting — rely on server.
- Pass stable `getRowId` when data doesn't include `id`.

---

## 2) TanStack Query install + best logic (as used in this repo)

### ✅ Install (already in `package.json`)
This project already includes:
- `@tanstack/react-query`
- `@tanstack/react-query-devtools`

If installing in another repo (pnpm):
```
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

### ✅ Where query client is configured
- **Client:** `src/lib/queryClient.ts`
- **Provider:** `src/components/providers.tsx`

Query defaults set:
- `staleTime`: 5 min
- `gcTime`: 10 min
- `retry`: max 3 (no retry on 4xx)
- `refetchOnWindowFocus: false`

### ✅ Best logic pattern used here
Each feature has a **dedicated hook** (example: `src/features/fastag-issuers/api/use-get-fastag-issuers.ts`).

**Pattern:**
- Use `queryKey` as `[feature, params]`
- Use typed API response
- Keep hooks in `src/features/<feature>/api/`
- Let components handle pagination state

### ✅ Recommended "best logic" for tables + queries

**Pagination + table**
1) Store `pagination` state in the page component.
2) Pass `pagination` + `onPaginationChange` into `DataTable`.
3) Use those values in your query hook params.

**Example flow (pseudo):**
```ts
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

const { data, isLoading } = useGetFastagIssuers({
  page: pagination.pageIndex + 1,
  limit: pagination.pageSize,
  search,
  is_active,
})
```

**Mutation + refresh**
- Use `useMutation` and `queryClient.invalidateQueries({ queryKey })` on success.
- If you need instant UI update, add **optimistic update** using `setQueryData`.

**Keep table smooth (optional)**
- Use `placeholderData: (prev) => prev` to reduce flicker.
- Use `keepPreviousData` for paginated lists.

---

## 3) Reuse the same UI components for Create & Edit forms

This repo already follows the **"Add/Edit Modal"** pattern:
- `UserAddEditModal.tsx`
- `ProductAddEditModal.tsx`
- `FastagIssuersAddEditModal.tsx`
- `FAQAddEditModal.tsx`
- `BannerAddEditModal.tsx`

### ✅ Recommended pattern (pin-to-pin)

1) **Single modal component** with `mode` and `initialData`.
2) **One set of fields**, not duplicated for create/edit.
3) Use `react-hook-form` + `Form` UI components from `src/components/ui/`.
4) `useEffect` to `form.reset()` when `initialData` changes.
5) Conditional labels and submit text based on `mode`.

### ✅ Typical prop design
```ts
interface AddEditModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: "add" | "edit"
  initialData?: Entity | null
  onSubmit: (payload: FormInput) => void
  isLoading?: boolean
}
```

### ✅ UI components to reuse
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- `Input`, `Textarea`, `Select`, `Checkbox`, `Button`
- Custom reusables like `JsonEditor`

### ✅ Example logic (from repo)
- **`ProductAddEditModal.tsx`** uses `mode` and `initialData`.
- **`UserAddEditModal.tsx`** validates with `react-hook-form` rules.
- **`BannerAddEditModal.tsx`** uses `zodResolver` for schema validation.

### ✅ Why this works well
- Same UI for create + edit ensures consistent layout and validation.
- Centralized logic makes maintenance easier.
- You can plug in any API hook (create/update) using `onSubmit`.

---

## ✅ Summary (pin-to-pin)
- **Reusable DataTable** lives in `src/components/reusable/DataTable.tsx` and supports pagination, sorting, filtering, row click, expansion, and drag-and-drop.
- **TanStack Query** is already installed and configured with sensible defaults in `queryClient` + `Providers`.
- **Best logic** is: keep API hooks per feature, pass pagination to hooks, invalidate queries after mutations, and reuse Add/Edit modal UI with `react-hook-form`.
- **Create/Edit forms** should share the same field UI and only differ by `mode` + `initialData`.
