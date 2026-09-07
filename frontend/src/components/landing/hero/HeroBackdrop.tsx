import { forwardRef } from 'react';
import { scenes } from './scenes';

const HeroBackdrop = forwardRef<HTMLDivElement>((_props, ref) => {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" style={{ zIndex: 10 }}>
      {scenes.map((scene, i) => (
        <img
          key={scene.id}
          data-hero-bg={i}
          src={scene.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: i === 0 ? 1 : 0,
            transformOrigin: scene.scaleOrigin,
            transform: isMobile ? 'none' : 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            willChange: 'opacity, transform',
          }}
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchPriority={i === 0 ? 'high' : 'low'}
        />
      ))}
    </div>
  );
});

HeroBackdrop.displayName = 'HeroBackdrop';
export default HeroBackdrop;
