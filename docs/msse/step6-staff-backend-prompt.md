# MSSE — Step 6: Staff (Backend Spec)

Frontend: `src/pages/msse/MsseStaff.tsx`, `src/pages/msse/MsseStaffProfile.tsx`.
API client (mocked): `src/lib/api/msse/staff.ts`.

## MVP scope
Staff directory + per-staff attendance & punctuality. Payroll, leave approvals, and
teaching allocation are Phase 2 placeholders.

## Data model (Django)

```python
class Staff(models.Model):
    institution = FK(Institution)
    identity = OneToOne(IdentityProfile)
    staff_no = CharField(unique=True)
    full_name = CharField()
    role = CharField()                # Lecturer, HOD, Bursar, Security Officer, ...
    department = FK('academic.Department', null=True)
    employment_type = CharField(choices=[full_time, part_time, contract, visiting])
    status = CharField(choices=[active, on_leave, suspended, separated])
    manager = FK('self', null=True, related_name='reports')
    email = EmailField()
    phone = CharField()
    hired_on = DateField()

class StaffPunctualityDaily(models.Model):   # written nightly by Celery beat
    staff = FK(Staff)
    as_of = DateField()
    first_seen = TimeField(null=True)
    last_seen = TimeField(null=True)
    minutes_late = IntegerField(default=0)
    state = CharField(choices=[on_time, late, very_late, absent, excused])
```

## REST endpoints (`/api/msse/staff/`)

| Method | Path                          | Purpose                              | Roles |
|--------|-------------------------------|--------------------------------------|-------|
| GET    | `/`                           | Paginated list. Filters: `department`, `role`, `employment_type`, `q` | admin, principal, hr |
| POST   | `/`                           | Onboard staff (triggers Step 2 enrollment) | admin, hr |
| GET    | `/{id}/`                      | Profile                              | scoped |
| PATCH  | `/{id}/`                      | Update                               | admin, hr |
| GET    | `/{id}/attendance/`           | `PersonAttendanceSummary` (30/90d)   | scoped, manager, self |
| POST   | `/{id}/notify-manager/`       | Notify line manager (email)          | admin, hr |

## Attendance integration
Reuses Step 3 `AttendanceEvent` filtered by `IdentityProfile.role='staff'`.
Punctuality % = `(events with state in [on_time, present]) / expected workdays`.
Lateness threshold per institution from `OrganizationSettings.staff_grace_minutes`.

## Payroll-attendance hook (Phase 2 — spec only)
On payroll cycle, expose `GET /api/msse/staff/{id}/attendance/payroll/?cycle={id}` returning
days worked, absent days (unpaid), late minutes (for deduction rules). No write-back —
payroll provider integrates by polling.

## RBAC
- `staff` → own profile + attendance.
- `manager` → direct reports (via `Staff.manager`).
- `hod`/`dean` → department/faculty.
- `principal`/`institution_owner`/`hr` → institution scope.
