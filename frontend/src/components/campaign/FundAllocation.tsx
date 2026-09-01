import SectionHeading from '../landing/SectionHeading';
import Reveal from '../animations/Reveal';
import { Server, Megaphone, Cog, Zap } from 'lucide-react';

const allocations = [
  {
    icon: Server,
    title: 'Product & Infrastructure',
    description: 'Servers, hosting, security, backups, and technical maintenance to keep TrackFarmOps running reliably.',
  },
  {
    icon: Megaphone,
    title: 'Marketing & Farmer Acquisition',
    description: 'Outreach, advertising, and farmer education to help Nigerian farms discover and adopt TrackFarmOps.',
  },
  {
    icon: Cog,
    title: 'Operations',
    description: 'Day-to-day operations, administrative costs, and team support to sustain campaign momentum.',
  },
  {
    icon: Zap,
    title: 'Product Improvements',
    description: 'Feature development, bug fixes, and enhancements based on real farmer feedback and needs.',
  },
];

const FundAllocation = () => {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How Funds Will Be Used"
          title="Transparent Resource Allocation"
          titleDelay={0.2}
        />
        
        <Reveal stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {allocations.map((allocation) => (
            <div
              key={allocation.title}
              className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <allocation.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-jetbrains-mono font-bold text-gray-900 mb-2">
                    {allocation.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {allocation.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.6} className="mt-12 text-center">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            We believe in transparency. Supporters will receive regular updates on how funds are being used 
            and the impact they're making on Nigerian agriculture.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default FundAllocation;
