import { useMemo } from 'react';
import Reveal from '../animations/Reveal';
import SectionHeading from './SectionHeading';
import { steps } from './content';

const VIEW_W = 1000;
const VIEW_H = 500;
const STEP_XS = [100, 500, 900];
const STEP_YS = [380, 250, 120];

const HowItWorksSection = () => {
  const { wavePath, nodes } = useMemo(() => {
    const xs = STEP_XS;
    const ys = STEP_YS;

    let path = `M 0,${ys[0]} `;
    for (let i = 0; i < xs.length; i++) {
      path += `L ${xs[i]},${ys[i]} `;
      if (i < ys.length - 1) path += `L ${xs[i]},${ys[i + 1]} `;
    }
    path += `L ${VIEW_W},${ys[ys.length - 1]}`;

    const nodes = xs.map((x, i) => ({ x, y: ys[i] }));

    return { wavePath: path, nodes };
  }, []);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 z-0 bg-[url('/confidence.png')] bg-cover bg-fixed bg-center opacity-60" aria-hidden="true" />
      <div className="absolute left-0 top-0 z-0 h-full w-1/2" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Up and running in minutes"
          title="A better day on the farm starts here."
          //description="A focused setup flow that gets your entire operation organized without the headache."
          descriptionClassName="text-white"
        />

        <Reveal once={false} stagger={0.18} className="relative mx-auto mt-10 h-[440px] w-full sm:h-[520px] lg:h-[200px] lg:max-w-3xl">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
                viewBox="0 0 10 8"
              >
                <path d="M 0 0 L 10 4 L 0 8 z" fill="rgba(255,255,255,0.9)" />
              </marker>
            </defs>
            <path
              d={wavePath}
              fill="none"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="4"
              strokeDasharray="6 8"
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
            />

            {nodes.map((node, i) => (
              <circle
                key={i}
                cx={node.x}
                cy={node.y}
                r="6"
                fill="#10b981"
                className="animate-pulse"
              />
            ))}
          </svg>

          {steps.map((step, index) => {
            const node = nodes[index];
            const left = `${(node.x / VIEW_W) * 100}%`;
            const top = `${(node.y / VIEW_H) * 100}%`;
            const Icon = step.icon;

            return (
              <article
                key={step.step}
                className="absolute z-10 w-[32vw] max-w-56 -translate-x-1/2 -translate-y-1/2 text-center sm:w-52 md:w-60 lg:w-64"
                style={{ left, top }}
              >
                <span className="font-jetbrains-mono text-4xl font-bold text-white sm:text-5xl">{step.step}</span>
                <div className="relative -mt-4 mb-3 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 sm:-mt-5 sm:mb-4 sm:h-14 sm:w-14">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="font-jetbrains-mono text-lg font-bold text-slate-900 sm:text-xl">{step.title}</h3>
                {/*<p className="mt-2 line-clamp-3 text-[10px] leading-4 text-slate-600 sm:text-xs sm:leading-5">{step.description}</p>*/}
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorksSection;
