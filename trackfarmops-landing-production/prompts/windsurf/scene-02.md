# Scene 02 — Chaos

## Objective

Implement **Scene 02** of the TrackFarmOps cinematic landing experience. This scene reveals the hidden complexity of manual farm management and creates the emotional tension that motivates the need for TrackFarmOps.

## Story

The peaceful farm transforms into controlled chaos. Around the farm manager, receipts, invoices, worker attendance sheets, inventory cards, fuel logs, WhatsApp messages, harvest records, calculators, and other operational documents begin orbiting rapidly, representing fragmented farm operations.

The user should immediately feel overwhelmed—but the motion must remain elegant and readable.

## Requirements

Build only Scene 02.

Do **not** implement Scene 03 or any transition beyond the documented handoff.

## Layout

- Full-screen pinned section
- Farm manager remains centered
- Orbiting documents arranged in multiple depth layers
- Darker, more dramatic atmosphere
- Minimal supporting text

## Visual Elements

- Farm manager
- Receipts
- Fertilizer invoices
- Worker attendance sheets
- Inventory cards
- Fuel logs
- WhatsApp notifications
- Harvest records
- Calculator
- Expense ledger
- Floating warning indicators

Use only approved assets from the Production Bible.

## Animation

Implement using GSAP + ScrollTrigger.

Include:

- Orbiting document system
- Layered parallax motion
- Rotation at varying speeds
- Floating UI notifications
- Camera push-in
- Atmospheric particles
- Escalating motion intensity
- Subtle shake as chaos reaches its peak

Movement should feel intentional, not random.

## Scroll Behavior

- Pin the scene.
- Gradually increase motion as the user scrolls.
- End with all elements converging toward the center, preparing for Scene 03.

## Performance

- Use transform and opacity animations.
- Reuse assets where possible.
- Maintain smooth performance on mobile and desktop.

## Accessibility

- Respect `prefers-reduced-motion`.
- Preserve narrative without complex motion.
- Maintain semantic structure and keyboard accessibility.

## Deliverables

Generate:

- React component(s)
- GSAP timelines
- Orbit animation system
- ScrollTrigger configuration
- Responsive implementation
- Cleanup logic

## Success Criteria

The completed scene should:

- Clearly communicate operational chaos.
- Build emotional tension without overwhelming the user.
- Maintain visual clarity despite multiple animated elements.
- Transition seamlessly into Scene 03.
- Be production-ready and fully aligned with the TrackFarmOps Production Bible.