

# Dashboard Theme Customization System

## Overview

Build a comprehensive, per-organization theme customization system that lets admins fully brand their dashboard experience (and their members' view). Theme settings are stored on the backend via the existing organization API and applied dynamically using CSS custom properties.

## Current State

- Dashboard uses hardcoded CSS variables in `src/index.css` (HSL-based Tailwind theme)
- `TerminologyContext` already dynamically adapts labels per org type — same pattern applies for theming
- `OrganizationSettings` page exists with tabs (General, Features, Attendance, Notifications) — new "Branding" tab fits here
- All dashboard pages use Tailwind's `bg-primary`, `text-foreground`, etc. — overriding CSS vars at the dashboard root is enough to re-skin everything

## Architecture

```text
┌──────────────────────────────────────────────────┐
│  Django Backend                                  │
│  Organization model: new `branding` JSON field   │
│  GET/PATCH /api/organizations/:id/               │
│  Returns: { branding: { primary_color, ... } }   │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│  ThemeContext (new React context)                 │
│  - Fetches org branding from profile.org_id      │
│  - Converts hex colors → HSL CSS vars            │
│  - Applies via style attribute on dashboard root  │
│  - Provides theme object to components            │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│  Dashboard pages                                 │
│  - No changes needed — they already use           │
│    Tailwind's CSS variable classes                │
│  - Custom logo/preloader rendered by Layout       │
└──────────────────────────────────────────────────┘
```

## What to Build

### 1. Theme Context (`src/contexts/ThemeContext.tsx`)

New context wrapping the dashboard that:
- Fetches `branding` from the organization data (via `djangoApi.getOrganization`)
- Converts hex colors to HSL and injects them as CSS custom properties on `document.documentElement` (scoped to `.dashboard-themed`)
- Exposes theme values (logo URL, org name, preloader style) to child components
- Falls back to system defaults when no branding is configured

**Theme shape:**
```typescript
interface OrgBranding {
  // Colors
  primary_color: string;        // hex e.g. "#1a73e8"
  secondary_color: string;
  accent_color: string;
  sidebar_bg: string;
  sidebar_text: string;
  header_bg: string;

  // Logo & identity
  logo_url: string;             // uploaded to Supabase storage
  favicon_url: string;
  
  // Preloader
  preloader_style: 'spinner' | 'pulse' | 'logo' | 'dots';
  
  // Typography
  font_family: 'inter' | 'space-grotesk' | 'poppins' | 'roboto' | 'system';
  heading_font: string;
  border_radius: 'none' | 'sm' | 'md' | 'lg' | 'full';

  // Dashboard layout
  sidebar_style: 'solid' | 'glass' | 'minimal';
  card_style: 'flat' | 'elevated' | 'bordered' | 'glass';
  dark_mode: 'system' | 'light' | 'dark';
  
  // Welcome message
  welcome_message: string;
  
  // Member dashboard overrides
  member_theme_enabled: boolean;  // apply same theme to members
}
```

### 2. Branding Settings Page (`src/pages/dashboard/BrandingSettings.tsx`)

New dedicated page (route: `/dashboard/branding`) with sections:

- **Color Picker Section**: Primary, secondary, accent, sidebar, header colors with live preview swatches
- **Logo Upload**: Drag-and-drop upload to Supabase storage `org-assets` bucket; preview display
- **Typography**: Font family selector, heading font, border radius presets
- **Layout Style**: Sidebar style (solid/glass/minimal), card style presets with visual previews
- **Preloader**: Choose preloader animation style; preview button
- **Member Theme**: Toggle to extend admin theme to member dashboards
- **Live Preview Panel**: Side-by-side mini preview of dashboard with current settings
- **Reset to Defaults**: Button to revert all branding

All saves go through `djangoApi.updateOrganization(orgId, { branding: {...} })`.

### 3. Integration into Dashboard Layout

- Wrap `DashboardLayout` content with `ThemeProvider`
- Add `.dashboard-themed` class to dashboard root div
- `DashboardSidebar`: Use theme logo_url instead of hardcoded `ScanFace` icon; apply sidebar_bg/text colors
- `DashboardHeader`: Use theme header_bg; show org logo
- Loading spinner: Render based on `preloader_style` from theme

### 4. Sidebar Menu Update

Add "Branding" item to `DashboardSidebar` menu (admin/super_admin only), between "Settings" and "Site Management" using `Palette` icon from lucide.

### 5. API Route Addition

Add to `apiRoutes.ts`:
```typescript
ORG_BRANDING: (id: string) => `/api/organizations/${id}/`,  // uses existing PATCH
```
No new route needed — branding is a JSON field on the existing organization model.

## Backend Requirements (Django)

You need to add a `branding` JSONField to your Organization model:

```python
# In your Organization model
branding = models.JSONField(default=dict, blank=True)
```

Run migration:
```bash
python manage.py makemigrations
python manage.py migrate
```

The existing `GET/PATCH /api/organizations/:id/` endpoints should already serialize this field if you add it to the serializer. Ensure the `branding` key is included in `OrganizationSerializer.fields`.

## Files to Create
- `src/contexts/ThemeContext.tsx`
- `src/pages/dashboard/BrandingSettings.tsx`
- `src/components/dashboard/ColorPicker.tsx` (reusable color input)
- `src/components/dashboard/ThemePreview.tsx` (live mini-preview)
- `src/components/dashboard/PreloaderPreview.tsx`

## Files to Modify
- `src/components/dashboard/DashboardLayout.tsx` — wrap with ThemeProvider, add `.dashboard-themed` class
- `src/components/dashboard/DashboardSidebar.tsx` — add Branding menu item, use theme logo/colors
- `src/components/dashboard/DashboardHeader.tsx` — use theme header colors/logo
- `src/App.tsx` — add `/dashboard/branding` route
- `src/lib/api/apiRoutes.ts` — no change needed (reuses existing org endpoint)

## Scope Boundaries
- Theme only affects `/dashboard/*` routes — public landing pages remain unchanged
- No new backend endpoints needed — uses existing organization PATCH
- Font loading is dynamic via Google Fonts URL injection

