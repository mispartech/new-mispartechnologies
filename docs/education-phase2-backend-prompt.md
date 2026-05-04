# Phase 2 — Education Vertical Backend Spec

This document captures the Django/DRF + Supabase changes required to back the
Phase 2 frontend scaffolding shipped in `src/pages/dashboard/AcademicStructure.tsx`,
`src/pages/dashboard/AcademicCalendar.tsx`, and `src/pages/dashboard/CourseRosters.tsx`,
plus the new education roles in `src/lib/roleConfig.ts`.

> **Status**: Frontend is wired against in-memory state with `notImplemented()`
> fallbacks. No frontend changes are required when these endpoints land.

## 1. New SystemRole values

Extend the Django `Role` enum / DB constraint with:

| value             | label              | scope                 |
|-------------------|--------------------|-----------------------|
| `lecturer`        | Lecturer / Teacher | school orgs only      |
| `student`         | Student            | school orgs only      |
| `parent_guardian` | Parent / Guardian  | school orgs only      |

Update:
- `Member.role` choices.
- JWT claim mirroring (so frontend `profile.role` returns the new values).
- `GET /api/profile/` response (`role` field).
- Permission decorators / `IsAdminOrSuperAdmin` should treat `lecturer` as a
  *staff-equivalent* for course-roster endpoints only — never for org admin
  endpoints.

`ASSIGNABLE_ROLES` mirror (frontend `src/lib/roleConfig.ts`):

```
super_admin -> [admin, manager, lecturer, student, parent_guardian]
admin       -> [manager, lecturer, student, parent_guardian]
```

## 2. Models

All models are **org-scoped** — `organization` FK is mandatory and every queryset
must filter by `request.user.organization_id` (never trust query params).

### 2.1 Academic structure

```python
class Faculty(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = [('organization', 'name')]

class Programme(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='programmes')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, blank=True)
    duration_years = models.PositiveSmallIntegerField(default=4)

class Level(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='levels')
    name = models.CharField(max_length=50)   # "100 Level", "JSS1", "Year 7"
    order = models.PositiveSmallIntegerField(default=1)
    class Meta:
        ordering = ['order']

class Course(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='courses')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='courses')
    code = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    credit_units = models.PositiveSmallIntegerField(default=3)
    class Meta:
        unique_together = [('organization', 'code')]
```

### 2.2 Academic calendar

```python
class AcademicSession(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=20)   # "2025/2026"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    class Meta:
        unique_together = [('organization', 'name')]

class AcademicTerm(models.Model):
    TERM_CHOICES = [
        ('first', 'First Term'), ('second', 'Second Term'), ('third', 'Third Term'),
        ('harmattan', 'Harmattan Semester'), ('rain', 'Rain Semester'),
    ]
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE, related_name='terms')
    name = models.CharField(max_length=20, choices=TERM_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
```

Constraint: only ONE `AcademicSession` per org may have `is_current=True`.
Use a partial unique index or a save() override.

### 2.3 Lecturer assignments & student enrollments

```python
class CourseLecturer(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lecturers')
    lecturer = models.ForeignKey(Member, on_delete=models.CASCADE,
                                 limit_choices_to={'role': 'lecturer'})
    session = models.ForeignKey(AcademicSession, on_delete=models.PROTECT)
    class Meta:
        unique_together = [('course', 'lecturer', 'session')]

class CourseEnrollment(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(Member, on_delete=models.CASCADE,
                                limit_choices_to={'role': 'student'})
    session = models.ForeignKey(AcademicSession, on_delete=models.PROTECT)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = [('course', 'student', 'session')]
```

### 2.4 Parent / guardian links

```python
class GuardianLink(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    guardian = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='wards',
                                 limit_choices_to={'role': 'parent_guardian'})
    student = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='guardians',
                                limit_choices_to={'role': 'student'})
    relationship = models.CharField(max_length=30, blank=True)   # mother, father, uncle...
    class Meta:
        unique_together = [('guardian', 'student')]
```

## 3. Endpoints (all DRF ViewSets unless noted)

