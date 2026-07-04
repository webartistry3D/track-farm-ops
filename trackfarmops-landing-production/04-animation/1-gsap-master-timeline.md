# GSAP Master Timeline
## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Purpose: Define the master animation architecture for the entire TrackFarmOps cinematic landing experience.
> Owner: WebArtistry Creations

---

# Philosophy

The landing page is a single cinematic experience.

Not seven separate webpages.

Not seven isolated animations.

Every scene is one continuous film connected by the user's scroll.

The Master Timeline orchestrates every transition, animation, interaction and visual state.

No scene should animate independently without being registered here.

---

# Master Architecture

```
Page Load

↓

Hero Initialization

↓

Scene 1

↓

Transition

↓

Scene 2

↓

Transition

↓

Scene 3

↓

Transition

↓

Scene 4

↓

Transition

↓

Scene 5

↓

Transition

↓

Scene 6

↓

Transition

↓

Scene 7

↓

Page End
```

One continuous narrative.

---

# Timeline Ownership

The landing experience consists of:

Master Timeline

↓

Scene Timelines

↓

Component Timelines

↓

Micro Interaction Timelines

Only the Master Timeline controls scene progression.

Scenes never trigger one another directly.

---

# Timeline Hierarchy

```
masterTimeline

├── heroIntroTimeline
│
├── scene01Timeline
│
├── transition01Timeline
│
├── scene02Timeline
│
├── transition02Timeline
│
├── scene03Timeline
│
├── transition03Timeline
│
├── scene04Timeline
│
├── transition04Timeline
│
├── scene05Timeline
│
├── transition05Timeline
│
├── scene06Timeline
│
├── transition06Timeline
│
└── scene07Timeline
```

Every child timeline remains modular.

---

# Scene Progression

## Scene 01

CALM

Purpose

Establish emotional baseline.

Mood

Peaceful.

Hopeful.

Motion

Minimal.

Wind.

Vegetation.

Subtle camera drift.

Primary Focus

Farm Manager

Duration

≈ 180vh

---

## Scene 02

CHAOS

Purpose

Visualize operational disorder.

Motion

Orbit.

Scatter.

Overlap.

Compression.

Primary Focus

Flying operational documents.

Duration

≈ 220vh

---

## Scene 03

ORDER

Purpose

Reveal TrackFarmOps.

Motion

Assembly.

Alignment.

Resolution.

Primary Focus

Dashboard construction.

Duration

≈ 180vh

---

## Scene 04

FARM LIFECYCLE

Purpose

Demonstrate operational workflow.

Motion

Sequential.

Connected.

Progressive.

Primary Focus

Farm timeline.

Duration

≈ 180vh

---

## Scene 05

ANALYTICS

Purpose

Transform data into insight.

Motion

Reveal.

Growth.

Expansion.

Primary Focus

Charts.

KPIs.

Duration

≈ 170vh

---

## Scene 06

SCALE

Purpose

Demonstrate multi-farm operations.

Motion

Network growth.

Connection.

Expansion.

Primary Focus

Nigeria network.

Duration

≈ 180vh

---

## Scene 07

CTA

Purpose

Resolve the story.

Motion

Slow.

Centered.

Minimal.

Primary Focus

TrackFarmOps logo.

CTA.

Duration

≈ 120vh

---

# ScrollTrigger Strategy

Every scene owns one ScrollTrigger.

Example

```
Scene 01

↓

Pin

↓

Scrub

↓

Release

↓

Transition

↓

Next Scene
```

No overlapping scene ownership.

---

# Pinning Strategy

Pinned

Scene 01

Scene 02

Scene 03

Scene 05

Optional

Scene 04

Scene 06

Never Pin

Scene 07

Pinned sections should always have narrative purpose.

---

# Timeline Labels

Every scene exposes identical labels.

```
intro

establish

focus

interaction

resolve

transition

complete
```

These labels enable reusable orchestration.

---

# Camera System

Camera movement is virtual.

Implemented through:

Transforms

Scale

Parallax

Perspective

Never through actual WebGL cameras.

Maximum movement:

5%

The visitor should almost never notice camera movement consciously.

---

# Transition Rules

Every scene exits gracefully.

Objects transform.

Objects migrate.

Objects dissolve.

Avoid:

Hard cuts.

Abrupt disappearance.

Instant replacement.

Everything should feel physically connected.

---

# Global Animation Rules

Allowed

Translate

Scale

Rotate

Opacity

Clip Path

SVG Path Drawing

Morphing

Filter (minimal)

Avoid

Layout animations

Width

Height

Top

Left

Margin

Expensive repaint operations.

---

# State Management

Every scene exists in one of three states.

```
Inactive

↓

Active

↓

Resolved
```

Resolved scenes should release GPU resources where possible.

---

# Performance Budget

Target FPS

60

Maximum simultaneous tweens

30

Maximum active ScrollTriggers

15

Maximum active particles

Desktop

60

Tablet

35

Mobile

20

Performance takes priority over visual complexity.

---

# Memory Management

On scene exit:

Destroy unused timelines.

Kill inactive ScrollTriggers.

Release large textures.

Pause ambient loops.

Avoid memory accumulation during long sessions.

---

# Responsive Strategy

Desktop

Full cinematic experience.

Tablet

Reduced parallax.

Reduced particles.

Shorter pin durations.

Mobile

Simplified choreography.

Fewer simultaneous animations.

Preserved narrative.

The story remains identical across devices.

Only the choreography changes.

---

# Accessibility

Respect

prefers-reduced-motion

Replace:

Pinned storytelling

↓

Sequential fades

Large camera motion

↓

Opacity transitions

Complex choreography

↓

Simple state changes

Narrative clarity must never depend solely on animation.

---

# Timeline Naming Convention

```
masterTimeline

scene01Timeline

scene02Timeline

dashboardAssemblyTimeline

chaosOrbitTimeline

farmLifecycleTimeline

analyticsTimeline

scaleTimeline

ctaTimeline
```

Avoid generic names.

---

# Debug Strategy

Development builds should expose:

Current Scene

Current Timeline Label

Scroll Progress

Pinned Sections

FPS

Active ScrollTriggers

Timeline Duration

Debug overlays must never ship to production.

---

# Integration Architecture

The Master Timeline should integrate with:

Next.js App Router

React Context

GSAP Context

ScrollTrigger

Lenis

Motion Tokens

Design Tokens

Every dependency should remain modular and replaceable.

---

# Failure Recovery

If JavaScript fails:

Content remains readable.

Scenes stack vertically.

Images remain visible.

CTAs remain functional.

The landing page should degrade gracefully.

---

# Engineering Contract

Every scene document (`scene-01.md` through `scene-07.md`) must define:

- Timeline construction
- Asset dependencies
- ScrollTrigger configuration
- Animation sequence
- Entry conditions
- Exit conditions
- Performance considerations
- Responsive adaptations

No scene may diverge from this master architecture.

---

# Final Principle

The visitor should never perceive seven separate animations.

They should feel as though they are scrolling through a single uninterrupted cinematic journey—from agricultural chaos to operational clarity.

The Master Timeline is the invisible conductor that ensures every scene, transition and interaction behaves as one cohesive experience.