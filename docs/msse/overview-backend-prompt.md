# MSSE — Backend Foundation Spec

This document is the backend brief for the **Mispar Smart School Ecosystem (MSSE)**, the educational vertical served at `school.mispartechnologies.com`. The frontend is being implemented step-by-step under `/msse/*` (public) and `/msse/dashboard/*` (authenticated, gated by `organization_type === 'school'`). Each subsequent module ships its own `docs/msse/step-N-backend-prompt.md`.

This file establishes the cross-cutting foundations every later step depends on.

---

## 1. Tenancy model

Extend the existing `organization` to support educational hierarchies:

```
Institution (organization, type=school)
└── Campus              (optional, for multi-campus universities)
    └── Faculty / School-of
        └── Department
            └── Programme
                └── Level (e.g. 100L, JSS1, SS3)
                    └── Class / Cohort (e.g. CSC-100-A, 2024/2025-A)
```

- Reuse `organization_id` from JWT — **never** accept it from URL or body.
- Add `campus_id`, `faculty_id`, `department_id`, `programme_id`, `level_id`, `class_id` foreign keys on relevant entities.
- All MSSE endpoints must enforce row-level scoping via JWT-derived `organization_id`.

## 2. Role matrix (RBAC)

Extend `roleConfig` with the following system roles. The frontend already plans for these:

| Role | Scope | Notes |
|---|---|---|
| `super_admin` | Mispar Technologies | Platform-wide |
| `institution_owner` | Institution | Billing + global settings |
| `principal` | Institution / Campus | Academic head |
| `dean` | Faculty | |
| `faculty_admin` | Faculty | |
| `hod` | Department | Head of Department |
| `lecturer` | Course / Class | Existing |
| `security_officer` | Campus | Security Center, gates |
| `hostel_admin` | Hostel | |
| `librarian` | Library | |
| `bursar` | Institution | Payments, fees |
| `student` | Self | Existing |
| `parent_guardian` | Linked ward(s) | Existing |
| `visitor` | Time-bound | |

Granular permissions should be assignable per-role-per-module. Implement a `role_permission` join table to allow institutions to customise the default matrix.

## 3. Realtime channels

Use Django Channels (or equivalent) at `wss://api.mispartechnologies.com/ws/msse/{channel}/`. Channel naming convention:

| Channel | Purpose |
|---|---|
| `dashboard` | KPI tiles + activity feed |
| `attendance` | Live attendance events |
| `security` | Watchlist matches + intrusion alerts |
| `gates/{campus_id}` | Smart gate access events |
| `exam/{exam_id}` | Exam-hall AI monitoring |
| `parent/{user_id}` | Per-parent push events |

All sockets must authenticate via the same JWT used for REST calls and respect organization scoping.

## 4. API surface (foundation)

These endpoints unblock the Step 0 dashboard. All return `404` cleanly when not yet implemented (frontend honours the existing `silent` flag).

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/msse/overview/` | Aggregate KPIs (enrolled identities, today's attendance, active alerts, at-risk students) |
| `GET` | `/api/msse/activity/` | Recent realtime events (paginated) |
| `GET` | `/api/msse/modules/` | Returns enabled MSSE modules for the current institution (feature flags) |

### `GET /api/msse/overview/` response shape

```json
{
  "enrolled_identities": 1240,
  "attendance_today": { "present": 1080, "late": 42, "absent": 118 },
  "active_alerts": 3,
  "at_risk_students": 17,
  "realtime_connected": true
}
```

## 5. Multi-tenant feature flags

Add `msse_modules_enabled` (JSON array) to the organization settings:

```json
["identity", "attendance", "security", "students", "staff", "analytics"]
```

The sidebar will hide modules not in this list once Step 16 lands.

## 6. Storage convention

Biometric assets continue to live in Supabase storage at:

```
faces/{org_id}/{user_id}/enrollment.jpg
faces/{org_id}/{user_id}/angles/{n}.jpg     # multi-angle captures
faces/{org_id}/{user_id}/liveness/{ts}.jpg  # anti-spoof samples
```

## 7. Subdomain routing

`school.mispartechnologies.com` resolves to the same SPA. The frontend will detect the host and either:

1. If pathname starts with `/msse/*` → render MSSE shell directly.
2. Else if host starts with `school.` → redirect to `/msse`.

Backend behaviour does not change per host — JWT remains the source of truth.

## 8. Acceptance criteria for foundation

- [ ] `/api/msse/overview/` returns the documented shape for school-type orgs
- [ ] WebSocket handshake succeeds at `/ws/msse/dashboard/`
- [ ] All new roles assignable via existing `/api/members/` invitation flow
- [ ] Organization settings include `msse_modules_enabled`
- [ ] All MSSE endpoints reject requests when `organization_type !== 'school'` with 403

---

Subsequent specs (`step-2-*`, `step-3-*`, …) will detail per-module models, endpoints, and AI workers.
