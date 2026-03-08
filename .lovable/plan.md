

# User (Member) Dashboard Design Revamp — Phased Plan

## Current State

The member dashboard has 6 pages accessible via the "My Space" sidebar group. They use basic Card layouts, plain spinner loaders, minimal visual personality, and no org-specific theming beyond the branding CSS variables. The pages are functional but generic — they don't feel personalized to the user or their organization.

## Design Philosophy

Every page should feel **personal** — the user's name, org branding colors, department, and dynamic attendance data should shape what they see. The org's `branding` object (already in ThemeContext) provides colors, logo, and terminology that should be woven throughout. Empty states should feel encouraging, not sterile.

---

## Phase 0 — Member Design Primitives

Shared components used across all member pages:

- **MemberPageHeader**: Reuse the admin `PageHeader` but with a softer, more personal tone — smaller gradient accent, optional greeting text, and org logo watermark.
- **MemberSkeleton**: Content-shaped skeleton loaders replacing all spinners across the 6 pages.
- **MotivationalEmptyState**: Empty states with contextual encouragement (e.g., "Your streak starts with one day!" instead of "No data found").
- **GlassStatCard**: A member-specific stat card variant with glassmorphism, subtle gradient backgrounds keyed to the stat type, and animated count-up values.

---

## Phase 1 — Member Dashboard Home (`MemberDashboard.tsx`)

The main landing page — should feel like a personal command center.

- **Welcome banner**: Full-width gradient banner using org branding colors. Time-of-day greeting ("Good morning, James"). Show org logo, department, and today's date prominently. Animated attendance status indicator (pulsing green check or amber alert).
- **Stats row**: Replace `StatsCard` with `GlassStatCard` — 4 cards (Total, This Month, This Week, Today) with gradient icon backgrounds, animated counters, and subtle trend arrows.
- **Today's focus strip**: A new horizontal strip below stats showing: current streak flame + count, next badge progress mini-bar, and today's schedule (if any) — all in one scannable row.
- **Recent attendance list**: Richer row design with relative timestamps ("2 hours ago"), subtle left-border color coding, and smooth entrance animations.
- **Quick actions**: Icon cards with hover glow instead of plain outline buttons. Add "Face Enrollment" action if not enrolled.
- **Profile card**: Glassmorphism style, larger avatar with enrollment status ring (green = enrolled, amber = pending).
- **Skeleton loaders**: Replace the spinner with content-shaped skeletons matching the final layout.

---

## Phase 2 — My Attendance History (`MyAttendanceHistory.tsx`)

- **Page header**: Use `MemberPageHeader` with export button in actions slot.
- **Summary strip**: A row of 3 mini stat pills above the table (Total Records, This Month, Attendance Rate %).
- **Date filter bar**: Pill-style date range selector with preset options (This Week, This Month, Last 30 Days) alongside the calendar pickers. Active filters shown as dismissible pills.
- **Table redesign**: Alternating row backgrounds, status dot (green circle) instead of badge, confidence shown as a slim progress bar in the cell. Mobile cards get a cleaner layout with date prominence.
- **Chart**: Apply branded chart theme (gradient fills, rounded bars, custom tooltip cards).
- **Empty state**: Motivational message with calendar illustration.

---

## Phase 3 — Attendance Summary (`AttendanceSummary.tsx`)

Currently very bare — needs the most work.

- **KPI cards row**: 4 cards at top — Attendance Rate (%), Best Month, Most Active Day of Week, Average Check-in Time. Each with an icon and trend indicator.
- **Chart section**: Branded Recharts theme — gradient area fills, rounded bars, custom tooltip with card styling. Add a toggle between bar and line view.
- **Heatmap**: Better color scale using org brand primary color, proper legend, hover tooltips showing date and count.
- **Insights card**: A "Your Patterns" card showing auto-generated text insights (e.g., "You're most consistent on Tuesdays" or "Your attendance improved 12% this month").

---

## Phase 4 — Streaks & Badges (`StreaksAndBadges.tsx`)

The gamification page — should be the most visually exciting.

- **Streak hero**: Large animated flame with particle effects (CSS-only). Current streak as a massive number with glow effect. Pulsing animation when streak is active.
- **Progress to next badge**: A prominent arc/ring progress indicator instead of a flat bar. Show the next badge icon at the end of the arc.
- **Stats row**: 3 glass cards (Current Streak, Longest Streak, Total Days) with animated counters and subtle gradient backgrounds.
- **Badge grid**: Card-per-badge with locked/unlocked states. Unlocked badges get a shimmer animation and colored glow. Locked badges are grayscale with a lock overlay and "X days to go" label. Hover reveals description.
- **Milestone timeline**: A vertical timeline on the left showing when badges were unlocked (date), creating a visual achievement history.

---

## Phase 5 — My Schedule (`MySchedule.tsx`)

- **Page header**: Org-aware terminology (Services, Classes, or Shifts based on org type).
- **Today's schedule card**: A prominent card at top showing today's schedule (if any) with countdown timer ("Starts in 2h 15m") or "No events today".
- **Upcoming list**: Cards with left color border (primary for upcoming), time shown prominently, location with map pin icon. Subtle entrance animation for each card.
- **Past schedules**: Collapsed by default, muted styling, with a "Show past" toggle.
- **Empty state**: Org-aware message ("No services scheduled" for church, "No classes assigned" for school).
- **Calendar mini-view**: Optional small month calendar with dots on scheduled days.

---

## Phase 6 — Profile Settings (`ProfileSettings.tsx`)

- **Profile hero**: Large card at top with avatar (with enrollment ring indicator), name, role badge, department, and org name — styled with glassmorphism.
- **Tab styling**: Pill-style tabs instead of default underline. Each tab gets an icon and label.
- **Form sections**: Clean dividers between field groups, subtle section labels, and improved input styling with focus rings matching brand color.
- **Face ID tab**: Better upload area with drag-and-drop zone, preview with face detection overlay hint, and clearer enrollment status messaging.
- **Security tab**: Password strength meter with visual bar and requirements checklist.

---

## Implementation Approach

Each phase ships as one focused prompt. Phase 0 primitives ship with Phase 1. No API or data model changes — purely visual and UX. All pages use existing data from the profile context and attendance API.

