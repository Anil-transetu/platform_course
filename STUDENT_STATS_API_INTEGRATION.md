# Student Stats API Integration

## Overview
This document outlines the integration of the `/api/v1/students/stats` endpoint into the Student Admin Dashboard.

## API Endpoint Details

**Endpoint:** `GET /api/v1/students/stats`
**Base URL:** `https://lms-backend-n83k.onrender.com`

### Request
- Method: `GET`
- Authentication: Bearer token (via Authorization header)
- Content-Type: `application/json`

### Response Format
```json
{
  "success": true,
  "message": "Student statistics retrieved successfully",
  "data": {
    "total_students": 54,
    "active_students": 54,
    "average_students_per_course": 54
  }
}
```

## Implementation Details

### 1. **API Layer** (`features/students/api.ts`)

#### Added Types
```typescript
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
```

#### Added Function
```typescript
export async function fetchStudentStats(): Promise<StudentStats> {
  const response = await fetch(`${BASE_URL}/stats`, { headers: getAuthHeaders() });
  const result: StudentStatsResponse = await handleResponse(response);
  return result.data;
}
```

#### Added React Query Hook
```typescript
export function useStudentStats() {
  return useQuery({
    queryKey: ["studentStats"],
    queryFn: () => fetchStudentStats(),
  });
}
```

### 2. **Admin Students Page** (`app/admin/students/page.tsx`)

#### Imported Hook
```typescript
import { useStudents, useStudentCounts, useStudentStats, type Student } from "@/features/students/api"
```

#### Used Hook in Component
```typescript
const { data: statsData } = useStudentStats();
```

#### Dynamic Stats Cards
The three top stat cards now display real data from the API:

```typescript
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

## Features

✅ **Automatic Data Fetching** - React Query automatically fetches stats on page load
✅ **Error Handling** - Built-in error handling via the `handleResponse` utility
✅ **Authentication** - Automatically includes Bearer token from cookies
✅ **Caching** - React Query caches results with queryKey `["studentStats"]`
✅ **Type Safety** - Full TypeScript support with proper interfaces
✅ **Loading States** - Ready for loading/error UI implementation
✅ **Number Formatting** - Locale-aware number formatting and fixed decimal places

## Usage

The stats data is automatically fetched when the Students Admin Page loads. The component displays:

1. **Total Students** - Total count with locale formatting (e.g., 54 → "54")
2. **Active Students** - Count of active students with locale formatting
3. **Avg. Courses/Student** - Average displayed with 1 decimal place (e.g., 54 → "54.0")

## Data Flow

```
Admin Students Page
        ↓
useStudentStats() Hook
        ↓
fetchStudentStats()
        ↓
GET /api/v1/students/stats
        ↓
Backend Response (StudentStatsResponse)
        ↓
Extract data.StudentStats
        ↓
Display in Stat Cards
```

## Error Handling

If the API call fails or returns an error:
- Default values "0" are displayed for each card
- The query will retry based on React Query's default retry policy
- Console will log any fetch errors

## Future Enhancements

1. Add loading skeleton states for stat cards
2. Add error state UI with retry button
3. Add real-time updates via WebSocket
4. Add timestamp of last update
5. Add export functionality for stats
6. Add historical trends/comparison

## Testing

To test the integration:

1. Ensure you're authenticated (have valid JWT token)
2. Navigate to `/admin/students`
3. The three top cards should display data from the API
4. Open DevTools Network tab to verify the `/stats` request

## Files Modified

- `features/students/api.ts` - Added stats API functions and hook
- `app/admin/students/page.tsx` - Updated to use real stats data

## Notes for Senior Developers

- The implementation follows the existing pattern in the codebase
- Uses React Query for state management consistency
- Includes proper TypeScript types and interfaces
- Authentication is handled automatically via existing utility functions
- Error handling is delegated to the centralized `handleResponse` function
- Number formatting respects user locale and decimal precision
