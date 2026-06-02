
# Schools Vertical — URL Rebrand, Onboarding, Admin Dashboards & Backend API Spec

The MVP focus is **Staff + Student attendance via face recognition**, served from `schools.mispartechnologies.com` (mirrored at `/schools/*` on the main domain). Everything else stays as visual placeholders.

---

## 1. URL & Routing Rebrand (`/msse/*` → `/schools/*`)

### Public routes
```
/schools                          → Landing (was /msse)
/schools/onboarding               → NEW — school-specific onboarding wizard
/schools/admin                    → NEW — Mispar Technologies (Ednitio) super-admin portal
/schools/dashboard                → School tenant dashboard (was /msse/dashboard)
/schools/dashboard/*              → All existing module routes preserved
/schools/dashboard/admin          → NEW — per-school admin console (attendance management)
```

### Subdomain detection (already in place in `PageWrapper`)
When `host` starts with `schools.` redirect:
- `/` → `/schools`
- `/admin` → `/schools/admin`
- `/dashboard/*` → `/schools/dashboard/*`

### Code changes
- Rename `src/pages/msse/` → `src/pages/schools/` (every file inside).
- Rename API folder `src/lib/api/msse/` → `src/lib/api/schools/`.
- Rename `MsseLayout`, `MsseSidebar`, `MsseThemeContext`, `MsseLanding`, etc. → `SchoolsLayout`, `SchoolsSidebar`, `SchoolsThemeContext`, `SchoolsLanding`. Keep visual design and content identical.
- Update `App.tsx` route block to use `/schools/*` paths and new component names.
- Add a redirect block: legacy `/msse/*` routes 301-redirect (client-side `<Navigate replace>`) to the matching `/schools/*` path so existing links/SEO continue to work.
- Rename docs folder `docs/msse/` → `docs/schools/`. The existing step-1…step-6 prompts move with it.

---

## 2. Schools Onboarding Wizard (`/schools/onboarding`)

A specialised version of the current `/onboarding` page, locked to `organization_type === "school"` and surfacing education-specific fields. Built as `src/pages/schools/SchoolsOnboarding.tsx`, reusing the existing `onboardingSession.ts` helpers and design tokens (glassmorphism, deep blue + electric cyan).

### Steps
1. **Institution profile** — name, short code, motto, logo, institution type (Nursery, Primary, Secondary, Tertiary, Mixed), founded year, ownership (Public / Private / Mission).
2. **Location & contact** — country/state/city (reuse `locationData.ts`), full address, official phone, official email, website.
3. **Academic structure** — number of campuses, hierarchy levels enabled (Faculty / Department / Programme / Level / Class), term system (3-term / 2-semester), academic session start date.
4. **Population & rosters** — expected counts: students, teaching staff, non-teaching staff, parents/guardians; optional CSV import (queued, processed by backend).
5. **Attendance policy** — school day start/end, late threshold (minutes), very-late threshold, weekend days, half-day cutoff, grace days/term.
6. **Capture points** — list of gates / classrooms / kiosks with location label and capture mode (`gate` / `classroom` / `event` / `kiosk` / `mobile`).
7. **Admin account** — first/last name, role (Principal, Vice Principal, Bursar, Registrar, IT Admin), phone.
8. **Plan & confirmation** — pick Starter / Pro / Business (existing pricing), accept biometric/privacy terms, submit.

### Persistence
- Local: `getOnboardingStorageKeys('school')` + cookie fallback so refresh recovers state.
- Server: single atomic `PUT /api/schools/onboarding/` (see §6) — backend creates organization, default roles, capture points, attendance policy, and seeds super-admin in one transaction.

---

## 3. Dual Admin Dashboards

### 3a. School Admin Console — `/schools/dashboard/admin`
Per-tenant operations cockpit for principal / vice-principal / IT admin. Already partially exists as `MsseAttendanceAdmin.tsx`; we expand it.

