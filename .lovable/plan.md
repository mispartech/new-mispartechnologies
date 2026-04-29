# Attendance Page UX Enhancements

Fullscreen toggle is already live on `/dashboard/attendance` (Maximize2 button in the Camera Feed card header, with native ESC-to-exit and bounding-box recalculation). This plan upgrades fullscreen into a proper **kiosk/operator mode** and adds high-impact quality-of-life improvements across the page.

## 1. Kiosk Fullscreen Mode (Camera Feed)

Upgrade the existing fullscreen toggle so it's actually useful for an operator running attendance at a door/lobby.

- **Stats overlay** — float the 3 stat cards (Total / Members / Visitors) as a translucent glass panel in the top-left corner while fullscreen.
- **Recent Recognitions side panel** — slide-in panel (right side, collapsible) so operators see who just checked in without leaving fullscreen. Toggle button on the overlay.
- **Last recognition toast-in-frame** — a large centered banner ("Welcome back, Sarah ✓") that fades after 2.5s, replacing the small badge. Color-coded: primary for member, amber for visitor.
- **Keyboard shortcuts** while fullscreen: `F` toggle, `S` toggle sound, `R` reset session, `H` hide/show overlay panels, `?` shows a shortcuts cheat-sheet.
- **Auto-hide cursor** after 3s of inactivity in fullscreen.
- **Wake lock** — request `navigator.wakeLock` so the screen doesn't sleep during an attendance session.

## 2. Camera Feed quality-of-life (windowed mode too)

- **Camera device picker** — `navigator.mediaDevices.enumerateDevices()` dropdown when more than one camera is present (laptops with USB webcams), with selection persisted in `localStorage`.
- **Mirror toggle** — flip the video horizontally (selfie view), persisted.
- **Snapshot button** — capture current frame to a downloaded PNG (helpful for operators verifying disputed entries).
- **Resolution preference** — Auto / 720p / 1080p toggle, persisted.
- **Better empty/error states** — when `apiStatus !== 'connected'`, show a clear inline retry button instead of just disabling Start Camera.

## 3. Recent Recognitions panel

- **Search box** at the top to filter by name in the visible list.
- **Group by Member/Visitor** with collapsible sections.
- **Click a row → opens existing details dialog** (already exists for the eye icon, just make the whole row clickable on touch devices).
- **"Undo last" action** — soft-revert most recent capture if it was a misrecognition (calls existing delete endpoint if available; if not, hide behind a flag).

## 4. Page-level header improvements

- **Sticky compact header on scroll** — when user scrolls past the stats, collapse Start/Stop + status badges into a sticky thin bar so operators always have controls in reach on long sessions.
- **Session timer** — small "Session: 00:42:13" badge once camera is on, helps operators track shift length.

## 5. Audio feedback upgrades

- **Distinct chimes** for member vs visitor (two pitches), reusing the existing audio system. Volume slider in the sound toggle popover.
- **Voice announcement (optional, off by default)** — Web Speech API: "Welcome, Sarah." Toggle in the sound popover.

## 6. Accessibility & mobile polish

- ARIA labels on all icon-only buttons (sound, fullscreen, refresh, camera).
- Increase tap targets to 48px on mobile per project memory.
- Respect `prefers-reduced-motion` for the pulse/spin animations.
- Live region (`aria-live="polite"`) announcing recognitions for screen readers.

## 7. Cross-page small wins (admin operators)

- **DashboardSidebar**: persist collapsed state in `localStorage`.
- **Notification bell**: mark-all-read button + relative timestamps ("2m ago").
- **Tables (Members/Attendance Logs)**: keyboard navigation (arrow keys row-to-row), and remember last sort/filter per page in `localStorage`.

## Technical Details

```text
src/pages/dashboard/AttendanceCapture.tsx
  - Add state: showOverlayPanels, showRecentPanel, mirrored, selectedDeviceId,
    availableCameras, sessionStartedAt, lastRecognition (for centered banner)
  - useEffect: enumerate cameras on mount + on devicechange
  - useEffect: keyboard shortcuts (only active when isFullscreen or focus on page)
  - useEffect: cursor auto-hide via class toggle
  - useEffect: wake lock on cameraOn, release on cameraOff/unmount
  - New components (inline or co-located):
      <KioskOverlay /> — stats + last recognition banner + shortcut hint
      <KioskSidePanel /> — collapsible Recent list reused from existing list
      <CameraToolbar /> — device picker, mirror, snapshot, resolution
  - Reuse existing FaceOverlay, RecentRecognitionsList, audio chime hook

src/components/dashboard/DashboardSidebar.tsx
  - Persist collapsed state (key: dashboard_sidebar_collapsed)

src/components/dashboard/NotificationBell.tsx
  - Add mark-all-read action and date-fns formatDistanceToNow

New file: src/hooks/useWakeLock.ts
New file: src/hooks/useKeyboardShortcuts.ts (generic map → handler)
New file: src/hooks/useCameraDevices.ts
```

No backend changes. No new env vars. No new dependencies (date-fns already in project; Web Speech and Wake Lock are browser APIs with graceful fallbacks).

## Out of scope

- Changes to face recognition pipeline itself (throttle, model, endpoints)
- Changes to attendance data shape or API contracts
- Plan-gating of these features (can wire to entitlements later when backend ships)

## Rollout order (if you want to slice)

1. Kiosk fullscreen (#1) + camera toolbar (#2) — biggest operator win
2. Recent panel improvements (#3) + audio upgrades (#5)
3. Sticky header + session timer (#4) + accessibility (#6)
4. Cross-page polish (#7)

Approve all, or tell me which slices to ship first.