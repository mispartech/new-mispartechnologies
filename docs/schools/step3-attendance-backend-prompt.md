# MSSE — Step 3: Smart Attendance (Backend Spec)

Frontend: `src/pages/msse/MsseAttendance.tsx` at `/msse/dashboard/attendance`.
API client (mocked): `src/lib/api/msse/attendance.ts`.

## Goals
Multi-mode biometric attendance with realtime events, lateness/absenteeism analytics, AI risk
flagging, and weekly heatmaps. Tenant-scoped by JWT (campus/faculty/dept inferred — never in URLs).

## Capture modes
`gate` | `classroom` | `event` | `mobile` (teacher tablet) | `kiosk`.
Each mode is a `CaptureSession` row that streams recognitions into `AttendanceEvent`.

## Data model (Django)

```
class CaptureSession(models.Model):
    institution = FK(Institution)
    campus = FK(Campus, null=True)
    mode = CharField(choices=CAPTURE_MODES)
    location = CharField()
    device_id = CharField(null=True)
    active = BooleanField(default=True)
    opened_by = FK(User)
    opened_at = DateTimeField(auto_now_add=True)
    closed_at = DateTimeField(null=True)

class AttendanceEvent(models.Model):
    session = FK(CaptureSession)
    person = FK(IdentityProfile)            # Step 2 link
    ts = DateTimeField(db_index=True)
    state = CharField(choices=[on_time, late, very_late, absent, excused, present])
    confidence = FloatField()
    mode = CharField()                       # denormalized
    class_or_dept = CharField(null=True)
    location = CharField()
    raw_frame_url = URLField(null=True)      # supabase storage faces/{org}/events/...
    schedule_slot = FK('academic.ScheduleSlot', null=True)

class AbsenteeismRiskSnapshot(models.Model):  # written nightly by Celery beat
    student = FK(IdentityProfile)
    as_of = DateField()
    attendance_pct = FloatField()
    consecutive_absences = IntegerField()
    late_count_30d = IntegerField()
    risk = CharField(choices=[low, medium, high, critical])
    ai_note = TextField()                    # Lovable AI Gateway (google/gemini-2.5-flash)
```

## REST endpoints (all under `/api/msse/attendance/`)

| Method | Path                          | Purpose                                  | Roles |
|--------|-------------------------------|------------------------------------------|-------|
| GET    | `kpis/`                       | Today's KPIs (present, on-time, etc.)    | admin, principal, dean, faculty_admin |
| GET    | `sessions/`                   | Active + recent sessions                 | admin, security_officer, faculty_admin |
| POST   | `sessions/`                   | Open new capture session                 | admin, security_officer |
| POST   | `sessions/{id}/close/`        | Close session                            | session opener, admin |
| GET    | `events/`                     | Paginated events (filter: role, state, session, q, date) | admin, dean |
| POST   | `events/{id}/excuse/`         | Mark an event excused (reason required)  | principal, dean, hod |
| GET    | `risk/`                       | Current absenteeism risk list            | principal, dean, hod |
| POST   | `risk/{student_id}/notify/`   | Trigger parent SMS/email (Resend)        | principal, dean, hod |
| GET    | `heatmap/`                    | Weekly day × period rates                | admin, principal, dean |

## Realtime (Django Channels)
Channel: `/ws/msse/attendance/{session_id}/` and `/ws/msse/attendance/feed/` (tenant-wide).
Messages: `event.created`, `session.opened`, `session.closed`, `risk.updated`.

## Recognition pipeline
Reuse Step 2 InsightFace pipeline. On match:
1. Resolve `IdentityProfile` and active `ScheduleSlot` for the location.
2. Compute `state` from slot start time: ≤0min → on_time, ≤10min → late, ≤30min → very_late, else absent on slot close.
3. Insert `AttendanceEvent`, broadcast via Channels.
4. Dedup: same person+slot within 5 min → ignore.

## AI risk job (Celery beat — nightly 02:00)
For each student, compute 30-day metrics, classify risk via thresholds + Lovable AI Gateway
prompt (`google/gemini-2.5-flash`) to generate `ai_note`. Critical risk auto-creates a task
for the assigned counselor and queues a parent notification draft.

## RBAC
- `student` / `parent` → read-only own records.
- `teacher` → events for assigned classes; can open `classroom` sessions on assigned schedule.
- `hod` / `dean` / `principal` → department / faculty / institution scope.
- `security_officer` → `gate` and `event` sessions.
- `institution_owner` → full read; configuration changes audited.

## Storage
`faces/{org_id}/events/{yyyy}/{mm}/{dd}/{event_id}.jpg` — optional cropped ROI.

## Notes
- Suppress non-critical 404s with `silent` flag on the frontend client.
- Heatmap aggregation should be cached for 5 minutes; invalidate on `event.created`.
- All times stored UTC; render in institution timezone from `/api/profile/`.