Tabs:
- **Overview** — live KPIs (present today, late, absent, at-risk) for staff + students, today's punctuality split, AI insight callouts.
- **Roster** — unified student + staff table; filter by role/class/department/enrollment status; bulk re-notify guardians.
- **Capture points** — health of every camera / kiosk / mobile tablet, last-event timestamp, restart action stub.
- **Enrollment queue** — pending face enrollments with one-click "open enrollment wizard".
- **Reports** — CSV export (date range, scope), saved-report shortcuts.
- **Settings** — attendance policy, late thresholds, notification templates, plan + billing link.

### 3b. Ednitio Platform Admin — `/schools/admin`
Mispar Technologies internal portal (gated by existing `platform_admin` role + new check for `vertical === 'schools'`). New page `src/pages/schools/SchoolsPlatformAdmin.tsx` built on the existing `/admin-dashboard` shell.

Tabs:
- **Tenants** — every onboarded school: name, plan, MAU, enrolled identities, % attendance health, last seen.
- **Onboarding queue** — incomplete onboardings, retry-email action.
- **Identity index** — global enrolled count, average face-quality score, duplicate suspects across tenants.
- **Face engine health** — uptime of the dedicated FR service, GPU queue depth, p50/p95 recognition latency, error rate.
- **Billing & plans** — Paystack subscription state per tenant.
- **Audit log** — sensitive actions across tenants.

---

## 4. Schools API Client (new, separate from main app)

The existing `src/lib/api/client.ts` keeps serving the church / corporate / healthcare verticals. Schools traffic gets its own client so we can point it at a different base URL and a dedicated face-recognition microservice.

New files:
```
src/lib/api/schools/
  schoolsApiRoutes.ts      // central route map
  schoolsClient.ts         // fetch wrapper (mirrors client.ts patterns)
  faceClient.ts            // talks to FR microservice (separate base URL)
  onboarding.ts            // schools onboarding endpoints
  students.ts              // existing — wire to real endpoints
  staff.ts                 // existing — wire to real endpoints
  attendance.ts            // existing — wire to real endpoints
  identity.ts              // existing — wire to real endpoints
  admin.ts                 // school-admin console endpoints
  platform.ts              // Ednitio platform-admin endpoints
```

### Environment variables (Vite)
```
VITE_SCHOOLS_API_URL          // e.g. https://api.schools.mispartechnologies.com
VITE_SCHOOLS_FR_URL           // e.g. https://fr.schools.mispartechnologies.com
VITE_SCHOOLS_WS_URL           // wss://api.schools.mispartechnologies.com/ws
```

### Shared rules (mirrors main client)
- JWT (Supabase access token) on every request via `Authorization: Bearer`.
- Backend infers `organization_id` from JWT — never in URL or body.
- Pagination envelope `{ count, results, next, previous }`; `unwrapPaginated` re-exported.
- Standard `silent` / `timeout` flags; 15s default, 45s for `/face/*`.
- 401 → auto-logout (reuse helper from main client).
- `notImplemented()` stub returns synthetic 404 so UI falls back to mock fixtures.

---

## 5. Backend Integration Plan (for Cursor)

Deliverable: `docs/schools/backend-integration-plan.md` — single authoritative brief for the backend repo. Cursor follows it to scaffold the Django (or FastAPI) project + dedicated FR worker.

### 5.1 Services & repos

| Service | Purpose | Tech |
|---|---|---|
| `schools-api` | REST + WebSocket gateway for tenants & admin consoles | Django 5 + DRF + Channels |
| `schools-fr` | Face enrollment + recognition (closed-set, no unknown faces) | FastAPI + InsightFace (`buffalo_l`) + pgvector |
| `schools-worker` | Celery: notifications, CSV imports, report exports, parent SMS/WhatsApp | Celery + Redis |
| Shared Postgres | Single DB, schema `schools` | Postgres 16 + pgvector |
| Shared Supabase | Auth + Storage only (`faces/{org_id}/{user_id}/…`) | Supabase |

