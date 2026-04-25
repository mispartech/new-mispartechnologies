# Backend Implementation Prompt — Paystack Billing + Plan-Based Feature Gating

> Paste this into the Django backend repo (`Smart-Attendance-System-API`) as the
> implementation brief. It supersedes the earlier `paystack-backend-spec.md`
> by adding the **plan-based access-control layer** that the frontend will
> read on every request to render the correct dashboard.

---

## 0. Goal

Mispar Technologies is a multi-tenant biometric attendance SaaS. Every
organization belongs to exactly **one subscription plan** (`starter`, `pro`,
or `business`) plus optional add-ons. The backend must:

1. Sell those plans through **Paystack** (NGN, billed quarterly).
2. Persist the org's current plan + period.
3. **Enforce plan limits server-side** (admins, members, departments, sites,
   feature flags) on every write.
4. **Expose the plan + entitlements** to the frontend so the UI can hide,
   disable, or unlock features per organization and per role (super_admin,
   admin, manager, member).

The frontend already calls these endpoints (see `src/lib/api/apiRoutes.ts`):

```
POST /api/payments/paystack/initialize/
GET  /api/payments/paystack/verify/<reference>/
POST /api/payments/paystack/webhook/
GET  /api/payments/subscription/
```

---

## 1. Plan Catalogue (single source of truth — server-side)

Define this as a Python constant (`payments/plans.py`). The frontend sends
only the plan **id**; the server resolves price + entitlements.

```python
PLAN_CATALOGUE = {
    "starter": {
        "display_name": "Starter",
        "amount_kobo":  8_000_000,   # ₦80,000 / quarter (≈ $50)
        "currency":     "NGN",
        "interval":     "quarterly", # 90 days
        "limits": {
            "max_admins":         1,   # super_admin counts here
            "max_managers":       0,
            "max_members":        50,
            "max_departments":    1,
            "max_sites":          1,
            "max_schedules":      3,
        },
        "features": {
            "face_recognition":          True,
            "attendance_logs":           True,
            "email_reports":             True,
            "monthly_reports":           False,
            "csv_export":                False,
            "pdf_export":                False,
            "analytics_charts":          False,
            "visitor_tracking":          False,
            "custom_branding":           False,
            "activity_logs":             False,
            "whatsapp_addon_eligible":   False,
            "api_access":                False,
            "dedicated_account_manager": False,
            "custom_analytics_addon":    False,
        },
    },
    "pro": {
        "display_name": "Pro",
        "amount_kobo":  12_000_000,  # ₦120,000 / quarter (≈ $75)
        "currency":     "NGN",
        "interval":     "quarterly",
        "limits": {
            "max_admins":         2,
            "max_managers":       3,   # admins + managers ≤ 5 total
            "max_members":        200,
            "max_departments":    None,  # unlimited
            "max_sites":          3,
            "max_schedules":      None,
        },
        "features": {
            "face_recognition":          True,
            "attendance_logs":           True,
            "email_reports":             True,
            "monthly_reports":           True,
            "csv_export":                True,
            "pdf_export":                True,
            "analytics_charts":          True,
            "visitor_tracking":          False,
            "custom_branding":           False,
            "activity_logs":             False,
            "whatsapp_addon_eligible":   True,
            "api_access":                False,
            "dedicated_account_manager": False,
            "custom_analytics_addon":    True,
        },
    },
    "business": {
        "display_name": "Business",
        "amount_kobo":  19_200_000,  # ₦192,000 / quarter (≈ $120)
        "currency":     "NGN",
        "interval":     "quarterly",
        "limits": {
            "max_admins":         None,  # unlimited
            "max_managers":       None,
            "max_members":        None,
            "max_departments":    None,
            "max_sites":          None,
            "max_schedules":      None,
        },
        "features": {
            "face_recognition":          True,
            "attendance_logs":           True,
            "email_reports":             True,
            "monthly_reports":           True,
            "csv_export":                True,
            "pdf_export":                True,
            "analytics_charts":          True,
            "visitor_tracking":          True,
            "custom_branding":           True,
            "activity_logs":             True,
            "whatsapp_addon_eligible":   True,
            "api_access":                True,
            "dedicated_account_manager": True,
            "custom_analytics_addon":    True,
        },
    },
}

ADDONS = {
    "whatsapp": {
        "price_per_member_per_month_kobo": 2000,  # ₦20
        "free_tier_members": {
            "starter": 0,
            "pro": 0,
            "business": 500,
        },
    },
    "custom_analytics": {
        "pricing": "custom_quote",  # contact sales
    },
}

TRIAL_DAYS = 14  # auto-applied to every new org
```

