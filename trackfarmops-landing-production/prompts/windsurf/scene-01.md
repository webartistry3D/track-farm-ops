# Scene 01 — The Calm Before the Storm

## Objective

Implement **Scene 01** of the TrackFarmOps cinematic landing experience. This is the opening scene and must establish an immediate emotional connection with the user while setting the visual tone for the entire experience.

## Story

A peaceful Nigerian rice farm at sunrise. Everything appears calm and productive. The farm manager stands confidently overlooking the fields. The scene communicates optimism, hard work, and potential before the hidden operational challenges begin to emerge.

The scene should naturally transition into Scene 02 (Chaos).

## Requirements

Build only Scene 01.

Do **not** implement any other scenes.

## Layout

- Full-screen pinned hero section
- Cinematic composition
- Layered environment for depth
- Minimal navigation
- Centered hero content
- Responsive across all breakpoints

## Visual Elements

- Sunrise over rice fields
- Farm manager illustration
- Rice crops
- Dirt pathway
- Warehouse silhouette
- Tractor silhouette
- Soft atmospheric haze
- Floating TrackFarmOps logo
- Primary CTA
- Secondary CTA

Use assets defined in the Production Bible.

## Animation

Implement using GSAP + ScrollTrigger.

Include:

- Slow camera push-in
- Gentle crop movement
- Subtle cloud drift
- Light atmospheric particles
- Soft logo reveal
- Sequential text reveal
- CTA fade-up
- Scroll indicator animation

Motion should feel calm, cinematic, and intentional.

## Scroll Behavior

- Pin the scene.
- Scrub animations smoothly.
- Prepare a seamless transition into Scene 02.
- Do not introduce abrupt motion.

## Performance

- Animate only GPU-friendly properties.
- Lazy-load non-critical assets.
- Keep 60 FPS on target devices.

## Accessibility

- Respect `prefers-reduced-motion`.
- Use semantic HTML.
- Ensure keyboard-accessible CTAs.
- Provide descriptive alt text for meaningful imagery.

## Deliverables

Generate:

- React component(s)
- GSAP timeline
- ScrollTrigger configuration
- Responsive layout
- Clean TypeScript implementation
- Appropriate cleanup logic

## Success Criteria

The completed scene should:

- Immediately communicate quality and trust.
- Feel cinematic rather than promotional.
- Establish the TrackFarmOps visual identity.
- Transition naturally into Scene 02.
- Be production-ready and fully aligned with the TrackFarmOps Production Bible.