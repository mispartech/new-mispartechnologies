

# User Onboarding Strategy by Organization Type

## Current State

The app supports 7 organization types: **Church/Religious**, **Corporate**, **School/Educational**, **Healthcare**, **Government**, **Non-Profit**, and **Other**.

Currently there is only ONE onboarding path:
1. Admin signs up at `/auth` → completes `/onboarding` (creates org) → becomes `super_admin`
2. Admin invites users via `AddMemberModal` (email invitation) → invitee clicks link → `/register?token=...` → sets password + face enrollment

There is NO self-registration path for non-admin users.

## Recommended Strategy Per Organization Type

### Tier 1: Invitation-Only (Corporate, Healthcare, Government)
**Why**: These orgs have strict access control — only authorized personnel should join.

- **Keep current flow**: Admin invites employees/staff via email
- **Add bulk CSV import** (already exists via `ImportMembersModal`)
- **No changes needed** — the invitation model is correct for these

### Tier 2: Hybrid — Invitation + Self-Registration (Church, Non-Profit, Other)
**Why**: Churches/NGOs have large, fluid memberships. Pastors can't individually invite 500+ members. Members need a way to self-register and attach to their organization.

- **Add a public registration page per organization** — e.g. `/join/<org-slug>`
- Members visit the link (shared via QR code, WhatsApp, bulletin board)
- They fill in: name, email, phone, gender, department (optional)
- Account is created with `pending` role → admin approves or auto-approves
- After approval, member sets password and enrolls face

### Tier 3: Managed Registration (School/Educational)
**Why**: Students are enrolled by admins, but parents/guardians may need portal access.

- **Keep invitation flow** for students (admin enrolls them)
- Future: parent/guardian self-registration linked to student records

## Implementation Plan

### Phase 1: Organization Join Page (`/join/:slug`)

| File | Change |
|---|---|
| `src/pages/JoinOrganization.tsx` | **New** — public registration form with org branding |
| `src/lib/api/apiRoutes.ts` | Add `ORG_PUBLIC_INFO: (slug) => /api/organizations/${slug}/public/` and `SELF_REGISTER: /api/self-register/` |
| `src/lib/api/client.ts` | Add `getOrgPublicInfo(slug)` and `selfRegister(data)` |
| `src/App.tsx` | Add route `/join/:slug` |

**JoinOrganization page design:**
- Fetches org public info (name, logo, type) from `GET /api/organizations/:slug/public/` (no auth required)
- Shows branded registration form with org name/logo at top
- Fields: First Name, Last Name, Email, Phone, Gender, Department (fetched from org)
- On submit → `POST /api/self-register/` with `{ org_slug, email, first_name, ... }`
- User receives email to verify + set password
- Account created with `pending` or `member` role depending on org settings

### Phase 2: Organization Settings — Registration Control

| File | Change |
|---|---|
| `src/pages/dashboard/OrganizationSettings.tsx` | Add "Registration" tab |

**New settings for admins:**
- Toggle: "Allow self-registration" (on/off)
- Toggle: "Require admin approval for new registrations"
- Shareable join link: `https://mispartechnologies.com/join/<org-slug>`
- QR code generator for the join link
- Default department for self-registered users

### Phase 3: Pending Approvals (if approval required)

| File | Change |
|---|---|
| `src/pages/dashboard/MembersList.tsx` | Add "Pending" tab showing self-registered users awaiting approval |

**Admin actions on pending users:** Approve (sets role to `member`), Reject (deletes), Edit department before approving.

## Backend Requirements (Prompt for You)

1. **Add `slug` field to Organization model** — auto-generated from org name, unique, URL-safe
2. **`GET /api/organizations/:slug/public/`** — unauthenticated endpoint returning `{ name, slug, type, logo_url, departments: [{id, name}] }` (minimal public info only)
3. **`POST /api/self-register/`** — unauthenticated; accepts `{ org_slug, email, first_name, last_name, phone, gender, department_id }`. Creates user with `pending` or `member` role based on org settings. Sends verification email.
4. **Add org settings fields**: `allow_self_registration` (boolean, default false), `require_approval` (boolean, default true)
5. **`GET /api/members/?status=pending`** — already planned, needed for approval queue

## Summary Table

| Org Type | Primary Method | Self-Registration | Approval Required |
|---|---|---|---|
| Corporate | Invitation | Off by default | N/A |
| Healthcare | Invitation | Off by default | N/A |
| Government | Invitation | Off by default | N/A |
| Church | Invitation + Join Link | On by default | Optional (default: off) |
| Non-Profit | Invitation + Join Link | On by default | Optional (default: off) |
| School | Invitation | Off by default | N/A |
| Other | Invitation | Off by default | N/A |

