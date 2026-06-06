# Student Stats API Integration - Visual Diagrams

## 1. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin Dashboard                             │
│                  /admin/students/page.tsx                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ imports
                             ↓
        ┌────────────────────────────────────────┐
        │  useStudentStats() Hook                │
        │  (React Query Wrapper)                 │
        └────────────┬─────────────────────────┘
                     │
                     │ queryFn()
                     ↓
        ┌────────────────────────────────────────┐
        │  fetchStudentStats()                   │
        │  - Auth headers                        │
        │  - Error handling                      │
        │  - Type casting                        │
        └────────────┬─────────────────────────┘
                     │
                     │ fetch()
                     ↓
        ┌────────────────────────────────────────┐
        │  GET /api/v1/students/stats            │
        │  https://lms-backend-...               │
        │  Authorization: Bearer [token]         │
        └────────────┬─────────────────────────┘
                     │
                     │ Response
                     ↓
        ┌────────────────────────────────────────┐
        │  Backend API                           │
        │  Returns StudentStatsResponse          │
        └────────────────────────────────────────┘
```

## 2. Data Flow Diagram

```
Component Load
    ↓
┌─────────────────────────────────────┐
│ const { data: statsData }           │
│   = useStudentStats()               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ React Query Hook                    │
│ - queryKey: ["studentStats"]        │
│ - queryFn: fetchStudentStats()      │
└─────────────────────────────────────┘
    ↓
    ├──→ useQuery({...})
    │   - Caches result
    │   - Handles loading state
    │   - Handles error state
    │
    ├──→ fetchStudentStats()
    │   - fetch() API call
    │   - Auth headers added
    │   - Response parsed
    │
    └──→ Stat Cards Updated
        - Total Students: statsData.total_students
        - Active Students: statsData.active_students
        - Avg Courses/Student: statsData.average_students_per_course
```

## 3. State Management Timeline

```
Timeline: Component Lifecycle

T0: Component Mounts
   │
   ├─→ useStudentStats() initialized
   │
T1: Hook Setup
   │
   ├─→ React Query queryKey: ["studentStats"]
   ├─→ Loading state: true
   ├─→ Data state: undefined
   │
T2: API Request Sent
   │
   ├─→ fetchStudentStats() called
   ├─→ getAuthHeaders() adds Bearer token
   ├─→ fetch() sends GET request
   │
T3: Waiting for Response
   │
   ├─→ Loading state: true
   ├─→ Data state: undefined
   │
T4: Response Received (Success)
   │
   ├─→ handleResponse() processes response
   ├─→ Data extracted from response.data
   ├─→ Loading state: false
   ├─→ Data state: { total_students, active_students, average_students_per_course }
   ├─→ Stat cards re-render with real values
   │
T5: Data Cached
   │
   ├─→ React Query caches result
   ├─→ Same data used if component re-mounts
   ├─→ Cache valid until invalidated
```

## 4. Response Structure

```
GET /api/v1/students/stats

