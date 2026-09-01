import { ArrowRight, Share2 } from 'lucide-react';
import Reveal from '../animations/Reveal';
import MagneticButton from '../animations/MagneticButton';

const CampaignFooterCTA = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-emerald-900 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_40%)]" />
      <div className="absolute inset-0 bg-grid opacity-[0.05]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-jetbrains-mono text-4xl font-bold text-white sm:text-5xl mb-6">
              Help Us Reach 100 Farms.
            </h2>
            
            <p className="text-xl text-emerald-100 mb-10 leading-relaxed">
              The product is built. The journey has started. Now we're looking for people who believe 
              Nigerian farmers deserve better tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton>
                <button className="group inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-10 py-5 font-semibold text-emerald-950 shadow-xl shadow-emerald-950/30 transition-all hover:bg-emerald-300 hover:shadow-emerald-950/40 hover:-translate-y-0.5 text-lg">
                  Support TrackFarmOps
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </MagneticButton>
              
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-10 py-5 font-semibold text-white  transition-all hover:bg-white/20 hover:border-white/40 text-lg">
                <Share2 className="h-5 w-5" />
                Share the Campaign
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CampaignFooterCTA;
