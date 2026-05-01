# Phase 1 — Education Vertical Backend Spec

> **Audience:** Django backend team (Mispar SSOT API).
> **Goal:** Unblock the frontend scaffolding shipped in Phase 1 for schools, colleges, and tertiary institutions.
> **Status:** Frontend is built against the contracts below. All endpoints below are **NEW** unless marked otherwise. Where the FE renders a "pending backend" state today, it is annotated.

---

## 1. New Plan Tier — `education`

### Pricing object

Add a fourth Paystack plan code alongside `starter | pro | business`:

```
education
  Display name:       Education
  Best for:           Schools, colleges, tertiary institutions
  Member cap:         10,000 members (configurable per-org override)
  Admin/staff cap:    Unlimited
  Departments:        Unlimited (mapped to Faculty/Programme/Class)
  Price (default):    $250 / quarter (₦ equivalent at Paystack init time)
  Add-ons eligible:   WhatsApp delivery, Custom Analytics
  Trial:              28-day free trial
```

### Endpoints to update

1. **`POST /api/payments/paystack/initialize/`** — accept `plan: 'education'` in addition to existing values. Map to a Paystack plan code on the backend (`MISPAR_PLAN_EDUCATION`) and corresponding amount.
2. **`GET /api/payments/subscription/`** — return `plan: 'education'` when active.
3. **`GET /api/profile/`** — `organization.subscription.plan` enum should include `education`.
4. **Plan gating middleware** — see `docs/backend-paystack-and-plan-gating-prompt.md`. Add `education` with the caps above. Treat as a superset of Business for feature flags (visitor tracking, branding, API access, activity logs).

### Backwards compatibility

Existing `starter | pro | business` continue to work unchanged. The frontend `PaystackPlan` type now includes `'education'`.

---

## 2. Self-Registration without Email — Identifier + DOB

### Why

Most students do not have institutional email at signup. Schools issue a **matric/student ID** and parents/guardians know the student's **date of birth**. We let the org admin pre-load the roster (see §3) and students self-claim using `{matric_number, date_of_birth}` rather than email.

### Endpoint changes

#### `GET /api/organizations/{slug}/public/` — extend response

Add fields:

```json
{
  "name": "...",
  "slug": "...",
  "type": "school",
  "logo_url": null,
  "departments": [...],
  "allow_self_registration": true,
  // NEW:
  "self_register_mode": "email" | "identifier_dob" | "both",
  "identifier_label": "Matric Number",          // org-defined, e.g. "Student ID", "Admission No."
  "education_meta": {                           // only present for school orgs
    "levels": ["100", "200", "300", "400", "500"],
    "faculties": [
      { "id": "uuid", "name": "Engineering", "programmes": [
        { "id": "uuid", "name": "Computer Science" }
      ]}
    ]
  }
}
```

#### `POST /api/self-register/` — accept either shape

**Existing email shape** (unchanged, still works):

```json
{ "org_slug": "...", "email": "...", "first_name": "...", "last_name": "...",
  "phone_number": "...", "gender": "...", "department_id": "..." }
```

**NEW identifier+DOB shape**:

```json
{
  "org_slug": "stmarys",
  "mode": "identifier_dob",
  "identifier": "MAT/2024/00123",
  "date_of_birth": "2007-05-14",         // ISO YYYY-MM-DD
  "first_name": "Adaeze",
  "last_name": "Okafor",
  "phone_number": "+2348012345678",      // optional, used as fallback contact
  "guardian_email": "parent@example.com",// optional, gets enrollment-status notifications
  "level": "200",                        // optional
  "faculty_id": "uuid",                  // optional
  "programme_id": "uuid",                // optional
  "department_id": "uuid"                // optional, may map to Class/Programme
}
```

**Backend behavior:**

1. Look up the org by slug. Reject if `self_register_mode` is `email`.
2. Match the row in `members` (or a new `student_roster` table — see §4) where `org_id = org` AND `identifier = {identifier}` AND `date_of_birth = {date_of_birth}`. Both fields must match — this is the auth factor.
3. If no match: return 404 with body `{"error": "Identifier or date of birth does not match our records. Contact your school administrator."}`. **Do not** leak which field was wrong.
4. If matched but already claimed (account already linked): return 409 `{"error": "This student account has already been activated. Try signing in instead."}`.
5. If matched and unclaimed:
   - Provision a Supabase auth user with a synthesized email (`{identifier}@students.{org.slug}.mispar.local`) so existing JWT plumbing still works. Mark the profile row with `auth_method: 'identifier_dob'` and store the real `identifier` and `date_of_birth`.
   - Send a one-time activation link via SMS (if `phone_number` present) and/or to `guardian_email` if provided. The link lets the student set a password.
   - Return `{"status": "pending_activation", "delivery": ["sms"|"guardian_email"]}`.

