# Best Practices
## Windsurf Development Standards

Apply these principles to every task within the TrackFarmOps Landing Experience.

## Code Quality

- Write clean, readable, production-ready code.
- Prefer reusable components over duplication.
- Keep files focused on a single responsibility.
- Use strict TypeScript practices.

## Architecture

- Follow the approved folder structure.
- Respect domain boundaries.
- Separate UI, animation, and application logic.
- Reuse shared utilities and hooks where appropriate.

## Animation

- Follow the GSAP patterns document.
- Build animations with timelines.
- Clean up all timelines and ScrollTriggers.
- Keep motion purposeful and lightweight.

## Performance

- Target smooth 60 FPS interactions.
- Animate only GPU-friendly properties where possible.
- Lazy-load non-critical resources.
- Avoid unnecessary re-renders and expensive computations.

## Responsive Design

- Build mobile-first.
- Adapt layouts and animations across breakpoints.
- Preserve the same narrative on every device.

## Accessibility

- Use semantic HTML.
- Ensure keyboard accessibility.
- Respect `prefers-reduced-motion`.
- Meet WCAG 2.2 AA standards.

## Collaboration

- Stay within the requested scope.
- Preserve existing functionality.
- Avoid unnecessary architectural changes.
- Keep implementations consistent with the Production Bible.

## Output Standard

Every deliverable should be:

- Production-ready
- Modular
- Performant
- Accessible
- Responsive
- Easy to maintain
- Fully aligned with the TrackFarmOps Production Bible