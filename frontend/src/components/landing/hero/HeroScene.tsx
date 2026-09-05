import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Play, Star } from 'lucide-react';
import CountUp from '../../animations/CountUp';
import MagneticButton from '../../animations/MagneticButton';
import type { SceneConfig } from './scenes';
import { problems, solutions, heroChips, heroStats, testimonials, trustedAvatars } from '../content';

interface HeroSceneProps {
  scene: SceneConfig;
  index: number;
  onSeeHowItWorks: () => void;
}

const HeroScene = ({ scene, index, onSeeHowItWorks }: HeroSceneProps) => {
  const isScene1 = index === 0;
  const isCenter = scene.layout === 'center';
  const titleLines = scene.content.title.split('\n');

  return (
    <div
      data-hero-text={index}
      className={`absolute inset-0 z-40 flex ${isScene1 ? 'items-center pt-28 sm:pt-36 lg:pt-44' : 'items-start pt-20 sm:pt-24 lg:pt-28'}`}
      style={{ opacity: isScene1 ? 1 : 0, pointerEvents: isScene1 ? 'auto' : 'none' }}
    >
      <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${isCenter ? 'flex flex-col items-center text-center' : ''}`}>
        <div className={isCenter ? 'max-w-3xl' : 'max-w-4xl'}>
          {/* Eyebrow */}
          {scene.content.eyebrow && (
            <div data-hero-element="eyebrow" className={`mb-4 ${scene.content.eyebrowClass ?? ''}`}>
              {scene.content.eyebrow}
            </div>
          )}

          {/* Title */}
          {isScene1 ? (
            <h1 data-hero-element="title" className={scene.content.titleClass}>
              <span className="block whitespace-nowrap text-[clamp(2.25rem,8vw,5.5rem)]">{titleLines[0]}</span>
              <span className="block whitespace-nowrap bg-gradient-to-r from-emerald-200 via-lime-100 to-amber-100 bg-clip-text text-transparent text-[clamp(1.4rem,6vw,4rem)]">
                {titleLines[1]}
              </span>
            </h1>
          ) : (
            <h2 data-hero-element="title" className={scene.content.titleClass}>
              {scene.content.title}
            </h2>
          )}

          {/* Progress line (Scene 2) */}
          {scene.showProgressLine && (
            <div data-hero-element="progress-line" className="mt-3 h-px w-0 overflow-hidden">
              <div className={`h-full w-full ${scene.progressLineColor ?? 'bg-rose-400/60'}`} />
            </div>
          )}

          {/* Body */}
          {scene.content.body && (
            <p data-hero-element="body" className={scene.content.bodyClass}>
              {scene.content.body}
            </p>
          )}

          {/* Scene 1: Chips */}
          {scene.showChips && (
            <div data-hero-element="chips" className="mt-8 flex flex-wrap gap-2.5">
              {heroChips.map((chip) => (
                <div
                  key={chip.text}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-white shadow-lg sm:text-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {chip.text}
                </div>
              ))}
            </div>
          )}

          {/* Scene 1: CTAs */}
          {isScene1 && (
            <div data-hero-element="actions" className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagneticButton>
                <Link
                  to="/signup"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-400 px-6 py-3.5 font-semibold text-emerald-950 shadow-xl shadow-emerald-950/30 transition-colors hover:bg-emerald-300"
                >
                  Start managing for free
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <button
                  type="button"
                  onClick={onSeeHowItWorks}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <Play className="ml-0.5 h-3 w-3 fill-current" />
                  </span>
                  See how it works
                </button>
              </MagneticButton>
            </div>
          )}

          {/* Scene 1: Social proof */}
          {scene.showSocialProof && (
            <div data-hero-element="proof" className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-200">
              <div className="flex -space-x-2.5">
                {trustedAvatars.slice(0, 5).map((avatar, i) => (
                  <img
                    key={`${avatar}-${i}`}
                    src={avatar}
                    alt="TrackFarmOps customer"
                    className="h-8 w-8 rounded-full border-2 border-emerald-950 object-cover"
                  />
                ))}
              </div>
              <span className="font-medium">Trusted by ambitious farmers nationwide</span>
              <span className="hidden h-5 w-px bg-white/20 sm:block" />
              <span className="flex items-center gap-1 font-medium">
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" /> 4.7 average rating
              </span>
            </div>
          )}

          {/* Scene 1: Stats */}
          {scene.showStats && (
            <div
              data-hero-element="stats"
              className="mt-16 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/85 backdrop-blur-xl sm:grid-cols-4 lg:mt-20"
            >
              {heroStats.map((stat, i) => (
                <div key={stat.label} className={`p-5 sm:p-6 ${i > 0 ? 'border-l border-white/10' : ''}`}>
                  <div className="font-jetbrains-mono text-2xl font-bold text-white sm:text-3xl">
                    <CountUp end={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-emerald-100 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Scene 2: Problems grid */}
          {scene.showProblems && (
            <div data-hero-element="problems" className="mt-7 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {problems.map((problem) => (
                <div
                  key={problem.title}
                  className="flex items-center gap-3 rounded-lg border border-rose-400/20 bg-rose-500/30 px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20">
                    <problem.icon className="h-4 w-4 text-rose-300" />
                  </span>
                  <span className="text-sm font-medium text-slate-200">{problem.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Scene 3: Solutions grid */}
          {scene.showSolutions && (
            <div data-hero-element="solutions" className="mt-7 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {solutions.map((solution) => (
                <div
                  key={solution.title}
                  className="flex items-center gap-3 rounded-lg border border-emerald-400/30 bg-white/80 px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <solution.icon className="h-4 w-4 text-emerald-600" />
                  </span>
                  <span className="text-sm font-medium text-emerald-700">{solution.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Scene 4: Features grid */}
          {scene.features && (
            <div data-hero-element="features" className="mt-7 grid grid-cols-1 gap-3 lg:grid-cols-4">
              {scene.features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                    <feature.icon className="h-5 w-5 text-emerald-300" />
                  </span>
                  <span className="text-base font-medium text-slate-100">{feature.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Scene 5: Final CTA */}
          {scene.showFinalCta && (
            <div data-hero-element="final-cta" className="mt-8 flex justify-center">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-8 py-4 text-lg font-semibold text-emerald-950 shadow-[0_0_40px_rgba(52,211,153,0.35)] transition-colors hover:bg-emerald-300"
              >
                Start managing for free
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}

          {/* Scene 5: Testimonial */}
          {scene.showTestimonial && (
            <div data-hero-element="testimonial" className="mx-auto mt-8 max-w-lg border-t border-white/10 pt-6">
              <p className="text-base italic text-slate-200">
                &ldquo;{testimonials[0].quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <img
                  src={testimonials[0].avatar}
                  alt={testimonials[0].name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">{testimonials[0].name}</div>
                  <div className="text-xs text-slate-400">{testimonials[0].role}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroScene;
