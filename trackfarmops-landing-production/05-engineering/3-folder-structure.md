# Folder Structure
## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Document ID: FOLDER-STRUCTURE
> Owner: WebArtistry Creations

---

# Purpose

This document defines the official directory structure for the TrackFarmOps cinematic landing experience.

The folder structure is designed to support:

- Modular engineering
- Domain-driven organization
- Scalable animation systems
- Asset management
- High-performance rendering
- Excellent developer experience

Every directory has a clearly defined responsibility.

---

# Architecture Philosophy

Organize by domain.

Never organize by file type alone.

Good

```
animation/
dashboard/
story/
lifecycle/
analytics/
```

Avoid

```
components/
hooks/
utils/
misc/
random/
```

Every folder should answer:

"What part of the product does this belong to?"

---

# Root Structure

```
trackfarmops-landing/

├── app/
├── public/
├── src/
├── docs/
├── scripts/
├── tests/
├── .github/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

# App Directory

```
app/

├── layout.tsx
├── page.tsx
├── globals.css
├── loading.tsx
├── error.tsx
├── not-found.tsx
└── sitemap.ts
```

Only application shell files belong here.

---

# Source Directory

```
src/

├── domains/
├── components/
├── engines/
├── hooks/
├── providers/
├── lib/
├── styles/
├── assets/
├── types/
├── config/
├── constants/
└── utils/
```

Source code lives exclusively inside `src`.

---

# Domains

```
domains/

├── story/
│
├── dashboard/
│
├── lifecycle/
│
├── analytics/
│
├── enterprise/
│
├── cta/
│
└── shared/
```

Domains represent product capabilities.

---

# Story Domain

```
story/

├── scenes/
│     ├── scene-01/
│     ├── scene-02/
│     ├── scene-03/
│     ├── scene-04/
│     ├── scene-05/
│     ├── scene-06/
│     └── scene-07/
│
├── transitions/
├── timeline/
└── data/
```

Everything related to cinematic storytelling belongs here.

---

# Components

```
components/

├── ui/
├── layout/
├── cinematic/
├── dashboard/
├── analytics/
├── farm/
├── typography/
├── icons/
└── shared/
```

Reusable components only.

No scene-specific logic.

---

# Animation Engines

```
engines/

├── master-timeline/
├── orbit/
├── lifecycle/
├── analytics/
├── transition/
├── camera/
├── particles/
├── counters/
├── scroll/
└── audio/
```

Each engine owns one responsibility.

---

# Hooks

```
hooks/

├── useScene.ts
├── useTimeline.ts
├── useLenis.ts
├── useScrollProgress.ts
├── useReducedMotion.ts
├── useAssetLoader.ts
├── useViewport.ts
├── useCounter.ts
└── useCleanup.ts
```

Hooks remain lightweight and composable.

---

# Providers

```
providers/

├── gsap-provider.tsx
├── lenis-provider.tsx
├── motion-provider.tsx
├── theme-provider.tsx
├── asset-provider.tsx
└── accessibility-provider.tsx
```

Providers expose application-wide services.

---

# Assets

```
assets/

├── illustrations/
├── svg/
├── icons/
├── logos/
├── textures/
├── backgrounds/
├── videos/
├── audio/
├── lottie/
└── fonts/
```

Every asset follows export-guidelines.md.

---

# Public

```
public/

├── images/
├── videos/
├── favicons/
├── robots.txt
├── manifest.json
└── sitemap.xml
```

Only publicly served assets belong here.

---

# Styles

```
styles/

├── globals.css
├── typography.css
├── utilities.css
├── animations.css
└── tokens.css
```

Design tokens should be consumed from CSS variables.

---

# Types

```
types/

├── animation.ts
├── dashboard.ts
├── lifecycle.ts
├── analytics.ts
├── scene.ts
├── asset.ts
└── common.ts
```

Avoid duplicate type definitions.

---

# Config

```
config/

├── gsap.ts
├── lenis.ts
├── motion.ts
├── theme.ts
├── analytics.ts
└── environment.ts
```

Configuration only.

No runtime logic.

---

# Constants

```
constants/

├── colors.ts
├── spacing.ts
├── breakpoints.ts
├── motion.ts
├── scenes.ts
└── typography.ts
```

Constants remain immutable.

---

# Utilities

```
utils/

├── animation.ts
├── easing.ts
├── interpolation.ts
├── preload.ts
├── performance.ts
├── accessibility.ts
├── viewport.ts
└── math.ts
```

Utilities contain pure functions only.

---

# Library

```
lib/

├── gsap/
├── lenis/
├── observers/
├── performance/
└── helpers/
```

External library wrappers belong here.

---

# Tests

```
tests/

├── unit/
├── integration/
├── accessibility/
├── visual/
└── performance/
```

Testing mirrors production architecture.

---

# Documentation

```
docs/

├── production-bible/
├── engineering/
├── assets/
├── deployment/
└── changelog/
```

Keep documentation version-controlled.

---

# Scripts

```
scripts/

├── optimize-assets.ts
├── generate-icons.ts
├── sprite-builder.ts
├── prebuild.ts
└── analyze-bundle.ts
```

Build tooling only.

---

# Naming Standards

Folders

kebab-case

Files

kebab-case

React Components

PascalCase

Hooks

camelCase

Types

PascalCase

Constants

UPPER_CASE

---

# Import Rules

Preferred

```
@/components/ui/button

@/engines/lifecycle

@/domains/story

@/hooks/useScene
```

Avoid long relative paths.

```
../../../../components
```

Use path aliases.

---

# Ownership Rules

Scenes

Own storytelling.

Components

Own rendering.

Engines

Own animation logic.

Hooks

Own reusable behavior.

Providers

Own global services.

Utilities

Own pure logic.

Assets

Own visual resources.

---

# Forbidden Patterns

Do not create folders such as:

```
misc/

old/

temp/

new/

backup/

final-final/

test2/
```

Every directory must have a defined responsibility.

---

# Scalability

The structure must support future additions such as:

- Interactive product demos
- Multi-language support
- Additional crops
- Seasonal landing campaigns
- Customer case studies
- Embedded product tours
- 3D hero experiences

without requiring structural changes.

---

# Definition of Done

The folder structure is complete when:

✓ Every file has an obvious location.

✓ Responsibilities are clearly separated.

✓ Scene logic remains isolated.

✓ Animation engines remain reusable.

✓ Imports remain predictable.

✓ New engineers can navigate the project without guidance.

---

# Final Principle

A well-designed folder structure should disappear into the background.

Engineers should spend their time building exceptional experiences—not searching for files.

If every module has a clear home and every responsibility has a clear owner, the codebase will remain maintainable as TrackFarmOps evolves from a landing page into a living product ecosystem.