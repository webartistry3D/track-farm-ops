import type { IconCard } from './content';

interface IconFeatureCardProps {
  item: IconCard;
  variant?: 'light' | 'dark';
}

const IconFeatureCard = ({ item, variant = 'light' }: IconFeatureCardProps) => {
  const Icon = item.icon;
  const isDark = variant === 'dark';

  return (
    <article
      className={`group relative h-full overflow-hidden rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-2 ${
        isDark
          ? 'border-white/10 bg-white/[0.06] hover:border-emerald-400/40 hover:bg-white/[0.1]'
          : 'border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03] hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/10'
      }`}
    >
      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} shadow-lg`}>
        <Icon className="h-6 w-6 text-white" strokeWidth={2.2} />
      </div>
      <h3 className={`font-jetbrains-mono text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {item.title}
      </h3>
      <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {item.description}
      </p>
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${item.accent} transition-all duration-500 group-hover:w-full`} />
    </article>
  );
};

export default IconFeatureCard;