| Method | Path                                       | Purpose                                |
|--------|--------------------------------------------|----------------------------------------|
| GET/POST | `/api/academic/faculties/`               | list / create faculties                |
| GET/PATCH/DELETE | `/api/academic/faculties/{id}/`  | retrieve / update / delete             |
| GET/POST | `/api/academic/programmes/`              | `?faculty=` filter                     |
| GET/POST | `/api/academic/levels/`                  | `?programme=` filter                   |
| GET/POST | `/api/academic/courses/`                 | `?programme=`, `?level=` filters       |
| GET/POST | `/api/academic/sessions/`                |                                        |
| POST     | `/api/academic/sessions/{id}/set-current/` | atomically marks is_current           |
| GET/POST | `/api/academic/terms/`                   | `?session=` filter                     |
| GET/POST | `/api/academic/course-lecturers/`        | assign lecturer to course              |
| GET/POST | `/api/academic/enrollments/`             | enroll student in course               |
| POST     | `/api/academic/enrollments/bulk/`        | `{course, session, student_ids:[...]}` |
| GET/POST | `/api/academic/guardian-links/`          |                                        |
| GET      | `/api/members/?role=lecturer`            | reuse existing members endpoint        |
| GET      | `/api/members/?role=student&programme=&level=` | filterable student picker        |

All list endpoints follow the existing DRF paginated envelope (frontend uses
`unwrapPaginated`).

## 4. Frontend ↔ backend route map

Add to `src/lib/api/apiRoutes.ts` once endpoints are live (currently in
`FUTURE_ROUTES`):

```ts
ACADEMIC_FACULTIES: '/api/academic/faculties/',
ACADEMIC_PROGRAMMES: '/api/academic/programmes/',
ACADEMIC_LEVELS: '/api/academic/levels/',
ACADEMIC_COURSES: '/api/academic/courses/',
ACADEMIC_SESSIONS: '/api/academic/sessions/',
ACADEMIC_SESSION_SET_CURRENT: (id: string) => `/api/academic/sessions/${id}/set-current/`,
ACADEMIC_TERMS: '/api/academic/terms/',
ACADEMIC_COURSE_LECTURERS: '/api/academic/course-lecturers/',
ACADEMIC_ENROLLMENTS: '/api/academic/enrollments/',
ACADEMIC_ENROLLMENTS_BULK: '/api/academic/enrollments/bulk/',
ACADEMIC_GUARDIAN_LINKS: '/api/academic/guardian-links/',
```

## 5. Permissions matrix

| Action                                      | super_admin | admin | manager | lecturer | student | parent_guardian |
|---------------------------------------------|:----------:|:-----:|:-------:|:--------:|:-------:|:---------------:|
| CRUD faculties / programmes / levels / courses | ✅ | ✅ |  —  |  —  |  —  |  —  |
| CRUD sessions / terms                       | ✅ | ✅ |  —  |  —  |  —  |  —  |
| Assign lecturer to course                   | ✅ | ✅ |  —  |  —  |  —  |  —  |
| Enroll students                             | ✅ | ✅ |  ✅ |  —  |  —  |  —  |
| View own course rosters                     | ✅ | ✅ |  ✅ |  ✅ (only courses they teach) | — | — |
| View own enrollments / attendance           | ✅ | ✅ |  ✅ |  ✅ |  ✅ |  ✅ (only their wards) |

Lecturers should be restricted via DRF `get_queryset()` filtering on
`course__lecturers__lecturer=request.user`.

## 6. Attendance integration (later phase)

Once `Course` exists, `Attendance` should optionally accept a `course` FK
(nullable, for backward compat with non-school orgs). Class attendance UI
will filter the recogniser to a course's enrolled students only.

Not in scope for Phase 2 but the schema additions above will make it a
straightforward add.

## 7. Migration order

1. Add new role values + JWT claim updates.
2. Ship academic structure models + endpoints.
3. Ship calendar models + endpoints.
4. Ship lecturer assignment + enrollment endpoints.
5. Ship guardian links.
6. (Phase 3) Wire `Course` FK into `Attendance`.
