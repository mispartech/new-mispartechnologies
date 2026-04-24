# Paystack Backend Integration Spec

This document tells the Django backend team **exactly** what to build so the
frontend Paystack checkout (in `src/pages/dashboard/SubscriptionSettings.tsx`)
works end-to-end.

---

## 1. Environment Variables (Django)

```
PAYSTACK_SECRET_KEY=sk_live_...        # never expose to frontend
PAYSTACK_PUBLIC_KEY=pk_live_...        # already on frontend as VITE_PAYSTACK_PUBLIC_KEY
PAYSTACK_WEBHOOK_BASE_URL=https://api.mispartechnologies.com
FRONTEND_BASE_URL=https://mispartechnologies.com
```

## 2. Plan Catalogue (server-side source of truth)

Quarterly billing. Prices in NGN kobo (multiply by 100).
The frontend sends the plan **id** only — the server picks the price.

| Plan id  | Display | USD/quarter | NGN/quarter (approx) | Amount (kobo) |
|----------|---------|-------------|----------------------|---------------|
| starter  | Starter | $50         | ₦80,000              | 8000000       |
| pro      | Pro     | $75         | ₦120,000             | 12000000      |
| business | Business| $120        | ₦192,000             | 19200000      |

> Use a current FX rate or hard-code the NGN amounts above. **Never trust
> the frontend with the price.**

---

## 3. Endpoints to implement

All endpoints live under `/api/payments/...` and use the existing
Supabase JWT auth middleware (same as the rest of the API), **except**
the webhook which is public + signature-verified.

### 3.1 `POST /api/payments/paystack/initialize/`  (auth required)

**Request body**
```json
{
  "plan": "starter" | "pro" | "business",
  "email": "user@example.com",
  "whatsapp_addon": false,
  "member_count": 0
}
```

**Server logic**
1. Look up the authenticated user; verify `email` matches.
2. Resolve `plan` → amount (kobo) from the catalogue above.
3. Generate a unique `reference` (e.g. `mispar_<org_id>_<uuid>`).
4. Call Paystack:
   ```http
   POST https://api.paystack.co/transaction/initialize
   Authorization: Bearer <PAYSTACK_SECRET_KEY>
   Content-Type: application/json

   {
     "email": "<email>",
     "amount": <amount_kobo>,
     "currency": "NGN",
     "reference": "<reference>",
     "callback_url": "https://mispartechnologies.com/dashboard/subscription",
     "metadata": {
       "plan": "<plan>",
       "org_id": "<org_id>",
       "user_id": "<supabase_user_id>"
     }
   }
   ```
5. Persist a `Payment` row (status = `pending`, plan, amount, reference,
   org_id, user_id, created_at).
6. Return:
   ```json
   {
     "reference": "mispar_...",
     "access_code": "<paystack access_code>",
     "authorization_url": "<paystack authorization_url>",
     "amount": 8000000,
     "currency": "NGN"
   }
   ```

### 3.2 `GET /api/payments/paystack/verify/<reference>/`  (auth required)

**Server logic**
1. Look up local `Payment` row by `reference`. Ensure it belongs to the
   requesting user/org.
2. Call Paystack:
   ```http
   GET https://api.paystack.co/transaction/verify/<reference>
   Authorization: Bearer <PAYSTACK_SECRET_KEY>
   ```
3. If `data.status == "success"` AND `data.amount == local.amount`:
   - Mark `Payment.status = success`.
   - Activate / extend the org subscription (90 days from `paid_at`).
4. Otherwise mark `Payment.status` = `failed` / `abandoned`.
5. Return:
   ```json
   {
     "reference": "mispar_...",
     "status": "success" | "failed" | "abandoned" | "pending",
     "amount": 8000000,
     "currency": "NGN",
     "plan": "starter",
     "paid_at": "2026-04-24T12:00:00Z"
   }
   ```

### 3.3 `POST /api/payments/paystack/webhook/`  (PUBLIC, signature-verified)

This is the URL set in **Paystack Dashboard → Settings → API Keys & Webhooks → Live Webhook URL**:
```
https://api.mispartechnologies.com/api/payments/paystack/webhook/
```

**Verification (mandatory)**

```python
import hmac, hashlib
from django.conf import settings

def verify_paystack_signature(request) -> bool:
    signature = request.headers.get("x-paystack-signature", "")
    expected = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
        request.body,                       # raw bytes — DO NOT re-serialize
        hashlib.sha512,
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
```

If verification fails → return `401`. Do not parse the body.

**Handle these events at minimum**

| Event                     | Action                                                         |
|---------------------------|----------------------------------------------------------------|
| `charge.success`          | Idempotently mark `Payment.success`, activate subscription     |
| `subscription.create`     | Store `subscription_code` and `email_token` on the org         |
| `subscription.disable`    | Mark org subscription as `cancelled`, keep access until period end |
| `invoice.payment_failed`  | Notify org admin, set status `past_due`                        |
| `invoice.create`          | Optional: log upcoming charge                                  |

**Always return `200 OK` quickly.** Do heavy work in a background job if needed.

### 3.4 `GET /api/payments/subscription/`  (auth required)

Returns the org's current subscription so the dashboard can show
"Current Plan" correctly:

```json
{
  "plan": "pro" | "starter" | "business" | null,
  "status": "trial" | "active" | "past_due" | "cancelled" | "expired",
  "current_period_end": "2026-07-24T00:00:00Z",
  "whatsapp_addon": false
}
```

---

## 4. Paystack Dashboard Configuration

Set these in the Paystack live dashboard:

| Field             | Value                                                                  |
|-------------------|------------------------------------------------------------------------|
| Live Callback URL | `https://mispartechnologies.com/dashboard/subscription`                |
| Live Webhook URL  | `https://api.mispartechnologies.com/api/payments/paystack/webhook/`    |
| IP Whitelist      | (optional — Paystack publishes their webhook IPs)                      |

---

## 5. Frontend → Backend contract summary

| Frontend file                                      | Backend endpoint                                |
|----------------------------------------------------|-------------------------------------------------|
| `src/lib/api/paystack.ts` → `initializePayment()`  | `POST /api/payments/paystack/initialize/`       |
| `src/lib/api/paystack.ts` → `verifyPayment()`      | `GET /api/payments/paystack/verify/:reference/` |
| (planned) subscription card                        | `GET /api/payments/subscription/`               |
| Paystack → server-to-server                        | `POST /api/payments/paystack/webhook/`          |

---

## 6. Test mode

Use `sk_test_...` / `pk_test_...` from the Paystack **Test Mode** tab during
development. Swap `VITE_PAYSTACK_PUBLIC_KEY` in `.env` accordingly. Test cards:
<https://paystack.com/docs/payments/test-payments/>
