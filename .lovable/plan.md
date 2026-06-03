
# Mispar Schools — MVP Redesign Plan

Scope is locked to MVP surfaces only. Everything else under `/schools/**` keeps its current scaffold until later passes.

## Locked design taste

- **Palette — Academic Trust**: Mispar Navy `#0B1E3F`, Academic Blue `#1E4D8C`, Primary Blue `#3B82F6`, Educational Green `#10B981`. Plus semantic: warning amber `#F59E0B`, danger `#EF4444`, info cyan `#0EA5E9`, soft academic grayscale.
- **Typography**: Outfit (headings) + Figtree (body), loaded via Google Fonts. Tabular numerals for metrics.
- **Theme**: Dual light/dark with system auto-detect + manual toggle. Light is the default reading mode; dark is the ops-center mode. Both ship from day one.
- **Voice**: Modern Smart Campus — friendly, premium, school-native. Not corporate SaaS, not surveillance.

## Pages in this pass

1. `/schools` — landing
2. `/schools/dashboard` — School Command Center (home)
3. `/schools/dashboard/attendance/admin` — Attendance Admin
4. `/schools/dashboard/students` — directory
5. `/schools/dashboard/staff` — directory
6. `/schools/dashboard/security` — Campus Security Center
7. Shared: sidebar, top bar, theme toggle, design tokens

Profiles, onboarding, platform admin, settings, communication: **out of scope** for this pass — keep existing scaffolds.

## 1. Design system foundation

**New file**: `src/styles/schools-tokens.css` (imported only inside `SchoolsLayout`, so the main app is untouched).

- HSL tokens for both themes under `.schools-root[data-theme="light"]` and `[data-theme="dark"]`:
  - `--schools-bg`, `--schools-surface`, `--schools-surface-2`, `--schools-border`, `--schools-text`, `--schools-text-muted`
  - `--schools-primary` (Mispar Blue), `--schools-primary-ink` (Navy), `--schools-accent` (Educational Green), `--schools-warning`, `--schools-danger`, `--schools-info`
  - Elevation: `--schools-shadow-sm/md/lg`, `--schools-radius` (14px)
- Load Outfit + Figtree via `index.html` `<link>` (preconnect + display=swap).
- Extend `tailwind.config.ts` with a `schools` color namespace mapped to those CSS vars and font families `font-display` (Outfit) / `font-sans-schools` (Figtree). All Schools components use these tokens — no hardcoded hex.

**New context**: extend `SchoolsThemeContext` with `theme: 'light' | 'dark' | 'system'`, persisted to `localStorage('schools.theme')`, applied via `data-theme` on `.schools-root`.

**New primitives** in `src/components/schools/ui/`:
- `SchoolsCard`, `StatCard` (label + value + delta + sparkline slot), `SectionHeader`, `EmptyState`, `DataTable` (sortable, responsive → card layout on mobile), `Badge` (status variants), `Avatar` (with attendance ring), `MetricRing`, `TrendSpark`, `ThemeToggle`.
- All accessible by default (focus-visible rings using `--schools-primary`, 44×44 tap targets, `aria-label` on icon-only buttons).

## 2. Shell: Sidebar + Top Bar redesign

- **Sidebar** (`SchoolsSidebar.tsx` rewrite): grouped nav `Overview / Attendance / People / Security / Insights / Settings`, with collapsible icon mode, active-route highlight, role badge at bottom (Principal/Admin/Staff). Education-flavored Lucide icons (`GraduationCap`, `Users`, `UserCog`, `ShieldCheck`, `ScanFace`, `LineChart`).
- **Top bar** (new `SchoolsTopBar.tsx`): school name + term/session chip, global search, theme toggle, notifications bell, profile menu.
- `SchoolsLayout` wraps with `.schools-root` themed container, light bg by default, dark uses current gradient feel (tuned down).

## 3. Dashboard Home (`SchoolsDashboard.tsx` rewrite)

Sections, top to bottom:

1. **Welcome strip**: "Good morning, {Principal}" + school name + academic session + term + date.
2. **Today's Campus Overview** — 6 StatCards: Students Present, Students Absent, Staff Present, Staff Absent, Visitors, Attendance Rate (with delta vs yesterday).
3. **Campus Health Score** — large MetricRing (0–100) with sub-scores: Attendance, Security, Staff Presence, Engagement. AI-generated copy line.
4. **Attendance Trends** — interactive Recharts area chart with Daily/Weekly/Monthly/Term/Yearly tabs.
5. **Live Attendance Feed** — right column, realtime via existing `useSchoolsRealtime('dashboard')` hook; empty state when channel pending.
6. **At-Risk Students** — top 5 with attendance %, class, AI recommendation chip → link to student profile.
7. **Department Performance** — horizontal bar list of classes/grades with attendance %.
8. **Security Snapshot** — 4 mini-cards: active alerts, visitors on campus, last access event, face-match accuracy.
9. **Upcoming Events** — list (exams, PTA, sports). Mock until backend.

All numbers wired to existing `src/lib/api/schools/*` modules with `notImplemented` fallbacks → empty/skeleton states (no fake numbers shown as real).

## 4. Attendance Admin (`SchoolsAttendanceAdmin.tsx` rewrite)

