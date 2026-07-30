import Reveal from '../animations/Reveal';
import IconFeatureCard from './IconFeatureCard';
import SectionHeading from './SectionHeading';
import { benefits } from './content';

const BenefitsSection = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white py-24 sm:py-32">
    <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
    <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-lime-200/50 blur-3xl" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Made for growth" title="More confidence in every decision." description="TrackFarmOps brings the insight, control, and support to turn a hard-working farm into a high-performing business." />
      <Reveal stagger={0.1} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => <IconFeatureCard key={benefit.title} item={benefit} />)}
      </Reveal>
    </div>
  </section>
);

export default BenefitsSection;
