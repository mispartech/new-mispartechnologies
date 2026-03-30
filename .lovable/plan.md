

## Problem

The Admin Management page is read-only — admins can't invite new admin/manager users. The `rolesByType` in onboarding defines industry-specific job titles (Parish Pastor, CEO, etc.) but these are only used during onboarding, not in admin invitation. The existing `POST /api/members/` endpoint handles member creation, but there's no way to create users with elevated roles (admin/manager) from the dashboard. Additionally, the backend needs a new endpoint or parameter to support role assignment during invitation.

## Approach

### Phase 1: Frontend — Admin Invitation UI

**Replace the "coming soon" Admin Invitations card** with a functional invite form.

#### New component: `InviteAdminModal.tsx`
- Form fields: First Name, Last Name, Email, Phone (optional), Role (select), Job Title (select/text)
- **Role selector**: Only shows roles the current user can assign:
  - `super_admin` can assign: `admin`, `manager`
  - `admin` can assign: `manager`
  - `manager` cannot invite admins (hide the invite button)
- **Job Title selector**: Dynamic based on organization type from `TerminologyContext` — reuse the `rolesByType` mapping from Onboarding (extract to shared constant)
- On submit: calls `POST /api/members/` with `{ email, first_name, last_name, role, job_title, ... }`
- The backend sends an invitation email; the invitee clicks the link, sets their password, and lands on their dashboard

#### Changes to `AdminManagement.tsx`
- Add "Invite Admin" button in the header (visible to super_admin/admin only)
- Replace "coming soon" card with a pending invitations table (fetch members with `status=pending` and admin roles)
- Add role change dropdown per admin row (super_admin only) — calls `PATCH /api/members/{id}/` to update role
- Add "Revoke" action to demote an admin back to member

#### Shared role config: `src/lib/roleConfig.ts`
Extract the `rolesByType` job-title mapping from `Onboarding.tsx` into a shared module so both Onboarding and InviteAdminModal can import it. Also define:
```text
ADMIN_ROLES = ['super_admin', 'admin', 'manager']
ASSIGNABLE_ROLES: { super_admin → [admin, manager], admin → [manager] }
SYSTEM_ROLES = ['super_admin', 'admin', 'manager', 'member', 'pending']
```

### Phase 2: Backend Requirements (Prompt for You)

The frontend will call these endpoints. Here's what the backend needs:

1. **`POST /api/members/`** — already exists but needs to accept an optional `role` field (default: `member`). When `role` is `admin` or `manager`:
   - Validate that the requesting user has permission to assign that role (super_admin can assign admin/manager, admin can assign manager)
   - Create the user with the specified role
   - Send invitation email with a password-setup link

2. **`PATCH /api/members/{id}/`** — update a member's role/job_title (not yet implemented, currently a stub). Needed for:
   - Promoting a member to admin/manager
   - Demoting an admin back to member
   - Permission check: only super_admin can change roles of admin-level users

3. **`GET /api/members/?status=pending&role=admin,manager`** — the existing members endpoint should support filtering by `status` to show pending invitations

### Phase 3: API Client Updates

- Move `MEMBER` route from `FUTURE_ROUTES` to `API_ROUTES`
- Implement `updateMember(id, data)` and `deleteMember(id)` (currently stubs returning 404)
- Add `role` and `job_title` to the `inviteMember` payload type

### Files to Create/Modify

| File | Change |
|---|---|
| `src/lib/roleConfig.ts` | **New** — shared role/job-title mappings |
| `src/components/dashboard/InviteAdminModal.tsx` | **New** — admin invitation modal |
| `src/pages/dashboard/AdminManagement.tsx` | Add invite button, pending invites table, role actions |
| `src/pages/Onboarding.tsx` | Import `rolesByType` from shared module instead of inline |
| `src/lib/api/apiRoutes.ts` | Move `MEMBER(id)` to `API_ROUTES` |
| `src/lib/api/client.ts` | Implement `updateMember`, `deleteMember`; add `role`/`job_title` to invite payload |

### Backend Prompt

After approval, I'll provide you a detailed Django implementation prompt covering the `PATCH /api/members/{id}/` endpoint, role permission validation, and status filtering.