### 5.2 Multi-tenancy & RBAC
- Every row carries `organization_id` (FK to existing `organizations`, scoped to `type='school'`).
- Roles seeded on onboarding: `institution_owner`, `principal`, `vice_principal`, `registrar`, `bursar`, `it_admin`, `hod`, `teacher`, `security_officer`, `student`, `parent_guardian`. Ednitio staff use existing `platform_admin` with new `verticals=['schools']` claim.
- Middleware rejects requests where `organization.type !== 'school'` with `403`.

### 5.3 Core endpoints (MVP — staff + student attendance)

Base: `https://api.schools.mispartechnologies.com`

```
# Onboarding
PUT    /api/schools/onboarding/                 atomic: org + policy + capture points + admin
GET    /api/schools/onboarding/                 resume in-progress

# Overview (school admin)
GET    /api/schools/overview/                   KPI tiles
GET    /api/schools/activity/?cursor=…          realtime feed (paginated)

# Students
GET    /api/schools/students/                   ?q&class&level&enrollment&risk&page
GET    /api/schools/students/{id}/
POST   /api/schools/students/                   create
PATCH  /api/schools/students/{id}/
DELETE /api/schools/students/{id}/
GET    /api/schools/students/{id}/attendance/   summary + trend + recent
POST   /api/schools/students/{id}/notify-guardian/
POST   /api/schools/students/import/            CSV → queued

# Staff
GET    /api/schools/staff/                      ?q&department&role&employment_type&page
GET    /api/schools/staff/{id}/
POST   /api/schools/staff/
PATCH  /api/schools/staff/{id}/
DELETE /api/schools/staff/{id}/
GET    /api/schools/staff/{id}/attendance/
POST   /api/schools/staff/{id}/notify-manager/
POST   /api/schools/staff/import/

# Attendance
GET    /api/schools/attendance/                 ?date&scope=staff|students|all&class&dept&state
POST   /api/schools/attendance/mark/            manual override (admin only)
PATCH  /api/schools/attendance/{id}/excuse/     reason
GET    /api/schools/attendance/kpis/            today's aggregate
GET    /api/schools/attendance/heatmap/         day×period
GET    /api/schools/attendance/at-risk/         RiskStudent[]
GET    /api/schools/attendance/sessions/        active capture sessions
GET    /api/schools/attendance/export/?fmt=csv  signed-URL download

# Capture points
GET    /api/schools/capture-points/
POST   /api/schools/capture-points/
PATCH  /api/schools/capture-points/{id}/
POST   /api/schools/capture-points/{id}/heartbeat/   from device

# Settings
GET/PATCH /api/schools/settings/                attendance policy, thresholds, notifications

# Platform admin (Ednitio)
GET    /api/schools/platform/tenants/
GET    /api/schools/platform/tenants/{org_id}/
GET    /api/schools/platform/face-engine/health/
GET    /api/schools/platform/duplicates/
GET    /api/schools/platform/audit-log/
```

### 5.4 Dedicated Face Recognition service

Base: `https://fr.schools.mispartechnologies.com`. Closed-set — only enrolled identities can match; no temp/visitor tracking, no clustering of unknowns. This is what makes it faster than the general client.

```
POST /v1/face/enroll              { person_id, org_id, image_base64 }
                                  → { embedding_id, quality, ok }
POST /v1/face/re-enroll           same as above + invalidates previous embeddings
POST /v1/face/recognize           { org_id, image_base64, capture_point_id, mode }
                                  → { matches: [{person_id, score, bbox}], latency_ms }
POST /v1/face/recognize-batch     for kiosk/mobile burst frames
GET  /v1/face/health              { gpu, queue_depth, p50_ms, p95_ms, model_version }
DELETE /v1/face/person/{id}       hard-remove embeddings
```

- Embeddings stored in `face_embeddings(org_id, person_id, vec vector(512))` + IVFFLAT index, **partitioned by `org_id`** so a query never scans across tenants → sub-50 ms p95.
- Strict org-scoping enforced server-side from a service JWT issued by `schools-api`.
- Anti-spoof toggle (passive liveness) configurable per tenant.

