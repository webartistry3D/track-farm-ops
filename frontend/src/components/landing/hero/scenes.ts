import {
  Smartphone,
  ShieldCheck,
  LineChart,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { problems, solutions, heroChips, heroStats, testimonials } from '../content';

export interface SceneContent {
  eyebrow?: string;
  eyebrowClass?: string;
  title: string;
  titleClass?: string;
  body?: string;
  bodyClass?: string;
}

export interface SceneFeature {
  icon: LucideIcon;
  label: string;
}

export interface SceneConfig {
  id: string;
  label: string;
  image: string;
  imageFallback: string;
  scrim: string;
  scaleFrom: number;
  scaleTo: number;
  scaleOrigin: string;
  yDrift: string;
  crossfadeStart: number;
  crossfadeEnd: number;
  content: SceneContent;
  layout: 'left' | 'center';
  orbs?: { one?: boolean; two?: boolean };
  features?: SceneFeature[];
  showProblems?: boolean;
  showSolutions?: boolean;
  showPhoneComposite?: boolean;
  showFinalCta?: boolean;
  showTestimonial?: boolean;
  showChips?: boolean;
  showStats?: boolean;
  showSocialProof?: boolean;
  showProgressLine?: boolean;
  progressLineColor?: string;
}

const SCENE_IMAGES = {
  scene1: '/trackfarmops-bg.png',
  scene2: '/trackfarmops-bg-2.png',
  scene3: '/trackfarmops-bg-3.png',
  scene4: '/trackfarmops-bg-4.png',
  scene5: '/trackfarmops-bg-5.png',
};

export const scenes: SceneConfig[] = [
  {
    id: 'the-land',
    label: 'The Land',
    image: SCENE_IMAGES.scene1,
    imageFallback: SCENE_IMAGES.scene1,
    scrim:
      'linear-gradient(105deg, rgba(2,44,34,0.55) 0%, rgba(4,78,54,0.25) 45%, rgba(15,23,42,0.20) 100%)',
    scaleFrom: 1.0,
    scaleTo: 1.06,
    scaleOrigin: '60% 40%',
    yDrift: '0vh',
    crossfadeStart: 0.16,
    crossfadeEnd: 0.18,
    layout: 'left',
    orbs: { one: true, two: true },
    content: {
      title: 'Run your farm\nfrom your smartphone.',
      titleClass: 'font-jetbrains-mono font-bold leading-[1.05] tracking-tight',
      // body: 'TrackFarmOps turns daily farm activity into the clarity you need to make faster, more profitable decisions — from any device, anywhere.',
      bodyClass: 'mt-7 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8',
    },
    showChips: true,
    showSocialProof: true,
    showStats: true,
  },
  {
    id: 'the-challenge',
    label: 'The Challenge',
    image: SCENE_IMAGES.scene2,
    imageFallback: SCENE_IMAGES.scene2,
    scrim:
      'linear-gradient(105deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.55) 50%, rgba(15,23,42,0.35) 100%)',
    scaleFrom: 1.04,
    scaleTo: 1.0,
    scaleOrigin: '50% 50%',
    yDrift: '-3vh',
    crossfadeStart: 0.40,
    crossfadeEnd: 0.43,
    layout: 'left',
    content: {
      eyebrow: 'THE REALITY',
      eyebrowClass: 'text-xs tracking-[0.2em] text-rose-300 font-semibold',
      //title: "Running a farm shouldn't feel like guesswork.",
      title: 'Money leaks between WhatsApp, exercise books and Excel.',
      titleClass:
        'font-jetbrains-mono font-bold leading-[1.1] tracking-tight text-[clamp(1.75rem,5vw,3.5rem)] text-white whitespace-pre-line',
      //body: 'Money leaks between WhatsApp, exercise books and Excel. Feed disappears. A sick animal goes unnoticed until it\u2019s too late.',
      body: 'Feed disappears 😢. A sick animal goes unnoticed until it\u2019s too late 🐄.',
      bodyClass: 'mt-5 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9 whitespace-pre-line',
    },
    showProblems: true,
    showProgressLine: true,
    progressLineColor: 'bg-rose-400/60',
  },
  {
    id: 'the-shift',
    label: 'The Shift',
    image: SCENE_IMAGES.scene3,
    imageFallback: SCENE_IMAGES.scene3,
    scrim:
      'linear-gradient(105deg, rgba(2,44,34,0.55) 0%, rgba(6,78,59,0.25) 45%, transparent 100%)',
    scaleFrom: 1.0,
    scaleTo: 1.05,
    scaleOrigin: '68% 45%',
    yDrift: '-2vh',
    crossfadeStart: 0.60,
    crossfadeEnd: 0.63,
    layout: 'left',
    content: {
      eyebrow: 'THE SHIFT',
      eyebrowClass: 'text-xs tracking-[0.2em] text-emerald-300 font-semibold',
      title: 'One App. Total clarity.',
      titleClass:
        'font-jetbrains-mono font-bold leading-[1.1] tracking-tight text-[clamp(1.75rem,5vw,3.5rem)] text-white',
      body: 'Every naira, every bag of feed, every animal — recorded in seconds, visible from anywhere.',
      bodyClass: 'mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg',
    },
    showSolutions: true,
  },
  {
    id: 'the-operation',
    label: 'The Operation',
    image: SCENE_IMAGES.scene4,
    imageFallback: SCENE_IMAGES.scene4,
    scrim:
      'linear-gradient(105deg, rgba(2,6,23,0.82) 0%, rgba(2,6,23,0.45) 45%, transparent 100%)',
    scaleFrom: 1.08,
    scaleTo: 1.0,
    scaleOrigin: '50% 50%',
    yDrift: '-2vh',
    crossfadeStart: 0.82,
    crossfadeEnd: 0.86,
    layout: 'left',
    content: {
      eyebrow: 'THE OPERATION',
      eyebrowClass: 'text-xs tracking-[0.2em] text-emerald-300 font-semibold',
      title: 'Built for Nigerian farmers.',
      titleClass:
        'font-jetbrains-mono font-bold leading-[1.1] tracking-tight text-[clamp(1.75rem,5vw,3.5rem)] text-white',
      body: 'Bank-level security. Works on low-end Android and patchy networks. Backed by a Nigerian support team that knows your season.',
      bodyClass: 'mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg',
    },
    showPhoneComposite: true,
    features: [
      { icon: Smartphone, label: 'Mobile-first' },
      { icon: ShieldCheck, label: 'AES-256 encrypted' },
      { icon: LineChart, label: 'Smart analytics' },
      { icon: Globe, label: 'Local support' },
    ],
  },
  {
    id: 'the-future',
    label: 'The Future',
    image: SCENE_IMAGES.scene5,
    imageFallback: SCENE_IMAGES.scene5,
    scrim:
      'linear-gradient(180deg, rgba(2,6,23,0.35) 0%, rgba(2,6,23,0.15) 40%, rgba(2,6,23,0.85) 100%)',
    scaleFrom: 1.1,
    scaleTo: 1.0,
    scaleOrigin: '50% 60%',
    yDrift: '-4vh',
    crossfadeStart: 0.96,
    crossfadeEnd: 1.0,
    layout: 'center',
    orbs: { one: true },
    content: {
      eyebrow: 'THE FUTURE',
      eyebrowClass: 'text-xs tracking-[0.2em] text-emerald-300 font-semibold',
      title: 'This is the future of farming.',
      titleClass:
        'font-jetbrains-mono font-bold leading-[1.1] tracking-tight text-[clamp(2rem,6vw,4.5rem)] text-white text-center',
      body: 'Join the farms already running on TrackFarmOps — and stay in control from anywhere.',
      bodyClass: 'mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg text-center mx-auto',
    },
    showFinalCta: true,
    showTestimonial: true,
  },
];

export { problems, solutions, heroChips, heroStats, testimonials };
