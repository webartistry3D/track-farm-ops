# Scene 05 — Analytics

## Objective

Implement **Scene 05** of the TrackFarmOps cinematic landing experience. This scene demonstrates how TrackFarmOps transforms operational data into actionable business intelligence.

## Story

As the farm lifecycle completes, the interface shifts into an analytics command center. Charts, KPIs, trends, and insights animate into view, showing that every farm activity is converted into meaningful decisions.

The message is simple: **TrackFarmOps doesn't just collect data—it helps farmers make better decisions.**

## Requirements

Build only Scene 05.

Do **not** implement Scene 06 or subsequent scenes.

## Layout

- Full-screen pinned section
- Dashboard-centered composition
- Analytics panels arranged around the primary dashboard
- Minimal supporting copy
- Responsive across all breakpoints

## Visual Elements

- KPI cards
- Revenue chart
- Yield trend chart
- Expense breakdown
- Inventory summary
- Worker productivity metrics
- Farm health indicators
- AI insights panel
- Recommendation cards

Use only approved assets from the Production Bible.

## Animation

Implement using GSAP + ScrollTrigger.

Include:

- Dashboard transition
- Chart drawing animations
- KPI counter animations
- Card reveal sequence
- Active data highlights
- AI recommendation reveal
- Subtle dashboard glow

Motion should feel intelligent, precise, and data-driven.

## Scroll Behavior

- Pin the scene.
- Reveal analytics progressively with scroll.
- Finish with the complete analytics dashboard before transitioning to Scene 06.

## Performance

- Animate using GPU-friendly properties.
- Optimize chart animations.
- Maintain smooth 60 FPS performance.

## Accessibility

- Respect `prefers-reduced-motion`.
- Ensure charts have accessible summaries.
- Maintain semantic HTML and keyboard accessibility.

## Deliverables

Generate:

- React component(s)
- Analytics dashboard
- GSAP timelines
- ScrollTrigger configuration
- Responsive implementation
- Cleanup logic

## Success Criteria

The completed scene should:

- Showcase TrackFarmOps as an intelligent decision-making platform.
- Present data in a clear and engaging way.
- Reinforce user confidence in the product.
- Transition seamlessly into Scene 06.
- Be production-ready and fully aligned with the TrackFarmOps Production Bible.