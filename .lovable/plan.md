

# Admin Dashboard Design Revamp — Phased Plan

## Current State

The dashboard has ~18 admin-facing pages all using basic Card/Table layouts with minimal visual hierarchy, no consistent page header pattern, generic loading states, and a utilitarian sidebar. The design is functional but flat — it lacks the polish, density, and delight expected of a modern admin experience.

## Design System Foundations (Phase 0 — applies to all phases)

Before touching individual pages, establish shared design primitives:

- **Page header component**: Consistent layout with title, subtitle, breadcrumb, and action buttons area. Gradient accent strip at top.
- **Enhanced card variants**: Add subtle gradient borders, hover micro-interactions, and a "spotlight" card variant for hero metrics.
- **Empty state component**: Illustrated empty states with contextual CTAs instead of plain text.
- **Skeleton loaders**: Replace spinner loaders with content-shaped skeleton placeholders on every page.
- **Sidebar redesign**: Grouped navigation sections with labels (e.g., "Attendance", "People", "Settings"), collapsible groups, active indicator bar, and a polished org logo/name area at top.
- **Header bar upgrade**: Add breadcrumbs, global search command palette (Cmd+K), and a more prominent user menu with role badge.
- **Dashboard-specific CSS variables**: Refine card backgrounds, add subtle noise texture, softer shadows, and improved border treatments for `.dashboard-themed`.

## Phase 1 — Layout Shell & Dashboard Home

**Files**: `DashboardSidebar.tsx`, `DashboardHeader.tsx`, `DashboardLayout.tsx`, `DashboardHome.tsx`, `StatsCard.tsx`

- **Sidebar**: Reorganize into labeled groups (Overview, Attendance, People, Configuration). Add collapsible sections, active route indicator pill, smooth transitions, and user info card at bottom with avatar + role badge.
- **Header**: Add breadcrumbs derived from route, command palette trigger, and improved mobile hamburger.
- **Dashboard Home**: Redesign stats cards with gradient backgrounds, sparkline mini-charts, and animated counters. Make the welcome banner more visually striking with time-of-day greeting. Improve the quick actions grid with icon backgrounds and subtle hover animations. Add better spacing and visual rhythm.
- **StatsCard**: Add sparkline support, gradient icon backgrounds, and percentage change indicators with color coding.

## Phase 2 — Attendance Pages

**Files**: `AttendanceCapture.tsx`, `AttendanceLogs.tsx`, `AttendanceHistory.tsx`, `AttendanceSummary.tsx`

- **AttendanceCapture**: Polish the camera view with a refined frame, status indicators, and smoother recognition feedback animations.
- **AttendanceLogs**: Redesign the table with row hover effects, inline avatars, confidence score progress bars, and status pills. Add a summary strip above the table showing today's totals.
- **AttendanceHistory**: Improve the date range picker UX, add visual chart above the table, and enhance the filter bar with pill-style active filters.
- **AttendanceSummary**: Better data visualization cards with trend arrows and color-coded metrics.

## Phase 3 — People Management Pages

**Files**: `MembersList.tsx`, `TempMembersList.tsx`, `AdminManagement.tsx`, `FaceGallery.tsx`

- **MembersList**: Enhance the table with richer row design (department color dots, enrollment status icon). Improve grid view cards with glassmorphism style. Add bulk action toolbar.
- **TempMembersList**: Add a visual timeline view option alongside the table. Better visitor cards with face thumbnail prominence.
- **AdminManagement**: Redesign the invite flow as a stepped modal. Show admin cards in a grid with role badges and last-active status.
- **FaceGallery**: Masonry-style grid with enrollment status overlays, hover zoom, and a refined upload dialog.

## Phase 4 — Reports & Analytics

**Files**: `Reports.tsx`, `AttendanceChart.tsx`, `AttendanceHeatmap.tsx`

- **Reports**: Add a dashboard-style report overview with KPI cards at top, improved chart styling (custom Recharts theme matching brand colors), and a cleaner export UI.
- **Charts**: Apply consistent chart theming — rounded bars, gradient fills, custom tooltips with card styling, and axis label improvements.
- **Heatmap**: Better color scale, legend, and hover tooltips.

## Phase 5 — Configuration & Settings Pages

**Files**: `OrganizationSettings.tsx`, `BrandingSettings.tsx`, `ScheduleManagement.tsx`, `SiteManagement.tsx`, `DepartmentsList.tsx`, `ProfileSettings.tsx`, `ActivityLogs.tsx`

- **Settings pages**: Unified settings layout with a left-side vertical tab navigation within the page. Clean form styling with section dividers.
- **BrandingSettings**: Already rich — polish the preview area and improve color picker interactions.
- **ScheduleManagement**: Visual weekly calendar grid instead of plain form inputs.
- **DepartmentsList**: Card-based department view with member count badges and head avatar.
- **ActivityLogs**: Timeline-style log view with action type icons, color-coded badges, and relative timestamps.
- **ProfileSettings**: Cleaner profile card with large avatar, role badge, and tabbed sections.

## Implementation Approach

Each phase will be implemented as a single prompt to keep changes focused and reviewable. Phase 0 (shared components) ships with Phase 1. No API or data changes — this is purely visual and UX.