Response:
┌─────────────────────────────────────────────────────────────┐
│ {                                                           │
│   "success": true,                 ← Status flag           │
│   "message": "Student statistics...",   ← Message          │
│   "data": {                        ← Main data object      │
│     "total_students": 54,          ← Total count           │
│     "active_students": 54,         ← Active count          │
│     "average_students_per_course": 54    ← Average         │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘

Extracted to Frontend:
┌─────────────────────────────────────┐
│ statsData: StudentStats             │
│ {                                   │
│   total_students: 54                │
│   active_students: 54               │
│   average_students_per_course: 54   │
│ }                                   │
└─────────────────────────────────────┘
```

## 5. Error Handling Flow

```
fetchStudentStats()
    ↓
fetch() request
    ↓
    ├─→ Success (200)
    │   ↓
    │   handleResponse() → OK
    │   ↓
    │   Extract data
    │   ↓
    │   Return StudentStats
    │
    └─→ Error (non-200)
        ↓
        handleResponse() → throws
        ↓
        Try to parse JSON error
        ↓
        Check for token expiry (401)
        ↓
        If 401: logout user, redirect to /login
        ↓
        If other: show error message, log to console
        ↓
        statsData = undefined
        ↓
        Stat cards show fallback "0"
```

## 6. Component Integration

```
┌─────────────────────────────────────────────────────────┐
│           StudentsPage Component                        │
│                                                         │
│  1. Import Statement                                   │
│     ├─→ useStudents                                    │
│     ├─→ useStudentCounts                              │
│     └─→ useStudentStats  ← NEW                        │
│                                                         │
│  2. Hook Calls (in component body)                    │
│     ├─→ useStudents(page, limit, ...)                │
│     ├─→ useStudentCounts()                           │
│     └─→ useStudentStats()  ← NEW                     │
│         └─→ returns { data: statsData, ... }          │
│                                                         │
│  3. Stat Cards Array                                  │
│     ├─→ Card 1: Total                                │
│     │   value: statsData?.total_students || "0"      │
│     │                                                  │
│     ├─→ Card 2: Active                               │
│     │   value: statsData?.active_students || "0"     │
│     │                                                  │
│     └─→ Card 3: Average                              │
│         value: statsData?.average_students_per_course │
│                  .toFixed(1) || "0"                   │
│                                                         │
│  4. UI Rendering                                      │
│     └─→ 3 Stat Cards displayed with formatted values │
└─────────────────────────────────────────────────────────┘
```

## 7. File Structure Changes

```
Before:
features/students/
├── api.ts (contains: fetchStudents, useStudents, etc.)
└── ...

After:
features/students/
├── api.ts (contains: ↓)
│   ├── StudentStats (NEW)
│   ├── StudentStatsResponse (NEW)
│   ├── fetchStudentStats() (NEW)
│   ├── useStudentStats() (NEW)
│   ├── fetchStudents
│   ├── useStudents
│   └── ...other exports...
└── ...

Admin Page:
app/admin/students/
├── page.tsx (UPDATED)
│   ├── Import: useStudentStats (NEW)
│   ├── Hook call: const { data: statsData } (NEW)
│   ├── Stats array: dynamic values (UPDATED)
│   └── Rest of component unchanged
└── ...
```

## 8. React Query Lifecycle

```
Hook Call: useStudentStats()
    ↓
┌──────────────────────────────────────┐
│ React Query Setup                    │
├──────────────────────────────────────┤
│ queryKey: ["studentStats"]           │
│ queryFn: fetchStudentStats           │
│ staleTime: default (0)               │
│ cacheTime: default (5 min)           │
│ retry: default (3)                   │
│ retryDelay: default (exponential)    │
└──────────────────────────────────────┘
    ↓
First Query Execution?
    ├─→ YES: Fetch from API
    │        ├─→ Loading... (isLoading = true)
    │        ├─→ Fetch complete
    │        └─→ Store in cache
    │
    └─→ NO: Return cached data
            ├─→ Mark as stale
            ├─→ Return instant (isFetching = false)
            └─→ Background refetch if needed
```

## 9. Number Formatting Examples

```
Input Values from API:
┌──────────────────────────────────────────────┐
│ total_students: 54                           │
│ active_students: 54                          │
│ average_students_per_course: 54             │
└──────────────────────────────────────────────┘

Formatting Applied:
┌──────────────────────────────────────────────┐
│ Card 1 (Total):                              │
│   54.toLocaleString() → "54"                │
│                                              │
│ Card 2 (Active):                            │
│   54.toLocaleString() → "54"                │
│                                              │
│ Card 3 (Average):                           │
│   54.toFixed(1) → "54.0"                    │
└──────────────────────────────────────────────┘

Display Output:
┌──────────────────────────────────────────────┐
│ Card 1: "54"       (with thousands if > 999) │
│ Card 2: "54"       (with thousands if > 999) │
│ Card 3: "54.0"     (always 1 decimal)       │
└──────────────────────────────────────────────┘
```

## 10. Deployment Checklist

```
┌─────────────────────────────────────────────────────┐
│ Pre-Deployment                                      │
├─────────────────────────────────────────────────────┤
│ ✅ TypeScript compilation: PASSED                 │
│ ✅ ESLint checks: PASSED                          │
│ ✅ Build generation: PASSED                       │
│ ✅ No runtime errors: VERIFIED                    │
│ ✅ API endpoint tested: CONFIRMED                 │
│ ✅ Error handling: IMPLEMENTED                    │
│ ✅ Type safety: VERIFIED                          │
│ ✅ Documentation: COMPLETE                        │
└─────────────────────────────────────────────────────┘
    ↓
Ready to Deploy: ✅ YES
    ↓
Branch: feat/student-api-integrations
    ↓
Target: main (ready to merge)
```
