
Objective:
Make onboarding drafts truly durable for logged-in admin users so progress is never lost on refresh/errors, and ensure completed users are not re-routed incorrectly.

What I verified in the codebase (root causes):
1) Final submit currently clears local draft even when backend save may have failed
- File: src/pages/Onboarding.tsx
- `handleSubmit` calls `djangoApi.saveOnboardingSession(...)` directly (line ~448) and does not check `resp.error` / `resp.status`.
- `djangoApi.saveOnboardingSession` returns `{status,error}` and does not throw on 4xx/5xx.
- Result: frontend can proceed to clear localStorage/cookie and navigate as if success, even if backend rejected or failed.

2) Draft save path can silently ignore backend 404
- File: src/lib/onboardingSession.ts
- `saveOnboardingSession` currently does:
  - `if (resp.status === 404) return;`
- Result: UI logs “Saving draft…” but backend persistence may not exist and no hard failure is surfaced.

3) Cookie fallback was added but not actually used in restore logic
- File: src/pages/Onboarding.tsx
- `getOnboardingCookie` is imported but never used.
- Result: if localStorage is missing/corrupted and backend draft is unavailable, recovery path is incomplete.

4) Role mismatch can route newly onboarded admins into member dashboard, causing member-stats 404
- Files: src/pages/Onboarding.tsx, src/pages/dashboard/DashboardRouter.tsx
- Onboarding sends `admin_role` as human labels like “Parish Pastor”.
- Dashboard router admin check expects snake_case values like `parish_pastor`.
- Result: admin can be treated as member, calling `/api/dashboard/member-stats/` and triggering the 404 you are seeing.

5) I could not directly inspect your Django DB schema from this frontend project
- `security--get_table_schema` failed because this project has no accessible Supabase schema context for that backend DB.
- So “no onboarding draft table” cannot be confirmed from this repo alone, but frontend symptoms are fully consistent with missing or non-persisting backend draft storage.

Why your data disappears after an error (exact failure chain):
1. You fill onboarding (localStorage has data).
2. You click Complete Setup.
3. Final API returns non-success or partial backend failure (not properly validated in frontend).
4. Frontend still executes success path and clears localStorage + cookie.
5. Refresh occurs -> nothing to restore locally; backend may also have no draft -> form appears reset.

Implementation plan (frontend + backend, in order):

Phase 1 — Frontend hardening (must do first)
A) Make onboarding API handling strict and explicit
- File: src/lib/onboardingSession.ts
- Change `saveOnboardingSession` to:
  - throw on any non-2xx (including 404),
  - return response payload/status so callers can verify.
- Keep `loadOnboardingSession` 404-as-null for initial load only.

B) Use the strict helper everywhere (no direct djangoApi call in submit)
- File: src/pages/Onboarding.tsx
- Replace direct `djangoApi.saveOnboardingSession(...)` in `handleSubmit` with strict helper.
- On final submit:
  1) cancel pending debounced draft timer,
  2) send final payload,
  3) refresh profile,
  4) only clear localStorage/cookie if refreshed profile confirms `is_onboarded === true`.
- If any step fails, do not clear anything.

C) Prevent draft-vs-final race conditions
- File: src/pages/Onboarding.tsx
- Add guards:
  - `isSubmittingRef` to block autosave while final submit is in progress,
  - clear timeout before final submit,
  - prevent trailing draft overwrite after final completion.

D) Actually use cookie marker in restore path
- File: src/pages/Onboarding.tsx
- During hydration:
  1) backend draft,
  2) localStorage by user key,
  3) cookie check (user match) to trigger recovery UX and keep user in onboarding with warning, not silent blank reset.
- Keep normalizeToCamelCase for mixed backend payloads.

E) Add deterministic admin-role normalization before routing
- Files: src/pages/Onboarding.tsx, src/pages/dashboard/DashboardRouter.tsx
- On submit: send canonical role values (e.g. `parish_pastor`) instead of display labels.
- In DashboardRouter: normalize incoming role (`trim + lowercase + spaces->underscores`) before `ADMIN_ROLES.includes(...)`.
- This removes false member routing and the `/api/dashboard/member-stats/` noise for admins.

Phase 2 — Backend/Django contract + database persistence (required for true cross-session durability)
A) Ensure `/api/onboarding/` draft persistence exists in DB
- Create/verify a persistent draft store keyed by authenticated user (e.g. `onboarding_sessions` table/model):
  - user_id (unique)
  - step (int)
  - data (jsonb/json)
  - is_draft (bool)
  - is_completed (bool)
  - updated_at

B) Distinguish draft vs final on the backend
- Draft request (`is_draft: true`):
  - upsert draft only,
  - never mark onboarding complete.
- Final request (`is_completed: true`):
  - run full completion transaction (org/profile/schedules/etc),
  - set profile `is_onboarded=true`,
  - mark draft completed,
  - commit atomically.

C) Return explicit success contract
- Response should include verifiable state, e.g.:
  - `{ saved: true, mode: "draft" }` for draft
  - `{ saved: true, mode: "final", is_onboarded: true }` for final
- Frontend should only clear local draft when this contract is satisfied.

Phase 3 — Validation and rollout checklist
1) Network verification:
- Draft typing triggers `PUT /api/onboarding/` with `is_draft: true`.
- Final submit triggers `PUT /api/onboarding/` with `is_completed: true`.
- No silent 404 acceptance.

2) Failure simulation:
- Force backend error on final submit -> confirm local draft remains after refresh.
- Force backend unavailable during draft save -> confirm local data still intact and user informed.

3) Role/routing verification:
- Newly onboarded admin lands on admin dashboard (not member dashboard).
- No call to `/api/dashboard/member-stats/` for admin role.

4) DB verification on backend:
- Confirm row exists/updates for draft during in-progress onboarding.
- Confirm row finalized and profile `is_onboarded=true` after successful completion.

Technical section (target file changes):
- `src/lib/onboardingSession.ts`
  - strict error semantics for save
  - preserve normalize utility
- `src/pages/Onboarding.tsx`
  - strict submit flow with profile confirmation before clearing
  - cancel/deconflict autosave timer on submit
  - cookie-aware restore branch
  - role value normalization in final payload
- `src/pages/dashboard/DashboardRouter.tsx`
  - normalize role before admin check
- (Backend) Django onboarding endpoint/model
  - persistent draft storage + explicit draft/final modes + atomic finalization

Expected outcome after this plan:
- Draft data survives refresh, API errors, and failed final submit.
- Completed onboarding only clears local cache after backend truth confirms completion.
- Admin users stop being misclassified as members, eliminating the member-stats 404 side effect.
- You get the behavior you asked for: logged-in admin always sees prefilled in-progress onboarding until they truly complete it.