> `None` means **unlimited**. Always treat `None` correctly in comparisons
> (`limit is None or current < limit`).

---

## 2. Database Schema (new + amended)

### 2.1 `OrgSubscription` (one per org)

```python
class OrgSubscription(models.Model):
    org             = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name="subscription")
    plan            = models.CharField(max_length=20, choices=[("starter","starter"),("pro","pro"),("business","business")])
    status          = models.CharField(max_length=20, choices=[
                          ("trial","trial"),
                          ("active","active"),
                          ("past_due","past_due"),
                          ("cancelled","cancelled"),
                          ("expired","expired"),
                      ], default="trial")
    current_period_start = models.DateTimeField()
    current_period_end   = models.DateTimeField()
    cancel_at_period_end = models.BooleanField(default=False)

    paystack_customer_code     = models.CharField(max_length=100, blank=True)
    paystack_subscription_code = models.CharField(max_length=100, blank=True)
    paystack_email_token       = models.CharField(max_length=100, blank=True)

    whatsapp_addon_enabled   = models.BooleanField(default=False)
    custom_analytics_enabled = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

Auto-create one row per org **at signup** with `plan="starter"`,
`status="trial"`, `current_period_end = now + TRIAL_DAYS`. Trial orgs are
granted **Pro entitlements** for the 14-day window so users can evaluate
the product, then auto-flip to `expired` (read-only) on expiry.

### 2.2 `Payment`

```python
class Payment(models.Model):
    org         = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="payments")
    user        = models.ForeignKey(CustomUser,   on_delete=models.SET_NULL, null=True)
    plan        = models.CharField(max_length=20)
    reference   = models.CharField(max_length=100, unique=True)
    amount_kobo = models.BigIntegerField()
    currency    = models.CharField(max_length=8, default="NGN")
    status      = models.CharField(max_length=20, default="pending")  # pending|success|failed|abandoned
    paystack_event_payload = models.JSONField(blank=True, null=True)
    paid_at     = models.DateTimeField(blank=True, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)
```

### 2.3 `WebhookEvent` (idempotency log)

```python
class WebhookEvent(models.Model):
    paystack_id = models.CharField(max_length=64, unique=True)  # event id from Paystack
    event_type  = models.CharField(max_length=50)
    received_at = models.DateTimeField(auto_now_add=True)
    payload     = models.JSONField()
```

Always check `WebhookEvent.objects.filter(paystack_id=...).exists()` before
processing. This makes the webhook endpoint safely retryable.

---

## 3. Paystack Endpoints (HTTP contract)

All endpoints under `/api/payments/...`. Authenticated endpoints use the
existing Supabase JWT middleware. The webhook is public + signature-verified.

### 3.1 `POST /api/payments/paystack/initialize/`  *(auth)*

**Request**
```json
{ "plan": "pro", "email": "user@example.com" }
```

**Server logic**
1. Resolve org from authenticated user. Reject unless role is `super_admin`
   or `admin` (managers/members cannot purchase).
2. Look up `PLAN_CATALOGUE[plan]`. 400 on unknown plan.
3. Generate `reference = f"mispar_{org.id}_{uuid4().hex}"`.
4. Call Paystack `POST /transaction/initialize` with the kobo amount,
   `callback_url=https://mispartechnologies.com/dashboard/subscription`,
   and `metadata = {plan, org_id, user_id}`.
5. Persist `Payment(status="pending", ...)`.
6. Respond:
   ```json
   {
     "reference": "mispar_...",
     "access_code": "...",
     "authorization_url": "https://checkout.paystack.com/...",
     "amount": 12000000,
     "currency": "NGN"
   }
   ```

