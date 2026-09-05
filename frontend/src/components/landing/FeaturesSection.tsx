import IconFeatureCard from './IconFeatureCard';
import Reveal from '../animations/Reveal';
import SectionHeading from './SectionHeading';
import { features } from './content';

const FeaturesSection = () => (
  <section className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
    <div className="absolute inset-0 bg-grid opacity-50" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Purpose-built toolkit" title="Know more. Miss less." />
      <Reveal once={false} stagger={0.08} className="marquee-track mt-4 overflow-hidden">
        <div className="animate-marquee-reverse flex w-max gap-5 px-2">
          {[...features, ...features].map((feature, index) => (
            <div key={`${feature.title}-${index}`} className="h-72 w-[320px] shrink-0 sm:w-[360px]">
              <IconFeatureCard item={feature} />
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

export default FeaturesSection;
