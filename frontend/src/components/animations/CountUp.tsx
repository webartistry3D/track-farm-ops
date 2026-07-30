import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const CountUp = ({
  end,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const format = (v: number) =>
      `${prefix}${v.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

    if (prefersReducedMotion()) {
      el.textContent = format(end);
      return;
    }

    const counter = { value: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        value: end,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
        onUpdate: () => {
          el.textContent = format(counter.value);
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [end, duration, decimals, prefix, suffix]);

  return <span ref={ref} className={className}>{`${prefix}0${suffix}`}</span>;
};

export default CountUp;
