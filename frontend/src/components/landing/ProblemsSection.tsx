import { AlertTriangle } from 'lucide-react';
import Reveal from '../animations/Reveal';
import IconFeatureCard from './IconFeatureCard';
import SectionHeading from './SectionHeading';
import { problems } from './content';

const ProblemsSection = () => (
  <section id="challenges" className="relative overflow-hidden bg-rose-50/60 py-24 sm:py-32">
    <div className="absolute inset-0 bg-grid opacity-40" />
    <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="The reality on the ground"
        title="Farming is hard enough without flying blind."
        description="When records live in notebooks, spreadsheets, and group chats, the small operational gaps quickly become expensive losses."
      />
      <Reveal direction="left" className="marquee-track mt-4 overflow-hidden">
        <div className="animate-marquee-reverse flex w-max gap-5 px-2">
          {[...problems, ...problems].map((problem, index) => (
            <div key={`${problem.title}-${index}`} className="h-72 w-[320px] shrink-0 sm:w-[360px]">
              <IconFeatureCard item={problem} />
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.2} className="mx-auto mt-12 flex max-w-3xl items-start gap-4 rounded-2xl border border-rose-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><AlertTriangle className="h-5 w-5" /></span>
        <p className="pt-1 text-sm leading-6 text-slate-600"><strong className="text-slate-900">The cost of disconnected operations compounds daily.</strong> TrackFarmOps gives every part of your farm one shared source of truth.</p>
      </Reveal>
    </div>
  </section>
);

export default ProblemsSection;
