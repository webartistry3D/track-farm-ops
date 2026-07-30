import { useRef } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

/**
 * Wraps content and gently pulls it toward the cursor for a premium,
 * tactile feel. Falls back to a static wrapper when reduced motion is on.
 */
const MagneticButton = ({
  children,
  className,
  strength = 0.4,
}: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.6,
      ease: 'power3.out',
    });
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <div
      ref={ref}
      className={`inline-block ${className ?? ''}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
};

export default MagneticButton;
