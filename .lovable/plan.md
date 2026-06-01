
# MSSE Step 5 + 6 — Students, Staff & Attendance Admin (MVP)

Scope is tightened per your direction: MVP = **staff and student attendance**. We will scaffold Students and Staff modules but spend the implementation depth on the **attendance surfaces** inside them, plus a new **Attendance Admin Console** that unifies oversight across both populations.

Everything else (grades, payroll, leave approvals, teaching allocation analytics, discipline, etc.) is built as **secondary tabs / "Phase 2" placeholders** so the IA is complete but engineering time stays on attendance.

---

## 1. Routes & navigation

Add to `src/App.tsx` under `/msse/dashboard`:

- `students` → `MsseStudents.tsx`
- `students/:id` → `MsseStudentProfile.tsx`
- `staff` → `MsseStaff.tsx`
- `staff/:id` → `MsseStaffProfile.tsx`
- `attendance/admin` → `MsseAttendanceAdmin.tsx` (new unified console)

Promote `students` and `staff` from `soon` → `live` in `msseModules.ts`. Add an "Attendance Admin" entry under the **Identity & Attendance** group.

---

## 2. MVP feature matrix

| Surface | MVP (build now) | Phase 2 (placeholder tab) |
|---|---|---|
| Students list | Directory, filters (class/level/status/enrollment), bulk import CSV stub, biometric status ring, quick "View attendance" action | Academic records, discipline, fees |
| Student profile | Bio header, **Attendance tab (default)**: 30/90-day trend, lateness count, risk badge, parent-notify button, raw events table | Grades, timetable, health, library |
| Staff list | Directory, filters (department/role/employment type), biometric status, quick "View attendance" | Payroll, leave balances, teaching load |
| Staff profile | Bio header, **Attendance tab (default)**: clock-in/out log, punctuality %, absence days, monthly summary, export CSV | Payroll-attendance link, leave, allocation |
| Attendance Admin Console | Cross-cutting dashboard (see §3) | — |

Phase 2 tabs render an `MsseModulePlaceholder`-style "Phase 2" card so users see the roadmap.

---

## 3. Attendance Admin Console (`/msse/dashboard/attendance/admin`)

The centerpiece for school admins. Single page, 4 segmented sections:

1. **Overview KPIs** — today's present/late/absent split for **students** and **staff** side-by-side, week-over-week delta, biometric capture health (sessions online).
2. **Live roster grid** — switch tab Students | Staff. Virtualized table: name, class/dept, today's state, first-seen time, last-seen, mode (gate/classroom/kiosk), confidence. Inline actions: mark excused, notify parent (students), notify line manager (staff).
3. **Risk & exceptions** —
   - Students: absenteeism risk list from Step 3 `risk/` endpoint.
   - Staff: punctuality offenders (>3 lates in 30d), consecutive absences.
   - Each row → drawer with AI note + one-click notification.
4. **Reports & export** — date range picker, scope (all / class / dept / individual), export CSV/PDF (frontend triggers `GET /api/msse/attendance/reports/?...` — backend stub).

All data flows through the existing `src/lib/api/msse/attendance.ts` client; we extend it with `getStudentAttendance`, `getStaffAttendance`, `getAdminRoster`, `exportReport` (mocked with "backend pending" fallback like prior steps).

---

## 4. New / edited files

**New pages**
- `src/pages/msse/MsseStudents.tsx`
- `src/pages/msse/MsseStudentProfile.tsx`
- `src/pages/msse/MsseStaff.tsx`
- `src/pages/msse/MsseStaffProfile.tsx`
- `src/pages/msse/MsseAttendanceAdmin.tsx`

**New shared components** (under `src/components/msse/`)
- `AttendanceTrendChart.tsx` — sparkline + 30/90d bar (recharts)
- `PunctualityBadge.tsx`
- `PersonAttendanceTab.tsx` — reused by student & staff profile
- `RosterTable.tsx` — virtualized table used by admin console
- `Phase2Tab.tsx` — generic "coming in Phase 2" panel

**New API clients**
- `src/lib/api/msse/students.ts` — `listStudents`, `getStudent`, `getStudentAttendance`, `notifyParent`
- `src/lib/api/msse/staff.ts` — `listStaff`, `getStaff`, `getStaffAttendance`, `notifyManager`

**Edits**
- `src/App.tsx` — register 5 new routes
- `src/pages/msse/msseModules.ts` — mark `students`, `staff` live; add `attendance-admin` entry
- `src/pages/msse/MsseSidebar.tsx` — no logic change (driven by modules)

**Backend specs (docs only, no runtime change)**
- `docs/msse/step5-students-backend-prompt.md` — Student model, enrollment, parent link, attendance endpoints scoped from Step 3
- `docs/msse/step6-staff-backend-prompt.md` — Staff model, employment record, attendance/punctuality endpoints, payroll-attendance hook (spec only)
- `docs/msse/step5-6-attendance-admin-backend-prompt.md` — Unified `GET /api/msse/attendance/admin/roster/` + report export endpoint

---

## 5. Design system

Reuse existing MSSE tokens (`MsseThemeContext`, `GlassCard`, `LiveStatBadge`, `AiInsightCallout`). No new colors. Charts use semantic tokens via tailwind config — no hard-coded hex.

Responsive: tables collapse to card list under `lg` per project convention (`responsive-tables` memory).

---

## 6. Out of scope (explicit, to keep MVP tight)

- Grades / examinations / report cards
- Discipline records
- Payroll computation, leave approval workflows
- Teaching allocation editor
- Hostel/transport/library linkage
- Parent portal UI (only the "notify parent" trigger is wired)

These remain `soon` in the sidebar and render Phase 2 placeholders if a user lands on the tab.

---

## 7. Acceptance checks

- `/msse/dashboard/students` lists mock students, filters work, click → profile with Attendance tab populated.
- `/msse/dashboard/staff` same flow for staff.
- `/msse/dashboard/attendance/admin` shows KPIs, switchable Students/Staff roster, risk list, and a working CSV export (client-side from mock data until backend lands).
- All three new backend prompt docs exist and reference the existing Step 2/3 models for continuity.
- No console errors; sidebar shows three modules as `live`.

Say **"approve"** (or "implement") and I'll build Step 5 + 6 in one pass.
