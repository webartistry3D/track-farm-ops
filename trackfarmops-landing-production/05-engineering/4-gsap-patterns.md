# GSAP Patterns
## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Document ID: GSAP-PATTERNS
> Owner: WebArtistry Creations

---

# Purpose

This document defines the official GSAP engineering patterns for the TrackFarmOps cinematic landing experience.

Every animation, timeline, ScrollTrigger and transition must conform to these standards.

The objective is consistency, maintainability, performance and predictable behavior.

---

# Design Philosophy

Animations are software.

They should be:

- Modular
- Reusable
- Deterministic
- Reversible
- Easy to debug
- Easy to destroy
- Easy to extend

Animation code should never become application logic.

---

# Core Principles

## One Responsibility

One timeline.

One purpose.

Example

```
scene03Timeline

✓ Dashboard assembly

NOT

Dashboard
+
Analytics
+
Particles
+
Transitions
```

---

## Timeline Composition

Large experiences are built from small timelines.

```
masterTimeline

↓

scene03Timeline

↓

dashboardTimeline

↓

kpiTimeline

↓

counterTimeline
```

Small timelines are easier to test.

---

## Never Animate Immediately

Avoid

```ts
gsap.to(...)
```

Prefer

```ts
const timeline = gsap.timeline()

timeline.to(...)
```

Timelines provide sequencing, labels and control.

---

# Timeline Ownership

Only one owner.

Example

```
Scene03

↓

scene03Timeline
```

No second component should modify the same timeline.

---

# Timeline Naming

Use descriptive names.

Good

```
dashboardAssemblyTimeline

analyticsTimeline

orbitTimeline

cameraTimeline

scene04Timeline
```

Avoid

```
timeline1

main

animation

testTimeline
```

---

# Timeline Structure

```
Intro

↓

Primary Motion

↓

Secondary Motion

↓

Idle

↓

Outro
```

Every timeline should have a beginning and an end.

---

# Labels

Every major sequence requires labels.

Example

```ts
timeline

.addLabel("intro")

.addLabel("assembly")

.addLabel("dashboard")

.addLabel("idle")

.addLabel("transition")
```

Labels improve orchestration.

---

# ScrollTrigger Pattern

Every ScrollTrigger should define:

- Trigger
- Start
- End
- Scrub
- Pin
- Invalidate On Refresh
- Cleanup

Avoid implicit defaults.

---

# React Pattern

Use the official React integration.

Preferred

```
useGSAP()

↓

gsap.context()

↓

cleanup()
```

Never leave animations attached after unmount.

---

# Cleanup

Every timeline must support cleanup.

Destroy:

- Timelines
- ScrollTriggers
- Observers
- Event listeners
- MatchMedia instances

No memory leaks.

---

# Context Pattern

Every scene creates its own GSAP context.

```
Scene

↓

GSAP Context

↓

Timeline

↓

Cleanup
```

Contexts should never overlap.

---

# Nested Timelines

Allowed.

Example

```
sceneTimeline

↓

dashboardTimeline

↓

kpiTimeline

↓

counterTimeline
```

Nested timelines should remain independent.

---

# Motion Tokens

Never hardcode animation values.

Avoid

```ts
duration: 0.8
```

Prefer

```ts
motion.duration.medium
```

Avoid

```ts
ease: "power3.out"
```

Prefer

```ts
motion.ease.standard
```

Motion remains centrally managed.

---

# Design Tokens

Avoid

```ts
x: 120
```

Prefer

```ts
spacing.xxxl
```

Animation should respect design tokens.

---

# Scroll Synchronization

Master Scroll

↓

Master Timeline

↓

Scene Timeline

↓

Feature Timeline

↓

Component Timeline

One direction only.

---

# Timeline Registration

Every timeline registers itself.

Example

```
registerTimeline()

↓

masterTimeline.add()
```

Never manipulate the master timeline directly from components.

---

# State Synchronization

Animation state must reflect application state.

Examples

Node Completed

↓

Animation Complete

Inventory Updated

↓

Counter Updated

Dashboard Ready

↓

Reveal Animation

Animation never invents state.

---

# Camera Pattern

Only Camera Engine controls:

Scale

Translation

Perspective

Focus

Scenes request camera movement.

Scenes never manipulate the camera directly.

---

# Counter Pattern

Counters always:

Start

↓

Interpolate

↓

Settle

↓

Idle

Never loop indefinitely.

---

# SVG Pattern

Preferred

Stroke drawing

Transform

Opacity

Clip paths

Morphing (where appropriate)

Avoid animating unnecessary SVG attributes.

---

# Stagger Pattern

Maximum stagger

0.08 seconds

Long staggers slow narrative pacing.

---

# Easing Standards

Primary

Standard

Exit

Accelerated

Entrance

Decelerated

Elastic and bounce easings are prohibited unless explicitly approved.

---

# Particle Pattern

Particles must:

Support cleanup.

Respect reduced motion.

Deactivate outside viewport.

Remain GPU-efficient.

---

# Idle Animations

Maximum simultaneous idle loops

6

Idle motion should be subtle.

Examples

Cloud drift

Crop movement

Soft glow

Bird flight

---

# Reverse Scrolling

Every timeline must support reverse playback.

No animation may assume forward-only progression.

Reverse scrolling must remain visually stable.

---

# Responsive Animations

Desktop

Full choreography

Tablet

Moderate simplification

Mobile

Essential storytelling only

Never duplicate timelines.

Adapt them.

---

# Accessibility

Respect:

prefers-reduced-motion

Replace:

Path drawing

↓

Fade

Camera movement

↓

Static framing

Particles

↓

Static composition

Narrative must survive without motion.

---

# Performance Standards

Target FPS

60

Maximum active timelines

8

Maximum active ScrollTriggers

15

Maximum simultaneous tweens

30

Kill inactive animations immediately.

---

# Debugging

Development mode should support:

Timeline labels

ScrollTrigger markers

FPS overlay

Scene identifier

Animation progress

Timeline duration

Disabled in production.

---

# Anti-Patterns

Never

- Create timelines inside render logic.
- Register duplicate ScrollTriggers.
- Hardcode easing values.
- Hardcode durations.
- Animate layout properties unnecessarily.
- Leave orphaned timelines.
- Manipulate scenes from child components.
- Mix business logic with animation logic.

---

# Testing Checklist

✓ Timeline registers correctly.

✓ Cleanup executes.

✓ Reverse scrolling verified.

✓ Responsive behavior verified.

✓ Reduced motion verified.

✓ Performance budget maintained.

✓ Timeline labels accurate.

✓ No memory leaks.

---

# Definition of Done

A GSAP implementation is complete when:

✓ Timeline ownership is clear.

✓ Cleanup is automatic.

✓ Motion tokens are used.

✓ Reverse scrolling works.

✓ Accessibility is respected.

✓ Performance remains stable.

✓ Animations are deterministic.

---

# Final Principle

GSAP is not simply an animation library within TrackFarmOps.

It is the cinematic engine that drives the narrative.

Every timeline should behave like a disciplined production system—modular, predictable and elegant.

When engineers follow these patterns consistently, the entire landing experience feels like one cohesive interactive film rather than a collection of independent animations.