- **Header**: title + date picker + scope tabs (All / Students / Staff / Visitors) + export CSV.
- **KPI row**: Present, Absent, Late, Attendance Rate, Avg Check-in Time — each with sparkline.
- **Live Board**: two-column grid of class/department cards showing present/expected counts and a thin progress bar; updates from realtime hook.
- **Attendance Heatmap**: 30-day × class matrix (reuse `AttendanceTrendChart` pattern, new heatmap component).
- **At-Risk / Chronic Absentee Panel**: table with student, class, attendance %, last seen, AI recommendation.
- **Recent Captures**: timeline of last 20 events (face thumbnail, name, role, capture point, confidence).
- **Reports**: quick export buttons (Daily, Weekly, Term, Custom).

## 5. Students directory (`SchoolsStudents.tsx` rewrite)

- Header with search, class/grade filters, status filter, "Enroll Student" CTA.
- KPI strip: total students, enrolled biometrics, attendance rate today, at-risk count.
- **Card grid** on desktop (avatar with attendance ring, name, class, attendance %, status badge) and **DataTable** toggle. Mobile collapses to cards.
- Row click → existing `SchoolsStudentProfile` (untouched this pass, but routed).

## 6. Staff directory (`SchoolsStaff.tsx` rewrite)

- Same shell as Students: search, department/role filters, "Invite Staff" CTA.
- KPI strip: total staff, present today, on leave, avg punctuality.
- Card grid with role chip (Teacher / Admin / Security / Support), subjects/department, attendance %, last check-in.
- Row click → existing `SchoolsStaffProfile`.

## 7. Security Center (`SchoolsSecurity.tsx` rewrite)

Reframed as **Campus Security Center**, school-friendly (not surveillance-coded):

- **Status bar**: campus status (Calm / Elevated / Alert), cameras online, gates active, last incident.
- **Live Monitoring grid**: capture-point tiles (gate, reception, hostel, etc.) with last face match + confidence.
- **Visitor Verification queue**: pending / approved / denied tabs with photo, host, purpose, time.
- **Access Logs**: filterable table (who, where, when, method).
- **Security Alerts**: severity-grouped list with acknowledge action.
- **Face Match Activity** sparkline + accuracy %.
- **Incident Reports**: simple list with status chips.

## 8. Landing page (`SchoolsLanding.tsx` rewrite)

Sections (single page, marketing tone):

1. Hero — "The Operating System for Modern Schools." + dual CTA (Request Demo / Sign In) + animated face-scan visual reusing existing component, retinted to Academic Trust.
2. Trust strip — logos placeholder + key stats.
3. Modules grid — 6 cards (Attendance, Identity, Students, Staff, Security, Analytics).
4. How it works — 4 steps (Enroll → Capture → Verify → Insights).
5. Built for African schools — illustration + 3 value props.
6. AI & Privacy — biometric data stays org-scoped, never sold (pulls from existing privacy memory).
7. Pricing teaser → link to main pricing.
8. Footer CTA + Mispar footer.

Mobile-first, light theme default, smooth scroll, `animate-fade-in` for sections.

## 9. Accessibility + Responsiveness

- WCAG AA contrast verified for both themes (tokens chosen to pass on `--schools-surface`).
- Every icon-only button: `aria-label`.
- Keyboard nav across sidebar, tabs, tables.
- `h-dvh` instead of `h-screen` for full-height shells.
- Breakpoints: mobile (<640), tablet (640–1024), desktop (>1024), large (>1440). Sidebar becomes drawer < lg.

## 10. What stays untouched this pass

- Onboarding, platform admin, profiles (Student/Staff), module placeholders, all `/dashboard` (non-schools) routes, docs, API clients (we only consume — no new endpoints).
- Existing backend prompts in `docs/schools/` remain authoritative; UI binds to the same endpoints already declared in `schoolsApiRoutes.ts`.

## Technical changes summary

**New files**
- `src/styles/schools-tokens.css`
- `src/components/schools/ui/{SchoolsCard,StatCard,SectionHeader,EmptyState,DataTable,Badge,Avatar,MetricRing,TrendSpark,ThemeToggle}.tsx`
- `src/components/schools/SchoolsTopBar.tsx`
- `src/components/schools/AttendanceHeatmap.tsx`
- `src/components/schools/CampusHealthScore.tsx`
- `src/components/schools/LiveCaptureTile.tsx`

**Rewritten files**
- `src/contexts/SchoolsThemeContext.tsx` (add light/dark/system)
- `src/pages/schools/SchoolsLayout.tsx`
- `src/pages/schools/SchoolsSidebar.tsx`
- `src/pages/schools/SchoolsLanding.tsx`
- `src/pages/schools/SchoolsDashboard.tsx`
- `src/pages/schools/SchoolsAttendanceAdmin.tsx`
- `src/pages/schools/SchoolsStudents.tsx`
- `src/pages/schools/SchoolsStaff.tsx`
- `src/pages/schools/SchoolsSecurity.tsx`

**Edited**
- `tailwind.config.ts` — add `schools` color namespace + font families
- `index.html` — Outfit + Figtree preconnect/link
- `src/pages/schools/schoolsModules.ts` — refreshed icons + grouping for new sidebar

## Acceptance criteria

- Light/dark toggle works across all 6 pages with persisted preference.
- All Schools surfaces use design tokens — zero hardcoded hex outside `schools-tokens.css`.
- No real data is fabricated: when endpoints return `notImplemented`, UI shows skeletons or empty states with helpful copy.
- All pages responsive at 360 / 768 / 1280 / 1920 with no horizontal scroll.
- Lighthouse a11y ≥ 95 on dashboard home in both themes.
- Main app (`/dashboard/**`) appearance unchanged — Schools tokens scoped under `.schools-root`.