### 5.5 Realtime channels
```
wss://api.schools.mispartechnologies.com/ws/schools/{channel}/
  overview          KPI deltas
  attendance        live events (student + staff)
  capture/{id}      per-camera frames+matches
  admin             platform-admin alerts
```

### 5.6 Data models (high-level — backend repo holds full migrations)
`School` (extends organization), `Campus`, `Department`, `Class`, `Student`, `Guardian`, `Staff`, `EmploymentRecord`, `CapturePoint`, `AttendancePolicy`, `AttendanceEvent`, `AttendanceDailyAggregate` (materialized), `FaceEnrollment`, `RiskFlag`, `AuditLog`.

### 5.7 Acceptance criteria
- [ ] `PUT /api/schools/onboarding/` is fully atomic (rollback on any failure).
- [ ] Mock fixtures used today match the real response shapes byte-for-byte (so the frontend works once `VITE_SCHOOLS_API_URL` is set, no other code change).
- [ ] FR service returns `< 200 ms` p95 for `/recognize` on the staging dataset (10 k embeddings, 1 tenant).
- [ ] All endpoints reject when `organization.type !== 'school'` or when JWT-derived `organization_id` does not match resource.
- [ ] WebSocket handshake validates the same Supabase JWT.
- [ ] CSV export endpoints return signed Supabase Storage URLs (never inline payloads).

---

## 6. File-Change Summary

**Renamed (folder + every file inside):**
- `src/pages/msse/` → `src/pages/schools/` (rename classes/components accordingly)
- `src/lib/api/msse/` → `src/lib/api/schools/`
- `src/contexts/MsseThemeContext.tsx` → `src/contexts/SchoolsThemeContext.tsx`
- `docs/msse/` → `docs/schools/`

**New files:**
- `src/pages/schools/SchoolsOnboarding.tsx`
- `src/pages/schools/SchoolsPlatformAdmin.tsx`
- `src/lib/api/schools/schoolsApiRoutes.ts`
- `src/lib/api/schools/schoolsClient.ts`
- `src/lib/api/schools/faceClient.ts`
- `src/lib/api/schools/onboarding.ts`
- `src/lib/api/schools/admin.ts`
- `src/lib/api/schools/platform.ts`
- `docs/schools/backend-integration-plan.md` (the full Cursor brief)
- `docs/schools/face-recognition-service-spec.md`
- `docs/schools/schools-onboarding-backend-prompt.md`

**Edited:**
- `src/App.tsx` — replace `/msse/*` block with `/schools/*` block + legacy redirects.
- `src/components/PageWrapper.tsx` — update subdomain detection for `schools.`.
- `src/pages/schools/schoolsModules.ts` (renamed) — add `admin` route, keep MVP-live status only for `students`, `staff`, `attendance`, `attendance/admin`, `identity`. Everything else stays `soon`.

**Out of scope (Phase 2, unchanged):**
- Grades, examinations, payroll, leave, hostel, transport, library, parent portal UI, communication module.

---

## Technical Notes (for the developer)

- Routes are React Router v6; legacy `/msse/*` → `/schools/*` is handled with `<Route path="/msse/*" element={<Navigate to={...} replace />} />` mapping.
- The Schools API client deliberately duplicates the `request()` wrapper from `client.ts` (same patterns: `silent`, `timeout`, paginated unwrap, 401 auto-logout) rather than sharing code, so the two backends can evolve independently.
- The FR client uses a 45 s timeout and posts base64 frames the same way `useFaceRecognition` does today; only the base URL changes.
- Mock fixtures already in `students.ts` / `staff.ts` / `attendance.ts` become the contract — backend must match their shapes exactly. This lets us flip a single env var to switch from mocks to real data.
- No changes to Supabase Auth, Storage, or RLS. Storage path stays `faces/{org_id}/{user_id}/enrollment.jpg`.
