
# Mispar Smart School Ecosystem (MSSE) — Implementation Plan

Same codebase, new `/msse` route tree (later mapped to `school.mispartechnologies.com` via custom domain). Each step ships **frontend scaffolding + a `docs/msse-<step>-backend-prompt.md` spec** for the Django team, following the same pattern as Phase 1/2.

We will execute one step per turn, in the order below. After each step you review, then say "next" to proceed.

---

## Step 0 — Foundation (one-shot)

- New route group `/msse/*` for the marketing site, `/dashboard/msse/*` for school-only modules (gated by `organization_type === 'school'`).
- `MsseThemeProvider`: dark/light, glassmorphism tokens, deep-blue + electric-cyan palette (reuses existing brand memory).
- `MsseLayout` + `MsseSidebar` with the 15-module sidebar order from the brief (collapsed by default to "Coming soon" until each step lands).
- Shared primitives: `GlassCard`, `LiveStatBadge`, `AiInsightCallout`, `RealtimeFeed` skeleton.
- `docs/msse-overview-backend-prompt.md`: tenancy model (institution → campus → faculty → department → class), realtime channel naming, RBAC matrix for the 14 MSSE roles.

## Step 1 — Landing page (`school.mispartechnologies.com`)

Hero, AI-powered education infra, smart attendance, smart security, parent portal, analytics, AI intelligence, case studies, use cases, ecosystem, pricing, FAQ, demo booking. Reuses existing `DemoRequestModal`.

## Step 2 — Biometric Identity System

Enrollment wizard (multi-angle, lighting/quality validation, anti-spoof prompt), identity profile shell (student / staff / visitor / parent), duplicate detection UI, RFID/NFC + QR backup fields, re-enrollment flow. Backend spec covers face embeddings, anti-spoof, liveness endpoints, biometric ID schema.

## Step 3 — Smart Attendance System

Capture modes (classroom, hall, exam, hostel, lab, event, kiosk, CCTV, offline-sync). Late-arrival, absenteeism, risk-student dashboards. Heatmaps, exports, daily/weekly/monthly trends, dropout-risk callouts.

## Step 4 — Smart Campus Security

Live CCTV grid, watchlist matches, intruder alerts, restricted-area monitor, smart-gate console (biometric / QR / RFID / visitor pass), incident log, campus heatmap.

## Step 5 — Student Management

Profiles, academic records, class/department mgmt, course registration, timetable, fees, hostel link, discipline, medical, documents. Integrates with Phase 2 academic structure.

## Step 6 — Staff Management

Onboarding, biometric link, attendance, payroll-attendance integration, leave, role mgmt, teaching allocation, staff analytics.

## Step 7 — Parent / Guardian Portal

Separate authenticated experience under `/parent/*`. Ward attendance, real-time alerts, fees, academics, security alerts, pickup authorization, school messaging.

## Step 8 — Visitor Management

Pre-registration, temporary biometric onboarding, badges, host approval, security screening, visit history.

## Step 9 — Smart Examination System

Exam-hall biometric verification, seating, anti-impersonation, AI fraud feed.

## Step 10 — AI Analytics & Intelligence Center

Realtime analytics dashboards, attendance/behavior/academic-risk modules, predictive charts, AI summaries, NL "Ask MSSE" assistant pane (wired to Lovable AI Gateway in a later turn).

## Step 11 — Communication System

Email / SMS / push / parent / internal / announcements / emergency broadcast console.

## Step 12 — Financial & Payment Integration

Tuition, payment tracking, receipts, outstanding analytics, scholarships. Architecture hooks for biometric-payment + campus wallet.

## Step 13 — Hostel Management

Biometric access, room allocation, occupancy, curfew, hostel attendance, visitors.

## Step 14 — Library Management

Biometric access, borrowing, digital catalog, occupancy, reading analytics.

## Step 15 — Transportation Management

Bus tracking map, boarding verification, parent pickup verification, route analytics, driver attendance.

## Step 16 — Multi-Institution & RBAC hardening

District/state tenancy switcher, granular RBAC editor for all 14 roles, audit logs UI, MFA settings page.

---

## Technical notes

- **Routing**: `/msse` (public marketing), `/msse/dashboard/*` mounted inside existing `DashboardLayout` and gated by `organization_type === 'school'`. Subdomain split is purely DNS — same SPA serves both.
- **Roles**: extend `roleConfig.ts` with `institution_owner`, `principal`, `dean`, `faculty_admin`, `security_officer`, `hostel_admin`, `librarian`, `bursar`. Keep existing `lecturer`, `student`, `parent_guardian`.
- **Realtime**: scaffold a `useMsseRealtime(channel)` hook now (no-op until backend wires Django Channels / WebSocket).
- **Data**: every module ships with a typed API client in `src/lib/api/msse/<module>.ts` that calls `/api/msse/<module>/` and returns "backend pending" UI on 404 (existing `silent` flag pattern).
- **Backend specs**: one markdown file per step under `docs/msse/` with models, endpoints, permissions, realtime channels, and acceptance criteria.
- **Branding**: when on `school.mispartechnologies.com` or `/msse/*`, swap brand to "Mispar Smart School Ecosystem" via `MsseThemeProvider`.

## What you'll get per step

1. New routes + pages + components
2. Sidebar entries flipped from "Coming soon" → live
3. `docs/msse/<step>-backend-prompt.md` spec
4. Short summary + next-step prompt

Reply **"start step 0"** (or jump to any step) and I'll implement it.
