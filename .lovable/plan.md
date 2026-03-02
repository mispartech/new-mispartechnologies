

## User Roles Overhaul: Unified, Organization-Agnostic Role System

### Problem Analysis

The current role system conflates **access-control roles** (who can do what) with **organization-specific job titles** (Parish Pastor, CEO, etc.). This causes several issues:

1. **Django `ROLE_CHOICES`** are church-specific (`parish_pastor`, `ushering_head_admin`, `usher_admin`) -- unusable for corporate, school, hospital orgs
2. **Onboarding Step 5** lets the admin pick a job title (e.g., "Parish Pastor", "HR Manager") and stores it as their `role` -- but this is a title, not an access level
3. **Frontend hardcodes church roles** in `DashboardRouter.tsx`, `DashboardSidebar.tsx`, and `AdminManagement.tsx`
4. Users who register and complete onboarding should automatically become `admin`, but currently get whatever title they picked (e.g., `parish_pastor`)

### Solution: Two-Field Model

Separate the concept into two distinct fields:

| Field | Purpose | Examples |
|-------|---------|---------|
| `role` | Access control (determines dashboard, sidebar, permissions) | `admin`, `manager`, `member` |
| `job_title` | Display-only label chosen during onboarding or by admin | "Parish Pastor", "HR Manager", "Head Teacher" |

### Unified Role Set (3 roles only)

| Role | Who gets it | Dashboard |
|------|-------------|-----------|
| `admin` | User who registers + completes onboarding | Full admin dashboard |
| `manager` | Invited by admin with elevated access | Admin dashboard (limited) |
| `member` | Invited employees/members | Member dashboard |

### Changes Required

#### A. Django Backend Changes (instructions for you to implement)

1. **Update `CustomUser` model**:
```python
ROLE_CHOICES = [
    ('super_admin', 'Super Admin'),
    ('admin', 'Admin'),
    ('manager', 'Manager'),
    ('member', 'Member'),
]

role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='member')
job_title = models.CharField(max_length=100, blank=True, default='')
```

2. **Migration**: Add `job_title` field, migrate existing church-specific roles:
   - `parish_pastor` -> role=`admin`, job_title=`Parish Pastor`
   - `department_head` -> role=`manager`, job_title=`Department Head`
   - `ushering_head_admin` -> role=`manager`, job_title=`Ushering Head Admin`
   - `usher_admin` -> role=`manager`, job_title=`Usher Admin`
   - `secretary` -> role=`manager`, job_title=`Secretary`
   - `member` -> role=`member`, job_title stays empty

3. **Onboarding view** (`PUT /api/onboarding/`): When processing `is_completed=true`, set `role='admin'` and store `admin_role` value into `job_title`

4. **Profile view** (`GET /api/profile/`): Include `job_title` in response

5. **Member invite flow**: Accept a `role` field (admin/manager/member) + optional `job_title`

#### B. Frontend Changes (what we will implement)

**1. `src/contexts/DjangoAuthContext.tsx`** -- Add `job_title` to User interface

**2. `src/pages/dashboard/DashboardRouter.tsx`** -- Simplify ADMIN_ROLES to just `['super_admin', 'admin', 'manager']`

**3. `src/components/dashboard/DashboardSidebar.tsx`** -- Replace the long church-specific role arrays with the 3 unified roles. Map sidebar visibility:
   - `admin` / `super_admin`: All admin items
   - `manager`: Subset of admin items (attendance, members, reports, departments)
   - `member`: Member-only items (existing)

**4. `src/pages/dashboard/AdminManagement.tsx`** -- Replace church-specific `ADMIN_ROLES` dropdown with unified roles (`admin`, `manager`) + a free-text `job_title` field

**5. `src/pages/Onboarding.tsx`** -- The `adminRole` field remains as-is in the UI (it selects a job title like "Parish Pastor"), but the submission payload changes: `admin_role` becomes `job_title`, and the backend sets `role='admin'` automatically

**6. `src/components/dashboard/DashboardLayout.tsx`** -- Display `job_title` where applicable (e.g., sidebar footer shows "Admin - Parish Pastor")

**7. `src/components/dashboard/DashboardSidebar.tsx` footer** -- Show both role and job title: "Admin" with subtitle "Parish Pastor"

### File-by-File Changes

| File | Change |
|------|--------|
| `src/contexts/DjangoAuthContext.tsx` | Add `job_title?: string` to `User` interface |
| `src/pages/dashboard/DashboardRouter.tsx` | Simplify `ADMIN_ROLES` to `['super_admin', 'admin', 'manager']` |
| `src/components/dashboard/DashboardSidebar.tsx` | Replace all role arrays with unified 3-role system; update footer to show job title |
| `src/pages/dashboard/AdminManagement.tsx` | Replace church-specific roles with `admin`/`manager` + job_title text input |
| `src/pages/Onboarding.tsx` | Rename `admin_role` to `job_title` in submission payload |
| `src/components/dashboard/DashboardLayout.tsx` | Pass `job_title` through profile object |

### Django Backend Checklist (for you to implement server-side)

1. Add `job_title = CharField(max_length=100, blank=True, default='')` to `CustomUser`
2. Update `ROLE_CHOICES` to `super_admin`, `admin`, `manager`, `member`
3. Create data migration to remap existing roles and populate `job_title`
4. Update `PUT /api/onboarding/` to set `role='admin'` + `job_title` from `admin_role` field
5. Update `GET /api/profile/` to include `job_title` in response
6. Update member creation / invite endpoints to accept `role` (from unified set) + `job_title`
7. Update admin invite endpoint to accept `role` + `job_title`

