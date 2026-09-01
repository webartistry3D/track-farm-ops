import Reveal from '../animations/Reveal';
import { CheckCircle2 } from 'lucide-react';

const SocialProofSection = () => {
  return (
    <section className="relative overflow-hidden bg-emerald-50 py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-700 mb-6">
              <CheckCircle2 className="h-4 w-4" />
              Live & Operational
            </div>
            
            <h2 className="font-jetbrains-mono text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              Currently Serving Our First Paying Farm
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              TrackFarmOps is not a concept or prototype. It's a fully built, deployed farm management 
              system that's actively being used by a Nigerian farm to manage their daily operations. 
              We're transparent about where we are—we have one paying farm, and we're working to reach 100.
            </p>

            <div className="bg-white border border-emerald-200 rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="font-jetbrains-mono font-bold text-emerald-600 text-4xl mb-2">1</div>
                  <div className="text-sm text-gray-600">Paying Farm</div>
                </div>
                <div>
                  <div className="font-jetbrains-mono font-bold text-emerald-600 text-4xl mb-2">100</div>
                  <div className="text-sm text-gray-600">Campaign Goal</div>
                </div>
                <div>
                  <div className="font-jetbrains-mono font-bold text-emerald-600 text-4xl mb-2">Live</div>
                  <div className="text-sm text-gray-600">Product Status</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SocialProofSection;
