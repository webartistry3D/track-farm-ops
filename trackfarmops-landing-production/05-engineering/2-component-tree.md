# Component Tree
## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Document ID: COMPONENT-TREE
> Owner: WebArtistry Creations

---

# Purpose

This document defines the complete React component hierarchy for the TrackFarmOps landing experience.

Each component should have a single responsibility.

Scenes orchestrate components.

Components never orchestrate scenes.

---

# Engineering Principles

Components must be:

- Reusable
- Stateless where possible
- Animation-friendly
- Accessible
- Responsive
- Easy to test

---

# High-Level Application Tree

```
<App>

└── <RootLayout>

    ├── <Providers>

    │     ├── GSAPProvider
    │     ├── LenisProvider
    │     ├── MotionProvider
    │     ├── ThemeProvider
    │     └── AccessibilityProvider

    ├── <LandingExperience>

    │     ├── HeroLoader
    │     ├── MasterTimeline
    │     ├── Scene01
    │     ├── Scene02
    │     ├── Scene03
    │     ├── Scene04
    │     ├── Scene05
    │     ├── Scene06
    │     ├── Scene07
    │     └── Footer

    └── AnalyticsScripts
```

---

# Landing Experience

```
LandingExperience

├── ScrollContainer
├── ProgressIndicator
├── SceneManager
├── NavigationOverlay
├── BackgroundEnvironment
├── AmbientAudio
└── Footer
```

LandingExperience owns the cinematic experience.

---

# Scene Structure

Every scene follows the same architecture.

```
Scene

├── SceneContainer
├── SceneBackground
├── SceneCamera
├── SceneContent
├── SceneOverlay
├── SceneEffects
└── SceneTimeline
```

Consistency simplifies engineering.

---

# Scene 01

```
Scene01

├── Sky
├── Sunrise
├── RiceField
├── FarmRoad
├── FarmManager
├── Heading
├── SupportingText
├── ScrollIndicator
└── AmbientEffects
```

---

# Scene 02

```
Scene02

├── OrbitSystem
│     ├── Receipt
│     ├── Invoice
│     ├── FuelLog
│     ├── InventoryCard
│     ├── AttendanceSheet
│     ├── Calculator
│     ├── WhatsAppBubble
│     └── ExpenseReport
│
├── ChaosParticles
├── FarmManager
├── StressOverlay
└── SceneTimeline
```

---

# Scene 03

```
Scene03

├── DashboardAssembly
├── DashboardFrame
├── KPIGrid
├── Sidebar
├── Header
├── NotificationCenter
├── InventoryWidget
├── WorkerWidget
├── ExpenseWidget
├── WeatherWidget
└── DashboardGlow
```

---

# Scene 04

```
Scene04

├── LifecycleTimeline
│
├── LifecycleNodes
│
├── ProgressPaths
│
├── WorkerAssignments
│
├── EquipmentStatus
│
├── InventoryFlow
│
├── WarehouseStatus
│
├── WeatherOverlay
│
└── TimelineProgress
```

---

# Scene 05

```
Scene05

├── ExecutiveDashboard
│
├── KPISection
│
├── RevenueChart
│
├── YieldChart
│
├── ExpenseChart
│
├── ProductivityChart
│
├── RecommendationCards
│
├── ForecastPanel
│
└── NotificationPanel
```

---

# Scene 06

```
Scene06

├── EnterpriseDashboard
│
├── NigeriaMap
│
├── FarmNetwork
│
├── FarmCards
│
├── ConnectionLines
│
├── RegionalAnalytics
│
├── FleetStatus
│
├── WarehouseNetwork
│
└── EnterpriseKPIs
```

---

# Scene 07

```
Scene07

├── Landscape
├── BrandLogo
├── Headline
├── SupportingText
├── PrimaryCTA
├── SecondaryCTA
├── TrustIndicators
└── AmbientEnvironment
```

---

# Shared Components