### 3.2 `GET /api/payments/paystack/verify/<reference>/`  *(auth)*

1. Fetch local `Payment` by reference; ensure it belongs to the user's org.
2. Call Paystack `GET /transaction/verify/<reference>`.
3. If `data.status == "success"` AND `data.amount == payment.amount_kobo`:
   - Set `payment.status="success"`, `paid_at=data.paid_at`.
   - **Activate or extend** `OrgSubscription`:
     ```python
     sub.plan = payment.plan
     sub.status = "active"
     start = max(now, sub.current_period_end or now)
     sub.current_period_start = start
     sub.current_period_end   = start + timedelta(days=90)
     sub.cancel_at_period_end = False
     sub.save()
     ```
4. Respond:
   ```json
   {
     "reference": "mispar_...",
     "status": "success",
     "amount": 12000000,
     "currency": "NGN",
     "plan": "pro",
     "paid_at": "2026-04-24T12:00:00Z"
   }
   ```

### 3.3 `POST /api/payments/paystack/webhook/`  *(public, signature-verified)*

```python
import hmac, hashlib
def verify(request) -> bool:
    sig = request.headers.get("x-paystack-signature", "")
    expected = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode(),
        request.body,                   # RAW bytes — never re-serialize
        hashlib.sha512,
    ).hexdigest()
    return hmac.compare_digest(sig, expected)
```

If signature invalid → return **401**, no parsing. If valid:
1. Idempotency: insert `WebhookEvent(paystack_id=event["id"], ...)`. If it
   already exists, return `200 OK` immediately.
2. Dispatch on `event["event"]`:

| Event                    | Action                                                                 |
|--------------------------|------------------------------------------------------------------------|
| `charge.success`         | Same as `verify` step 3 (mark Payment success, extend subscription).   |
| `subscription.create`    | Store `subscription_code`, `email_token`, `customer_code`.             |
| `subscription.disable`   | `sub.cancel_at_period_end = True`.                                     |
| `invoice.payment_failed` | `sub.status = "past_due"`. Email org admin.                            |
| `invoice.create`         | Optional: log upcoming charge.                                         |

3. **Always return 200 within 5 s.** Push slow work to Celery / cron.

### 3.4 `GET /api/payments/subscription/`  *(auth)*

> **This is the most important endpoint for the dynamic dashboard.**
> The frontend calls it on every login + on plan change, and caches the
> result in `DjangoAuthContext`. It must include resolved entitlements so
> the UI never has to hard-code limits.

**Response**
```json
{
  "plan": "pro",
  "plan_display_name": "Pro",
  "status": "active",
  "is_trial": false,
  "trial_days_left": 0,
  "current_period_start": "2026-04-24T00:00:00Z",
  "current_period_end":   "2026-07-23T00:00:00Z",
  "cancel_at_period_end": false,

  "limits": {
    "max_admins":      2,
    "max_managers":    3,
    "max_members":     200,
    "max_departments": null,
    "max_sites":       3,
    "max_schedules":   null
  },

  "usage": {
    "admins":      1,
    "managers":    2,
    "members":     147,
    "departments": 4,
    "sites":       1,
    "schedules":   6
  },

  "features": {
    "face_recognition":          true,
    "attendance_logs":           true,
    "email_reports":             true,
    "monthly_reports":           true,
    "csv_export":                true,
    "pdf_export":                true,
    "analytics_charts":          true,
    "visitor_tracking":          false,
    "custom_branding":           false,
    "activity_logs":             false,
    "whatsapp_addon_eligible":   true,
    "api_access":                false,
    "dedicated_account_manager": false,
    "custom_analytics_addon":    true
  },

  "addons": {
    "whatsapp_enabled":         false,
    "custom_analytics_enabled": false
  },

  "upgrade_suggestions": [
    { "feature": "visitor_tracking", "required_plan": "business" }
  ]
}
```

`usage` is recomputed live (cheap COUNT queries scoped to the org).

---

