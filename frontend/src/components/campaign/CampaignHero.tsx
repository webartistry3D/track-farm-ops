import { Link } from 'react-router-dom';
import { ArrowRight, Sprout } from 'lucide-react';
import Reveal from '../animations/Reveal';
import MagneticButton from '../animations/MagneticButton';

const CampaignHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 py-24 sm:py-32 lg:py-40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_40%)]" />
      <div className="absolute inset-0 bg-grid opacity-[0.05]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-4xl">
            {/* Campaign badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-200 mb-8">
              <Sprout className="h-4 w-4" />
              2 → 200 Farms Campaign
            </div>

            {/* Main headline */}
            <h1 className="font-jetbrains-mono text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
              From 2 Farm to 200.
            </h1>

            {/* Supporting copy */}
            <p className="text-xl sm:text-2xl text-emerald-100 mb-8 max-w-2xl leading-relaxed">
              TrackFarmOps was built to help Nigerian agribusinesses manage their operations. 
              Now we are raising support to put better digital tools in the hands of 100 Nigerian farms.
            </p>

            {/* Progress visualization */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 mb-10 max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-emerald-200 text-sm font-medium">Campaign Progress</span>
                <span className="text-white font-jetbrains-mono font-bold text-lg">2 / 200 Farms</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mb-3">
                <div className="bg-emerald-400 h-3 rounded-full" style={{ width: '1%' }} />
              </div>
              <p className="text-emerald-200 text-sm">
                2 farms are already on TrackFarmOps. Help us reach 200.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <MagneticButton>
                <Link 
                  to="#sponsor" 
                  className="group inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-8 py-4 font-semibold text-emerald-950 shadow-xl shadow-emerald-950/30 transition-all hover:bg-emerald-300 hover:shadow-emerald-950/40 hover:-translate-y-0.5"
                >
                  Support the Campaign
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
              <Link 
                to="/about"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white  transition-all hover:bg-white/20 hover:border-white/40"
              >
                See What We're Building
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CampaignHero;
