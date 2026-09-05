import { useLayoutEffect, useRef } from 'react';
import type { ElementType, ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

export type RevealDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'appear'
  | 'scale'
  | 'zoom';

interface RevealProps {
  children: ReactNode;
  /** Animation entrance direction */
  direction?: RevealDirection;
  /** Delay before the animation starts (seconds) */
  delay?: number;
  /** Animation duration (seconds) */
  duration?: number;
  /** Travel distance in px for slide directions */
  distance?: number;
  /**
   * When set, direct children are animated one-by-one with this stagger (seconds).
   * Ideal for card grids and lists.
   */
  stagger?: number;
  /** Only animate the first time it enters the viewport */
  once?: boolean;
  /** ScrollTrigger start position, defaults to 'top 85%' */
  start?: string;
  className?: string;
  as?: ElementType;
  style?: React.CSSProperties;
}

const getOffset = (direction: RevealDirection, distance: number) => {
  switch (direction) {
    case 'up':
      return { y: distance };
    case 'down':
      return { y: -distance };
    case 'left':
      return { x: distance };
    case 'right':
      return { x: -distance };
    case 'scale':
      return { scale: 0.85 };
    case 'zoom':
      return { scale: 1.15 };
    case 'appear':
    default:
      return {};
  }
};

const Reveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.9,
  distance = 60,
  stagger,
  once = true,
  start = 'top 85%',
  className,
  as: Tag = 'div',
  style,
}: RevealProps) => {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(stagger ? el.children : el, { opacity: 1, clearProps: 'all' });
      return;
    }

    const ctx = gsap.context(() => {
      const targets = stagger ? el.children : el;
      const from = {
        opacity: 0,
        ...getOffset(direction, distance),
      };

      gsap.set(targets, from);

      gsap.to(targets, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration,
        delay,
        ease: 'power3.out',
        stagger: stagger || 0,
        scrollTrigger: once
          ? {
              trigger: el,
              start,
              toggleActions: 'play none none none',
            }
          : {
              trigger: el,
              start,
              end: 'bottom 60%',
              scrub: 1,
            },
      });
    }, ref);

    return () => ctx.revert();
  }, [direction, delay, duration, distance, stagger, once, start]);

  return (
    <Tag ref={ref as never} className={className} style={style}>
      {children}
    </Tag>
  );
};

export default Reveal;
