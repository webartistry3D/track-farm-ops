# Scene 01 — Calm Before the Storm

## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Scene ID: SCENE-01
> Timeline: `scene01Timeline`
> Owner: WebArtistry Creations

---

# Scene Purpose

The first scene establishes emotional trust.

The visitor should immediately understand:

> This is a real Nigerian commercial farm.

No software.

No dashboards.

No marketing.

Just calm.

The purpose is to create a peaceful baseline so the chaos in Scene 02 feels meaningful.

---

# Story Objective

Communicate:

• Scale

• Peace

• Simplicity

• Potential

• Human connection

The visitor should emotionally invest in the farm before discovering its operational problems.

---

# Duration

Scroll Distance

180vh

Pinned

Yes

Estimated Timeline

18–22 seconds

---

# Emotional State

Beginning

Calm

↓

Curiosity

↓

Expectation

↓

Subtle anticipation

The visitor should feel relaxed.

---

# Environment

Primary Environment

Modern Nigerian commercial rice farm

Time

Early morning

Weather

Clear

Temperature

Warm

Wind

Light breeze

Sky

Soft blue

Sun Position

Upper-left

Lighting follows:

lighting.md

---

# Primary Subject

Farm Manager

Position

Center-left

Pose

Standing naturally

Holding tablet

Looking toward the fields

Expression

Focused

Hopeful

Confident

No exaggerated gestures.

---

# Supporting Elements

Rice fields

Warehouse

Farm road

Irrigation channels

Vegetation

Distant equipment

Subtle birds

Light cloud movement

Everything supports the hero.

Nothing competes.

---

# Camera Language

Opening Shot

Wide aerial establishing shot.

↓

Slow cinematic push-in.

↓

Eye-level framing.

↓

Subtle parallax.

↓

Hold.

Maximum camera movement:

5%

The visitor should barely notice movement.

---

# Composition

Rule of Thirds

Farm manager occupies left third.

Open farmland occupies remaining frame.

Negative space prepares for typography.

---

# Typography

Headline

Managing a farm shouldn't feel like managing chaos.

Subheadline

Track every task, worker, inventory movement and harvest from one intelligent platform.

CTA

Explore the Story

Typography fades in naturally.

No dramatic entrance.

---

# Motion Choreography

## Phase 1

0–15%

Fade from white.

Landscape emerges.

Morning mist dissipates.

---

## Phase 2

15–35%

Camera slowly pushes forward.

Grass sways.

Clouds drift.

Birds cross horizon.

---

## Phase 3

35–55%

Farm manager subtly shifts weight.

Looks across the fields.

Tablet catches soft sunlight.

---

## Phase 4

55–75%

Headline appears.

Subheadline follows.

CTA fades upward.

---

## Phase 5

75–100%

Everything settles.

Ambient motion continues.

Prepare for transition.

---

# Motion Assets

Grass

Loop

Clouds

Loop

Birds

Loop

Tree movement

Loop

Ambient particles

Loop

Camera drift

Timeline

Typography reveal

Timeline

Manager idle animation

Timeline

---

# Animation Specification

Grass

Translate Y

1–2px

Wind

Sine easing

Clouds

Horizontal translation

Extremely slow

Birds

Bezier path

Natural speed

Camera

Scale

1 → 1.04

Translate Y

0 → -20px

Typography

Opacity

0 → 1

Y

24px → 0

Duration

0.8 seconds

Ease

power3.out

---

# ScrollTrigger

Trigger

Scene container

Start

top top

End

+=180%

Pin

True

Scrub

1

Anticipate Pin

1

Invalidate On Refresh

True

Markers

Development only

---

# Asset Dependencies

Characters

Farm Manager

Environments

Commercial Rice Farm

Warehouse

Objects

Tablet

Farm Road

Vegetation

UI

Hero Typography

CTA Button

Ambient

Clouds

Birds

Mist

Every asset must exist in:

asset-bible.md

---

# GSAP Timeline Structure

```
scene01Timeline

intro()

↓

environmentReveal()

↓

cameraPush()

↓

ambientLoops()

↓

managerIdle()

↓

headlineReveal()

↓

ctaReveal()

↓

hold()

↓

transitionOut()
```

No anonymous tweens.

Every sequence should be modular.

---

# Timeline Labels

```
intro

environment

camera

headline

cta

hold

transition
```

Referenced by the Master Timeline.

---

# Transition to Scene 02

The transition should begin subtly.

Visual indicators:

Wind increases slightly.

Papers begin drifting into frame from distant edges.

A single receipt crosses the foreground.

The farm manager briefly notices movement.

Typography fades.

Ambient calm begins to feel unstable.

The visitor should sense that something is about to go wrong before chaos actually begins.

---

# Performance Constraints

Maximum active tweens

12

Maximum particles

20

Maximum simultaneous loops

6

GPU-friendly transforms only.

---

# Mobile Adaptation

Reduce:

Cloud count

Bird count

Particle count

Parallax depth

Camera movement

Maintain:

Narrative

Typography

Character

Mood

---

# Accessibility

Reduced Motion

Disable:

Camera push

Parallax

Bird animation

Replace with:

Simple fade

Static composition

Typography reveal

---

# Scene Completion Criteria

The scene is complete when:

✓ The environment feels authentic

✓ The farm manager is clearly established as the protagonist

✓ The visitor understands the agricultural context

✓ Calm has been emotionally established

✓ Typography is fully readable

✓ The transition into Scene 02 feels inevitable

---

# Engineering Notes

This scene should avoid visual complexity.

Its power comes from restraint.

Do not attempt to impress the visitor with animation.

Earn their attention through atmosphere.

Scene 02 will provide contrast.

Scene 01 exists to make that contrast emotionally effective.

---

# Director's Intent

If the visitor pauses at any point in this scene, the frame should resemble the opening shot of a premium agricultural documentary.

They should feel the quiet confidence of a well-run farm before witnessing the invisible operational chaos that TrackFarmOps was built to solve.

The calm is not the destination.

It is the emotional foundation upon which the entire story is built.