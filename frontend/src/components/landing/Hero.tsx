import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import { scenes } from './hero/scenes';
import HeroBackdrop from './hero/HeroBackdrop';
import HeroScene from './hero/HeroScene';
import PhoneComposite from './hero/PhoneComposite';
import ProgressRail from './hero/ProgressRail';

const Hero = () => {
  const root = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [showScrollCue, setShowScrollCue] = useState(true);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const sceneCount = scenes.length;

      // Master timeline: duration = sceneCount (5 units, one per scene)
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: `+=${sceneCount * 100}%`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            triggerRef.current = self;
            const progress = self.progress;
            const sceneIdx = Math.min(Math.floor(progress * sceneCount), sceneCount - 1);
            setActiveScene(sceneIdx);
            setShowScrollCue(progress < 0.05);
          },
        },
      });

      // Per-scene: image crossfade + scale, text enter/hold/exit
      // Crossfade values in scenes.ts are scroll-fractions (0–1); scale to timeline units (×sceneCount)
      scenes.forEach((scene, i) => {
        const sceneStart = i;
        const sceneDuration = 1;
        const cfStart = scene.crossfadeStart * sceneCount;
        const cfEnd = scene.crossfadeEnd * sceneCount;

        // --- Image opacity (crossfade) ---
        const img = el.querySelector<HTMLImageElement>(`[data-hero-bg="${i}"]`);
        if (img) {
          if (i === 0) {
            tl.to(
              img,
              { opacity: 0, duration: cfEnd - cfStart },
              cfStart
            );
          } else {
            const incomingStart = scenes[i - 1].crossfadeStart * sceneCount;
            const incomingEnd = scenes[i - 1].crossfadeEnd * sceneCount;
            tl.to(
              img,
              { opacity: 1, duration: incomingEnd - incomingStart, ease: 'power2.out' },
              incomingStart
            );
            if (i < sceneCount - 1) {
              tl.to(
                img,
                { opacity: 0, duration: cfEnd - cfStart },
                cfStart
              );
            }
          }

          // --- Image scale (parallax) ---
          tl.fromTo(
            img,
            { scale: scene.scaleFrom },
            { scale: scene.scaleTo, duration: sceneDuration, ease: 'power1.inOut' },
            sceneStart
          );

          // --- Image y drift ---
          if (scene.yDrift !== '0vh') {
            tl.fromTo(
              img,
              { y: '0vh' },
              { y: scene.yDrift, duration: sceneDuration, ease: 'none' },
              sceneStart
            );
          }
        }

        // --- Scrim crossfade (matches image) ---
        const scrim = el.querySelector(`[data-hero-scrim="${i}"]`);
        if (scrim) {
          if (i === 0) {
            tl.to(
              scrim,
              { opacity: 0, duration: cfEnd - cfStart },
              cfStart
            );
          } else {
            const incomingStart = scenes[i - 1].crossfadeStart * sceneCount;
            const incomingEnd = scenes[i - 1].crossfadeEnd * sceneCount;
            tl.to(
              scrim,
              { opacity: 1, duration: incomingEnd - incomingStart, ease: 'power2.out' },
              incomingStart
            );
            if (i < sceneCount - 1) {
              tl.to(
                scrim,
                { opacity: 0, duration: cfEnd - cfStart },
                cfStart
              );
            }
          }
        }

        // --- Text block enter/hold/exit ---
        const textEl = el.querySelector(`[data-hero-text="${i}"]`);
        if (textEl) {
          const enterStart = i === 0 ? 0 : sceneStart + 0.15;
          const enterDuration = 0.15;
          const exitStart = i === 0 ? sceneStart + 0.50 : i === 3 ? sceneStart + 0.80 : i === 1 ? sceneStart + 0.82 : sceneStart + 0.70;
          const exitDuration = i === 0 ? 0.30 : 0.30;

          if (i === 0) {
            // Scene 1: animate children in on mount (separate timeline)
            const enterTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            enterTl
              .from('[data-hero-element="title"] > span', { opacity: 0, y: 60, duration: 0.8, stagger: 0.12 })
              .from('[data-hero-element="body"]', { opacity: 0, y: 24, duration: 0.65 }, '-=0.35')
              .from('[data-hero-element="chips"] > div', { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 }, '-=0.25')
              .from('[data-hero-element="actions"]', { opacity: 0, y: 18, duration: 0.55 }, '-=0.15')
              .from('[data-hero-element="proof"]', { opacity: 0, y: 16, duration: 0.5 }, '-=0.15')
              .from('[data-hero-element="stats"] > div', { opacity: 0, y: 30, duration: 0.55, stagger: 0.1 }, '-=0.15');

            // Scene 1 exit — earlier so text is gone before image 2 fades in
            tl.to(textEl, { opacity: 0, y: -30, duration: exitDuration, ease: 'power2.in' }, exitStart);
            tl.to(textEl, { pointerEvents: 'none', duration: 0.01 }, exitStart);
          } else {
            // Scenes 2-5: opacity + y driven by scroll, delayed entry so image is fully visible first
            tl.fromTo(
              textEl,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: enterDuration, ease: 'power3.out' },
              enterStart
            );
            tl.to(textEl, { pointerEvents: 'auto', duration: 0.01 }, enterStart + enterDuration);

            // Exit
            tl.to(textEl, { opacity: 0, y: -30, duration: exitDuration, ease: 'power2.in' }, exitStart);
            tl.to(textEl, { pointerEvents: 'none', duration: 0.01 }, exitStart + exitDuration);
          }
        }

        // --- Scene 2: progress line draw ---
        if (scene.showProgressLine) {
          const progressLine = el.querySelector('[data-hero-element="progress-line"]');
          if (progressLine) {
            tl.fromTo(
              progressLine,
              { width: '0%' },
              { width: '100%', duration: 0.50, ease: 'power1.inOut' },
              sceneStart + 0.15
            );
          }
        }

        // --- Scene 2: problems stagger ---
        if (scene.showProblems) {
          const problemItems = el.querySelectorAll('[data-hero-element="problems"] > div');
          if (problemItems.length) {
            tl.from(
              problemItems,
              { opacity: 0, x: -20, duration: 0.06 * problemItems.length, stagger: 0.06, ease: 'power2.out' },
              sceneStart + 0.15
            );
          }
        }

        // --- Scene 3: solutions stagger ---
        if (scene.showSolutions) {
          const solutionPills = el.querySelectorAll('[data-hero-element="solutions"] > div');
          if (solutionPills.length) {
            tl.from(
              solutionPills,
              { opacity: 0, scale: 0.9, duration: 0.05 * solutionPills.length, stagger: 0.05, ease: 'power2.out' },
              sceneStart + 0.15
            );
          }
        }

        // --- Scene 4: features stagger (compressed so all 4 appear before text exits) ---
        if (scene.features) {
          const featureItems = el.querySelectorAll('[data-hero-element="features"] > div');
          if (featureItems.length) {
            tl.from(
              featureItems,
              { opacity: 0, x: 20, duration: 0.12, stagger: 0.15, ease: 'power2.out' },
              sceneStart + 0.20
            );
          }
        }

        // --- Scene 4: phone composite fade in + dashboard slides ---
        if (scene.showPhoneComposite && phoneRef.current) {
          // Fade in the phone frame with first feature
          tl.to(phoneRef.current, { opacity: 1, duration: 0.15, ease: 'power2.out' }, sceneStart + 0.20);
          // Fade out with text exit
          tl.to(phoneRef.current, { opacity: 0, duration: 0.20, ease: 'power2.in' }, sceneStart + 0.80);

          // Dashboard slides sync with features (0.20, 0.35, 0.50)
          const dashes = phoneRef.current.querySelectorAll('[data-dash]');
          dashes.forEach((dash, dashIdx) => {
            const dashProgress = sceneStart + 0.20 + dashIdx * 0.15;
            tl.to(dash, { opacity: 1, duration: 0.12, ease: 'power2.out' }, dashProgress);
            if (dashIdx < dashes.length - 1) {
              tl.to(dash, { opacity: 0, duration: 0.10, ease: 'power2.in' }, dashProgress + 0.15);
            }
          });
        }
      });

      // --- Scene 5: final CTA pulse (idle loop) ---
      const finalCta = el.querySelector('[data-hero-element="final-cta"] a');
      if (finalCta) {
        gsap.to(finalCta, {
          scale: 1.03,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // --- Orbs idle animation ---
      gsap.to('[data-hero="orb-one"]', {
        x: 55, y: -35, scale: 1.13, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
      gsap.to('[data-hero="orb-two"]', {
        x: -45, y: 30, scale: 0.92, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
    }, root);

    // Refresh ScrollTrigger so downstream sections recalculate after hero pin
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  const scrollToScene = (sceneIndex: number) => {
    const st = triggerRef.current;
    if (st) {
      const targetScroll = st.start + (sceneIndex / scenes.length) * (st.end - st.start);
      gsap.to(window, { scrollTo: targetScroll, duration: 1.2, ease: 'power2.inOut' });
    }
  };

  const isReduced = typeof window !== 'undefined' && prefersReducedMotion();

  return (
    <section
      id="hero"
      ref={root}
      className="relative isolate bg-slate-950 text-white"
      style={{ minHeight: isReduced ? 'auto' : '100vh' }}
    >
      {/* z-0: solid fallback */}
      <div className="absolute inset-0 bg-slate-950" style={{ zIndex: 0 }} />

      {/* z-10: backdrop images */}
      <HeroBackdrop ref={backdropRef} />

      {/* z-20: cinematic vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 20,
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(2,6,23,0.55) 100%)',
        }}
      />

      {/* z-25: per-scene directional scrims */}
      {scenes.map((scene, i) => (
        <div
          key={`scrim-${scene.id}`}
          data-hero-scrim={i}
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 25,
            background: scene.scrim,
            opacity: i === 0 ? 1 : 0,
          }}
        />
      ))}

      {/* z-30: grid texture */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{ zIndex: 30 }}
      />

      {/* z-35: orbs */}
      <div
        data-hero="orb-one"
        className="pointer-events-none absolute -right-32 top-24 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl"
        style={{ zIndex: 35 }}
      />
      <div
        data-hero="orb-two"
        className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-lime-300/15 blur-3xl"
        style={{ zIndex: 35 }}
      />

      {/* z-36: Phone composite (Scene 4) */}
      <PhoneComposite ref={phoneRef} />

      {/* z-40: Text/UI layers — one per scene */}
      {scenes.map((scene, i) => (
        <HeroScene key={scene.id} scene={scene} index={i} onSeeHowItWorks={() => scrollToScene(1)} />
      ))}

      {/* z-50: Progress rail */}
      <ProgressRail activeScene={activeScene} onJump={scrollToScene} />

      {/* z-50: Scroll cue */}
      {showScrollCue && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 z-50 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-white/60 lg:flex">
          <span>Explore</span>
          <ArrowDown className="h-4 w-4 animate-bob" />
        </div>
      )}
    </section>
  );
};

export default Hero;
