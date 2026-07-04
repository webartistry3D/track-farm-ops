# Scene 05 — Analytics & Intelligence

## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Scene ID: SCENE-05
> Timeline: `scene05Timeline`
> Feature Timeline: `analyticsTimeline`
> Owner: WebArtistry Creations

---

# Scene Purpose

Demonstrate how TrackFarmOps transforms operational data into actionable business intelligence.

The visitor should understand that the platform doesn't simply collect information—it helps farm owners and managers make faster, smarter and more profitable decisions.

---

# Narrative Objective

Answer one question:

**How do I know if my farm is improving?**

The answer is presented through meaningful analytics that emerge naturally from completed farm operations.

Every chart, KPI and trend must originate from real activities completed in Scene 04.

---

# Emotional Progression

```
Understanding

↓

Confidence

↓

Insight

↓

Control

↓

Strategic Thinking

↓

Ambition
```

The visitor should begin thinking beyond today's tasks and toward long-term farm growth.

---

# Duration

Scroll Distance

170vh

Pinned

Yes

Estimated Timeline

18–22 seconds

---

# Environment

The operational interface gently transitions into an executive analytics workspace.

The farm remains subtly visible in the background through soft imagery and abstract field geometry.

Technology never loses its connection to agriculture.

---

# Primary Subject

Analytics Dashboard

The dashboard should feel like an executive command center rather than an accounting application.

It should prioritize clarity over visual complexity.

---

# Core Story

Operations create data.

Data becomes insight.

Insight improves decisions.

Better decisions improve the farm.

This is the value chain the visitor should experience.

---

# Dashboard Sections

Executive KPIs

Revenue

Operating Expenses

Net Profit

Harvest Yield

Inventory Value

Worker Productivity

Equipment Utilization

Task Completion

Crop Health Score

Warehouse Capacity

Forecast Accuracy

Trend Visualizations

Revenue Growth

Expense Trend

Yield Progress

Inventory Movement

Productivity Trend

Harvest Forecast

Operational Intelligence

Upcoming Risks

Recommended Actions

Weather Impact

Low Inventory Alerts

Delayed Tasks

Equipment Service Reminder

---

# Camera Language

The camera becomes more stable than previous scenes.

Movement is minimal.

Instead of cinematic motion, emphasis shifts to information hierarchy.

Subtle zooms guide attention from one insight to another.

---

# Motion Choreography

## Phase 1 — KPI Emergence (0–20%)

Executive KPI cards appear.

Numbers begin at zero.

Values increase smoothly.

Small indicators confirm healthy performance.

---

## Phase 2 — Trend Formation (20–45%)

Charts draw themselves.

Trend lines extend naturally.

Bar charts rise.

Progress rings complete.

Every animation represents accumulated operational data.

---

## Phase 3 — Intelligence Layer (45–70%)

Recommendations appear.

Warnings highlight gently.

Forecast models activate.

The platform begins explaining the data rather than merely displaying it.

---

## Phase 4 — Decision Support (70–90%)

The dashboard highlights relationships.

Example:

Higher worker attendance

↓

Improved harvest output

↓

Higher warehouse inventory

↓

Revenue growth

The visitor sees cause and effect.

---

## Phase 5 — Strategic View (90–100%)

The interface settles.

Only subtle live updates remain.

The dashboard now feels like a trusted decision-making companion.

---

# Typography

Headline

Every Decision Backed by Data.

Supporting Copy

TrackFarmOps transforms day-to-day farm operations into actionable insights, helping you improve productivity, reduce waste and plan with confidence.

CTA

See Your Farm Clearly

Typography should remain concise and support the analytics.

---

# Motion Philosophy

Motion communicates understanding.

Charts should never animate for decoration.

Every reveal should reinforce a business outcome.

Animation exists to clarify—not impress.

---

# GSAP Timeline Architecture

```
scene05Timeline

↓

analyticsIntro()

↓

kpiReveal()

↓

counterAnimation()

↓

chartDraw()

↓

forecastReveal()

↓

recommendationReveal()

↓

dashboardIdle()

↓

transitionOut()
```

Every section remains independently testable.

---

# Feature Timeline

```
analyticsTimeline

├── executiveKpis()
├── revenueTrend()
├── expenseTrend()
├── yieldAnalytics()
├── inventoryMovement()
├── productivityMetrics()
├── forecastEngine()
├── recommendationCards()
└── analyticsIdle()
```

All animations must correspond to genuine product capabilities.

---

# ScrollTrigger

Trigger

Scene container

Start

top top

End

+=170%

Pin

True

Scrub

1

Invalidate On Refresh

True

---

# Animation Specifications

KPI Cards

Opacity

0 → 1

Translate Y

20px → 0

Counters

Smooth numeric interpolation.

No slot-machine effects.

Charts

SVG path drawing.

Area fills fade in after line completion.

Progress Rings

Clockwise draw.

Forecast Cards

Slide and fade simultaneously.

Recommendation Cards

Reveal one after another using staggered timing.

---

# Analytics Principles

Every metric must:

Be believable.

Reflect commercial rice farming.

Relate to an operational event.

Support decision-making.

Avoid meaningless placeholder values.

---

# Asset Dependencies

Executive Dashboard

KPI Cards

Charts

Forecast Widgets

Recommendation Cards

Notification Components

Icons

Trend Indicators

All assets must comply with:

Asset Bible

SVG Library

UI Language

Design Tokens

Motion Tokens

---

# Performance Budget

Maximum animated charts

5

Maximum simultaneous counters

8

Maximum active tweens

20

Target FPS

60

Prefer SVG animations over raster effects.

---

# Mobile Adaptation

Prioritize:

Executive KPIs

Revenue

Yield

Tasks

Recommendations

Convert multi-column analytics into stacked cards.

Reduce simultaneous chart animations.

Preserve narrative sequence.

---

# Accessibility

Reduced Motion

Replace:

Counter animations

↓

Instant values

Chart drawing

↓

Static charts

Forecast transitions

↓

Simple fades

Analytics must remain fully understandable without animation.

---

# Transition to Scene 06

The analytics dashboard begins highlighting multiple farms.

Regional comparisons appear.

Performance summaries expand beyond a single operation.

Connection lines emerge.

The camera slowly pulls back.

The visitor realizes the platform isn't limited to one farm.

It is built to manage an entire agricultural network.

---

# Scene Completion Criteria

✓ KPIs originate from operational events.

✓ Charts remain readable.

✓ Insights feel actionable.

✓ Dashboard maintains visual calm.

✓ Cause-and-effect relationships are clear.

✓ Visitor understands the value of analytics.

---

# Engineering Notes

Do not animate every number continuously.

Use restraint.

A stable dashboard inspires confidence.

Charts should reveal information progressively rather than overwhelming the visitor.

The focus is understanding—not spectacle.

---

# Director's Intent

This scene should feel like walking into the office of a highly organized farm owner who always knows exactly what is happening across the business.

The software is no longer simply recording operations.

It is helping leaders think strategically.

The visitor should leave this scene believing:

**TrackFarmOps doesn't just show me my farm.**

**It helps me run it better.**