

# Mobile & Tablet Responsiveness Audit — Dashboard Pages

## Audit Summary

After reviewing all 24 dashboard pages, the sidebar, header, and shared components, here are the issues found and fixes needed.

---

## Critical Issues

### 1. DashboardHeader — left offset broken on mobile
**File**: `DashboardHeader.tsx` line 86
The header has `left-0 lg:left-auto` but no awareness of sidebar width on desktop. On mobile, the header spans full width correctly, but it doesn't account for the sidebar `ml-64` offset used in `DashboardLayout`. The header floats over the sidebar toggle button area inconsistently.

**Fix**: Sync header width with sidebar state — pass `sidebarOpen` and apply matching `lg:left-64` / `lg:left-[68px]` transitions.

### 2. AttendanceHistory — filters row overflows on mobile
**File**: `AttendanceHistory.tsx` line 188
Five filter controls in a single `grid-cols-1 md:grid-cols-5` row. On mobile the `grid-cols-1` works, but the date picker buttons with long formatted dates (`"March 31, 2026"`) overflow their containers. The calendar icon + full date text doesn't fit in narrow widths.

**Fix**: Use shorter date format on mobile (`MMM d` instead of `PPP`), or truncate with `text-ellipsis overflow-hidden`.

### 3. AttendanceHistory — table has 10 columns, not scrollable on mobile
**File**: `AttendanceHistory.tsx` line 207
The table has Date, Time, Type, Name/ID, Gender, Age Range, Confidence, Detections, Face, Status — 10 columns with no mobile card view. Only `overflow-x-auto` on the wrapper. On small screens the horizontal scroll is not discoverable.

**Fix**: Add a mobile card layout (like MembersList does with `hidden md:block` for table and `md:hidden` for cards), or reduce visible columns on mobile.

### 4. Reports — stat cards have long inline JSX, no mobile text truncation
**File**: `Reports.tsx` lines 138-142
Stat cards are dense inline JSX. The icon + text layout works but the `text-2xl font-bold` values can push against card edges on very small screens (320px). The trend text `"15% from previous period"` can wrap awkwardly.

**Fix**: Add `truncate` or `text-sm` on trend text for mobile breakpoints.

### 5. Reports — chart containers have no min-height guard
**File**: `Reports.tsx` lines 145-148
Charts use `h-80` and `h-64` fixed heights. On mobile, the XAxis labels (e.g., "Morning (9am-12pm)") in the BarChart overflow and overlap. Recharts doesn't auto-resize text.

**Fix**: Use `tick={{ fontSize: 10 }}` on XAxis for mobile, or rotate labels with `angle={-45}`.

### 6. DepartmentsList — no mobile card layout
**File**: `DepartmentsList.tsx`
Uses only a `<Table>` with no `md:hidden` mobile alternative. On mobile, columns compress and text wraps unreadably.

**Fix**: Add mobile card view matching the pattern in MembersList and AdminManagement.

### 7. AttendanceCapture — stats cards label "Members" not dynamic
**File**: `AttendanceCapture.tsx` line 726
The middle stat card says "Members" hardcoded instead of using `getTerm('plural')`.

**Fix**: Replace with `{getTerm('plural', true)}`.

### 8. OrganizationSettings — Tabs overflow on mobile
**File**: `OrganizationSettings.tsx`
Uses `<TabsList>` with multiple tab triggers that overflow horizontally on narrow screens without scrolling.

**Fix**: Add `overflow-x-auto` and `flex-nowrap` to TabsList, or stack tabs vertically on mobile.

### 9. BrandingSettings — Tabs overflow on mobile
**File**: `BrandingSettings.tsx`
Same TabsList overflow issue as OrganizationSettings.

**Fix**: Same solution — scrollable tabs or vertical stack.

### 10. ProfileSettings — Tabs overflow on mobile
**File**: `ProfileSettings.tsx`
Same pattern — multiple tabs that compress on small screens.

