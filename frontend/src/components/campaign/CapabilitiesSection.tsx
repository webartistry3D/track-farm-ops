import SectionHeading from '../landing/SectionHeading';
import IconFeatureCard from '../landing/IconFeatureCard';
import Reveal from '../animations/Reveal';
import { Wallet, Boxes, Building2, HeartPulse, Users, BarChart3 } from 'lucide-react';

const capabilities = [
  {
    icon: Wallet,
    title: 'Income & Expenses',
    description: 'Track produce sales, livestock sales, and expenses with revenue dashboard, trends, and profit reports.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: Boxes,
    title: 'Inventory',
    description: 'Track seeds, feed, fertilizers, and agrochemicals with stock levels, low-stock alerts, and waste tracking.',
    accent: 'from-teal-500 to-emerald-600',
  },
  {
    icon: Building2,
    title: 'Assets',
    description: 'Track tractors, generators, vehicles with asset register, maintenance scheduling, and utilization tracking.',
    accent: 'from-lime-500 to-green-600',
  },
  {
    icon: HeartPulse,
    title: 'Livestock Health',
    description: 'Track health status, vaccinations, checkups, and treatments with veterinarian role access.',
    accent: 'from-green-500 to-emerald-600',
  },
  {
    icon: Users,
    title: 'Farm Operations',
    description: 'Track employees, attendance, payroll, task assignments with worker profiles and performance records.',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Convert raw farm data into business intelligence: income vs expenses, profitability, and efficiency.',
    accent: 'from-green-600 to-lime-600',
  },
];

const CapabilitiesSection = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
      <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-lime-200/50 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What TrackFarmOps Does"
          title="Complete Farm Management in One Platform"
          titleDelay={0.2}
        />
        
        <Reveal stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {capabilities.map((capability) => (
            <IconFeatureCard key={capability.title} item={capability} />
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
