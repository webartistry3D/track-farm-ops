import SectionHeading from '../landing/SectionHeading';
import Reveal from '../animations/Reveal';
import { Globe, Heart, Share2, Users } from 'lucide-react';

const participationWays = [
  {
    icon: Heart,
    title: 'Sponsor a Farm',
    description: 'Directly sponsor a Nigerian farm\'s access to TrackFarmOps.',
  },
  {
    icon: Users,
    title: 'Become a Founding Supporter',
    description: 'Join the movement to transform Nigerian agriculture.',
  },
  {
    icon: Globe,
    title: 'Introduce to Farmers',
    description: 'Connect Nigerian farmers you know with TrackFarmOps.',
  },
  {
    icon: Users,
    title: 'Connect Organizations',
    description: 'Introduce us to agricultural organizations and cooperatives.',
  },
  {
    icon: Share2,
    title: 'Share the Campaign',
    description: 'Spread the word within your networks and communities.',
  },
];

const DiasporaSection = () => {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="For Nigerians Abroad"
          title="Built in Nigeria. Supported by Nigerians Everywhere."
          titleDelay={0.2}
        />
        
        <Reveal delay={0.4} className="max-w-3xl mx-auto mb-12">
          <p className="text-lg text-gray-600 leading-relaxed text-center">
            Nigerians in the diaspora can support Nigerian agriculture without necessarily becoming 
            farmers themselves. Your support helps build sustainable agricultural technology from Nigeria, 
            for Nigerian farmers.
          </p>
        </Reveal>

        <Reveal stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {participationWays.map((way) => (
            <div
              key={way.title}
              className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <way.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-jetbrains-mono font-bold text-gray-900 mb-2">
                    {way.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {way.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default DiasporaSection;
