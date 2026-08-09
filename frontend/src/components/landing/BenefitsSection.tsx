import Reveal from '../animations/Reveal';
import IconFeatureCard from './IconFeatureCard';
import SectionHeading from './SectionHeading';
import { benefits } from './content';

const rotations = [-1.5, 1.2, -0.8, 1, -1.2, 0.6];

const BenefitsSection = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white py-24 sm:py-32">
    <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
    <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-lime-200/50 blur-3xl" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Made for growth" title="Transform your farm into a high-performing business." />
      <Reveal stagger={0.1} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit, index) => (
          <div key={benefit.title} className="h-full" style={{ transform: `rotate(${rotations[index % rotations.length]}deg)` }}>
            <IconFeatureCard item={benefit} />
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

export default BenefitsSection;
