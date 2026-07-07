# Best Practices
## Devin Engineering Standards

These principles apply to every implementation within the TrackFarmOps Landing Experience.

## Code Quality

- Write clean, readable, and maintainable code.
- Prefer composition over duplication.
- Keep components small and focused.
- Use strict TypeScript throughout.

## Architecture

- Follow the approved folder structure.
- Separate UI, animation, and business logic.
- Build reusable components and utilities.
- Respect domain boundaries.

## Animation

- Follow the GSAP patterns document.
- Use timelines instead of isolated tweens.
- Clean up all animations and ScrollTriggers.
- Keep motion purposeful and performant.

## Performance

- Prioritize 60 FPS interactions.
- Animate `transform` and `opacity` only where possible.
- Lazy-load non-critical assets.
- Minimize JavaScript execution.

## Responsive Design

- Build mobile-first.
- Adapt layouts and animations per breakpoint.
- Preserve the narrative across all screen sizes.

## Accessibility

- Use semantic HTML.
- Support keyboard navigation.
- Respect `prefers-reduced-motion`.
- Meet WCAG 2.2 AA standards.

## Git & Collaboration

- Make focused, atomic changes.
- Preserve existing functionality.
- Avoid unnecessary refactoring outside the task scope.
- Document significant implementation decisions.

## Output Standard

Every deliverable should be:

- Production-ready
- Fully functional
- Modular
- Well-structured
- Performant
- Accessible
- Consistent with the TrackFarmOps Production Bible