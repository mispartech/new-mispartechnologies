# Schools Backend — Integration Plan for Cursor

This is the **single authoritative brief** for the backend repository that powers `schools.mispartechnologies.com`. Cursor should follow it end-to-end to scaffold three services that together serve the Schools vertical.

The frontend is already complete and falls back to mock fixtures when the backend is unreachable. Once `VITE_SCHOOLS_API_URL` and `VITE_SCHOOLS_FR_URL` are set, the UI will flip to live data with no code change — **so the response shapes below are contracts, not suggestions**.

---

## 0. Companion specs

- `face-recognition-service-spec.md` — the closed-set FR microservice (`schools-fr`)
- `schools-onboarding-backend-prompt.md` — the atomic onboarding endpoint
- `step1…step6-*-backend-prompt.md` — per-module deep dives that this plan stitches together

---

## 1. Service topology

| Service | Purpose | Tech | Repo path |
|---|---|---|---|
| `schools-api` | REST + WebSocket gateway. Owns tenant data, attendance, rosters, admin consoles. | Django 5 + DRF + Channels (Daphne) | `services/api/` |
| `schools-fr` | Face enrollment + recognition. **Closed-set** — no unknown-face clustering, no visitor tracking. | FastAPI + InsightFace `buffalo_l` + pgvector | `services/fr/` |
| `schools-worker` | Celery: notifications (SMS/WhatsApp/email), CSV imports, report exports, daily aggregates. | Celery + Redis | `services/worker/` |
| Shared Postgres 16 | Single DB, schema `schools`, pgvector extension. | Postgres + pgvector | — |
| Shared Supabase | **Auth + Storage only.** Never DB. | Supabase | — |

**Why a separate FR service?** Schools are closed-set: only enrolled identities can match. We can skip the entire visitor/unknown-clustering pipeline that the general engine runs, partition embeddings by `org_id`, and consistently hit sub-200ms p95.

---

## 2. Auth, tenancy, RBAC

### 2.1 Auth
- Supabase issues JWTs. Both `schools-api` and `schools-fr` verify them against Supabase JWKS — they do **not** mint their own tokens.
- `schools-fr` accepts either a Supabase user JWT (forwarded by browser) or a service JWT minted by `schools-api` (for server-to-server enrollment).

### 2.2 Tenancy
- Every row carries `organization_id`. The frontend **never** sends it; resolve it server-side from `auth.user_id → membership → organization_id`.
- A middleware rejects all requests where `organization.type != 'school'` with `403`.
- Cross-tenant reads are impossible by construction — queries always filter by the resolved `organization_id`.

### 2.3 RBAC
Roles seeded by the onboarding endpoint, stored in the existing `user_roles` table:

| Role | Scope | Notes |
|---|---|---|
| `institution_owner` | Tenant | Billing + global settings |
| `principal` | Tenant | Full read/write |
| `vice_principal` | Tenant | Same as principal minus billing |
| `registrar` | Tenant | Rosters + identities |
| `bursar` | Tenant | Payments + plan |
| `it_admin` | Tenant | Capture points + integrations |
| `hod` | Department | Department-scoped reads |
| `teacher` | Class | Roster + attendance for own class |
| `security_officer` | Campus | Capture point health |
| `student` | Self | Own attendance |
| `parent_guardian` | Linked ward | Own ward's attendance |

Ednitio staff use the existing `platform_admin` role with a new claim `verticals: ['schools']`. Required for `/api/schools/platform/*`.

---

## 3. Data models (Django apps)

Organize models into apps: `tenants`, `directory`, `attendance`, `identity`, `policy`, `platform`.

