import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import Reveal from '../animations/Reveal';
import IconFeatureCard from './IconFeatureCard';
import { benefits } from './content';

const BenefitsSection = () => {
  const root = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useLayoutEffect(() => {
    const el = root.current;
    const cards = cardsRef.current;
    if (!el || !cards || prefersReducedMotion()) return;

    const cardEls = cards.querySelectorAll('[data-benefit-card]');
    const orbEls = el.querySelectorAll('[data-benefit-orb]');

    const ctx = gsap.context(() => {
      const row1Cards = Array.from(cardEls).slice(0, 3);
      const row2Cards = Array.from(cardEls).slice(3, 6);

      // Measure row 1 card height to calculate overlap distance
      const row1Height = (row1Cards[0] as HTMLElement)?.offsetHeight ?? 280;
      // Overlap so only icon + title of row 1 remain visible (~45% of card)
      const overlapY = -(row1Height * 0.55);

      // Row 1 cards: fade in during normal scroll (no pin)
      gsap.from(row1Cards, {
        opacity: 0,
        y: 60,
        scale: 0.92,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cards,
          start: 'top 80%',
          once: true,
        },
      });

      // Row 2 cards: hidden initially, animate during pin
      gsap.set(row2Cards, { opacity: 0, y: row1Height + 60, scale: 0.92, zIndex: 20 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'center center',
          end: '+=100%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            setActiveIndex(self.progress > 0.1 ? 1 : 0);
          },
        },
      });

      // Row 2 cards slide up and overlap row 1
      row2Cards.forEach((card, i) => {
        tl.to(
          card,
          { opacity: 1, y: overlapY, scale: 1, duration: 0.25, ease: 'power2.inOut' },
          i * 0.06
        );
      });

      // Parallax background drift
      if (bgRef.current) {
        tl.to(
          bgRef.current,
          { y: -40, duration: 1, ease: 'none' },
          0
        );
      }

      // Orbs drift
      orbEls.forEach((orb, i) => {
        gsap.to(orb, {
          x: i % 2 === 0 ? 40 : -40,
          y: i % 2 === 0 ? -30 : 25,
          duration: 8 + i * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, root);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  const isReduced = typeof window !== 'undefined' && prefersReducedMotion();

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden bg-gradient-to-b from-emerald-50 to-white"
      style={{ minHeight: isReduced ? 'auto' : '100vh' }}
    >
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-[url('/confidence.png')] bg-cover bg-fixed bg-center opacity-20"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/90 via-white/80 to-white" />

      {/* Orbs */}
      <div
        data-benefit-orb
        className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl"
      />
      <div
        data-benefit-orb
        className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-lime-200/50 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <span className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Made for growth
          </span>
          <h2 className="font-jetbrains-mono text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
            Transform your farm into a high-performing business.
          </h2>
        </Reveal>

        {/* Cards grid */}
        <div ref={cardsRef} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} data-benefit-card className="h-full">
              <IconFeatureCard item={benefit} />
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        {!isReduced && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {[0, 1].map((i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i <= activeIndex
                    ? 'w-8 bg-emerald-500'
                    : 'w-2 bg-emerald-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BenefitsSection;