## 4. Plan Enforcement (server-side gate — non-negotiable)

Create one helper and use it on every relevant write:

```python
# payments/gating.py
class PlanLimitExceeded(Exception):
    def __init__(self, resource, current, limit, required_plan):
        self.payload = {
            "error": "plan_limit_exceeded",
            "resource": resource,
            "current": current,
            "limit": limit,
            "required_plan": required_plan,
            "message": f"Your plan allows up to {limit} {resource}. Upgrade to {required_plan} to add more.",
        }

class FeatureNotInPlan(Exception):
    def __init__(self, feature, required_plan):
        self.payload = {
            "error": "feature_not_in_plan",
            "feature": feature,
            "required_plan": required_plan,
            "message": f"'{feature}' is not available on your current plan. Upgrade to {required_plan}.",
        }

def enforce_limit(org, resource: str, current: int):
    plan = org.subscription.plan
    limit = PLAN_CATALOGUE[plan]["limits"][f"max_{resource}"]
    if limit is not None and current >= limit:
        raise PlanLimitExceeded(resource, current, limit,
                                required_plan=_next_plan_with_higher_limit(resource, limit))

def require_feature(org, feature: str):
    plan = org.subscription.plan
    if not PLAN_CATALOGUE[plan]["features"].get(feature):
        raise FeatureNotInPlan(feature,
                               required_plan=_first_plan_with_feature(feature))
```

Add a DRF exception handler that maps both exceptions to **HTTP 402 Payment
Required** with the `payload` body. The frontend already shows toast errors
based on `data.message`.

### Where to enforce (minimum set)

| Action                                | Enforcement                                                |
|---------------------------------------|-------------------------------------------------------------|
| `POST /api/members/`                  | `enforce_limit(org, "members", current_member_count)`       |
| `POST /api/members/` with admin role  | `enforce_limit(org, "admins", current_admin_count)`         |
| `POST /api/members/` with manager role| `enforce_limit(org, "managers", current_manager_count)`     |
| `POST /api/departments/`              | `enforce_limit(org, "departments", ...)`                    |
| `POST /api/sites/`                    | `enforce_limit(org, "sites", ...)`                          |
| `POST /api/schedules/`                | `enforce_limit(org, "schedules", ...)`                      |
| Visitor tracking endpoints            | `require_feature(org, "visitor_tracking")`                  |
| Branding update                       | `require_feature(org, "custom_branding")`                   |
| Activity logs read                    | `require_feature(org, "activity_logs")`                     |
| Reports CSV/PDF export                | `require_feature(org, "csv_export"/"pdf_export")`           |
| Analytics charts data                 | `require_feature(org, "analytics_charts")`                  |
| `/api/v1/...` external API tokens     | `require_feature(org, "api_access")`                        |

### Status behaviour

- `trial`: apply **Pro** entitlements until `current_period_end`, then
  auto-flip to `expired`.
- `past_due`: keep read access, block writes to all
  member/admin/department/schedule endpoints (return 402).
- `expired` / `cancelled` (after period end): read-only mode for
  super_admin only; everyone else gets 402 on every authenticated route
  except `/api/profile/` and `/api/payments/...`.

---

## 5. Role × Plan Capability Matrix

The plan controls **what the org can do**. The role controls **who in the
org can do it**. Both must pass.

| Capability                       | super_admin | admin | manager | member | Min plan       |
|---------------------------------|-------------|-------|---------|--------|----------------|
| Invite admins/managers          | ✅          | ✅    | ❌      | ❌     | Starter        |
| Invite members                  | ✅          | ✅    | ✅      | ❌     | Starter        |
| Capture attendance              | ✅          | ✅    | ✅      | ❌     | Starter        |
| View own attendance history     | ✅          | ✅    | ✅      | ✅     | Starter        |
| Departments CRUD                | ✅          | ✅    | ❌      | ❌     | Starter (1)    |
| Sites CRUD                      | ✅          | ✅    | ❌      | ❌     | Starter (1)    |
| Schedules CRUD                  | ✅          | ✅    | ✅      | ❌     | Starter (3)    |
| Visitor review                  | ✅          | ✅    | ✅      | ❌     | **Business**   |
| Branding & theming              | ✅          | ❌    | ❌      | ❌     | **Business**   |
| Activity logs                   | ✅          | ✅    | ❌      | ❌     | **Business**   |
| Analytics charts                | ✅          | ✅    | ✅      | ❌     | **Pro**        |
| CSV/PDF export                  | ✅          | ✅    | ✅      | ❌     | **Pro**        |
| WhatsApp delivery               | ✅          | ✅    | ❌      | ❌     | **Pro** add-on |
| Subscription & billing          | ✅          | ❌    | ❌      | ❌     | always         |
| API tokens                      | ✅          | ❌    | ❌      | ❌     | **Business**   |

