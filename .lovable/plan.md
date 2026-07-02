
## Migration plan — Schools → dedicated Lovable project (remix strategy)

You picked **"Remix this project"** — this is the safest path because the stack, auth, Supabase client, shadcn setup, and every Schools file transfer verbatim with zero rewrites.

The `Project Blank Slate` (TanStack Start) will be **discarded** — it's incompatible with the current stack.

---

### Step-by-step you'll drive (Lovable dashboard actions)

These aren't things an agent can do — remixing and creating projects are dashboard-only actions.

1. **In this project's Settings → General → "Remix this project"** — creates a new project with an identical copy of the codebase. Name it **"Mispar Schools"**.
2. Delete the blank `Project Blank Slate` (you don't need it).
3. Open the new "Mispar Schools" project. In its first chat message paste:
   > "Follow `docs/MIGRATION-schools-only.md` step by step. This project should serve Schools only."
4. The agent inside the new project executes the prune script below (it has the file already because it was cloned from here).

---

### What I'll do inside THIS project before you remix

Create one file that the remixed project will read and execute:

**`docs/MIGRATION-schools-only.md`** — a self-contained checklist the new project's agent follows. It contains:

#### Section A — DELETE these paths
```
src/pages/Index.tsx
src/pages/AboutUs.tsx
src/pages/OurTeam.tsx
src/pages/Careers.tsx
src/pages/PressMedia.tsx
src/pages/Blog.tsx
src/pages/PrivacyPolicy.tsx
src/pages/TermsOfService.tsx
src/pages/CookiePolicy.tsx
src/pages/SmartAttendance.tsx
src/pages/SecuritySystems.tsx
src/pages/HealthcareIntegration.tsx
src/pages/EducationalSolutions.tsx
src/pages/CorporateAccess.tsx
src/pages/JoinOrganization.tsx
src/pages/Onboarding.tsx              ← generic; Schools uses SchoolsOnboarding
src/pages/dashboard/**                 ← entire generic dashboard
src/pages/platform/**                  ← platform admin (Schools has its own)
src/components/dashboard/**            ← generic dashboard components
src/components/Navbar.tsx
src/components/Footer.tsx
src/components/HeroSection.tsx
src/components/FeaturesSection.tsx
src/components/HowItWorksSection.tsx
src/components/SolutionsSection.tsx
src/components/PricingSection.tsx
src/components/RoadmapSection.tsx
src/components/CTASection.tsx
src/components/TestimonialSection.tsx
src/components/DemoSection.tsx
src/components/DemoForm.tsx
src/components/DemoRequestModal.tsx
src/components/LightweightDemoForm.tsx
src/components/InteractiveFaceDemo.tsx
src/components/FaceScanVisualization.tsx
src/components/PrivacyTrustSection.tsx
src/components/AttendanceSimulation.tsx
src/components/ComingSoonOverlay.tsx
src/lib/api/demoApi.ts
src/lib/api/platformApi.ts
src/lib/api/platformAdminAuth.ts
src/lib/api/paystack.ts
src/lib/api/apiRoutes.ts               ← main-app routes; Schools has its own
src/lib/api/client.ts                  ← same reason
src/lib/demoSession.ts
src/lib/onboardingSession.ts
src/lib/roleConfig.ts
src/contexts/TerminologyContext.tsx
src/contexts/ThemeContext.tsx          ← main-app theme; Schools has SchoolsThemeContext
src/hooks/useFaceRecognition.ts
src/hooks/useFaceEnrollmentGuard.ts
src/hooks/useAttendanceAudio.ts
src/hooks/useCameraDevices.ts
src/hooks/useKeyboardShortcuts.ts
src/hooks/useWakeLock.ts
docs/backend-paystack-and-plan-gating-prompt.md
docs/education-phase1-backend-prompt.md
docs/education-phase2-backend-prompt.md
docs/paystack-backend-spec.md
```

#### Section B — KEEP these paths (Schools + shared infra)
```
src/pages/schools/**
src/pages/Auth.tsx
src/pages/Register.tsx
src/pages/ResetPassword.tsx
src/pages/EmailVerified.tsx
src/pages/Logout.tsx
src/pages/NotFound.tsx
src/components/schools/**
src/components/PageWrapper.tsx        ← simplified (strip subdomain redirect)
src/components/ScrollToTop.tsx
src/components/ui/**                   ← shadcn primitives
src/contexts/SchoolsThemeContext.tsx
src/contexts/DjangoAuthContext.tsx
src/hooks/useSchoolsRealtime.ts
src/hooks/useSchoolsResource.ts
src/hooks/use-mobile.tsx
src/hooks/use-toast.ts
src/hooks/useCountUp.ts
src/hooks/useDocumentTitle.ts
src/lib/api/schools/**
src/lib/utils.ts
src/lib/isUuid.ts
src/lib/locationData.ts
src/integrations/supabase/client.ts
src/styles/schools-tokens.css
src/index.css
src/main.tsx
src/App.css
src/vite-env.d.ts
docs/schools/**
public/**
package.json, vite.config.ts, tailwind.config.ts, tsconfig*.json, components.json,
eslint.config.js, index.html, capacitor.config.ts, .env
```

#### Section C — REWRITE `src/App.tsx` (mount Schools at root)
Replace the current App with a Schools-only version:
```tsx
<Routes>
  <Route path="/" element={<SchoolsLanding />} />
  <Route path="/onboarding" element={<SchoolsOnboarding />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/register" element={<Register />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  <Route path="/email-verified" element={<EmailVerified />} />
  <Route path="/logout" element={<Logout />} />
  <Route path="/admin" element={<SchoolsPlatformAdmin />} />
  <Route path="/dashboard" element={<SchoolsLayout />}>
    <Route index element={<SchoolsDashboard />} />
    <Route path="identity" element={<SchoolsIdentity />} />
    <Route path="attendance" element={<SchoolsAttendance />} />
    <Route path="attendance/admin" element={<SchoolsAttendanceAdmin />} />
    <Route path="admin" element={<SchoolsAttendanceAdmin />} />
    <Route path="security" element={<SchoolsSecurity />} />
    <Route path="students" element={<SchoolsStudents />} />
    <Route path="students/:id" element={<SchoolsStudentProfile />} />
    <Route path="staff" element={<SchoolsStaff />} />
    <Route path="staff/:id" element={<SchoolsStaffProfile />} />
    <Route path=":module" element={<SchoolsModulePlaceholder />} />
  </Route>
  {/* legacy in-app links still work */}
  <Route path="/schools/*" element={<Navigate to="/" replace />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

#### Section D — Rewrite internal Schools links
All Schools pages hard-code `/schools/dashboard/...`, `/schools/onboarding`, etc. Global find-replace inside the new project only:
- `/schools/dashboard` → `/dashboard`
- `/schools/onboarding` → `/onboarding`
- `/schools/admin` → `/admin`
- `/schools`  (bare) → `/`

Files to touch: everything in `src/pages/schools/**` and `src/components/schools/**` (~ 20 files, mechanical).

#### Section E — Simplify `PageWrapper.tsx`
Remove `useSchoolsSubdomainRedirect` entirely (this project **is** the subdomain now).

#### Section F — Environment variables to set in the new project
```
VITE_SCHOOLS_API_URL=https://api.schools.mispartechnologies.com
VITE_SCHOOLS_FR_URL=<face-recognition service base>
VITE_SCHOOLS_WS_URL=<wss host>
VITE_SUPABASE_URL=https://vbakqmbnkhzpzmwbcczz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key from current .env>
```

#### Section G — Backend cutover checklist (Django side)
- Add `schools.mispartechnologies.com` to `ALLOWED_HOSTS`
- Add same origin to `CORS_ALLOWED_ORIGINS`
- Add same origin to Supabase Auth → URL Configuration → redirect allow-list

#### Section H — Deploy sequence
1. Publish new project → `mispar-schools.lovable.app` (verify smoke tests)
2. Lovable → Domains → connect `schools.mispartechnologies.com` to new project
3. Wait for TLS
4. Return to THIS project and run cleanup pass (see below)

---

### What I'll do inside THIS project AFTER cutover (separate approval)

Once you confirm `schools.mispartechnologies.com` is live on the new project, I'll open a second small PR here that:

1. Removes all `src/pages/schools/**`, `src/components/schools/**`, `src/lib/api/schools/**`, `src/hooks/useSchools*.ts`, `src/contexts/SchoolsThemeContext.tsx`, `src/styles/schools-tokens.css`, `docs/schools/**`.
2. Removes Schools imports + routes from `src/App.tsx`.
3. Replaces the whole `/schools/*` block with a **single redirect catch-all** so old bookmarks / marketing links continue to work:
```tsx
<Route path="/schools/*" element={<ExternalRedirect base="https://schools.mispartechnologies.com" />} />
```
4. Strips `useSchoolsSubdomainRedirect` from `PageWrapper.tsx` (its target now lives natively at the subdomain).

I will NOT do that cleanup until you tell me cutover succeeded — it's the rollback safety net.

---

### Files this plan creates in THIS project (only, before you remix)

1. `docs/MIGRATION-schools-only.md` — the full checklist above, verbatim, so the remixed project's agent can execute it without needing this conversation.
2. Nothing else. No code is moved, no routes changed here until post-cutover.

---

### High-risk items to be aware of

- **Supabase Auth sessions are per-origin.** Users signed in at `mispartechnologies.com` will re-authenticate at `schools.mispartechnologies.com`. Acceptable for MVP; cross-subdomain SSO is a Phase 2 task.
- **Django CORS + `ALLOWED_HOSTS`** must be updated **before** first real login on the new domain or every request 4xxs.
- **Preview vs published mismatch you observed:** likely a stale build cache. Once the new project is published to its own subdomain and DNS points there, this becomes irrelevant. If it recurs, we investigate then.
- **`docs/schools/*` will be duplicated** during the remix window (present in both projects). The post-cutover cleanup step deletes them here.

---

### Deliverable of THIS turn (once you approve)

I will create only one file: **`docs/MIGRATION-schools-only.md`**. Then you remix, and the new project's agent executes the checklist.