```
tenants/
  School(OneToOne organization)
  Campus(school, name, address)
  Department(school, name, hod=FK staff)
  Class(school, code, level, stream, homeroom_teacher=FK staff)

directory/
  Student(school, campus, class, admission_no, first_name, last_name,
          gender, dob, status, enrollment_status, photo_url)
  Guardian(student, name, phone, email, relation, can_pickup)
  Staff(school, campus, department, staff_no, first_name, last_name,
        role, employment_type, status, enrollment_status, email, phone, manager=FK staff)
  EmploymentRecord(staff, started_on, ended_on, title)

identity/
  FaceEnrollment(school, person_type, person_id, embedding_id,
                 quality_score, captured_at, captured_by, status)

policy/
  AttendancePolicy(school, day_start, day_end, late_threshold_min,
                   very_late_threshold_min, weekend_days, half_day_cutoff,
                   grace_days_per_term)
  CapturePoint(school, campus, label, mode, online, last_event_at,
               device_fingerprint)

attendance/
  AttendanceEvent(school, person_type, person_id, ts, state, mode,
                  capture_point, confidence, raw_match_id)
  AttendanceDailyAggregate(school, person_type, person_id, date,
                           state, first_seen, last_seen)  # materialized
  RiskFlag(school, student, level, reason, ai_note, raised_at, resolved_at)

platform/
  AuditLog(actor, action, tenant=nullable FK, metadata, ts)
  Subscription(school, plan, status, started_at, renews_at)
```

Materialized view rebuilds nightly via Celery; partial refresh on each `AttendanceEvent` insert for today only.

---

## 4. REST API surface

Base: `https://api.schools.mispartechnologies.com`. All endpoints return DRF paginated envelopes `{ count, next, previous, results }` for collections, raw object for detail.

### 4.1 Onboarding (see `schools-onboarding-backend-prompt.md`)
```
GET  /api/schools/onboarding/      resume in-progress
PUT  /api/schools/onboarding/      atomic submit
```
Payload = `SchoolsOnboardingPayload` from `src/lib/api/schools/onboarding.ts`. The handler **must** wrap the entire transaction with `transaction.atomic()`: org row + policy + capture points + default departments + admin user + role assignments + Subscription stub. Any failure rolls back.

### 4.2 Overview & activity
```
GET  /api/schools/overview/        → { enrolled_identities, attendance_today: {present, late, absent},
                                       at_risk_students, active_sessions, realtime_connected }
GET  /api/schools/activity/        paginated (cursor) recent events
```

### 4.3 Students
```
GET    /api/schools/students/      ?q&class&level&enrollment&risk&page&page_size
GET    /api/schools/students/{id}/
POST   /api/schools/students/
PATCH  /api/schools/students/{id}/
DELETE /api/schools/students/{id}/
GET    /api/schools/students/{id}/attendance/       → PersonAttendanceSummary (see students.ts)
POST   /api/schools/students/{id}/notify-guardian/  → { ok }
POST   /api/schools/students/import/                multipart CSV → 202 + job_id
```

Response shape for `GET /students/` matches the `Student` interface in `src/lib/api/schools/students.ts` exactly.

### 4.4 Staff
```
GET    /api/schools/staff/         ?q&department&role&employment_type&page
GET    /api/schools/staff/{id}/
POST   /api/schools/staff/
PATCH  /api/schools/staff/{id}/
DELETE /api/schools/staff/{id}/
GET    /api/schools/staff/{id}/attendance/
POST   /api/schools/staff/{id}/notify-manager/
POST   /api/schools/staff/import/
```

### 4.5 Attendance
```
GET    /api/schools/attendance/         ?date&scope=staff|students|all&class&dept&state&page
POST   /api/schools/attendance/mark/    admin manual override
PATCH  /api/schools/attendance/{id}/excuse/  { reason }
GET    /api/schools/attendance/kpis/     → AttendanceKPIs (see attendance.ts)
GET    /api/schools/attendance/heatmap/  → HeatmapCell[]
GET    /api/schools/attendance/at-risk/  → RiskStudent[]
GET    /api/schools/attendance/sessions/ → LiveCaptureSession[]
POST   /api/schools/attendance/export/   { scope, start_date, end_date, format }
                                         → { download_url, expires_at }   # signed Supabase URL
```

### 4.6 Capture points
```
GET    /api/schools/capture-points/
POST   /api/schools/capture-points/
PATCH  /api/schools/capture-points/{id}/
POST   /api/schools/capture-points/{id}/heartbeat/   from device every 30s
```

### 4.7 Identities (biometric registry)
```
GET    /api/schools/identities/
GET    /api/schools/identities/{id}/
POST   /api/schools/identities/                  create profile (no biometric yet)
POST   /api/schools/identities/{id}/enroll/      { image_base64 }
                                                 → forwards to schools-fr /v1/face/enroll
POST   /api/schools/identities/{id}/re-enroll/   forwards to schools-fr /v1/face/re-enroll
```

