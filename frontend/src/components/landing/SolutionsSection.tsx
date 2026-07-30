import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Reveal from '../animations/Reveal';
import SectionHeading from './SectionHeading';
import { solutions } from './content';

const ORBIT = 35;
const HUB_RADIUS = 13;
const SATELLITE_RADIUS = 9;

const SolutionsSection = () => {
  const satellites = useMemo(
    () =>
      solutions.map((solution, index) => {
        const angleDeg = -90 + index * 60;
        const angle = (angleDeg * Math.PI) / 180;
        return {
          ...solution,
          angle,
          cx: 50 + ORBIT * Math.cos(angle),
          cy: 50 + ORBIT * Math.sin(angle),
          lineEnd: 50 + (ORBIT - SATELLITE_RADIUS) * Math.cos(angle),
          lineStart: 50 + HUB_RADIUS * Math.cos(angle),
          lineEndY: 50 + (ORBIT - SATELLITE_RADIUS) * Math.sin(angle),
          lineStartY: 50 + HUB_RADIUS * Math.sin(angle),
        };
      }),
    []
  );

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle_at_85%_15%,rgba(132,204,22,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          light
          eyebrow="One calm command center"
          title="Everything your farm needs. Finally in one place."
          //description="A single, secure operating system that connects the financial, physical, and people sides of your farm."
        />

        <Reveal className="relative mx-auto mt-8 aspect-square w-full max-w-3xl md:mt-12 lg:max-w-[35rem]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(16,185,129,0.35)" />
                <stop offset="100%" stopColor="rgba(132,204,22,0.18)" />
              </linearGradient>
            </defs>

            <circle
              className="animate-orbit"
              style={{ transformOrigin: '50px 50px' }}
              cx="50"
              cy="50"
              r={ORBIT}
              fill="none"
              stroke="rgba(16,185,129,0.25)"
              strokeWidth="0.35"
              strokeDasharray="1.2 1.6"
            />

            {satellites.map((sat, index) => (
              <line
                key={`link-${index}`}
                className="animate-pulse-line"
                style={{ animationDelay: `${index * 0.15}s` }}
                x1={sat.lineStart}
                y1={sat.lineStartY}
                x2={sat.lineEnd}
                y2={sat.lineEndY}
                stroke="rgba(16,185,129,0.4)"
                strokeWidth="0.35"
                strokeDasharray="0.8 0.8"
              />
            ))}

            <circle
              cx="50"
              cy="50"
              r={HUB_RADIUS}
              fill="url(#hubGradient)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.4"
            />
          </svg>

          <div className="absolute left-1/2 top-1/2 z-10 flex h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-300/30 bg-slate-900/60 p-4 text-center shadow-[0_0_60px_-12px_rgba(16,185,129,0.45)] backdrop-blur-md sm:p-5">
            <div>
              <p className="font-jetbrains-mono text-[clamp(0.55rem,1.8vw,0.9rem)] font-bold leading-tight text-emerald-300">
                TrackFarmOps
              </p>
              {/* <p className="mt-1 text-[clamp(0.45rem,1.2vw,0.65rem)] font-medium uppercase tracking-wider text-emerald-300">
                Engine
              </p> */}
            </div>
          </div>

          {satellites.map((sat) => {
            const Icon = sat.icon;
            return (
              <div
                key={sat.title}
                className="group absolute z-10 flex h-[28%] w-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-full border border-white/10 bg-slate-900/70 p-2 text-center shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)] backdrop-blur-md transition-all duration-500 hover:z-50 hover:scale-110 hover:border-emerald-300/40 hover:bg-slate-900/90 sm:h-[18%] sm:w-[18%]"
                style={{ left: `${sat.cx}%`, top: `${sat.cy}%` }}
              >
                <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full sm:mb-1.5 sm:h-10 sm:w-10">
                  <Icon className="h-12 w-12 text-emerald-300" strokeWidth={2.2} />
                </div>
                <p className="line-clamp-2 text-[clamp(0.45rem,1.35vw,0.7rem)] font-semibold leading-[1.15] text-slate-100">
                  {sat.title}
                </p>

                <div className="pointer-events-none absolute z-50 left-1/2 top-full mt-2 w-40 -translate-x-1/2 rounded-xl border border-emerald-300/20 bg-slate-900/90 p-3 text-left text-xs text-slate-200 opacity-0 shadow-2xl backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 sm:w-48 sm:p-3.5">
                  {sat.description}
                </div>
              </div>
            );
          })}
        </Reveal>

        <Reveal delay={0.2} className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-900 shadow-xl shadow-emerald-950/30 transition-all hover:-translate-y-1 hover:bg-emerald-50">
            Explore the platform
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <span className="hidden items-center gap-2 text-sm text-emerald-200 sm:flex">
            <Sparkles className="h-4 w-4" /> Built for Nigerian farming realities
          </span>
        </Reveal>
      </div>
    </section>
  );
};

export default SolutionsSection;
