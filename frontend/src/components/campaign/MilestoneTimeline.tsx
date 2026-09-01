import SectionHeading from '../landing/SectionHeading';
import Reveal from '../animations/Reveal';
import { CheckCircle2, Circle } from 'lucide-react';

const milestones = [
  {
    number: '01',
    title: 'First Paying Farm',
    description: 'Our first farm is already using TrackFarmOps to manage their daily operations.',
    status: 'completed',
  },
  {
    number: '10',
    title: 'Early Adoption',
    description: 'Reaching early adopters and refining the product based on real farm feedback.',
    status: 'upcoming',
  },
  {
    number: '50',
    title: 'Growing Network',
    description: 'Building a network of farms benefiting from digital management tools.',
    status: 'upcoming',
  },
  {
    number: '100',
    title: 'Campaign Goal',
    description: '100 Nigerian farms using TrackFarmOps to transform their operations.',
    status: 'upcoming',
  },
];

const MilestoneTimeline = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
      <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-lime-200/50 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Build in Public"
          title="We're Building This in Public"
          titleDelay={0.2}
        />
        
        <Reveal delay={0.4} className="max-w-3xl mx-auto mb-12">
          <p className="text-lg text-gray-600 leading-relaxed text-center">
            Supporters will be able to follow our journey from 1 farm to 100. We'll publicly share 
            progress, product improvements, farmer adoption stories, milestones, and lessons learned 
            along the way.
          </p>
        </Reveal>

        <Reveal stagger={0.15} className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 to-emerald-200 md:left-1/2" />
            
            {milestones.map((milestone, index) => (
              <div
                key={milestone.number}
                className={`relative flex items-center gap-8 mb-12 last:mb-0 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-jetbrains-mono font-bold text-emerald-600 text-2xl mb-2">
                      {milestone.number}
                    </div>
                    <h3 className="font-jetbrains-mono font-bold text-gray-900 text-xl mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Icon */}
                <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    milestone.status === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-white border-2 border-emerald-300'
                  }`}>
                    {milestone.status === 'completed' ? (
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    ) : (
                      <Circle className="h-8 w-8 text-emerald-300" />
                    )}
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default MilestoneTimeline;
