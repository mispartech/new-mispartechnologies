

## Problem Analysis

The auto-login after logout is caused by a **race condition** between Supabase's `signOut` and the auth state listener in `DjangoAuthContext`. Here's what happens:

1. User navigates to `/logout`
2. `signOut({ scope: 'local' })` is called
3. `window.location.href = '/'` fires in the `finally` block (hard reload)
4. On reload, `DjangoAuthProvider` mounts fresh
5. **Occasionally**, an in-flight token refresh completes and writes fresh tokens back to localStorage *after* `signOut` clears them but *before* the page fully unloads
6. On the new page load, `onAuthStateChange` fires `SIGNED_IN` with a valid session, re-authenticating the user

The logs confirm this: `SIGNED_IN` fires **before** `INITIAL_SESSION`, which is abnormal and indicates a restored session.

Secondary issues:
- `isLoading` only resolves on `SIGNED_IN`/`INITIAL_SESSION` — a `SIGNED_OUT` event alone leaves the app in loading state until the 5s fallback
- No belt-and-suspenders localStorage cleanup after `signOut` succeeds (only in `catch`)

## Plan

### 1. Harden the Logout page (`src/pages/Logout.tsx`)

- **Always** clear `sb-` localStorage keys after `signOut` resolves (not just in `catch`), as a defense against race conditions with token refresh
- Use `scope: 'global'` to also invalidate the server-side refresh token, preventing any concurrent tab from refreshing

```text
signOut({ scope: 'global' })
  ↓ success or fail
clear all sb-* localStorage keys
  ↓
window.location.href = '/'
```

### 2. Fix DjangoAuthContext listener (`src/contexts/DjangoAuthContext.tsx`)

- **Resolve `isLoading` on `SIGNED_OUT`** — currently the init only completes on `SIGNED_IN`/`INITIAL_SESSION`, so a logout→reload where there's no session hangs for 5 seconds
- **Guard against stale `SIGNED_IN` after `SIGNED_OUT`** — if a `SIGNED_OUT` event has already fired, ignore subsequent `SIGNED_IN` events (they come from stale token refresh callbacks)
- **Verify session validity** — when `INITIAL_SESSION` fires with a session, call `supabase.auth.getUser()` (which hits the server) to confirm the token is actually valid before fetching the Django profile. If `getUser()` fails, treat it as signed out.

### 3. Harden the context `logout()` method

- Also clear `sb-` keys after `signOut` as belt-and-suspenders (matching the Logout page pattern)

### Files to modify

| File | Change |
|---|---|
| `src/pages/Logout.tsx` | `scope: 'global'`, always clear localStorage |
| `src/contexts/DjangoAuthContext.tsx` | Resolve loading on SIGNED_OUT, add signed-out guard, verify session with getUser() |

