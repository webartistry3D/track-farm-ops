import { ArrowRight, Sprout } from 'lucide-react';
import Reveal from '../animations/Reveal';
import MagneticButton from '../animations/MagneticButton';

const SponsorFarmSection = () => {
  return (
    <section id="sponsor" className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_40%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-700 mb-6">
              <Sprout className="h-4 w-4" />
              Direct Impact
            </div>
            
            <h2 className="font-jetbrains-mono text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              Help Put One More Farm on Track.
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Your contribution can directly sponsor a Nigerian farm's access to TrackFarmOps. 
              You're not just supporting software—you're helping a real farm transform their operations 
              with better digital tools.
            </p>

            <div className="bg-white/80 border border-emerald-200 rounded-2xl p-8 mb-8">
              <h3 className="font-jetbrains-mono font-bold text-gray-900 text-xl mb-4">
                How Sponsorship Works
              </h3>
              <div className="text-left space-y-3 text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">1</div>
                  <p>You contribute toward farm sponsorship</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">2</div>
                  <p>We identify farms that would benefit most</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">3</div>
                  <p>Farms get onboarding and full access to TrackFarmOps</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">4</div>
                  <p>You receive updates on the farm's progress</p>
                </div>
              </div>
            </div>

            <MagneticButton>
              <button className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-10 py-5 font-semibold text-white shadow-xl shadow-emerald-950/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-950/40 hover:-translate-y-0.5 text-lg">
                Sponsor a Farm
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </MagneticButton>
            
            <p className="mt-4 text-sm text-gray-500">
              Payment integration coming soon. Contact us to sponsor directly.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SponsorFarmSection;
