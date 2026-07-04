# Scene 04 — The Living Farm Lifecycle

## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Scene ID: SCENE-04
> Timeline: `scene04Timeline`
> Feature Timeline: `farmLifecycleTimeline`
> Owner: WebArtistry Creations

---

# Scene Purpose

Demonstrate how TrackFarmOps coordinates the complete lifecycle of a commercial farm.

Rather than presenting isolated software modules, this scene visualizes farming as one connected operational system where every task influences the next.

The visitor should understand:

TrackFarmOps manages the entire farming journey—not just records.

---

# Narrative Objective

Answer the question:

**How does TrackFarmOps help throughout the season?**

The answer unfolds visually as one continuous operational flow.

Every completed activity unlocks the next.

Nothing feels disconnected.

---

# Emotional Progression

```
Confidence

↓

Understanding

↓

Momentum

↓

Coordination

↓

Trust

↓

Mastery
```

The visitor should begin to imagine running their own farm using this workflow.

---

# Duration

Scroll Distance

180vh

Pinned

Optional (recommended on desktop)

Estimated Timeline

20–24 seconds

---

# Environment

The dashboard from Scene 03 gradually blends into the physical farm.

The user is no longer looking at software.

They are looking at software controlling reality.

Real-world farm operations become synchronized with their digital counterparts.

---

# Primary Subject

Farm Lifecycle Timeline

This timeline becomes the narrative spine of the scene.

Each stage represents an actual operational milestone within a Nigerian commercial rice farming cycle.

---

# Lifecycle Stages

Stage 01

Land Preparation

↓

Stage 02

Seed Procurement

↓

Stage 03

Planting

↓

Stage 04

Fertilizer Application

↓

Stage 05

Field Monitoring

↓

Stage 06

Worker Coordination

↓

Stage 07

Equipment Maintenance

↓

Stage 08

Harvest

↓

Stage 09

Warehouse Intake

↓

Stage 10

Sales & Distribution

The flow is continuous.

No stage exists in isolation.

---

# Storytelling Principle

Every action causes another.

Example

Land prepared

↓

Seeds become available

↓

Planting begins

↓

Workers receive assignments

↓

Inventory decreases

↓

Expenses update

↓

Equipment usage increases

↓

Harvest forecast improves

↓

Warehouse stock increases

↓

Revenue grows

TrackFarmOps visualizes these relationships automatically.

---

# Camera Language

The camera adopts a guided journey.

Instead of remaining fixed, it follows progress along the lifecycle timeline.

Movement

Horizontal progression

↓

Subtle vertical transitions

↓

Focused zooms

↓

Wide overview

The motion should resemble exploring a living operational map.

---

# Motion Choreography

## Phase 1 — Timeline Emerges (0–15%)

The dashboard gently simplifies.

A central lifecycle timeline appears.

Milestone nodes fade into view.

Connecting paths draw themselves.

---

## Phase 2 — Preparation (15–30%)

Land preparation activates.

Equipment enters.

Workers receive assignments.

Seed inventory updates.

Timeline advances.

---

## Phase 3 — Growth (30–55%)

Planting animation.

Fertilizer distribution.

Field inspections.

Weather updates.

Task completion indicators.

Inventory movement.

Everything feels synchronized.

---

## Phase 4 — Harvest (55–80%)

Rice fields mature.

Harvest tasks activate.

Equipment moves.

Warehouse fills.

Production metrics increase.

Revenue begins climbing.

---

## Phase 5 — Distribution (80–100%)

Completed harvest becomes inventory.

Sales orders activate.

Distribution routes illuminate.

Revenue finalizes.

Timeline reaches completion.

Immediately prepares for analytics.

---

# Typography

Headline

Every Season. Every Task. Every Outcome.

Supporting Copy

TrackFarmOps connects every stage of farm operations—from land preparation to harvest and distribution—into one intelligent workflow.

CTA

See Every Operation in Context

Typography should reinforce—not interrupt—the operational flow.

---

# Motion Philosophy

Movement represents progress.

Completed tasks move forward.

Pending tasks remain calm.

