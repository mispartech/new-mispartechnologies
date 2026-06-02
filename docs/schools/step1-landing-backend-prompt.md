# MSSE — Step 1: Landing Page Backend Spec

The MSSE marketing landing page at `/msse` (and later `school.mispartechnologies.com`) reuses the existing **demo request** pipeline. No new endpoints are strictly required for the page itself; this doc lists what the backend already exposes and what is recommended to add for richer marketing analytics.

## Reused endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/demo-requests/` | Demo booking from CTA buttons — already implemented (see `src/lib/api/demoApi.ts`). |

Frontend modal: `DemoRequestModal`. Same payload (`name`, `email`, `whatsapp`, `organization`). Optional new field: `product: 'msse'` so platform admins can filter MSSE leads.

## Recommended new endpoints

### 1. Marketing stats (optional, cosmetic)
```
GET /api/msse/marketing-stats/
→ { uptime_pct: 99.9, avg_match_ms: 280, institutions: 12, students: 14500 }
```
Used by hero trust strip. Falls back to hard-coded values when 404.

### 2. Pricing tiers (optional, CMS-driven)
```
GET /api/msse/pricing/
→ [ { name, price_naira_per_term, member_cap, features: string[], featured: bool } ]
```
Frontend already hard-codes 3 tiers; switch to API when ready.

### 3. FAQ (optional, CMS-driven)
```
GET /api/msse/faq/
→ [ { question, answer, order } ]
```

## Lead tagging

Extend the existing `DemoRequest` model with:
- `product: choices=['mispar', 'msse']` (default `'mispar'`)
- `source_path: str` (e.g. `/msse`, `/msse#pricing`)

Frontend will pass `product='msse'` and `source_path=window.location.pathname` from the MSSE landing.

## Acceptance criteria

- [ ] `POST /api/demo-requests/` accepts `product` and `source_path`
- [ ] Platform admin demo-request list shows product filter chip
- [ ] (Optional) `/api/msse/marketing-stats/` returns JSON; frontend tolerates 404 silently
- [ ] (Optional) Pricing + FAQ endpoints serve the same shape the page currently hard-codes

## Out of scope (handled in later steps)

- Biometric enrollment, attendance, security, RBAC — see Step 2+ docs.
