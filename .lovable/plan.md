

## Problem Analysis

There are **three interconnected issues** causing the broken logout and missing login button:

### Issue 1: Logout page never actually signs out

The console on `/logout` shows:
```
[DjangoAuth] Auth state change: SIGNED_IN
[DjangoAuth] Fetching profile from Django...
```

This means when the `/logout` page loads, the `DjangoAuthProvider` initializes first, finds the existing Supabase session, and fires a `SIGNED_IN` event which triggers a profile fetch to Django (which returns 500). Meanwhile, the `Logout` component's `useEffect` calls `logout()` which calls `supabase.auth.signOut()`. 

The likely problem: `supabase.auth.signOut()` may be failing silently (network issue or error), and even if it does fail, the Supabase tokens remain in `localStorage`. The `finally` block then redirects to `/` where the stale session is picked up again -- creating a loop.

### Issue 2: Login button not showing on the navbar

The Navbar conditionally renders based on `isLoading`:
- If `isLoading` is `true` -> shows a skeleton placeholder
- If `isAuthenticated` is `true` -> shows user dropdown
- If neither -> shows Login button

Since the Django profile fetch returns 500, `user` is `null` and `isAuthenticated` is `false`. However, the `onAuthStateChange` SIGNED_IN handler calls `fetchProfile()` which takes up to 15 seconds (timeout) before failing. During that time, `isLoading` may already be `false` from `initialize()`, but there's a **race condition**: `initialize()` and `onAuthStateChange` both call `fetchProfile()` simultaneously, causing duplicate requests and potential state confusion.

The real issue: the Supabase session exists (stale tokens in localStorage) so it keeps reporting `SIGNED_IN`, but the Django backend returns 500. The app is stuck in a state where `isAuthenticated` is `false` but Supabase thinks the user is signed in.

### Issue 3: No Django logout endpoint needed

**No, you do not need a Django API logout endpoint.** Supabase manages the session entirely client-side (JWT in localStorage). Calling `supabase.auth.signOut()` clears the local session. Django is stateless -- it just validates the JWT on each request.

---

## Fix Plan

### 1. Harden the `logout()` function in `DjangoAuthContext.tsx`

- Use `supabase.auth.signOut({ scope: 'local' })` to ensure local tokens are cleared even if the server-side revocation fails
- Wrap in try/catch so it never throws
- As a safety net, manually remove Supabase keys from localStorage if signOut fails

### 2. Fix the `Logout.tsx` component

- Skip the auth provider initialization entirely by calling `supabase.auth.signOut({ scope: 'local' })` directly (before the provider can trigger SIGNED_IN)
- Clear user state and redirect immediately
- Don't rely on the auth context `logout()` which races with initialization

### 3. Prevent duplicate profile fetches in `DjangoAuthContext.tsx`

- Add a flag so that when `initialize()` already fetched (or attempted to fetch) the profile, the `onAuthStateChange` SIGNED_IN handler for `INITIAL_SESSION` doesn't trigger a second fetch
- Handle `INITIAL_SESSION` event properly (it fires alongside `initialize()`)

### 4. Unify the `DashboardHeader.tsx` logout

- Replace direct `supabase.auth.signOut()` call with `useDjangoAuth().logout()` for consistency

---

## Technical Details

### File: `src/contexts/DjangoAuthContext.tsx`

Changes to the `logout` function:
```typescript
const logout = useCallback(async () => {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (err) {
    console.error('[DjangoAuth] signOut error, clearing manually:', err);
    // Fallback: manually clear Supabase tokens from localStorage
    const keys = Object.keys(localStorage).filter(k =>
      k.startsWith('sb-')
    );
    keys.forEach(k => localStorage.removeItem(k));
  }
  setUser(null);
}, []);
```

Changes to `onAuthStateChange` to prevent double-fetch race:
- Track whether `initialize()` has already completed
- Skip profile fetch on `INITIAL_SESSION` since `initialize()` handles it
- Only fetch profile on explicit `SIGNED_IN` (actual new login)

### File: `src/pages/Logout.tsx`

Rewrite to bypass the auth context race condition:
```typescript
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Logout = () => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const doLogout = async () => {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (err) {
        console.error('[Logout] signOut failed, clearing manually:', err);
        Object.keys(localStorage)
          .filter(k => k.startsWith('sb-'))
          .forEach(k => localStorage.removeItem(k));
      } finally {
        window.location.href = '/';
      }
    };

    doLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Signing out...</p>
    </div>
  );
};
```

### File: `src/components/dashboard/DashboardHeader.tsx`

Replace the direct Supabase call with the unified auth context:
```typescript
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';
// ...
const { logout } = useDjangoAuth();

const handleLogout = async () => {
  setIsLoggingOut(true);
  try {
    await logout();
    window.location.href = '/';
  } catch {
    // fallback
    window.location.href = '/';
  }
};
```

### Summary of changes

| File | What Changes |
|---|---|
| `DjangoAuthContext.tsx` | Harden `logout()` with `scope: 'local'` and localStorage fallback; fix `onAuthStateChange` to skip duplicate fetches on `INITIAL_SESSION` |
| `Logout.tsx` | Call `supabase.auth.signOut` directly to avoid race with provider initialization; always redirect via `window.location.href` |
| `DashboardHeader.tsx` | Use `useDjangoAuth().logout()` instead of direct `supabase.auth.signOut()` |

