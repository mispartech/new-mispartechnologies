# MSSE — Step 5: Students (Backend Spec)

Frontend: `src/pages/msse/MsseStudents.tsx`, `src/pages/msse/MsseStudentProfile.tsx`.
API client (mocked): `src/lib/api/msse/students.ts`.

## MVP scope
Student directory + per-student attendance surface. All grading, discipline, fees, health,
hostel, library, transport tabs are Phase 2 and render placeholders client-side.

## Data model (Django)

```python
class Student(models.Model):
    institution = FK(Institution)
    identity = OneToOne(IdentityProfile)             # Step 2 link (biometric vector)
    admission_no = CharField(unique=True)
    full_name = CharField()
    gender = CharField(choices=[('M','M'),('F','F')])
    dob = DateField(null=True)
    level = CharField()                              # JSS1..SS3 / Year 1..N
    class_group = FK('academic.ClassGroup', null=True)
    status = CharField(choices=[active, suspended, graduated, withdrawn])
    enrolled_at = DateField()

class Guardian(models.Model):
    student = FK(Student, related_name='guardians')
    full_name = CharField()
    phone = CharField()
    email = EmailField(null=True)
    relationship = CharField()
    is_primary = BooleanField(default=False)
```

`IdentityProfile.enrollment_status` drives the avatar ring on the frontend
(green = enrolled, amber = pending/not enrolled).

## REST endpoints (`/api/msse/students/`)

| Method | Path                            | Purpose                                       | Roles |
|--------|---------------------------------|-----------------------------------------------|-------|
| GET    | `/`                             | Paginated list. Filters: `level`, `class`, `status`, `enrollment`, `q` | admin, principal, dean, hod, teacher (scoped) |
| POST   | `/`                             | Create student (triggers Step 2 enrollment)   | admin, principal |
| GET    | `/{id}/`                        | Profile + guardians                           | scoped |
| PATCH  | `/{id}/`                        | Update bio                                    | admin, principal |
| POST   | `/import/`                      | CSV bulk import (async, returns job id)       | admin |
| GET    | `/{id}/attendance/`             | `PersonAttendanceSummary` (30/90d, trend, recent days) | scoped + parent |
| POST   | `/{id}/notify-parent/`          | Trigger SMS+email via Resend                  | principal, dean, hod, teacher |

All endpoints derive `institution_id` from JWT — never accept it in URL or body.

## Attendance integration
`GET /{id}/attendance/` aggregates Step 3 `AttendanceEvent` rows for the student and
returns the `PersonAttendanceSummary` shape used by the frontend
(`src/lib/api/msse/students.ts`). Cache for 60s; invalidate on `event.created`.

## RBAC
- `student` → own profile + attendance only.
- `parent_guardian` → linked students only (via `Guardian.is_primary` + verified phone).
- `teacher` → students in their assigned classes.
- `hod`/`dean`/`principal` → department / faculty / institution scope.

## Notifications
Parent notification template lives in Django; uses Resend with verified UUID identifiers.
Channel preference (SMS vs email) resolved from `Guardian` + institution settings.
