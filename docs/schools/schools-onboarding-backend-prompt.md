# Schools Onboarding — Backend Prompt

Implements `GET` / `PUT /api/schools/onboarding/`. Used by the frontend wizard at `/schools/onboarding` (`src/pages/schools/SchoolsOnboarding.tsx`). The exact payload contract is `SchoolsOnboardingPayload` in `src/lib/api/schools/onboarding.ts` — match it byte-for-byte.

---

## Atomicity (non-negotiable)

The entire `PUT` handler must run inside `transaction.atomic()`. The following sub-steps either all succeed or all roll back:

1. Create `Organization` (type `school`) with name, short_code, motto, logo, ownership, institution_type, founded_year.
2. Create `School` profile row linked to organization.
3. Insert `Campus` rows = `campus_count` (auto-named "Main Campus", "Campus 2", …).
4. Insert default `Department` rows based on `institution_type` (e.g. secondary → English, Mathematics, Sciences, Arts, Administration).
5. Insert `AttendancePolicy` from `payload.policy`.
6. Insert `CapturePoint` rows from `payload.capture_points` (default `online=false` until first heartbeat).
7. Create admin Supabase user via service role (or link if email already exists), send invite email through Resend.
8. Create `Membership` row linking admin user → organization with `admin_role` mapped to one of: `principal | vice_principal | bursar | registrar | it_admin`.
9. Seed the eleven scoped roles in `user_roles` and grant the appropriate ones to the admin.
10. Create `Subscription` stub with plan = `payload.plan`, status = `trialing` (14-day trial), `renews_at = now + 14d`.
11. Insert `AuditLog` entry `tenant.onboarded`.

If any step throws, the whole transaction aborts and the response is `400 { detail, step }` so the frontend can surface a meaningful error.

---

## `GET /api/schools/onboarding/`

Returns the in-progress state if the caller's organization exists but onboarding is incomplete. Used by the wizard to resume from the right step.

```json
{
  "completed": false,
  "next_step": 4,
  "organization_id": "uuid|null",
  "...": "fields collected so far"
}
```

If completed → `{ "completed": true, "organization_id": "uuid" }` and the frontend redirects to `/schools/dashboard`.

---

## Validation rules

- `short_code` — uppercase, 2–8 chars, unique across all schools (`UNIQUE INDEX`).
- `email` — RFC valid, unique among admin users.
- `phone` — E.164.
- `capture_points` — at least 1, at most 50 at onboarding (more can be added later).
- `hierarchy_levels` — subset of `['faculty','department','programme','level','class']`; must include at least one.
- `policy.late_threshold_min < policy.very_late_threshold_min`.
- `policy.weekend_days` — array of 0..6, length 0..3.
- `accepted_biometric_terms === true` else `400`.

---

## Side-effects

- Send admin invite email via Resend with magic-link to `/schools/dashboard`.
- Enqueue Celery `seed_demo_data` task **only** if request contains `?seed=demo` query — never by default.
- Emit WS event on `admin` channel: `{ type: 'tenant.onboarded', tenant_id, name, plan }` so the Ednitio platform admin sees new tenants in real time.

---

## Acceptance criteria

- [ ] Submitting twice with the same `short_code` returns `409`.
- [ ] If Resend invite fails, the whole transaction rolls back.
- [ ] Admin can log in immediately after accepting the magic link and lands on `/schools/dashboard` with full permissions for their `admin_role`.
- [ ] `Subscription.status = 'trialing'` and `renews_at` is exactly 14 days out.
