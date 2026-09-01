import SectionHeading from '../landing/SectionHeading';
import Reveal from '../animations/Reveal';
import { Star, Crown, Sparkles } from 'lucide-react';

const tiers = [
  {
    name: 'Farm Supporter',
    icon: Star,
    description: 'Support individual farms and help them get started with TrackFarmOps.',
    benefits: [
      'Campaign recognition on supporter page',
      'Updates on farm progress',
      'Direct impact on Nigerian agriculture',
    ],
    accent: 'from-emerald-500 to-green-600',
  },
  {
    name: 'Growth Supporter',
    icon: Sparkles,
    description: 'Contribute to scaling TrackFarmOps to reach more farms across Nigeria.',
    benefits: [
      'All Farm Supporter benefits',
      'Early access to new features',
      'Founder updates and insights',
      'Priority support for farm introductions',
    ],
    accent: 'from-teal-500 to-emerald-600',
    featured: true,
  },
  {
    name: 'Founding Partner',
    icon: Crown,
    description: 'Become a foundational partner in building sustainable agricultural technology in Nigeria.',
    benefits: [
      'All Growth Supporter benefits',
      'Direct product updates and roadmap access',
      'Recognition as founding partner',
      'Opportunity to shape product direction',
      'Exclusive partner events and networking',
    ],
    accent: 'from-lime-500 to-green-600',
  },
];

const SupporterTiers = () => {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_40%)]" />
      <div className="absolute inset-0 bg-grid opacity-[0.05]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Founding Supporters"
          title="Join the Movement to Transform Nigerian Agriculture"
          titleDelay={0.2}
          light
        />
        
        <Reveal stagger={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-white/10 border ${
                tier.featured ? 'border-emerald-400/50' : 'border-white/10'
              } rounded-2xl p-8 hover:border-emerald-400/30 transition-all ${
                tier.featured ? 'scale-105' : ''
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-400 text-emerald-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${tier.accent} flex items-center justify-center`}>
                  <tier.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-jetbrains-mono font-bold text-white text-xl">
                  {tier.name}
                </h3>
              </div>
              
              <p className="text-emerald-100 mb-6 leading-relaxed">
                {tier.description}
              </p>
              
              <ul className="space-y-3 mb-8">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-gray-300">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-3 rounded-xl font-semibold transition-all ${
                tier.featured
                  ? 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}>
                Become {tier.name}
              </button>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default SupporterTiers;
