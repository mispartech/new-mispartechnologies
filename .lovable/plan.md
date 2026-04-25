## Goal

Produce **one** backend implementation brief — `docs/backend-paystack-and-plan-gating-prompt.md` — that the Django team (`Smart-Attendance-System-API`) can implement directly. It supersedes the earlier `paystack-backend-spec.md` by adding the missing piece: **plan-driven entitlements that the frontend reads to render different dashboards per organization and per role.**

No frontend code changes in this task — this is a documentation deliverable only. The frontend wiring (Subscribe buttons, Paystack inline checkout, callback verification) was already shipped in the previous turn.

## What the document will contain

1. **Plan catalogue (server source of truth)** — `starter`, `pro`, `business` with `limits` (max_admins, max_managers, max_members, max_departments, max_sites, max_schedules) and `features` (face_recognition, monthly_reports, csv_export, pdf_export, analytics_charts, visitor_tracking, custom_branding, activity_logs, whatsapp_addon_eligible, api_access, dedicated_account_manager, custom_analytics_addon). `None` = unlimited. Quarterly NGN pricing in kobo.

2. **Database models**
   - `OrgSubscription` (one per org): `plan`, `status` ∈ `trial|active|past_due|cancelled|expired`, `current_period_start/end`, Paystack codes, add-on flags. Auto-created on signup with 14-day trial.
   - `Payment`: reference, amount_kobo, status, paid_at, payload.
   - `WebhookEvent`: idempotency log keyed on Paystack event id.

3. **Paystack endpoints** (under `/api/payments/...`)
   - `POST /paystack/initialize/` — auth-only, super_admin/admin only, generates reference, calls Paystack `/transaction/initialize`, persists pending Payment, returns `{reference, access_code, authorization_url, amount, currency}`.
   - `GET /paystack/verify/<reference>/` — verifies with Paystack, on success extends `OrgSubscription` by 90 days.
   - `POST /paystack/webhook/` — public, HMAC-SHA512 verified using raw body, idempotent on event id, dispatches `charge.success`, `subscription.create`, `subscription.disable`, `invoice.payment_failed`, `invoice.create`. Always returns 200 within 5 s.
   - `GET /payments/subscription/` — returns plan + limits + live usage counts + features + addons + upgrade hints. **This is the single source the frontend hydrates the dashboard from.**

4. **Profile endpoint amendment** — `GET /api/profile/` must embed the same `subscription` object so `DjangoAuthContext` gets it in one round-trip on app load.

5. **Server-side enforcement helpers**
   - `enforce_limit(org, resource, current)` and `require_feature(org, feature)`.
   - DRF exception handler maps both to **HTTP 402** with a consistent JSON envelope: `{ error, resource|feature, current, limit, required_plan, message }`.
   - Table mapping every write endpoint to the limit/feature it must check (members, admins, managers, departments, sites, schedules, visitor tracking, branding, activity logs, exports, analytics data, API tokens).
   - Behaviour matrix for `trial`, `past_due`, `expired`, `cancelled`.

6. **Role × Plan capability matrix** — one table showing what super_admin / admin / manager / member can do per plan, so the frontend gating logic and backend permissions stay aligned.

7. **Add-ons**
   - WhatsApp delivery: toggle endpoint, monthly job that bills `max(0, member_count - free_tier) × ₦20`. Free tier per plan.
   - Custom Analytics: sales-lead endpoint (`POST /payments/addons/custom-analytics/request/`), no self-serve.

8. **Paystack dashboard configuration** — exact callback + webhook URLs for live and test modes.

9. **Environment variables** — `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_API_BASE`, `FRONTEND_BASE_URL`, `TRIAL_DAYS=14`.

10. **Acceptance checklist** — 10 verifiable items the backend team can tick off (auto-trial creation, idempotent webhook, 402 on limit/feature breach, manager cannot escalate role, past_due read-only writes, etc.).

11. **Standardized 402 error envelope** so the frontend can render one consistent "Upgrade" modal everywhere.

## Files to be created

| File | Purpose |
|---|---|
| `docs/backend-paystack-and-plan-gating-prompt.md` | The full brief described above (~9–10 KB). |

## What this enables on the frontend (next steps, not part of this task)

After the backend ships:

- `DjangoAuthContext` reads `user.subscription` and exposes `{plan, limits, usage, features}`.
- A new hook `useEntitlements()` returns `can(feature)` and `withinLimit(resource)`.
- `DashboardSidebar` hides/locks items based on `features` + role.
- A shared `<UpgradePrompt requiredPlan="pro" />` component is rendered wherever the API returns 402.
- `SubscriptionSettings` highlights the current plan and shows live usage bars (members 147/200, etc.).

These frontend changes will be a separate task once the backend endpoints are live.