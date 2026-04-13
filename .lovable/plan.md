

# Dynamic Stats, Attendance Delivery Settings & Pricing Updates

## Overview

Three interconnected changes: (1) replace all hardcoded stats across the site with dynamic data managed from the platform admin dashboard, (2) add attendance record delivery settings (WhatsApp/Email) to the org dashboard, and (3) update pricing to reflect the WhatsApp messaging cost add-on.

---

## 1. Replace Hardcoded Stats with Dynamic Data

**Problem:** HeroSection shows "10,000+ Users", CTASection says "Join thousands", TestimonialSection has fake testimonials and org logos, PlatformAdminDashboard stats are all "—", Blog/Press/Careers have dummy content.

**Approach:** Create a `platform_stats` table and a `site_content` table managed from the admin dashboard. The public site fetches stats via a public API endpoint.

### Files to change:

- **`HeroSection.tsx`** — Replace hardcoded `useCountUp(10000)` with a fetch from `GET /api/platform/stats/` (public endpoint returning `{ total_users, total_organizations, accuracy_rate }`). Show "0" or skeleton until loaded.

- **`CTASection.tsx`** — Replace "Join thousands of organizations" with dynamic text using the org count, e.g., "Join {count}+ organizations..."

- **`TestimonialSection.tsx`** — Add a blur overlay (reuse `ComingSoonOverlay`) over the entire testimonial section since all testimonials and org logos are fabricated. Show "Real testimonials coming soon".

- **`PlatformAdminDashboard.tsx`** — Wire stats cards to fetch from `GET /api/platform/dashboard-stats/` (authenticated). Show loading skeletons. Add management sub-pages:
  - **Site Stats Management** — form to manually set/override public-facing stats (total users, orgs, accuracy) until auto-calculation is ready
  - **Content Management** stubs already exist; keep as-is for now

### New files:
- **`src/lib/api/platformApi.ts`** — API client functions for `GET /api/platform/stats/` (public) and `GET /api/platform/dashboard-stats/` (admin-only)

### Backend prompt needed:
- `GET /api/platform/stats/` — public, returns `{ total_users, total_organizations, accuracy_rate }` computed from DB
- `GET /api/platform/dashboard-stats/` — admin-only, returns detailed counts (orgs, users, demo requests, active plans)
- `PATCH /api/platform/stats/` — admin-only, allows manual override of public-facing stats

---

## 2. Attendance Record Delivery Settings (WhatsApp/Email)

**Problem:** No way for org admins to configure how members receive monthly attendance records.

### Files to change:

- **`OrganizationSettings.tsx`** — Add a new tab "Attendance Delivery" with:
  - Toggle: "Send monthly attendance records to members"
  - Radio/select: Delivery channel — "Email only" (free), "WhatsApp only", "Both Email & WhatsApp"
  - Info card showing cost calculation: "WhatsApp messaging: ₦20/member/month. Your org has {member_count} members = ₦{total}/month"
  - Note: "WhatsApp delivery is available on Pro and Business plans"

- **`NotificationSettings.tsx`** (profile-level) — Add a personal preference for members: "Receive attendance records via" with Email/WhatsApp toggle (respects org-level setting as the master switch)

- **`DashboardSidebar.tsx`** — No change needed, settings already accessible

### New component:
- **`src/components/dashboard/AttendanceDeliverySettings.tsx`** — Reusable card with the delivery channel config, cost preview, and plan-gating logic

### Backend prompt needed:
- Add `attendance_delivery_channel` and `attendance_delivery_enabled` fields to Organization settings
- Add `preferred_delivery_channel` to member profile
- Endpoint to trigger monthly attendance report generation and delivery via Resend (email) or WhatsApp Business API

---

## 3. Update Pricing to Include WhatsApp Add-on

### Files to change:

- **`PricingSection.tsx`** — Update plans:
  - **Starter ($35/quarter):** Add "Email attendance reports (included)". Remove WhatsApp option.
  - **Pro ($65/quarter):** Add "Monthly attendance reports (Email included, WhatsApp add-on: ₦20/member/month)"
  - **Business ($100/quarter):** Add "Monthly attendance reports (Email + WhatsApp included for up to 500 members, ₦20/member beyond)"

- **`SubscriptionSettings.tsx`** — Mirror the updated pricing. Add a "WhatsApp Add-on" section below the plan cards showing:
  - Current member count
  - Estimated WhatsApp cost: `{members} × ₦20 = ₦{total}/month`
  - Toggle to enable/disable WhatsApp delivery (links to org settings)

---

## 4. Backend Prompt (provided after frontend implementation)

1. `GET /api/platform/stats/` — public stats endpoint
2. `GET /api/platform/dashboard-stats/` — admin stats with real DB counts
3. `PATCH /api/platform/stats/` — manual stat overrides
4. Organization settings fields for attendance delivery config
5. WhatsApp Business API integration for attendance record delivery
6. Monthly attendance report generation job (cron/Celery)

---

## Technical Summary

| Change | Files | Type |
|---|---|---|
| Dynamic hero stats | `HeroSection.tsx`, `platformApi.ts` | Fetch + render |
| Dynamic CTA text | `CTASection.tsx` | Fetch + render |
| Blur testimonials | `TestimonialSection.tsx` | Overlay |
| Admin dashboard stats | `PlatformAdminDashboard.tsx` | Fetch + management UI |
| Attendance delivery settings | `OrganizationSettings.tsx`, new component | New tab + config |
| Member delivery preference | `NotificationSettings.tsx` | Add toggle |
| Pricing WhatsApp add-on | `PricingSection.tsx`, `SubscriptionSettings.tsx` | Content update |

