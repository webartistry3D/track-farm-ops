# Scene 04 — Farm Lifecycle

## Objective

Implement **Scene 04** of the TrackFarmOps cinematic landing experience. This scene demonstrates how TrackFarmOps manages the complete farm lifecycle through a unified digital workflow.

## Story

With the dashboard fully assembled, the camera transitions into an interactive lifecycle visualization. The visitor follows the journey of a farming season—from planning to harvest—showing that every stage is connected and managed within a single platform.

The emphasis is on continuity, visibility, and operational control.

## Requirements

Build only Scene 04.

Do **not** implement Scene 05 or subsequent scenes.

## Layout

- Full-screen pinned section
- Centered lifecycle visualization
- Dashboard remains subtly present as contextual background
- Horizontal layout on desktop
- Vertical timeline on mobile

## Lifecycle Stages

- Farm Setup
- Land Preparation
- Planting
- Fertilizer Application
- Irrigation
- Field Operations
- Harvest
- Storage
- Sales & Distribution

Use the approved lifecycle model from the Production Bible.

## Visual Elements

- Lifecycle timeline
- Connected stage nodes
- Animated progress line
- Farm activity illustrations
- Status indicators
- Completion checkpoints
- Supporting dashboard highlights

## Animation

Implement using GSAP + ScrollTrigger.

Include:

- Timeline drawing animation
- Sequential stage activation
- Progress line movement
- Camera tracking
- Active node highlighting
- Dashboard synchronization
- Smooth transitions between stages

Motion should communicate flow, organization, and operational continuity.

## Scroll Behavior

- Pin the scene.
- Advance through each lifecycle stage based on scroll progress.
- Complete the lifecycle before transitioning into Scene 05.

## Performance

- Use lightweight SVG animations where possible.
- Animate GPU-friendly properties only.
- Keep interactions smooth across all supported devices.

## Accessibility

- Respect `prefers-reduced-motion`.
- Ensure the lifecycle remains understandable without animation.
- Use semantic structure and accessible labels.

## Deliverables

Generate:

- React component(s)
- Lifecycle visualization
- GSAP timelines
- ScrollTrigger configuration
- Responsive implementation
- Cleanup logic

## Success Criteria

The completed scene should:

- Clearly communicate the end-to-end farm lifecycle.
- Demonstrate TrackFarmOps as a unified operational platform.
- Maintain the cinematic flow established by previous scenes.
- Transition naturally into Scene 05.
- Be production-ready and fully aligned with the TrackFarmOps Production Bible.