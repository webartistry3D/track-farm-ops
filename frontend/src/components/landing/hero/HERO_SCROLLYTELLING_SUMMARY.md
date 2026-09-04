# Hero Scrollytelling Implementation Summary

## Overview

The landing page hero has been transformed from a static background image into a scroll-scrubbed scrollytelling experience across five scenes. Users scroll through a pinned container while a master GSAP timeline drives image crossfades, scale parallax, text lifecycle animations, and UI element transitions.

## Architecture

### Scroll Model

- **Pinned container:** `100vh` height, pinned via GSAP `ScrollTrigger` with `pin: true`
- **Scroll range:** `+=400%` (5 scenes × 100vh each)
- **Scrub:** `0.8` (desktop), respects `prefersReducedMotion`
- **Single master timeline:** All tweens placed by absolute position — no nested ScrollTriggers

### Layer Stack (z-index)

| Layer | z-index | Description |
|-------|---------|-------------|
| Solid fallback | 0 | `bg-slate-950` |
| Backdrop images | 10 | 5 stacked `<img>` elements (`HeroBackdrop`) |
| Cinematic vignette | 20 | Radial gradient darkening edges |
| Per-scene scrims | 25 | Directional gradient overlays per scene |
| Grid texture | 30 | Subtle `bg-grid` with mask |
| Orbs | 35 | Floating blurred circles (Scene 1 & 5) |
| Phone composite | 36 | Stylized phone mock with dashboard slides (Scene 4) |
| Text/UI layers | 40 | One `HeroScene` per scene |
| Progress rail | 50 | 5-dot vertical navigation (lg+ only) |
| Scroll cue | 50 | "Explore" + arrow (fades after 5% scroll) |
| Navigation | 60 | Fixed top nav bar |

## Scenes

### Scene 1 — "The Land"

- **Eyebrow:** (none, commented out)
- **Title:** "Run your farm / from your smartphone."
- **Body:** (commented out)
- **Content:** Chips (2), CTAs (Start free + See how it works), Social proof (avatars + rating), Stats grid (4 stats)
- **Layout:** Left-aligned, vertically centered
- **Animation:** Children animate in on mount (separate timeline), exit at 70% scroll
- **Orbs:** Both active

### Scene 2 — "The Reality"

- **Eyebrow:** "THE REALITY" (rose)
- **Title:** "Money leaks between WhatsApp, exercise books and Excel."
- **Body:** "Feed disappears 😢. A sick animal goes unnoticed until it's too late 🐄."
- **Content:** Problems grid (2-column, 6 items with rose icon circles), Progress line draw
- **Layout:** Left-aligned, top-aligned
- **Crossfade:** 35%–40% of scene range

### Scene 3 — "The Shift"

- **Eyebrow:** "THE SHIFT" (emerald)
- **Title:** "One App. Total clarity."
- **Body:** "Every naira, every bag of feed, every animal — recorded in seconds, visible from anywhere."
- **Content:** Solutions grid (2-column, 6 items with emerald icon circles)
- **Layout:** Left-aligned, top-aligned
- **Crossfade:** 55%–60% of scene range

### Scene 4 — "The Operation"

- **Eyebrow:** "THE OPERATION" (emerald)
- **Title:** "Built for the business of farming."
- **Body:** "Income, expenses, inventory, assets, livestock, workforce — all in one secure app."
- **Content:** Features grid (4-column desktop, 1-column mobile), Phone composite with 3 dashboard slides
- **Layout:** Left-aligned, top-aligned
- **Crossfade:** 75%–80% of scene range

### Scene 5 — "The Future"

- **Eyebrow:** "THE FUTURE" (emerald)
- **Title:** "This is the future of farming."
- **Body:** "Stop guessing. Start growing."
- **Content:** Final CTA button (pulsing), Testimonial card
- **Layout:** Center-aligned
- **Orbs:** One active

## Files

| File | Purpose |
|------|---------|
| `hero/scenes.ts` | Scene configuration: images, scrims, scale/drift, crossfade windows, content, feature flags |
| `hero/HeroBackdrop.tsx` | 5 stacked `<img>` elements with `data-hero-bg` attributes |
| `hero/HeroScene.tsx` | Per-scene text/UI block with conditional rendering for all content types |
| `hero/PhoneComposite.tsx` | Scene 4 phone mock with 3 sequential dashboard slides (income, inventory, livestock) |
| `hero/ProgressRail.tsx` | 5-dot vertical navigation rail (lg+ only), active dot tracks scroll |
| `Hero.tsx` | Main orchestrator: pinned container, master GSAP timeline, scroll interactions |
| `lib/gsap.ts` | Registers `ScrollTrigger` and `ScrollToPlugin` |

## Key Animations

### Image Transitions

- **Crossfade:** Scene *n* fades in during scene *n-1*'s crossfade window, fades out during its own
- **Scale parallax:** Each image scales from `scaleFrom` to `scaleTo` across its scene duration
- **Y drift:** Optional vertical drift (e.g., `-3vh`) for subtle parallax

### Text Lifecycle

- **Scene 1:** Children stagger in on mount (power3.out), exit at 70% scroll
- **Scenes 2–5:** Enter at 0–15% (opacity + y), hold, exit at 70–100% (opacity + y)
- **Pointer events:** Disabled during exit to prevent interaction with invisible content

### Interactive Elements

- **"See how it works" button** (Scene 1): Smooth scrolls to Scene 2 start via `gsap.to(window, { scrollTo })`
- **Progress rail dots:** Click to jump to any scene start
- **ScrollTrigger instance** stored in `triggerRef` for navigation calculations

### Idle Animations

- **Orbs:** Continuous yoyo movement (9s and 11s durations)
- **Final CTA:** Gentle scale pulse (1.2s, yoyo)

## Content Data

Scene content references shared data from `content.ts`:

- `heroChips` — Feature highlight pills (Scene 1)
- `heroStats` — Stat counters with `CountUp` animation (Scene 1)
- `problems` — Pain point cards with icons (Scene 2)
- `solutions` — Solution cards with icons (Scene 3)
- `testimonials` — User testimonials (Scene 5)
- `trustedAvatars` — Social proof avatars (Scene 1)

## Placeholder Images

All 5 scenes currently use `/trackfarmops-bg.png` as a placeholder. To replace with generated scene images:

1. Generate images via Higgsfield (requires credits)
2. Update the `PLACEHOLDER` constant in `scenes.ts` or set per-scene `image` paths
3. Each image should be 16:9, high resolution, matching the scene's visual description

## Reduced Motion

When `prefersReducedMotion()` returns true:

- No pin, no scroll animation
- Scene 1 content displays statically
- All other scenes hidden
- Container uses `min-height: auto` instead of `100vh`

## Dependencies

- `gsap` (^3.15.0) — Core animation library
- `ScrollTrigger` — Pin and scroll-driven animations
- `ScrollToPlugin` — Smooth scroll navigation
- `react-router-dom` — `Link` for CTA navigation
- `lucide-react` — Icons for problems, solutions, features
