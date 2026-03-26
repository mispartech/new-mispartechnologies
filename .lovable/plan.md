

## Problem

The hero section face visualization is static, robotic, and doesn't convey the real-world experience of face recognition. The current SVG face has static feature boxes, a slow scan line, and no sense of movement or life. Users don't immediately understand what the product does.

## Vision

Transform the right side of the hero into a **cinematic simulation** of a person walking into frame and being detected, recognized, and logged — all in ~10 seconds. The face should move naturally (simulating a person approaching a camera), cvzone-style corner brackets should dynamically track the face, and the entire sequence should tell a story at first glance.

## Design Concept

```text
Timeline (10s loop):

0-1s    Face silhouette enters from right, slightly off-center
1-3s    DETECTING — cyan corners snap onto face, scan line sweeps,
        confidence ticks up (72%→85%), label: "Detecting Face..."
3-5s    RECOGNIZED — corners turn amber, name appears
        "Adaeze Okonkwo — 96%", feature boxes highlight
5-7s    SAVED — corners turn green, checkmark pulse,
        "Attendance Saved ✓ — 99%", subtle celebration glow
7-9s    Face drifts slightly, data fades, ready for reset
9-10s   Smooth crossfade back to start
```

## Plan

### 1. Rewrite `FaceScanVisualization.tsx` — Dynamic face with motion

**Face silhouette improvements:**
- Replace the current SVG with a cleaner, minimal gender-neutral silhouette (smooth head, simple eyes with pupils, subtle nose bridge, gentle curved smile — no neck/shoulder lines that look skeletal)
- Add CSS `transform: translate()` animation so the face **drifts horizontally and vertically** within the frame, simulating a person in motion walking toward a camera
- Use `requestAnimationFrame`-driven position updates for smooth 60fps movement with subtle easing

**cvzone-style corner brackets that track the face:**
- Instead of static corner divs at fixed positions, render 4 corner bracket pairs (8 L-shaped elements) that are **positioned relative to the face's current animated position**
- Corners should appear with a slight "snap" animation (scale from 0.8→1) when transitioning from no-detection to detecting
- Corner positions update in sync with the face drift animation, creating the illusion of real-time tracking
- Corner thickness: 3px, length: ~20% of face box width (matching FaceOverlay.tsx pattern)

**Feature detection boxes (eyes, nose, mouth):**
- These also move with the face position
- They fade in sequentially during the detecting phase (eyes first, then nose, then mouth) with 200ms stagger
- Each box has a thin border + label (L_EYE, R_EYE, NOSE, MOUTH) with confidence %

### 2. State-driven color transitions with motion

**Three states, color-coded (unchanged concept, improved execution):**
- **Detecting** (0-3s): Cyan `hsl(190 90% 50%)` — corners pulse subtly, confidence increments from 72→85%
- **Recognized** (3-6s): Amber `hsl(45 100% 60%)` — corners solidify, name label slides in, confidence jumps to 96%
- **Saved** (6-9s): Green `hsl(142 70% 50%)` — brief glow burst on corners, checkmark appears, confidence at 99%

**The face continues drifting slightly throughout** — it never stops moving, reinforcing the "live camera" feel.

### 3. Top status label — dynamic content

- Positioned above the tracking frame (moves with it)
- Shows contextual text per state:
  - Detecting: `Scanning... — 72% — Detecting Face...`
  - Recognized: `Adaeze Okonkwo — 96% — Face Recognized`
  - Saved: `Adaeze Okonkwo — 99% — Attendance Saved ✓`

### 4. Side status timeline (desktop XL)

- Keep the 3-step vertical indicator (Face Detected → Identity Matched → Record Saved)
- Each step lights up progressively as the animation advances
- Add a subtle connecting line between dots that fills with color

### 5. Ambient effects

- **Scan line**: Keep the horizontal sweep but sync its color with the current state
- **Data stream particles**: Replace generic floating dots with tiny data-point particles that flow toward the face during detection (like the system "reading" the face)
- **Radial glow**: Pulses color-matched to current state behind the face area
- **Grid overlay**: Subtle, unchanged

### 6. Mobile/tablet version

- Face is centered, smaller, semi-transparent (opacity 0.25)
- Still animated (drifting motion + state changes)
- Corner brackets and feature boxes included but simplified (no labels on mobile)
- No status timeline on mobile

### 7. CSS animations (`src/index.css` + `tailwind.config.ts`)

- Add `face-drift` keyframe for the natural wandering motion
- Add `corner-snap` keyframe for bracket appearance
- Add `confidence-tick` for the number incrementing effect
- Keep existing `scan-line-slow` but parameterize color via CSS custom property

### Files to modify

| File | Change |
|---|---|
| `src/components/FaceScanVisualization.tsx` | Complete rewrite with motion system, dynamic tracking corners, sequential feature detection |
| `src/index.css` | Add face-drift, corner-snap keyframes |
| `tailwind.config.ts` | Add new animation entries |

