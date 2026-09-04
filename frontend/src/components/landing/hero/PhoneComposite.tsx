import { forwardRef } from 'react';

const PhoneComposite = forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <div
      ref={ref}
      data-phone-composite
      className="absolute right-[8%] top-1/2 z-[36] hidden -translate-y-1/2 sm:block"
      style={{ perspective: '800px', opacity: 0 }}
    >
      <div
        className="relative h-[280px] w-[160px] rounded-xl border border-white/10 bg-slate-950/90 shadow-2xl"
        style={{ transform: 'rotate3d(1, -0.3, 0, 8deg)' }}
      >
        {/* Dashboard mock slides */}
        <div data-dash="0" className="absolute inset-2 rounded-lg bg-emerald-950/95 p-3" style={{ opacity: 0 }}>
          <div className="mb-2 h-2 w-20 rounded bg-emerald-400/40" />
          <div className="mb-1.5 text-[8px] font-bold text-emerald-300">Income vs Expenses</div>
          <div className="flex h-20 items-end gap-1.5">
            <div className="w-6 rounded-t bg-emerald-400/70" style={{ height: '60%' }} />
            <div className="w-6 rounded-t bg-emerald-400/50" style={{ height: '45%' }} />
            <div className="w-6 rounded-t bg-emerald-400/80" style={{ height: '75%' }} />
            <div className="w-6 rounded-t bg-emerald-400/60" style={{ height: '55%' }} />
          </div>
          <div className="mt-2 flex justify-between text-[7px] text-slate-400">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
          </div>
        </div>

        <div data-dash="1" className="absolute inset-2 rounded-lg bg-slate-900/95 p-3" style={{ opacity: 0 }}>
          <div className="mb-2 h-2 w-20 rounded bg-amber-400/40" />
          <div className="mb-1.5 text-[8px] font-bold text-amber-300">Inventory Alerts</div>
          <div className="space-y-1.5">
            {['Feed', 'Fertilizer', 'Seeds'].map((item, i) => (
              <div key={item} className="flex items-center justify-between rounded bg-white/5 px-1.5 py-1">
                <span className="text-[7px] text-slate-300">{item}</span>
                <span className={`text-[7px] font-bold ${i < 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {i < 2 ? 'Low' : 'OK'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div data-dash="2" className="absolute inset-2 rounded-lg bg-emerald-950/95 p-3" style={{ opacity: 0 }}>
          <div className="mb-2 h-2 w-20 rounded bg-lime-400/40" />
          <div className="mb-1.5 text-[8px] font-bold text-lime-300">Livestock Health</div>
          <div className="space-y-1.5">
            {[
              { label: 'Healthy', count: '142', color: 'text-emerald-400' },
              { label: 'Vaccination due', count: '8', color: 'text-amber-400' },
              { label: 'Under treatment', count: '3', color: 'text-rose-400' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded bg-white/5 px-1.5 py-1">
                <span className="text-[7px] text-slate-300">{row.label}</span>
                <span className={`text-[7px] font-bold ${row.color}`}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

PhoneComposite.displayName = 'PhoneComposite';
export default PhoneComposite;
