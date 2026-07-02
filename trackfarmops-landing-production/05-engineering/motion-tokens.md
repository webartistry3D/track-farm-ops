# Motion Tokens
## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Purpose: Single source of truth for all motion, animation and scroll behavior.
> Owner: WebArtistry Creations

---

# Philosophy

Motion is a communication system.

Animations exist to explain, reinforce or transition.

Every movement should have narrative purpose.

No animation should exist purely because it looks impressive.

Motion must remain consistent throughout the experience.

---

# Motion Principles

Motion should be:

Intentional

Predictable

Smooth

Cinematic

Meaningful

Never:

Chaotic without purpose

Flashy

Distracting

Overly playful

Inconsistent

---

# Animation Durations

Instant

100ms

Micro

150ms

Fast

250ms

Normal

400ms

Medium

600ms

Slow

900ms

Scene

1200ms

Cinematic

1800ms

Epic

2400ms

Never exceed 3000ms unless explicitly required by the storyboard.

---

# Standard Easings

Default

power2.out

Entrance

power3.out

Exit

power2.in

Reveal

expo.out

Organic

sine.inOut

Linear

none

Elastic and Bounce are prohibited unless explicitly approved.

---

# Timeline Labels

Every GSAP timeline should expose the same labels.

```
intro

build

focus

transition

resolve

complete
```

Never invent arbitrary labels.

---

# ScrollTrigger Standards

Desktop

Start

top top

End

+=100%

Scrub

true

Pin

Only when defined in the storyboard

Anticipate Pin

1

Tablet

Reduce pin duration by 25%.

Mobile

Reduce pin duration by 50%.

---

# Scroll Distance Tokens

Short Scene

100vh

Standard Scene

150vh

Narrative Scene

200vh

Hero Scene

250vh

Epic Transition

300vh

Avoid excessively long scroll distances.

---

# Stagger Tokens

Micro

0.02

Small

0.05

Normal

0.08

Large

0.12

Mass Assembly

0.18

Use stagger to create rhythm, not randomness.

---

# Delay Tokens

None

0

Short

0.1

Medium

0.25

Long

0.5

Scene

0.75

---

# Fade Tokens

Fade In

Opacity

0 → 1

Fade Out

Opacity

1 → 0

Default Duration

400ms

---

# Scale Tokens

Subtle

0.98 → 1

Standard

0.95 → 1

Hero

0.90 → 1

Never scale above 1.05 unless explicitly required.

---

# Rotation Tokens

Micro

3°

Small

6°

Medium

12°

Chaos

20°

Maximum

30°

Avoid excessive spinning.

Rotation should support storytelling.

---

# Orbit Tokens (Chaos Scene)

Receipt Orbit

18 seconds

Invoice Orbit

22 seconds

Attendance Sheet Orbit

20 seconds

Fuel Log Orbit

24 seconds

WhatsApp Notification Drift

16 seconds

Harvest Record Orbit

26 seconds

All orbit animations should feel synchronized but not identical.

---

# Dashboard Assembly Tokens

Receipt Snap

300ms

Card Build

400ms

Widget Reveal

500ms

Chart Grow

700ms

Timeline Connect

600ms

Dashboard Complete

1200ms

Assembly should feel deliberate and satisfying.

---

# Camera Motion Tokens

Push In

3–5%

Pull Out

5–8%

Pan

2–4%

Depth Shift

40–80px

Parallax

10–40px

Camera movement must remain subtle.

---

# Parallax Depth

Background

10px

Landscape

20px

Farm Objects

30px

Documents

40px

Dashboard

60px

Foreground UI

80px

Depth should reinforce focus.

---

# Particle Tokens

Maximum Active Particles

Desktop

60

Tablet

35

Mobile

20

Particles should enhance atmosphere, never distract.

---

# Blur Tokens

Background Blur

4px

Focus Blur

8px

Depth Blur

12px

Maximum

16px

Avoid excessive blur.

---

# Hover Motion

Lift

4px

Scale

1.02

Duration

200ms

Ease

power2.out

Hover effects should feel responsive, not theatrical.

---

# Page Transition Tokens

Scene Fade

600ms

Scene Morph

900ms

Scene Blend

1200ms

Only one major transition should occur at a time.

---

# Performance Constraints

Target Frame Rate

60 FPS

Maximum Simultaneous GSAP Tweens

30

Maximum Active ScrollTriggers

15

Avoid animating:

width

height

top

left

Prefer:

transform

opacity

filter (sparingly)

---

# Reduced Motion

Respect

prefers-reduced-motion

Replace:

Large movement

↓

Opacity

Scale

↓

Simple fade

Pinned scenes

↓

Static layouts

The story must remain understandable without complex animation.

---

# Naming Convention

Animations should use semantic names.

Examples

heroRevealTimeline

chaosOrbitTimeline

dashboardAssemblyTimeline

analyticsChartTimeline

scaleNetworkTimeline

Avoid names such as:

animation1

timeline2

gsapStuff

---

# Engineering Rules

All motion values must reference Motion Tokens.

Do not hardcode:

Durations

Easings

Staggers

Delays

Scroll distances

Camera values

Animation utilities should import shared constants wherever possible.

---

# Governance

Any modification to a motion token is a system-wide decision.

Update:

Motion documentation

Animation specifications

Shared constants

GSAP utilities

Component implementations

before merging changes.

---

# Final Principle

The visitor should never notice the animation itself.

They should notice what the animation helps them understand.

When motion disappears into storytelling, the experience has achieved its purpose.