The frontend reads `features` + the user's `role` and toggles sidebar
items, buttons, and pages accordingly. The backend still enforces both
checks on every request — never trust the UI.

---

## 6. Profile endpoint amendment

`GET /api/profile/` must additionally return:

```json
{
  "...existing fields...": "...",
  "subscription": { ... same shape as /api/payments/subscription/ ... }
}
```

This lets the React `DjangoAuthContext` populate plan + entitlements in
one round-trip on app load.

---

## 7. Add-ons

### 7.1 WhatsApp delivery
- Toggle: `POST /api/payments/addons/whatsapp/` `{ enabled: bool }`.
  Requires `whatsapp_addon_eligible == True`.
- Monthly billing job calculates
  `max(0, member_count - free_tier) * ₦20` and creates a Paystack one-time
  charge.

### 7.2 Custom Analytics
- No self-serve toggle. `POST /api/payments/addons/custom-analytics/request/`
  records a sales lead and emails `sales@mispartechnologies.com`.

---

## 8. Paystack Dashboard configuration

| Field              | Value                                                                  |
|--------------------|------------------------------------------------------------------------|
| Live Callback URL  | `https://mispartechnologies.com/dashboard/subscription`                |
| Live Webhook URL   | `https://api.mispartechnologies.com/api/payments/paystack/webhook/`    |
| Test Callback URL  | `https://mispartechnologies.lovable.app/dashboard/subscription`        |
| Test Webhook URL   | (use ngrok or a staging API URL pointing to the same path)             |

---

## 9. Environment variables

```
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...      # also exposed to frontend as VITE_PAYSTACK_PUBLIC_KEY
PAYSTACK_API_BASE=https://api.paystack.co
FRONTEND_BASE_URL=https://mispartechnologies.com
TRIAL_DAYS=14
```

---

## 10. Acceptance checklist

- [ ] New org → `OrgSubscription` row auto-created with `trial` status.
- [ ] `GET /api/payments/subscription/` returns plan, limits, usage, features.
- [ ] `GET /api/profile/` includes the same `subscription` object.
- [ ] Initialize → Paystack popup opens → on success the org's plan flips
      to the purchased plan and `current_period_end` is +90 days.
- [ ] Webhook is idempotent (replaying the same event has no side effect).
- [ ] Webhook signature mismatch → 401, no DB writes.
- [ ] Creating a 51st member on Starter → **402** with a JSON body the
      frontend can render as "Upgrade to Pro to add more members".
- [ ] Hitting `/api/branding/` on Starter or Pro → **402** with
      `required_plan: "business"`.
- [ ] Past-due org cannot create members but can still log in and pay.
- [ ] Manager cannot call `POST /api/members/` with `role=admin` (403).
- [ ] All gating checks have unit tests covering the boundary
      (limit-1, limit, limit+1).

---

## 11. Standard 402 error envelope

All plan/feature errors return HTTP **402** with this body so the frontend
can show one consistent upgrade modal:

```json
{
  "error": "plan_limit_exceeded",       // or "feature_not_in_plan"
  "resource": "members",                // omitted for feature errors
  "feature":  "visitor_tracking",       // omitted for limit errors
  "current":  50,
  "limit":    50,
  "required_plan": "pro",
  "message": "Your plan allows up to 50 members. Upgrade to Pro to add more."
}
```
