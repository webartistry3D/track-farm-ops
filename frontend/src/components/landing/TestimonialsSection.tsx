import { useLayoutEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import Reveal from '../animations/Reveal';
import { testimonials } from './content';

const TestimonialCard = ({
  testimonial,
}: {
  testimonial: (typeof testimonials)[number];
}) => (
  <article
    className="flex w-[320px] shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:w-[370px]"
  >
    <div className="flex gap-1 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-current" />
      ))}
    </div>
    <blockquote className="mt-5 text-sm leading-7 text-slate-600">"{testimonial.quote}"</blockquote>
    <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
      <img src={testimonial.avatar} alt={testimonial.name} className="h-10 w-10 rounded-full object-cover" />
      <div>
        <p className="text-sm font-bold text-slate-900">{testimonial.name}</p>
        <p className="text-xs text-slate-500">{testimonial.role}</p>
      </div>
    </div>
  </article>
);

const TestimonialsSection = () => {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useLayoutEffect(() => {
    const el = root.current;
    const track = trackRef.current;
    if (!el || !track || prefersReducedMotion()) return;

    const orbEls = el.querySelectorAll('[data-testimonial-orb]');

    const cardEls = track.querySelectorAll('[data-testimonial-card]');

    const ctx = gsap.context(() => {
      // Orbs drift (always)
      orbEls.forEach((orb, i) => {
        gsap.to(orb, {
          x: i % 2 === 0 ? 50 : -50,
          y: i % 2 === 0 ? -20 : 30,
          duration: 10 + i * 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Pinned horizontal reel — vertical scroll drives horizontal card movement
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=400%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * testimonials.length),
              testimonials.length - 1
            );
            setActiveIndex((prev) => (prev !== idx ? idx : prev));
          },
        },
      });

      // Horizontal reel movement — add right padding so last card fully enters viewport
      const trackWidth = track.scrollWidth;
      const viewportWidth = el.offsetWidth;
      const maxScroll = Math.max(0, trackWidth - viewportWidth + 40);

      tl.to(track, {
        x: -maxScroll,
        duration: 1,
        ease: 'none',
      });

      // Per-card opacity/scale driven by scroll — smooth active/inactive transitions
      const segSize = 1 / testimonials.length;
      cardEls.forEach((card, i) => {
        const segStart = i * segSize;
        // Fade in as card enters center, dim as it leaves
        tl.fromTo(
          card,
          { opacity: 0.5, scale: 0.9 },
          { opacity: 1, scale: 1, duration: segSize * 0.4, ease: 'power2.out' },
          segStart
        );
        if (i < testimonials.length - 1) {
          tl.to(
            card,
            { opacity: 0.5, scale: 0.9, duration: segSize * 0.4, ease: 'power2.in' },
            segStart + segSize * 0.6
          );
        }
      });

      // Parallax background drift — wider drift on mobile to cover narrower viewport
      if (bgRef.current) {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        tl.to(
          bgRef.current,
          { x: isMobile ? -120 : -60, duration: 1, ease: 'none' },
          0
        );
      }
    }, root);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  const isReduced = typeof window !== 'undefined' && prefersReducedMotion();

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden bg-white"
      style={{ minHeight: isReduced ? 'auto' : '100vh' }}
    >
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute inset-y-0 left-0 w-[130%] bg-[url('/testimonial2.png')] bg-cover bg-center opacity-60"
        aria-hidden="true"
      />
      

      {/* Orbs */}
      <div
        data-testimonial-orb
        className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl"
      />
      <div
        data-testimonial-orb
        className="absolute -right-32 bottom-1/4 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal once={false} className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <span className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Loved in the field
          </span>
          <h2 className="font-jetbrains-mono text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
            The numbers matter. So do the people behind them.
          </h2>
        </Reveal>

        {/* Horizontal reel — vertical scroll drives horizontal movement */}
        <div className="relative overflow-hidden">
          <div ref={trackRef} className="flex w-max gap-5 px-2 py-8">
            {testimonials.map((testimonial, index) => (
              <div key={`${testimonial.name}-${index}`} data-testimonial-card>
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

        </div>

        {/* Progress indicator */}
        {!isReduced && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {testimonials.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-8 bg-emerald-500'
                    : i < activeIndex
                    ? 'w-4 bg-emerald-300'
                    : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
