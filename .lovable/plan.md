

## Problem

The app inconsistently uses "Member", "Employee", "Visitor", "Student", "Staff" across different pages, sidebar labels, breadcrumbs, modals, toasts, and face overlays. The `TerminologyContext` exists and works correctly, but many components still have hardcoded strings instead of using `getTerm()`.

The user's rule: **"Visitor" should always mean unknown/temporary faces.** The dynamic term (employee, member, student, staff) should apply to registered/known people — driven by the organization type selected during onboarding.

## Organization Types (from Onboarding)

| Type | Registered Person Term | Plural |
|---|---|---|
| church / religious / nonprofit | Member | Members |
| corporate / business / government | Employee | Employees |
| school / university / education | Student | Students |
| hospital / healthcare / clinic | Staff | Staff |
| other | Member | Members |

**"Visitor"** stays constant across all org types — it always refers to unrecognized/temporary faces.

## Files Requiring Changes

### 1. `src/components/dashboard/DashboardHeader.tsx`
- The `ROUTE_LABELS` map has hardcoded `'Members'`, `'Temporary Members'`. Make these dynamic by consuming `useTerminology` and computing labels from `getTerm()` at render time instead of a static object.
- Breadcrumb for `/dashboard/members` → `getTerm('plural', true)`
- Breadcrumb for `/dashboard/temp-members` → `"Temp Visitors"` (visitors are always "Visitor")

### 2. `src/components/dashboard/FaceOverlay.tsx`
- Line 131: fallback `'Member'` → use a prop or pass terminology down. Since FaceOverlay is a canvas-adjacent component without context access, add a `personLabel` prop defaulting to `'Member'` and have `AttendanceCapture` pass `getTerm('title')`.

### 3. `src/pages/dashboard/AttendanceCapture.tsx`
- Lines 120, 164: hardcoded `'Member'` in Badge → replace with `getTerm('title')`
- "Visitor" stays as-is (correct per user's rule)
- Pass `personLabel={getTerm('title')}` to `FaceOverlay`
- Add `useTerminology` import

### 4. `src/components/dashboard/AddMemberModal.tsx`
- Dialog title: `"Add New Member"` → `"Add New {getTerm('title')}"`
- Toast: `"Member Invited"` → `"{getTerm('title')} Invited"`
- Alert description: `"The member will receive..."` → `"The {getTerm('singular')} will receive..."`
- Add `useTerminology` import

### 5. `src/components/dashboard/EditMemberModal.tsx`
- Dialog title likely says "Edit Member" → make dynamic
- Add `useTerminology` import

### 6. `src/components/dashboard/ImportMembersModal.tsx`
- Title and labels → make dynamic
- Add `useTerminology` import

### 7. `src/pages/dashboard/MembersList.tsx`
- Line 62: toast `'Failed to fetch members'` → dynamic
- Line 69: confirm `'delete this member'` → dynamic
- Line 74: toast `'Member deleted successfully'` → dynamic
- These are minor string replacements using existing `personSingular`/`personPlural`

### 8. `src/pages/dashboard/TempMembersList.tsx`
- Page title: `"Temporary {getTerm('plural', true)}"` → Change to **"Temporary Visitors"** since temp = visitors, always
- Subtitle: already says "Unregistered visitors" — correct
- Sidebar label `Temp {getTerm('plural')}` in DashboardSidebar → Change to **"Temp Visitors"** (constant)

### 9. `src/components/dashboard/DashboardSidebar.tsx`
- Line 76: `Temp ${getTerm('plural', true)}` → `"Temp Visitors"` (visitors = constant term)
- Line 75: `getTerm('plural', true)` for `/dashboard/members` → already correct

### 10. `src/pages/dashboard/FaceGallery.tsx`
- Line 105: `"No members found"` → `"No {personPlural} found"` using `useTerminology`

### 11. `src/pages/dashboard/MemberDashboard.tsx`
- Line 139: fallback `'Member'` → `getTerm('title')` (already has access via context)

### 12. `src/components/dashboard/FaceOverlay.tsx`
- Line 131: `face.name || 'Member'` → `face.name || personLabel` (new prop)
- Line 134: `'Visitor'` stays as-is

## Summary of Terminology Rules

```text
┌─────────────────────┬──────────────────────────┐
│ Context             │ Label                    │
├─────────────────────┼──────────────────────────┤
│ Known/registered    │ Dynamic: getTerm()       │
│ Unknown/temporary   │ Always: "Visitor"        │
│ Sidebar nav items   │ Dynamic for registered,  │
│                     │ "Temp Visitors" for temp  │
│ Breadcrumbs         │ Same as sidebar          │
│ Face overlay labels │ Dynamic for known,       │
│                     │ "Visitor" for unknown    │
│ Toasts & modals     │ Dynamic for registered   │
└─────────────────────┴──────────────────────────┘
```

## Implementation Order

1. Update `DashboardSidebar` — fix "Temp Visitors" label
2. Update `DashboardHeader` — make breadcrumb labels dynamic
3. Update `AttendanceCapture` — replace hardcoded "Member" badges with `getTerm('title')`
4. Update `FaceOverlay` — add `personLabel` prop
5. Update `AddMemberModal`, `EditMemberModal`, `ImportMembersModal` — dynamic dialog titles/toasts
6. Update `MembersList` — dynamic toast/confirm messages
7. Update `TempMembersList` — "Temporary Visitors" title
8. Update `FaceGallery` — dynamic empty state
9. Update `MemberDashboard` — dynamic fallback name

