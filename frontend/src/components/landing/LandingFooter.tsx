import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUp, Sprout } from 'lucide-react';
import Reveal from '../animations/Reveal';
import MagneticButton from '../animations/MagneticButton';

const LandingFooter = () => (
  <>
    <section className="relative overflow-hidden bg-slate-950 py-16 text-center sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.26),transparent_42%)]" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal once={false} className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200"><Sprout className="h-4 w-4" /> Start stronger today</span>
        </Reveal>
        <Reveal once={false} delay={0.15} className="mx-auto mt-6 max-w-3xl text-center">
          <h2 className="font-jetbrains-mono text-4xl font-bold tracking-tight text-white sm:text-5xl">Your farm has more potential. Let's unlock it.</h2>
        </Reveal>
        <Reveal once={false} delay={0.3} className="mx-auto mt-8 max-w-3xl text-center">
          <MagneticButton><Link to="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-7 py-4 font-semibold text-emerald-950 shadow-xl shadow-emerald-950/30 transition-colors hover:bg-emerald-300">Create your free account <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></Link></MagneticButton>
        </Reveal>
      </div>
    </section>
    <footer className="bg-slate-950 border-t border-white/10 py-10 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
        <Link to="/" className="font-jetbrains-mono text-lg font-bold text-white">Track<span className="text-emerald-400">Farm</span>Ops</Link>
        <p className="text-center text-sm">© 2026 TrackFarmOps. Powered by WebArtistry Creations ®.</p>
        <nav className="flex gap-5 text-sm"><Link to="/about" className="transition-colors hover:text-emerald-300">About</Link><Link to="/support" className="transition-colors hover:text-emerald-300">Support</Link><Link to="/privacy" className="transition-colors hover:text-emerald-300">Privacy</Link><Link to="/terms" className="transition-colors hover:text-emerald-300">Terms</Link><Link to="/contact" className="transition-colors hover:text-emerald-300">Contact</Link></nav>
      </div>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
          className="rounded-full bg-emerald-400 p-3 text-emerald-950 shadow-lg shadow-emerald-950/30 transition-transform hover:scale-110 hover:bg-emerald-300"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </footer>
  </>
);

export default LandingFooter;
