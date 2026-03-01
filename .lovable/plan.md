

## Member/Employee Sidebar Navigation Enhancement

### Problem
Non-admin users (members/employees) currently see only 3 sidebar items: Dashboard, My Attendance, and My Profile. This is too sparse for an attendance system where members need to engage with their records, view analytics, and access various attendance-related features.

### Current State
The sidebar in `DashboardSidebar.tsx` filters menu items by role. The `member` role only has access to:
- Dashboard (`/dashboard`)
- My Attendance (`/dashboard/my-attendance`)
- My Profile (`/dashboard/profile`)

### Proposed New Sidebar Items for Members

| Nav Item | Icon | Route | Purpose |
|----------|------|-------|---------|
| Dashboard | LayoutDashboard | `/dashboard` | Overview with stats, streaks, quick actions (existing) |
| My Attendance | Calendar | `/dashboard/my-attendance` | Full attendance history table with filters (existing) |
| Attendance Summary | TrendingUp | `/dashboard/attendance-summary` | Visual analytics: charts, heatmap, trends, monthly/weekly breakdowns |
| My Streaks & Badges | Trophy | `/dashboard/streaks` | Gamified streak tracker, achievement badges, consistency metrics |
| My Schedule | CalendarClock | `/dashboard/my-schedule` | View assigned schedules (services, shifts, classes depending on org type) |
| My Profile | UserCheck | `/dashboard/profile` | Edit personal info, view face enrollment status (existing) |

### New Pages to Create

**1. Attendance Summary Page** (`src/pages/dashboard/AttendanceSummary.tsx`)
- Reuses existing `AttendanceChart` and `AttendanceHeatmap` components already in the codebase
- Adds monthly/weekly attendance percentage cards
- Date range filtering
- Organization-type-aware labels (e.g., "Services Attended" for church, "Days Present" for corporate)

**2. Streaks & Badges Page** (`src/pages/dashboard/StreaksAndBadges.tsx`)
- Expands the existing `AttendanceStreakTracker` component into a full page
- Shows current streak, longest streak, all-time stats
- Achievement badges grid with progress indicators
- Milestone tracking

**3. My Schedule Page** (`src/pages/dashboard/MySchedule.tsx`)
- Read-only view of schedules assigned to the member's organization
- Shows upcoming schedule entries (next service, next shift, etc.)
- Uses organization type to display contextual labels (from the onboarding terminology system)

### Files to Modify

1. **`src/components/dashboard/DashboardSidebar.tsx`** -- Add 3 new nav items to the `menuItems` array with `member` in their roles array

2. **`src/App.tsx`** -- Add 3 new child routes under `/dashboard`

### Files to Create

3. **`src/pages/dashboard/AttendanceSummary.tsx`** -- Chart-focused analytics page reusing existing components
4. **`src/pages/dashboard/StreaksAndBadges.tsx`** -- Full-page streak and badge view
5. **`src/pages/dashboard/MySchedule.tsx`** -- Read-only schedule viewer

### Technical Notes

- All new pages will use `useOutletContext` to access `profile` data, following the existing pattern
- API calls will use `{ silent: true }` option to prevent 404 spam if backend endpoints are not yet ready
- The `AttendanceHeatmap` component currently uses Supabase directly; the new pages will follow the same pattern with graceful fallback
- No new API endpoints are required -- pages reuse existing `getAttendance` and `getSchedules` calls from the API client
- Organization-type-aware labels will be derived from the profile's organization data (already fetched in `MemberDashboard`)

