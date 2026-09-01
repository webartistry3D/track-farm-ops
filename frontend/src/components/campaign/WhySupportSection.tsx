import SectionHeading from '../landing/SectionHeading';
import Reveal from '../animations/Reveal';
import { Globe, TrendingUp, Shield, Zap, Users, Building } from 'lucide-react';

const benefits = [
  {
    icon: Globe,
    title: 'Reach More Nigerian Farms',
    description: 'Help us bring digital farm management tools to farmers across Nigeria who need them most.',
  },
  {
    icon: Users,
    title: 'Subsidize Farm Access',
    description: 'Sponsor access for selected farmers who cannot afford the tools but would benefit tremendously.',
  },
  {
    icon: Shield,
    title: 'Maintain Infrastructure',
    description: 'Keep the platform running reliably with secure servers, backups, and technical maintenance.',
  },
  {
    icon: Zap,
    title: 'Improve the Product',
    description: 'Fund continuous development of new features based on real farmer feedback and needs.',
  },
  {
    icon: TrendingUp,
    title: 'Run Farmer Acquisition',
    description: 'Support marketing and outreach efforts to help farmers discover and adopt TrackFarmOps.',
  },
  {
    icon: Building,
    title: 'Build Sustainable AgTech',
    description: 'Support the growth of agricultural technology built in Nigeria, for Nigerian farmers.',
  },
];

const WhySupportSection = () => {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Support Matters"
          title="Your Support Makes Real Impact"
          titleDelay={0.2}
        />
        
        <Reveal stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-jetbrains-mono font-bold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
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

export default WhySupportSection;
