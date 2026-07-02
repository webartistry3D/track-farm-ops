# Design Tokens
## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Purpose: Single source of truth for all design tokens used across engineering, Figma and implementation.
> Owner: WebArtistry Creations

---

# Philosophy

Design Tokens are the implementation layer of the visual identity.

Every color, spacing value, radius, typography scale, animation timing and elevation should originate from this document.

No hardcoded values should exist inside components.

If a value is reusable, it belongs here.

---

# Token Naming Convention

Use semantic names.

Never name tokens after appearance.

✅ Correct

color-success

surface-primary

text-muted

radius-lg

space-6

duration-fast

❌ Incorrect

green500

blueDark

roundedBig

padding20

---

# Color Tokens

## Brand

```
--color-brand-primary
#2E7D32

--color-brand-secondary
#66BB6A

--color-brand-accent
#D4A017
```

---

## Surfaces

```
--surface-primary
#FFFFFF

--surface-secondary
#F8FAFC

--surface-elevated
#FFFFFF

--surface-overlay
rgba(255,255,255,0.80)
```

---

## Text

```
--text-primary
#1F2937

--text-secondary
#475569

--text-muted
#64748B

--text-inverse
#FFFFFF
```

---

## Borders

```
--border-primary
#CBD5E1

--border-subtle
#E2E8F0
```

---

## Status

```
--success
#2E7D32

--warning
#F59E0B

--danger
#DC2626

--info
#2563EB
```

---

# Typography Tokens

Primary Font

```
Inter
```

Secondary Font

```
JetBrains Mono
```

---

## Font Sizes

```
text-display-xl
96px

text-display-lg
72px

text-h1
56px

text-h2
48px

text-h3
40px

text-h4
32px

text-body-lg
20px

text-body
18px

text-small
16px

text-caption
14px
```

---

## Font Weights

```
regular
400

medium
500

semibold
600

bold
700
```

---

## Line Heights

```
display
1.05

heading
1.2

body
1.6

caption
1.5
```

---

# Spacing Scale

Based on an 8-point grid.

```
space-1
4px

space-2
8px

space-3
12px

space-4
16px

space-5
20px

space-6
24px

space-8
32px

space-10
40px

space-12
48px

space-16
64px

space-20
80px

space-24
96px

space-32
128px
```

---

# Border Radius

```
radius-sm
6px

radius-md
10px

radius-lg
16px

radius-xl
24px

radius-full
9999px
```

Use consistent radii throughout the experience.

Avoid mixing styles.

---

# Shadows

Small

```
0 2px 8px rgba(15,23,42,.08)
```

Medium

```
0 8px 24px rgba(15,23,42,.10)
```

Large

```
0 20px 48px rgba(15,23,42,.12)
```

No harsh shadows.

Never pure black.

---

# Motion Tokens

Fast

```
150ms
```

Normal

```
300ms
```

Slow

```
600ms
```

Scene Transition

```
1000ms
```

Long Cinematic

```
1800ms
```

---

# Easing Tokens

Standard

```
power2.out
```

Entrance

```
power3.out
```

Exit

```
power2.in
```

Reveal

```
expo.out
```

Organic

```
sine.inOut
```

Only approved GSAP easings should be used.

---

# Z-Index Scale

```
background
0

content
10

dashboard
20

floating-assets
30

navigation
40

modal
100

debug
999
```

Avoid arbitrary z-index values.

---

# Blur Tokens

```
blur-sm
4px

blur-md
8px

blur-lg
16px

blur-xl
24px
```

Use only when storytelling requires depth or focus.

---

# Container Widths

```
content
1280px

reading
760px

dashboard
1440px
```

---

# Grid

Desktop

12 columns

Tablet

8 columns

Mobile

4 columns

Maintain consistent gutters across breakpoints.

---

# Breakpoints

```
sm
640px

md
768px

lg
1024px

xl
1280px

2xl
1536px
```

---

# Animation Principles

Animations must consume tokens.

Never hardcode:

Durations

Spacing

Opacity

Colors

Border radius

Transforms

Centralizing values ensures visual consistency and simplifies future updates.

---

# Figma Integration

All Figma variables should mirror these token names exactly.

Example:

```
Color / Brand / Primary

Text / Primary

Space / 6

Radius / Large

Motion / Scene Transition
```

No alternative naming systems.

---

# Tailwind Integration

Expose all design tokens through:

- CSS Custom Properties
- `tailwind.config.ts`
- Utility classes

Example:

```
bg-surface-primary

text-primary

border-primary

rounded-lg

shadow-md

duration-normal
```

Avoid raw HEX values and arbitrary spacing utilities in production code.

---

# Governance

Any change to a design token must be reflected in:

- Figma Variables
- Tailwind Configuration
- CSS Variables
- Documentation

Token changes are system-wide decisions, not component-level overrides.

---

# Final Principle

Components should never define the design system.

They should consume it.

The design system is the contract between design and engineering.

If every component uses the same tokens, the TrackFarmOps experience will remain visually consistent, scalable and maintainable as the product evolves.