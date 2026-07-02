# AGENTS.md

> **Project:** TrackFarmOps Landing Experience
> **Purpose:** Operating manual for AI engineering agents (Windsurf, Devin, Cursor, Claude Code, GitHub Copilot, etc.)
> **Priority:** This document takes precedence over implementation assumptions. Read before modifying any code.

---

# Mission

Build a cinematic, high-performance scrollytelling experience that transforms the visitor's perception of farm management.

This is **not** a traditional SaaS landing page.

It is an interactive product film driven by scroll.

The objective is to communicate the value of TrackFarmOps visually before asking the visitor to read.

---

# Product Context

TrackFarmOps is a Farm Operating System (Farm OS) built for modern African agriculture.

It unifies:

- Farm Operations
- Inventory
- Finance
- Workforce
- Assets
- Harvest
- Analytics

into a single intelligent platform.

Never portray the application as merely a record-keeping tool.

---

# Core Narrative

The landing experience is locked into seven scenes.

1. Calm
2. Chaos
3. Order
4. Farm Lifecycle
5. Analytics
6. Scale
7. Call To Action

Do not add, remove, merge, or reorder scenes unless the production specification is updated.

---

# Engineering Philosophy

The experience should feel like:

Apple Product Page

×

Stripe

×

Linear

×

A cinematic short film

Every animation must have narrative purpose.

No decorative animation.

No meaningless motion.

---

# Technical Stack

Framework
- Next.js (App Router)

Language
- TypeScript

Animation
- GSAP
- ScrollTrigger

Styling
- TailwindCSS

Icons
- Lucide

Smooth Scroll
- Lenis

3D (only if explicitly required)
- React Three Fiber

Images
- SVG preferred
- WebP
- AVIF

---

# Architecture Rules

Each scene is an isolated module.

Never create one massive landing page component.

Preferred structure:

app/
landing/
components/

scene-01-calm/

scene-02-chaos/

scene-03-order/

scene-04-lifecycle/

scene-05-analytics/

scene-06-scale/

scene-07-cta/

Each scene owns:

- Layout
- Assets
- Animation
- Styles
- ScrollTrigger logic

No scene should directly manipulate another scene.

---

# Animation Rules

Every scene owns its own GSAP timeline.

Never place animation logic inside JSX.

Never create anonymous timelines.

All timelines must be cleaned up on unmount.

Use GSAP Context where appropriate.

Always destroy ScrollTriggers.

---

# Scroll Rules

The visitor's scroll controls the experience.

Scrolling should never feel blocked.

Pinned sections should only exist where the story benefits.

Avoid excessive scroll hijacking.

The page must remain intuitive.

---

# Motion Principles

Motion communicates meaning.

Examples:

Receipts orbit because paperwork is overwhelming.

Dashboard cards assemble because information becomes organized.

Charts grow because insight emerges.

Maps expand because the business scales.

Nothing moves randomly.

---

# Scene Responsibilities

Scene 1

Goal

Introduce calm.

Scene 2

Goal

Create controlled stress.

Scene 3

Goal

Deliver relief.

Scene 4

Goal

Explain the operating workflow.

Scene 5

Goal

Reveal intelligence.

Scene 6

Goal

Demonstrate scalability.

Scene 7

Goal

Convert visitor into customer.

---

# Dashboard Rules

Dashboards shown in animations must represent realistic TrackFarmOps functionality.

Never invent fake metrics.

Never use placeholder lorem ipsum.

Use believable agricultural data.

---

# Asset Rules

Every asset must have an identifier.

Example

UI-001

Expense Receipt

UI-002

Fuel Log

ILL-001

Farm Manager

BG-001

Rice Field

DASH-001

Overview Dashboard

Animations reference asset IDs.

Never duplicate assets unnecessarily.

---

# Code Standards

Strict TypeScript.

No any.

No deeply nested components.

Prefer composition.

Prefer reusable hooks.

Prefer reusable animation utilities.

---

# Performance Budget

Target

60 FPS

Largest Contentful Paint
< 2.5 s

Interaction to Next Paint
< 200 ms

Cumulative Layout Shift
< 0.1

JavaScript
Keep bundles minimal.

Lazy-load non-critical scenes.

Preload only hero assets.

---

# Responsive Behaviour

Desktop

Primary cinematic experience.

Tablet

Preserve narrative.

Reduce motion complexity.

Mobile

Prioritize readability.

Simplify particle counts.

Reduce animation density.

Avoid excessive pinned durations.

Maintain narrative consistency.

---

# Accessibility

Respect prefers-reduced-motion.

Every interaction must remain usable without animation.

Maintain WCAG AA contrast.

Keyboard navigation required.

Screen readers must understand page structure.

---

# Visual Consistency

Never mix illustration styles.

Never mix lighting styles.

Never mix icon systems.

Never introduce inconsistent border radii.

Never introduce random gradients.

Everything follows the Art Direction specification.

---

# Camera Language

Think like a cinematographer.

Allowed camera actions:

Push In

Pull Out

Pan

Parallax

Depth Shift

Focus Transition

Never simulate chaotic camera shake unless explicitly defined in the storyboard.

---

# AI Image Generation

Generated assets must follow the Art Direction document.

Consistency is more important than realism.

Maintain:

- Lighting
- Perspective
- Palette
- Composition
- Character proportions

across all generated assets.

---

# Do Not

❌ Build the whole page in one file.

❌ Hardcode animation values across components.

❌ Invent new scenes.

❌ Add unnecessary visual effects.

❌ Use stock SaaS illustrations.

❌ Animate for decoration.

❌ Sacrifice performance for aesthetics.

❌ Introduce libraries without approval.

---

# Always

✅ Keep animations modular.

✅ Keep code reusable.

✅ Keep scenes isolated.

✅ Profile performance.

✅ Test responsiveness.

✅ Maintain visual consistency.

✅ Preserve the emotional narrative.

---

# Definition of Done

A task is complete only when:

- The implementation matches the production specification.
- Animations run smoothly at target frame rates.
- The scene transitions naturally into the next.
- Assets follow the design system.
- Code passes linting and type checks.
- Accessibility requirements are satisfied.
- No regressions are introduced.

---

# Final Principle

Every commit should answer one question:

> "Does this implementation make the visitor feel that TrackFarmOps transforms farm management from chaos into clarity?"

If the answer is **no**, rethink the implementation before shipping.