**Fix**: Scrollable or responsive tab layout.

### 11. FaceGallery — grid cards lack consistent sizing on tablet
**File**: `FaceGallery.tsx`
The member face grid likely uses a responsive grid but face images and action buttons may not have proper tap targets (48px min).

**Fix**: Ensure buttons are at least `h-10 w-10` and face images have consistent aspect ratios.

### 12. VisitorReview — cluster cards need mobile optimization
**File**: `VisitorReview.tsx`
Cluster cards with thumbnails, badges, and action buttons may compress on mobile. The merge modal with radio selections needs adequate tap targets.

**Fix**: Stack card content vertically on mobile, increase touch target sizes.

### 13. MemberDashboard — "Today's Focus Strip" overflows on small mobile
**File**: `MemberDashboard.tsx` line 210
The strip has `flex-col sm:flex-row` with 3 items, each `flex-1`. On very narrow screens (320px), the content within each item (icon + text + badge) can overflow.

**Fix**: Add `min-w-0` to inner flex containers to allow text truncation.

### 14. DashboardSidebar — mobile sidebar missing close button
**File**: `DashboardSidebar.tsx`
Mobile sidebar opens via overlay tap-to-close, but there's no explicit close button (X) at the top. Users on mobile may not discover the overlay dismiss pattern.

**Fix**: Add an explicit close button (X icon) in the mobile sidebar header area.

---

## Minor Issues

### 15. Breadcrumbs hidden on mobile
`DashboardHeader.tsx` line 96: `hidden sm:flex` hides breadcrumbs entirely on mobile. Users lose navigation context.

**Fix**: Show a simplified breadcrumb (just current page name) on mobile.

### 16. AttendanceCapture — "Recent" panel stacks below camera on mobile
On `lg:grid-cols-3`, the Recent panel drops below the camera. This is correct behavior but the 400px max-height scroll area may feel cramped when it's the only visible content after scrolling past the camera.

**Fix**: On mobile, increase `max-h` to `max-h-[60vh]` to give more space to the recent list.

### 17. DashboardHome — Quick Actions text truncation
**File**: `DashboardHome.tsx` line 187
Action labels like "View Employees" are fine, but longer dynamic terms (if any) could wrap. The `min-w-0 flex-1` is present — looks okay.

**No fix needed** — current implementation handles this.

---

## Implementation Plan

### File changes (in order):

| # | File | Changes |
|---|---|---|
| 1 | `DashboardLayout.tsx` | Pass `sidebarOpen` state to `DashboardHeader` |
| 2 | `DashboardHeader.tsx` | Accept `sidebarOpen` prop, apply dynamic `lg:left-*`; show simplified breadcrumb on mobile |
| 3 | `DashboardSidebar.tsx` | Add close (X) button to mobile sidebar header |
| 4 | `AttendanceCapture.tsx` | Fix "Members" label → dynamic; increase mobile recent list height |
| 5 | `AttendanceHistory.tsx` | Add mobile card view for attendance table; shorten date format on mobile |
| 6 | `DepartmentsList.tsx` | Add `md:hidden` mobile card layout |
| 7 | `Reports.tsx` | Add `tick fontSize` to chart axes; truncate trend text |
| 8 | `OrganizationSettings.tsx` | Make TabsList scrollable on mobile |
| 9 | `BrandingSettings.tsx` | Make TabsList scrollable on mobile |
| 10 | `ProfileSettings.tsx` | Make TabsList scrollable on mobile |
| 11 | `VisitorReview.tsx` | Stack card content vertically on mobile; increase tap targets |
| 12 | `MemberDashboard.tsx` | Add `min-w-0` to focus strip items |
| 13 | `FaceGallery.tsx` | Ensure 48px tap targets on action buttons |

**Estimated**: ~13 files, mostly CSS/layout adjustments with a few structural additions (mobile card views for tables).

