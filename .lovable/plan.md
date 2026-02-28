

# Fix Onboarding Data Persistence -- Root Cause Analysis and Plan

## Root Cause: Why Your Onboarding Data Keeps Getting Lost

After a thorough audit, there are **two critical bugs** causing this:

### Bug 1: Data Format Mismatch Between Save and Restore

The auto-save (runs every time you change a field) sends **camelCase frontend data** to the backend:
```text
{ organizationType: "church", organizationName: "My Church", adminRole: "Pastor" }
```

But the **final submit** sends **snake_case transformed data** to the **same endpoint**:
```text
{ organization_type: "church", organization_name: "My Church", is_completed: true }
```

When the final submit **fails** (due to an error), the backend has already received the snake_case data from that attempt. On the next page load, the restore logic tries to map `persisted.data` back into the frontend form, but the field names don't match -- so **everything appears blank**.

### Bug 2: No Draft vs Final Distinction

Both the auto-save and the final submit use `PUT /api/onboarding/` with no way for the backend to tell them apart. If the backend treats any `PUT` as a finalization attempt, it may clear or transform the stored data, corrupting the draft.

---

## The Fix: Hybrid Persistence with Cookie Marker

### Architecture

```text
User fills form
    |
    v
[1] Save to localStorage immediately (every field change)
[2] Set a cookie marker: "onboarding_in_progress=userId" (survives browser cleanup)
[3] Debounced save to backend (500ms) -- DRAFT format only (camelCase, no is_completed)
    |
    v
User clicks "Complete Setup"
    |
    v
[4] Final submit: snake_case transformed data with is_completed: true
[5] On success: clear localStorage + clear cookie + refreshUser()
[6] On failure: data is SAFE in localStorage -- user can resume
```

### Changes Required

#### 1. `src/lib/onboardingSession.ts` -- Add Cookie Helpers

- Add `setOnboardingCookie(userId)` -- sets a simple cookie `mispar_onboarding_active={userId}` with 30-day expiry
- Add `getOnboardingCookie()` -- reads the cookie to detect if onboarding was in progress
- Add `clearOnboardingCookie()` -- removes the cookie after successful completion
- These are lightweight markers only -- all real data stays in localStorage

#### 2. `src/pages/Onboarding.tsx` -- Fix Data Flow

**Restore logic (on page load):**
- Try backend first (existing behavior)
- If backend data has snake_case keys, **transform them back** to camelCase before applying
- Fall back to localStorage (existing behavior)
- Fall back to cookie marker -- if cookie exists but no data found, show a "your previous session may have expired" message rather than a blank form

**Auto-save logic (on field change):**
- Continue saving to localStorage immediately (existing)
- Set cookie marker on first save (new)
- Debounced backend save: send data **as-is in camelCase** with a `is_draft: true` flag so the backend knows NOT to process it as a finalization

**Final submit logic:**
- Transform to snake_case with `is_completed: true` (keep existing)
- On **success only**: clear localStorage, clear cookie, call `refreshUser()`
- On **failure**: do NOT clear anything -- data is safe in localStorage for next attempt

#### 3. `src/lib/api/client.ts` -- No Changes Needed

The `saveOnboardingSession` method already accepts any `Record<string, unknown>` payload. The differentiation happens in the data itself (`is_draft` vs `is_completed`).

#### 4. `src/contexts/DjangoAuthContext.tsx` -- No Changes Needed

The `refreshUser()` call after successful onboarding already syncs `is_onboarded` correctly.

---

## Technical Details

### Cookie Format
```text
Name:  mispar_onboarding_active
Value: {userId}
Path:  /
MaxAge: 30 days
SameSite: Lax
```

This cookie contains NO sensitive data -- just the user ID as a marker that onboarding was in progress. Its only purpose is to detect "this user was doing onboarding" even if localStorage gets cleared.

### Snake-to-Camel Transform Map

When restoring from backend, if the data contains snake_case keys, map them:
```text
organization_type    -> organizationType
organization_name    -> organizationName
admin_first_name     -> adminFirstName
admin_last_name      -> adminLastName
service_schedules    -> serviceSchedules
```

This prevents the blank-form bug when a failed final submit overwrote the draft.

### Auto-Save Payload (Draft)
```json
{
  "step": 3,
  "data": {
    "organizationType": "church",
    "organizationName": "Grace Church",
    "is_draft": true
  }
}
```

### Final Submit Payload
```json
{
  "step": 5,
  "data": {
    "organization_name": "Grace Church",
    "organization_type": "church",
    "is_completed": true
  }
}
```

---

## Files to Modify

| File | Change |
|---|---|
| `src/lib/onboardingSession.ts` | Add cookie helpers, add snake-to-camel transformer |
| `src/pages/Onboarding.tsx` | Fix restore logic to handle both formats, add cookie marker on save, add `is_draft` flag to auto-save, protect data on submit failure |

## What This Solves

- Data survives failed final submissions (localStorage is never cleared on error)
- Data survives page refreshes mid-onboarding (localStorage + cookie marker)
- Data survives browser storage cleanup (cookie marker detects lost session)
- Backend draft data can be correctly restored even if format differs
- No more filling out the same form 10 times