Dependencies illuminate naturally.

Nothing teleports.

Nothing appears without reason.

---

# GSAP Timeline Architecture

```
scene04Timeline

↓

timelineReveal()

↓

landPreparation()

↓

seedProcurement()

↓

planting()

↓

fertilizerApplication()

↓

fieldMonitoring()

↓

workerCoordination()

↓

equipmentMaintenance()

↓

harvest()

↓

warehouseIntake()

↓

distribution()

↓

completion()

↓

transitionOut()
```

Each stage functions as an independent module.

---

# Feature Timeline

```
farmLifecycleTimeline

├── nodeReveal()
├── pathDraw()
├── taskActivation()
├── inventorySync()
├── workerAssignments()
├── equipmentStatus()
├── weatherUpdates()
├── warehouseFill()
├── salesDistribution()
└── lifecycleComplete()
```

Each animation reflects an actual product capability.

---

# ScrollTrigger

Trigger

Scene container

Start

top top

End

+=180%

Pin

Desktop: Optional

Tablet: No

Mobile: No

Scrub

1

---

# Animation Specifications

Timeline Paths

SVG path drawing.

Nodes

Scale

0.8 → 1

Opacity

0 → 1

Task Cards

Slide upward.

Fade in.

Inventory Counters

Increment smoothly.

Progress Rings

Draw clockwise.

Worker Assignments

Fade between "Assigned" and "Completed".

Warehouse

Storage bars fill progressively.

Distribution Routes

Animate using path traversal.

---

# Interactive Details

As each milestone activates:

Corresponding dashboard KPI updates.

Inventory values adjust.

Task completion increases.

Worker availability changes.

Equipment utilization updates.

Weather influences recommendations.

The dashboard and farm remain synchronized.

---

# Asset Dependencies

Farm Timeline

Task Cards

Progress Indicators

Worker Icons

Equipment Icons

Inventory Widgets

Warehouse Illustration

Distribution Map

Weather Widget

KPI Cards

All assets must conform to:

Asset Bible

SVG Library

Motion Tokens

Design Tokens

---

# Performance Budget

Maximum simultaneous tweens

22

Maximum animated nodes

12

Maximum active paths

10

Maximum counter animations

6

Target

60 FPS

Prefer SVG path animations over heavy raster effects.

---

# Mobile Adaptation

Convert the horizontal lifecycle into a vertical guided journey.

Display one operational stage at a time.

Reduce simultaneous animations.

Maintain identical narrative progression.

---

# Accessibility

Reduced Motion

Replace:

Path drawing

↓

Sequential highlights

Timeline movement

↓

Step-by-step fades

Counter animations

↓

Static values

The lifecycle must remain understandable without animation.

---

# Transition to Scene 05

The completed lifecycle pauses.

The camera pulls back slightly.

Operational data begins separating from the workflow.

Charts quietly emerge from completed milestones.

Harvest totals become graphs.

Expenses become financial trends.

Worker activity becomes productivity analytics.

The visitor realizes:

Running the farm generates intelligence.

TrackFarmOps transforms operations into insight.

---

# Scene Completion Criteria

✓ Every lifecycle stage is represented.

✓ Workflow feels continuous.

✓ Dashboard and farm remain synchronized.

✓ Operational dependencies are visually clear.

✓ Motion reinforces progress.

✓ Visitor understands the end-to-end value of TrackFarmOps.

---

# Engineering Notes

Avoid turning this into a feature carousel.

This is not a slideshow of modules.

It is one continuous operational system.

Every animation should communicate causality.

One completed task naturally enables the next.

The experience should resemble watching a living production pipeline rather than navigating software.

---

# Director's Intent

Imagine watching an entire farming season unfold in less than thirty seconds.

Not through time-lapse photography, but through intelligent coordination.

Seeds arrive because procurement was completed.

Planting succeeds because workers were scheduled.

Harvest fills the warehouse because equipment was maintained.

Revenue increases because distribution was planned.

The visitor should leave this scene with one lasting impression:

**TrackFarmOps doesn't just record farm activities—it orchestrates them.**