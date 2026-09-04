import { forwardRef } from 'react';
import { scenes } from './scenes';

const HeroBackdrop = forwardRef<HTMLDivElement>((_props, ref) => {
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
