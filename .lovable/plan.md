

# Frontend Fixes — Landing Page, Nav, Content Pages & Platform Admin

## Changes Summary

10 distinct issues to address across ~15 files. All frontend-only except the Demo form which needs a backend prompt.

---

## 1. Blur "Experience the Magic" Demo Section
**Files:** `DemoSection.tsx`, `InteractiveFaceDemo.tsx`

Wrap the interactive demo area in a blurred overlay with a "Coming Soon" badge. The upload/camera buttons become non-interactive. Keep the section visible but with `blur-sm` + `pointer-events-none` on the interactive content, and overlay a centered "Coming Soon — Backend integration in progress" pill.

## 2. Fix Privacy Section ("Your face. Your data. Your control.")
**File:** `PrivacyTrustSection.tsx`

- Rename "What we NEVER store" to "What we NEVER do"
- Change items to:
  - "Sell your data to third parties"
  - "Share face images outside your organization"
  - "Access data without organizational authorization"
- Remove "Raw photos of your face" (since face images ARE stored per org)
- Update "What we capture" to include "Face images (stored securely per organization)"
- Remove footer line "Your actual photos never leave your device" (inaccurate)

## 3. Fix Pricing Section with Realistic Features
**File:** `PricingSection.tsx`

Replace feature lists with actual implemented backend features:

**Starter ($35/quarter):**
- Up to 50 members
- 1 admin user
- Face recognition attendance
- Basic attendance logs & reports
- 1 department
- Email support

**Pro ($65/quarter):**
- Everything in Starter
- Up to 200 members
- 5 admin/manager accounts
- Department management (unlimited)
- Attendance analytics & charts
- CSV/PDF export
- Priority support

**Business ($100/quarter):**
- Everything in Pro
- Unlimited members & admins
- Visitor tracking & review
- Custom branding & theming
- Activity logs
- API access
- Dedicated account manager

Remove "Multi-camera support", "Emotion & demographic insights", "On-premise deployment" — these don't exist. Add a note: "Payment integration coming soon" on the CTA buttons until Paystack is wired up.

## 4. Fix Demo Request Modal
**File:** `DemoRequestModal.tsx`

- Add `email` field (required) alongside name and WhatsApp
- Make `name` required (remove "optional" label)
- Add `organization` field (optional)
- Add form validation — disable submit until required fields are filled
- Show the email field prominently since backend will send a confirmation email
- The submit currently uses a fake `setTimeout` — keep it but add a note in the success message about the confirmation email

**Backend prompt needed:** `POST /api/demo-request/` endpoint that saves the request and sends a Resend confirmation email with a demo video link.

## 5. Blur /press, /blog, /team, /careers Pages
**Files:** `PressMedia.tsx`, `Blog.tsx`, `OurTeam.tsx`, `Careers.tsx`

Add a blur overlay to the content sections (not the hero headers) with a "Content coming soon" badge. Keep the page structure visible but make individual items blurred and non-interactive. The hero section text stays readable.

## 6. Scroll to Top on Page Navigation
**File:** `PageWrapper.tsx`

Add a `useEffect` with `useLocation` that scrolls `window.scrollTo(0, 0)` on every route change. This ensures all page navigations start at the top. This is separate from the `ScrollToTop` button component.

## 7. Fix Nav Links to Work from Any Page
**File:** `Navbar.tsx`

Change navLinks from `{ href: '#features' }` to use navigation logic:
- If currently on `/`, smooth-scroll to the anchor
- If on any other page, navigate to `/#features`, `/#solutions`, etc.

Use `useLocation` to detect current path. For non-home pages, use `navigate('/')` then scroll after a brief delay, or simply use `<a href="/#features">` which the browser handles natively.

Also fix: `#features` section is not rendered on the home page — `FeaturesSection` is not imported in `Index.tsx`. Either add it back or remove "Features" from nav links.

## 8. Add FeaturesSection to Home Page
**File:** `Index.tsx`

Import and render `FeaturesSection` between `HeroSection` and `HowItWorksSection` so the `#features` nav link has a target.

## 9. Platform Super Admin System (Mispar Admin, not Org Admin)
**Files:** New pages and routes

Create a separate admin system for Mispar Technologies internal staff:

- `/admin-register` — Registration page for platform admins (invite-only with a secret code or restricted to specific email domains like `@mispartechnologies.com`)
- `/admin-login` — Separate login page
- `/admin-dashboard` — Platform admin dashboard with:
  - Organization management (view all orgs, status, member counts)
  - Content management (blog posts, press items, careers — future CMS)
  - Demo request management (view submitted demo requests)
  - Platform analytics (total orgs, total users, attendance stats)

This is a significant feature. For now, create the route structure, registration page, and a placeholder dashboard. The content management system will come later.

**Backend prompt needed:** Platform admin model, registration endpoint restricted to `@mispartechnologies.com` emails, and platform admin JWT scope.

## 10. Pricing in Organization Dashboard
**File:** New `src/pages/dashboard/SubscriptionSettings.tsx`

Add a "Subscription" page in the org dashboard (under Configuration group in sidebar) showing the current plan and upgrade/downgrade options. For now, show the plans with "Contact Sales" or "Coming Soon" buttons until Paystack is integrated.

---

## Technical Details

| # | File(s) | Type |
|---|---|---|
| 1 | `DemoSection.tsx` | Blur overlay + "Coming Soon" |
| 2 | `PrivacyTrustSection.tsx` | Content update |
| 3 | `PricingSection.tsx` | Feature list rewrite |
| 4 | `DemoRequestModal.tsx` | Add email field, validation |
| 5 | `PressMedia.tsx`, `Blog.tsx`, `OurTeam.tsx`, `Careers.tsx` | Blur overlay |
| 6 | `PageWrapper.tsx` | Scroll-to-top on route change |
| 7 | `Navbar.tsx` | Fix hash nav links for cross-page |
| 8 | `Index.tsx` | Add FeaturesSection |
| 9 | New: `AdminRegister.tsx`, `AdminDashboard.tsx`, routes in `App.tsx` | Platform admin |
| 10 | New: `SubscriptionSettings.tsx`, sidebar update | Pricing in dashboard |

## Backend Prompt (provided after implementation)

1. `POST /api/demo-request/` — save demo requests + send Resend confirmation email
2. Platform admin model + registration/login endpoints
3. Paystack integration guidance for subscription billing