```
shared/

├── Button
├── Card
├── Badge
├── Chip
├── Icon
├── Logo
├── SectionHeading
├── RichText
├── Tooltip
├── Divider
├── Surface
└── Container
```

These components are scene-agnostic.

---

# Dashboard Components

```
dashboard/

├── Sidebar
├── Topbar
├── KPIWidget
├── MetricCard
├── NotificationCard
├── ActivityFeed
├── ChartContainer
├── ProgressRing
├── StatusBadge
└── Table
```

Reusable between multiple scenes.

---

# Analytics Components

```
analytics/

├── LineChart
├── AreaChart
├── BarChart
├── KPIGrid
├── ForecastCard
├── TrendIndicator
├── InsightCard
└── RecommendationCard
```

Charts should use a unified API.

---

# Farm Components

```
farm/

├── FarmManager
├── Worker
├── Tractor
├── RiceField
├── Warehouse
├── PickupTruck
├── Irrigation
├── CropRow
└── Equipment
```

These represent the physical farming world.

---

# Animation Components

```
animation/

├── OrbitSystem
├── ParticleSystem
├── TimelinePath
├── CounterAnimation
├── MorphGroup
├── SceneTransition
├── CameraRig
└── ScrollIndicator
```

Animation behavior should be encapsulated.

---

# Background Components

```
background/

├── Sky
├── Clouds
├── Sunlight
├── AtmosphericFog
├── Landscape
├── Birds
├── Wind
└── LightRays
```

Backgrounds should remain lightweight.

---

# Layout Components

```
layout/

├── Section
├── SceneWrapper
├── Viewport
├── Grid
├── Stack
├── Spacer
├── MaxWidth
└── SafeArea
```

Shared layout primitives only.

---

# Providers

```
providers/

├── GSAPProvider
├── LenisProvider
├── MotionProvider
├── ThemeProvider
├── AccessibilityProvider
└── AssetProvider
```

Providers should expose minimal public APIs.

---

# Hooks

```
hooks/

├── useScene
├── useTimeline
├── useScrollProgress
├── useReducedMotion
├── useAssetLoader
├── useViewport
├── useCounter
└── useCleanup
```

Hooks should remain composable.

---

# Utilities

```
utils/

├── animation.ts
├── easing.ts
├── math.ts
├── performance.ts
├── preload.ts
├── viewport.ts
├── accessibility.ts
└── constants.ts
```

Utilities contain no UI logic.

---

# Component Rules

Every component must define:

Purpose

Props

Dependencies

Accessibility Notes

Performance Notes

Animation Ownership

Cleanup Requirements

---

# Naming Convention

Components

PascalCase

Examples

FarmManager

LifecycleTimeline

EnterpriseDashboard

Hooks

camelCase

Example

useTimeline

Files

kebab-case

Example

farm-manager.tsx

---

# Ownership Rules

Scenes own:

Layout

Narrative

Timeline registration

Components own:

Rendering

Local interaction

Accessibility

Animation engines own:

Motion logic

State progression

Synchronization

---

# Anti-Patterns

Avoid:

- Components importing scene files
- Components registering global timelines
- Shared state inside presentational components
- Animation logic scattered across multiple files
- Duplicate UI widgets

---

# Testing Strategy

Each component must support:

✓ Unit testing

✓ Visual regression testing

✓ Keyboard navigation

✓ Responsive layouts

✓ Reduced motion

✓ Cleanup verification

---

# Definition of Done

The component tree is complete when:

✓ Every UI element has a clear owner.

✓ Components remain reusable.

✓ Scenes remain orchestration layers.

✓ Shared components contain no scene-specific logic.

✓ Animation remains modular.

✓ The hierarchy scales without restructuring.

---

# Final Principle

The component tree should mirror the story itself.

Scenes tell the narrative.

Components build the scenes.

Engines bring them to life.

When combined, they create a cinematic experience that is elegant to use, intuitive to maintain and ready to evolve alongside the TrackFarmOps platform.