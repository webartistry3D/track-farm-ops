import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, CheckCircle2, Play, Star } from 'lucide-react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
import CountUp from '../animations/CountUp';
import MagneticButton from '../animations/MagneticButton';
import { heroChips, heroStats, trustedAvatars } from './content';

const Hero = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline
        .from('[data-hero="eyebrow"]', { opacity: 0, y: 20, duration: 0.55 })
        .from('[data-hero="title"] > span', { opacity: 0, y: 60, duration: 0.8, stagger: 0.12 }, '-=0.2')
        .from('[data-hero="description"]', { opacity: 0, y: 24, duration: 0.65 }, '-=0.35')
        .from('[data-hero="chips"] > div', { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 }, '-=0.25')
        .from('[data-hero="actions"]', { opacity: 0, y: 18, duration: 0.55 }, '-=0.15')
        .from('[data-hero="proof"]', { opacity: 0, y: 16, duration: 0.5 }, '-=0.15')
        .from('[data-hero="stats"] > div', { opacity: 0, y: 30, duration: 0.55, stagger: 0.1 }, '-=0.15');

      gsap.to('[data-hero="orb-one"]', { x: 55, y: -35, scale: 1.13, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('[data-hero="orb-two"]', { x: -45, y: 30, scale: 0.92, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, root);

    return () => ctx.revert();
  }, []);

  const scrollToChallenges = () => {
    document.getElementById('challenges')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" ref={root} className="relative isolate min-h-[760px] overflow-hidden bg-slate-950 pb-12 pt-28 text-white sm:pt-36 lg:min-h-screen lg:pt-44">
      <video autoPlay muted loop playsInline className="absolute inset-0 -z-30 h-full w-full object-cover opacity-45">
        <source src="/track-farm-ops-bg.mp4" type="video/mp4" />
      </video>
      {/* <div className="absolute inset-0 -z-20 bg-[linear-gradient(105deg,rgba(2,44,34,0.96)_0%,rgba(4,78,54,0.79)_47%,rgba(15,23,42,0.86)_100%)]" />*/}
      <div className="absolute inset-0 -z-10 bg-grid opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div data-hero="orb-one" className="absolute -right-32 top-24 -z-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      <div data-hero="orb-two" className="absolute -bottom-24 left-1/4 -z-10 h-72 w-72 rounded-full bg-lime-300/15 blur-3xl" />

      <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* <div data-hero="eyebrow" className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_3px_rgba(110,231,183,0.6)]" />
            Built for the business of farming
          </div> */}
          <h1 data-hero="title" className="font-jetbrains-mono font-bold leading-[1.05] tracking-tight">
            <span className="block whitespace-nowrap text-[clamp(2.25rem,8vw,5.5rem)]">Run your farm</span>
            <span className="block whitespace-nowrap bg-gradient-to-r from-emerald-200 via-lime-100 to-amber-100 bg-clip-text text-transparent text-[clamp(1.4rem,6vw,4rem)]">from your smartphone.</span>
          </h1>
          <p data-hero="description" className="mt-7 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
            TrackFarmOps turns daily farm activity into the clarity you need to make faster, more profitable decisions — from any device, anywhere.
          </p>
          <div data-hero="chips" className="mt-8 flex flex-wrap gap-2.5">
            {heroChips.map((chip) => (
              <div key={chip.text} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md sm:text-sm">
                <CheckCircle2 className="h-4 w-4" />
                {chip.text}
              </div>
            ))}
          </div>
          <div data-hero="actions" className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MagneticButton>
              <Link to="/signup" className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-400 px-6 py-3.5 font-semibold text-emerald-950 shadow-xl shadow-emerald-950/30 transition-colors hover:bg-emerald-300">
                Start managing for free
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <button type="button" onClick={scrollToChallenges} className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20"><Play className="ml-0.5 h-3 w-3 fill-current" /></span>
                See how it works
              </button>
            </MagneticButton>
          </div>
          <div data-hero="proof" className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-200">
            <div className="flex -space-x-2.5">
              {trustedAvatars.slice(0, 5).map((avatar, index) => (
                <img key={`${avatar}-${index}`} src={avatar} alt="TrackFarmOps customer" className="h-8 w-8 rounded-full border-2 border-emerald-950 object-cover" />
              ))}
            </div>
            <span className="font-medium">Trusted by ambitious farmers nationwide</span>
            <span className="hidden h-5 w-px bg-white/20 sm:block" />
            <span className="flex items-center gap-1 font-medium"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /> 4.7 average rating</span>
          </div>
        </div>

        <div data-hero="stats" className="mt-16 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.09] backdrop-blur-xl sm:grid-cols-4 lg:mt-20">
          {heroStats.map((stat, index) => (
            <div key={stat.label} className={`p-5 sm:p-6 ${index > 0 ? 'border-l border-white/10' : ''}`}>
              <div className="font-jetbrains-mono text-2xl font-bold text-white sm:text-3xl">
                <CountUp end={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="mt-1.5 text-xs font-medium text-emerald-100 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <button type="button" onClick={scrollToChallenges} aria-label="Scroll to challenges" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-white/60 transition-colors hover:text-white lg:flex">
        <span>Explore</span>
        <ArrowDown className="h-4 w-4 animate-bob" />
      </button>
    </section>
  );
};

export default Hero;