#### Login

Add **`POST /api/auth/identifier-login/`** (or fold into existing login):

```json
{ "org_slug": "stmarys", "identifier": "MAT/2024/00123", "password": "..." }
```

Backend resolves to the synthesized email and proxies to Supabase password sign-in, returns the JWT pair the frontend already expects.

> **Frontend status:** `JoinOrganization.tsx` already renders the identifier+DOB form variant when `self_register_mode !== 'email'` and the org type is `school`. It calls `djangoApi.selfRegister` with the new shape. Until the backend supports it, the call returns 404 and the UI shows a friendly "pending backend" message.

---

## 3. Bulk Roster Import — School Onboarding Step

### Context

`ImportMembersModal` already exists and posts to `POST /api/members/` (one at a time today, batch endpoint stubbed). Phase 1 surfaces this modal as a **dedicated onboarding step (Step 3.5)** when `organization_type === 'school'`. The CSV columns the FE accepts are now:

```
identifier,first_name,last_name,date_of_birth,gender,level,faculty,programme,
guardian_email,guardian_phone,department,phone_number,email
```

`identifier` and `date_of_birth` become required for schools. `email` is optional.

### Endpoint to implement

**`POST /api/members/bulk-invite/`** (currently stubbed via `notImplemented` in `client.ts`).

Request:

```json
{
  "members": [
    {
      "identifier": "MAT/2024/00123",
      "first_name": "Adaeze",
      "last_name": "Okafor",
      "date_of_birth": "2007-05-14",
      "gender": "female",
      "level": "200",
      "faculty_id": "uuid-or-name",
      "programme_id": "uuid-or-name",
      "department_id": "uuid-or-name",
      "guardian_email": "parent@example.com",
      "guardian_phone": "+234...",
      "phone_number": "+234...",
      "email": null
    }
  ],
  "send_invitations": false,            // schools usually skip; students claim later via §2
  "on_conflict": "skip" | "update"
}
```

Response:

```json
{
  "success": 980,
  "failed": 20,
  "errors": [
    { "row": 14, "identifier": "MAT/2024/00050", "error": "duplicate identifier in this org" }
  ]
}
```

Behavior notes:

- Atomic per-row, not per-batch. Partial success is fine.
- Org-scope uniqueness on `(org_id, identifier)`.
- Idempotent: re-importing the same CSV with `on_conflict: skip` should be a no-op.
- Cap batch size at **5,000 rows per call**. The FE will chunk larger files.

> **Frontend status:** Onboarding now shows a "Step 3.5 — Import Roster" card for schools that opens `ImportMembersModal`. The modal already targets `bulkInviteMembers`; today this returns 404 and the UI shows a "Backend pending — you'll be able to import after launch" notice. Skipping the step is allowed.

---

## 4. Data Model Notes

Suggested schema additions (Django models):

```python
class Member(models.Model):
    # existing fields…
    identifier = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    date_of_birth = models.DateField(null=True, blank=True)
    auth_method = models.CharField(max_length=32, default='email')  # 'email' | 'identifier_dob'
    guardian_email = models.EmailField(null=True, blank=True)
    guardian_phone = models.CharField(max_length=32, null=True, blank=True)
    level = models.CharField(max_length=16, null=True, blank=True)
    faculty = models.ForeignKey('Faculty', null=True, blank=True, on_delete=models.SET_NULL)
    programme = models.ForeignKey('Programme', null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['organization', 'identifier'],
                condition=Q(identifier__isnull=False),
                name='unique_identifier_per_org',
            )
        ]

class Faculty(models.Model):
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE)
    name = models.CharField(max_length=128)

class Programme(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    name = models.CharField(max_length=128)
```

`Faculty` and `Programme` are optional — small schools can ignore them and use the existing `Department` model. They are needed only when an org enables the "Education hierarchy" feature.

---

## 5. Acceptance Criteria

- [ ] `GET /api/organizations/{slug}/public/` returns `self_register_mode`, `identifier_label`, and (for schools) `education_meta`.
- [ ] `POST /api/self-register/` accepts both the email and identifier+DOB shapes and provisions a usable auth account in either case.
- [ ] `POST /api/members/bulk-invite/` returns the documented response and enforces org-scoped identifier uniqueness.
- [ ] `POST /api/payments/paystack/initialize/` accepts `plan: 'education'` and `GET /api/payments/subscription/` reports it.
- [ ] Plan gating middleware caps members at 10,000 for `education` and unlocks all Business-tier features.

Once these ship, the frontend scaffolding becomes fully functional with no further FE work required.
