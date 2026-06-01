# MSSE — Step 5+6: Attendance Admin Console (Backend Spec)

Frontend: `src/pages/msse/MsseAttendanceAdmin.tsx` at `/msse/dashboard/attendance/admin`.

## Purpose
Unified attendance command center for school admins. Cross-population (students + staff)
KPIs, live roster, exceptions, and export. Sits on top of Step 3 events + Step 5/6
person models — no new attendance storage.

## REST endpoints (`/api/msse/attendance/admin/`)

| Method | Path                          | Purpose                                       | Roles |
|--------|-------------------------------|-----------------------------------------------|-------|
| GET    | `kpis/`                       | Split KPIs for students vs staff (today)      | admin, principal, dean, hr |
| GET    | `roster/?scope=students|staff&state=&q=` | Today's live roster (paginated, virtualized) | admin, principal, dean, hr |
| GET    | `exceptions/`                 | Student absenteeism risk + staff punctuality offenders | admin, principal, dean, hr |
| POST   | `excuse/{event_id}/`          | Bulk-mark events excused (reason required)   | principal, dean, hod, hr |
| GET    | `report/?scope=&range=&format=csv|pdf` | Streamed export                       | admin, principal, dean, hr |

## Response shape — `kpis/`
```json
{
  "students": { "total": 1420, "present": 1284, "on_time": 1220, "late": 64, "absent": 136 },
  "staff":    { "total": 86,   "present": 81,   "on_time": 75,   "late": 6,  "absent": 5 },
  "capture":  { "active_sessions": 6, "avg_recognition_ms": 412 },
  "wow_delta": { "students_present_pct": +1.2, "staff_punctuality_pct": -4.0 }
}
```

## Response shape — `roster/`
Flat rows:
```json
{ "id": "...", "name": "...", "group": "SS2 Science | Lecturer · Maths",
  "enrolled": true, "state": "on_time|late|absent",
  "first_seen": "07:48", "mode": "gate", "location": "Main Gate", "confidence": 0.96 }
```
Backend resolves `state` from the day's first `AttendanceEvent` vs the person's expected
schedule (student class schedule for students, staff start time for staff). Persons with
no event by configurable cutoff are returned as `absent`.

## Realtime
Push roster row updates over the existing `/ws/msse/attendance/feed/` channel using
message type `admin.roster.updated`. Frontend already subscribes via
`useMsseRealtime('attendance')`.

## Reports
- `format=csv` → streamed `text/csv` from a Postgres COPY.
- `format=pdf` → Celery job → `report_ready` channel message with signed Supabase URL.
- PDFs include institution branding (from Step 1 onboarding) and principal signature block.

## RBAC
Roles above all imply read access. Excusing events is restricted to leadership and HR.
Students/parents/teachers do **not** see the admin console; they remain on per-person
surfaces (`/msse/dashboard/students/:id`, `/msse/dashboard/staff/:id`).

## Performance
- Roster endpoint returns ≤500 rows per page; frontend virtualizes.
- `kpis/` cached 30s; invalidated on `event.created`.
- `exceptions/` cached 5min; invalidated on nightly risk job.
