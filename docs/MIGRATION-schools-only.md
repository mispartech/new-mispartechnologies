# Migration Checklist — Convert This Remixed Project Into a Schools-Only App

> **Context for the agent reading this file:** This project was just remixed from `mispartechnologies.com` (the corporate + Schools monorepo). Your job is to prune everything that isn't Schools, promote Schools from `/schools/*` to `/*`, and prepare the build for deployment to `schools.mispartechnologies.com`.
>
> Execute the sections in order. Every path below is repo-relative. Do not skip Section G (backend) — cutover breaks logins without it.

---

## Section A — Delete non-Schools code

Remove these paths (use `rm -rf` via the shell tool):

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
src/pages/Onboarding.tsx
src/pages/dashboard/
src/pages/platform/
src/components/dashboard/
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
src/lib/api/apiRoutes.ts
src/lib/api/client.ts
src/lib/demoSession.ts
src/lib/onboardingSession.ts
src/lib/roleConfig.ts
src/contexts/TerminologyContext.tsx
src/contexts/ThemeContext.tsx
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

After deleting, run a sanity search: `rg -l "from \"@/pages/dashboard|from \"@/components/dashboard|TerminologyContext|useFaceRecognition|platformApi|demoApi"` — every hit outside `src/pages/schools/**` needs to be removed or replaced. Expect zero hits after Sections B–E.

---

## Section B — Keep (do not touch)

These files are the Schools app and must survive:

```
src/pages/schools/**
src/pages/Auth.tsx
src/pages/Register.tsx
src/pages/ResetPassword.tsx
src/pages/EmailVerified.tsx
src/pages/Logout.tsx
src/pages/NotFound.tsx
src/components/schools/**
src/components/PageWrapper.tsx        (edit per Section E)
src/components/ScrollToTop.tsx
src/components/ui/**
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
package.json, vite.config.ts, tailwind.config.ts,
tsconfig*.json, components.json, eslint.config.js,
index.html, capacitor.config.ts, .env
```

---

## Section C — Rewrite `src/App.tsx`

Replace the entire file with:

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DjangoAuthProvider } from "@/contexts/DjangoAuthContext";
import PageWrapper from "./components/PageWrapper";

import Auth from "./pages/Auth";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import EmailVerified from "./pages/EmailVerified";
import Logout from "./pages/Logout";
import NotFound from "./pages/NotFound";

import SchoolsLanding from "./pages/schools/SchoolsLanding";
import SchoolsOnboarding from "./pages/schools/SchoolsOnboarding";
import SchoolsPlatformAdmin from "./pages/schools/SchoolsPlatformAdmin";
import SchoolsLayout from "./pages/schools/SchoolsLayout";
import SchoolsDashboard from "./pages/schools/SchoolsDashboard";
import SchoolsIdentity from "./pages/schools/SchoolsIdentity";
import SchoolsAttendance from "./pages/schools/SchoolsAttendance";
import SchoolsAttendanceAdmin from "./pages/schools/SchoolsAttendanceAdmin";
import SchoolsSecurity from "./pages/schools/SchoolsSecurity";
import SchoolsStudents from "./pages/schools/SchoolsStudents";
import SchoolsStudentProfile from "./pages/schools/SchoolsStudentProfile";
import SchoolsStaff from "./pages/schools/SchoolsStaff";
import SchoolsStaffProfile from "./pages/schools/SchoolsStaffProfile";
import SchoolsModulePlaceholder from "./pages/schools/SchoolsModulePlaceholder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DjangoAuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <PageWrapper>
            <Toaster />
            <Sonner />
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

              {/* Legacy in-app links keep working */}
              <Route path="/schools" element={<Navigate to="/" replace />} />
              <Route path="/schools/onboarding" element={<Navigate to="/onboarding" replace />} />
              <Route path="/schools/admin" element={<Navigate to="/admin" replace />} />
              <Route path="/schools/dashboard/*" element={<Navigate to="/dashboard" replace />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageWrapper>
        </TooltipProvider>
      </BrowserRouter>
    </DjangoAuthProvider>
  </QueryClientProvider>
);

