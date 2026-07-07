# Scene 06 — Scale

## Objective

Implement **Scene 06** of the TrackFarmOps cinematic landing experience. This scene demonstrates how TrackFarmOps scales from managing a single farm to operating multiple farms, estates, and agricultural enterprises from one unified platform.

## Story

The analytics dashboard expands outward. One farm becomes many. Multiple farms connect into a single operational network, illustrating centralized management, standardization, and enterprise-scale visibility.

The visitor should understand that TrackFarmOps grows alongside the business.

## Requirements

Build only Scene 06.

Do **not** implement Scene 07 or any other scenes.

## Layout

- Full-screen pinned section
- Central enterprise dashboard
- Connected farm network radiating outward
- Clean, premium composition
- Responsive across all breakpoints

## Visual Elements

- Enterprise dashboard
- Multiple farm nodes
- Connection lines
- Warehouse nodes
- Fleet indicators
- Staff management overview
- Consolidated KPI cards
- Regional performance summary
- Real-time activity indicators

Use only approved assets from the Production Bible.

## Animation

Implement using GSAP + ScrollTrigger.

Include:

- Dashboard expansion
- Farm node generation
- Connection line drawing
- Network pulse animations
- KPI updates
- Camera zoom-out
- Subtle ambient motion

Motion should communicate growth, confidence, and operational scale.

## Scroll Behavior

- Pin the scene.
- Synchronize network expansion with scroll progress.
- End with the complete enterprise ecosystem visible before transitioning into Scene 07.

## Performance

- Animate GPU-friendly properties only.
- Reuse assets and animation patterns where possible.
- Maintain smooth performance across supported devices.

## Accessibility

- Respect `prefers-reduced-motion`.
- Present the network clearly without relying solely on animation.
- Ensure semantic structure and keyboard accessibility.

## Deliverables

Generate:

- React component(s)
- Enterprise network visualization
- GSAP timelines
- ScrollTrigger configuration
- Responsive implementation
- Cleanup logic

## Success Criteria

The completed scene should:

- Clearly communicate scalability.
- Demonstrate enterprise-ready capabilities.
- Maintain visual simplicity despite increased complexity.
- Transition naturally into Scene 07.
- Be production-ready and fully aligned with the TrackFarmOps Production Bible.