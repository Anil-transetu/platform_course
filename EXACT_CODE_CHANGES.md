# Exact Code Changes - Copy/Reference

## File 1: `features/students/api.ts`

### Addition #1: New Interfaces (Added before fetchStudentCount function)

```typescript
/**
 * Fetch student statistics
 */
export interface StudentStats {
  total_students: number;
  active_students: number;
  average_students_per_course: number;
}

export interface StudentStatsResponse {
  success: boolean;
  message: string;
  data: StudentStats;
}

export async function fetchStudentStats(): Promise<StudentStats> {
  const response = await fetch(`${BASE_URL}/stats`, { headers: getAuthHeaders() });
  const result: StudentStatsResponse = await handleResponse(response);
  return result.data;
}
```

### Addition #2: New React Query Hook (Added after useStudentCounts)

```typescript
export function useStudentStats() {
  return useQuery({
    queryKey: ["studentStats"],
    queryFn: () => fetchStudentStats(),
  });
}
```

---

## File 2: `app/admin/students/page.tsx`

### Change #1: Updated Import (Line 5)

**FROM:**
```tsx
import { useStudents, useStudentCounts, type Student } from "@/features/students/api"
```

**TO:**
```tsx
import { useStudents, useStudentCounts, useStudentStats, type Student } from "@/features/students/api"
```

### Change #2: Added Hook Call (After line 75)

**ADD THIS LINE:**
```tsx
const { data: statsData } = useStudentStats();
```

**FULL CONTEXT:**
```tsx
  const { data: countsData } = useStudentCounts();
  const { data: statsData } = useStudentStats();  // ← NEW LINE

  // Paginate mock students
```

### Change #3: Updated Stats Array (Lines 95-126)

**FROM:**
```tsx
  const stats: StatCard[] = [
    {
      label: "Total Students",
      value: "12,482",
      helperText: "Total number of students enrolled",
      icon: <Users size={20} className="text-blue-600" />,
      accent: "primary",
    },
    {
      label: "Active Students",
      value: "11,204",
      helperText: "Students currently active",
      icon: <UserCheck size={20} className="text-emerald-600" />,
      accent: "success",
    },
    {
      label: "Avg. Courses/Student",
      value: "3.4",
      helperText: "Engagement metric",
      icon: <BookOpen size={20} className="text-purple-600" />,
      accent: "info",
    },
  ];
```

**TO:**
```tsx
  const stats: StatCard[] = [
    {
      label: "Total Students",
      value: statsData?.total_students ? `${statsData.total_students.toLocaleString()}` : "0",
      helperText: "Total number of students enrolled",
      icon: <Users size={20} className="text-blue-600" />,
      accent: "primary",
    },
    {
      label: "Active Students",
      value: statsData?.active_students ? `${statsData.active_students.toLocaleString()}` : "0",
      helperText: "Students currently active",
      icon: <UserCheck size={20} className="text-emerald-600" />,
      accent: "success",
    },
    {
      label: "Avg. Courses/Student",
      value: statsData?.average_students_per_course ? statsData.average_students_per_course.toFixed(1) : "0",
      helperText: "Engagement metric",
      icon: <BookOpen size={20} className="text-purple-600" />,
      accent: "info",
    },
  ];
```

---

## Summary of Changes

| File | Type | Count |
|------|------|-------|
| `features/students/api.ts` | Interfaces Added | 2 |
| `features/students/api.ts` | Functions Added | 1 |
| `features/students/api.ts` | Hooks Added | 1 |
| `app/admin/students/page.tsx` | Imports Updated | 1 |
| `app/admin/students/page.tsx` | Hook Calls Added | 1 |
| `app/admin/students/page.tsx` | Dynamic Values | 3 |

## Total Lines Changed

- **Added**: ~45 lines
- **Modified**: ~6 lines
- **Removed**: 0 lines
- **Files Modified**: 2

## Verification Commands

```bash
# Check for TypeScript errors
npm run build

# Check for linting issues
npm run lint

# Type check only
npx tsc --noEmit
```

All checks should pass ✅
