import Reveal from '../animations/Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  titleDelay?: number;
  description?: string;
  descriptionClassName?: string;
  descriptionDelay?: number;
  light?: boolean;
}

const SectionHeading = ({
  eyebrow,
  title,
  titleDelay = 0,
  description,
  descriptionClassName,
  descriptionDelay = 0,
  light = false,
}: SectionHeadingProps) => (
  <Reveal once={false} className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
    {eyebrow && (
      <span
        className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
          light
            ? 'border-white/20 bg-white/10 text-emerald-200'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}
      >
        {eyebrow}
      </span>
    )}
    <Reveal once={false} delay={titleDelay}>
      <h2
        className={`font-jetbrains-mono text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl ${
          light ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
    </Reveal>
    {description && (
      <Reveal once={false} delay={descriptionDelay}>
        <p className={`mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg ${descriptionClassName ? descriptionClassName : light ? 'text-slate-300' : 'text-slate-600'}`}>
          {description}
        </p>
      </Reveal>
    )}
  </Reveal>
);

export default SectionHeading;