export default App;
```

---

## Section D — Rewrite internal Schools links

Run these find/replace passes across `src/pages/schools/**` and `src/components/schools/**` **only**:

| Find                    | Replace         |
| ----------------------- | --------------- |
| `/schools/dashboard`    | `/dashboard`    |
| `/schools/onboarding`   | `/onboarding`   |
| `/schools/admin`        | `/admin`        |
| `"/schools"` (bare)     | `"/"`           |
| `'/schools'` (bare)     | `'/'`           |

Verify with `rg -n "/schools" src/`. Expected remaining hits: comments, doc strings, `docs/**`. Anything in code needs manual review.

Also check `src/pages/schools/schoolsModules.ts` and `SchoolsSidebar.tsx` — those hold the nav map.

---

## Section E — Simplify `PageWrapper.tsx`

Remove the `useSchoolsSubdomainRedirect` hook and any subdomain-detection logic. This project **is** the subdomain now — no redirect needed. The wrapper should keep only `ScrollToTop` behavior and document-title handling.

---

## Section F — Environment variables

Set in the new project's Settings → Environment:

```
VITE_SCHOOLS_API_URL=https://api.schools.mispartechnologies.com
VITE_SCHOOLS_FR_URL=<face-recognition service base URL>
VITE_SCHOOLS_WS_URL=<wss:// host for realtime>
VITE_SUPABASE_URL=https://vbakqmbnkhzpzmwbcczz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key — copy from the source project's .env>
```

Update `index.html`:
- `<title>Mispar Schools — Attendance & Security</title>`
- Matching `<meta name="description">`, `og:title`, `og:description`.

---

## Section G — Backend cutover checklist (Django + Supabase)

Before publishing:

1. Django `settings.py`:
   - `ALLOWED_HOSTS` += `schools.mispartechnologies.com`
   - `CORS_ALLOWED_ORIGINS` += `https://schools.mispartechnologies.com`
   - `CSRF_TRUSTED_ORIGINS` += `https://schools.mispartechnologies.com`
2. Supabase → Authentication → URL Configuration:
   - Add `https://schools.mispartechnologies.com` to Site URL allow-list and Redirect URLs.
3. WebSocket gateway (`VITE_SCHOOLS_WS_URL`) must allow the new origin.
4. Face-recognition microservice CORS must include the new origin.

---

## Section H — Deploy sequence

1. Publish → confirm `mispar-schools.lovable.app` (or auto-slug) renders the landing page and the dashboard mounts at `/dashboard`.
2. Smoke test: `/onboarding` wizard step gating; `/dashboard` overview loads without health banner; `/dashboard/students` fetches live data.
3. Lovable → Domains → connect `schools.mispartechnologies.com` to this project.
4. Wait for TLS issuance, then reverify all routes on the custom domain.
5. Notify the source project (mispartechnologies.com) — it will run a cleanup pass to remove `/schools/*` and replace it with a 301 to the new subdomain.

---

## Section I — High-risk items

- **Auth sessions are per-origin.** Users signed in at `mispartechnologies.com` will re-authenticate here. Acceptable for MVP.
- **Do not delete `docs/schools/**`** — those backend prompts stay with this repo (they describe *this* app's backend).
- **Do not touch `src/integrations/supabase/client.ts`** — the Supabase client + generated types are shared infra and must remain.
- **`useSchoolsRealtime.ts`** relies on `VITE_SCHOOLS_WS_URL`. If unset, it no-ops silently. Set it before demoing realtime features.

---

## Section J — Definition of done

- [ ] Sections A–F complete
- [ ] `bun run build` succeeds with zero errors
- [ ] `rg -n "dashboard/DashboardLayout|TerminologyContext|platformApi|demoApi" src/` returns nothing
- [ ] Manual smoke test passes on the preview URL
- [ ] Custom domain connected and verified
- [ ] Source project notified for cleanup pass