### 4.8 Settings
```
GET   /api/schools/settings/
PATCH /api/schools/settings/    attendance policy + notification templates + branding
```

### 4.9 Platform admin (Ednitio — `platform_admin` only)
```
GET    /api/schools/platform/tenants/                 → TenantSummary[]
GET    /api/schools/platform/tenants/{org_id}/
GET    /api/schools/platform/face-engine/health/      → proxies schools-fr /v1/face/health
GET    /api/schools/platform/duplicates/              → DuplicateSuspect[]
GET    /api/schools/platform/audit-log/
```

---

## 5. WebSocket channels

All sockets at `wss://api.schools.mispartechnologies.com/ws/schools/{channel}/`, authenticated with the same Supabase JWT (`?access_token=…`).

| Channel | Payload | Consumers |
|---|---|---|
| `overview` | KPI deltas | school admin dashboard |
| `attendance` | `AttendanceEvent` as it lands | live attendance + admin |
| `capture/{id}` | per-camera frame matches | capture point monitor |
| `admin` | platform-admin alerts | Ednitio portal |

Channel scoping is enforced server-side from the JWT — the client cannot subscribe to another tenant's channel.

---

## 6. Recognition flow (end-to-end)

```
Device camera ──base64 frame──► schools-fr /v1/face/recognize
                                       │
                                       ▼ (match found)
                              schools-api callback
                                       │
                  POST /internal/attendance/ingest  (mTLS, service JWT)
                                       │
                                       ▼
                          AttendanceEvent insert
                          + RiskFlag recompute
                          + WS broadcast on `attendance` channel
                          + push to capture/{id} channel
```

For latency: `schools-fr` resolves matches against an IVFFLAT index **partitioned by `org_id`**, so a query never scans across tenants. Target: p95 < 200ms for a 10k-embedding tenant on a single T4 GPU.

---

## 7. Acceptance criteria

- [ ] Frontend works against the live backend with **zero code changes** after setting `VITE_SCHOOLS_API_URL` / `VITE_SCHOOLS_FR_URL` / `VITE_SCHOOLS_WS_URL`.
- [ ] All endpoints reject with `403` when JWT's organization is not `type='school'` or when the resolved `organization_id` doesn't own the resource.
- [ ] `PUT /api/schools/onboarding/` is fully atomic (rollback on any sub-step failure).
- [ ] `schools-fr` p95 `/recognize` < 200ms on staging dataset (10k embeddings).
- [ ] WebSocket handshake validates the same Supabase JWT used for REST.
- [ ] CSV/XLSX exports return **signed Supabase Storage URLs** (no inline payloads).
- [ ] `AttendanceDailyAggregate` is refreshed within 60s of a new event.
- [ ] No business data is read from Supabase Postgres directly by the frontend — everything goes through `schools-api`.

---

## 8. Environment variables (backend)

```
DATABASE_URL=postgres://…/schools
REDIS_URL=redis://…
SUPABASE_URL=https://….supabase.co
SUPABASE_JWKS_URL=https://….supabase.co/auth/v1/.well-known/jwks.json
SUPABASE_SERVICE_ROLE_KEY=eyJ…           # storage signed URLs only
SCHOOLS_FR_URL=http://schools-fr:8080
SCHOOLS_FR_SERVICE_JWT_SECRET=…
RESEND_API_KEY=…                          # transactional email
TWILIO_*=…                                # SMS/WhatsApp
PAYSTACK_SECRET_KEY=…
```

Frontend (already in `src/lib/api/schools/schoolsClient.ts`):

```
VITE_SCHOOLS_API_URL=https://api.schools.mispartechnologies.com
VITE_SCHOOLS_FR_URL=https://fr.schools.mispartechnologies.com
VITE_SCHOOLS_WS_URL=wss://api.schools.mispartechnologies.com/ws
```

---

## 9. Phase 2 (not MVP)

Grades, examinations, payroll-attendance bridge, leave, hostel, transport, library, parent portal UI, communication module. Models can be scaffolded but endpoints should return `404 { detail: "Feature not available yet." }` so the frontend's existing `notImplemented()` fallback keeps working.
