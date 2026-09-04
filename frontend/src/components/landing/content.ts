import type { LucideIcon } from 'lucide-react';
import {
  TrendingDown,
  PackageX,
  Wrench,
  HeartPulse,
  UserX,
  Network,
  Wallet,
  Banknote,
  Tractor,
  Boxes,
  Stethoscope,
  Users,
  BarChart3,
  Target,
  LineChart,
  Smartphone,
  ShieldCheck,
  Globe,
  Rocket,
  UserPlus,
  UsersRound,
  Activity,
} from 'lucide-react';

export interface IconCard {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind gradient stops, e.g. 'from-emerald-500 to-green-600' */
  accent: string;
}

export interface Step {
  icon: LucideIcon;
  step: string;
  title: string;
  //description: string;
}

export interface Stat {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
}

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
}

export const heroChips = [
  { text: 'Complete farm management system', accent: 'from-emerald-500/80 to-green-600/80' },
  // { text: 'Income, expenses, inventory & assets', accent: 'from-sky-500/80 to-blue-600/80' },
  { text: 'Monitor operations from anywhere', accent: 'from-amber-500/80 to-orange-600/80' },
];

export const heroStats: Stat[] = [
  { value: 30, suffix: '%', label: 'Avg. profit uplift' },
  { value: 6, label: 'Modules' },
  { value: 4.7, decimals: 1, suffix: '/5', label: 'Farmer rating' },
  { value: 24, suffix: '/7', label: 'Remote monitoring' },
];

export const problems: IconCard[] = [
  {
    icon: TrendingDown,
    title: 'Poor Financial Visibility',
    description: 'Farmers cannot answer: How much did we earn? Where is money leaking? Which unit is profitable?',
    accent: 'from-rose-500 to-red-600',
  },
  {
    icon: PackageX,
    title: 'Weak Inventory Control',
    description: 'Difficulty tracking feed, fertilizers, chemicals, seeds, produce — leading to losses, theft, and wastage.',
    accent: 'from-rose-500 to-red-600',
  },
  {
    icon: Wrench,
    title: 'Poor Asset Management',
    description: 'Struggle to monitor tractors, irrigation, generators, vehicles, including maintenance and depreciation.',
    accent: 'from-rose-500 to-red-600',
  },
  {
    icon: HeartPulse,
    title: 'Livestock Health Risks',
    description: 'No systematic tracking of vaccinations, checkups, or health status leading to disease outbreaks and losses.',
    accent: 'from-rose-500 to-red-600',
  },
  {
    icon: UserX,
    title: 'Workforce Accountability',
    description: 'Limited visibility into worker attendance, tasks, completion, and daily field activities.',
    accent: 'from-rose-500 to-red-600',
  },
  {
    icon: Network,
    title: 'Fragmented Operations',
    description: 'Information scattered across WhatsApp, exercise books, Excel sheets, and individual managers.',
    accent: 'from-rose-500 to-red-600',
  },
];

export const solutions: IconCard[] = [
  {
    icon: Banknote,
    title: 'Income',
    description: 'Track produce sales, livestock sales, expenses, with revenue dashboard, trends, and profit reports.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: Wallet,
    title: 'Expenses',
    description: 'Track produce sales, livestock sales, expenses, with revenue dashboard, trends, and profit reports.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: Boxes,
    title: 'Inventory',
    description: 'Track seeds, feed, fertilizers, agrochemicals with stock levels, low-stock alerts, and waste tracking.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: Tractor,
    title: 'Assets',
    description: 'Track tractors, generators, vehicles with asset register, maintenance scheduling, and utilization tracking.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: Stethoscope,
    title: 'Livestock Health',
    description: 'Track health status, vaccinations, checkups, and treatments with veterinarian role access.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Convert raw farm data into business intelligence: income vs expenses, profitability, and efficiency.',
    accent: 'from-emerald-500 to-green-600',
  },
];

export const steps: Step[] = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Sign Up',
    //description: 'Create an account to set up your farm profile in seconds.',
  },
  {
    icon: UsersRound,
    step: '02',
    title: 'Add Workers',
    //description: 'Add your farm workers and assign roles and responsibilities.',
  },
  {
    icon: Activity,
    step: '03',
    title: 'Start Tracking',
    //description: 'Begin tracking operations, assets, and optimizing your farm workflow.',
  },
];

export const features: IconCard[] = [
  {
    icon: Wallet,
    title: 'Income & Expense Tracker',
    description: 'Track produce sales, livestock sales, expenses, with revenue dashboard, trends, and profit reports.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: Boxes,
    title: 'Inventory & Assets Manager',
    description: 'Track seeds, feed, fertilizers, agrochemicals with stock levels, low-stock alerts, and waste tracking.',
    accent: 'from-teal-500 to-emerald-600',
  },
  {
    icon: Stethoscope,
    title: 'Livestock Health Manager',
    description: 'Track health status, vaccinations, checkups, and treatments with veterinarian role access.',
    accent: 'from-lime-500 to-green-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Convert raw farm data into business intelligence: income vs expenses, profitability, and efficiency.',
    accent: 'from-green-500 to-emerald-600',
  },
  {
    icon: Users,
    title: 'Multi-User Access',
    description: 'Assign roles and permissions to workers, managers, and owners for secure collaboration.',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Works perfectly on smartphones and tablets — manage your farm from anywhere in the field.',
    accent: 'from-green-600 to-lime-600',
  },
];

export const benefits: IconCard[] = [
  {
    icon: Target,
    title: 'Increase Profitability',
    description: "Track expenses and income in real-time to identify cost-saving opportunities. Our analytics help boost your farm's bottom line by up to 30%.",
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: LineChart,
    title: 'Smart Analytics',
    description: 'Get detailed insights with customizable reports and dashboards. Monitor crop performance, livestock health, and financial trends in one place.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Manage your farm from anywhere with our mobile-optimized app. Works perfectly on low-end Android phones even with poor connectivity.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Level Security',
    description: 'Your farm data is protected with AES-256 encryption and secure backups. We comply with international data protection standards.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: Globe,
    title: 'Local Support',
    description: "Get dedicated support from our Nigerian team who understand local farming challenges. We're here to help you succeed 24/7.",
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: Rocket,
    title: 'Easy Onboarding',
    description: 'Get started in minutes with our intuitive interface. No technical knowledge required — just sign up and start managing like a pro.',
    accent: 'from-emerald-500 to-green-600',
  },
];

export const testimonials: Testimonial[] = [
  {
    name: 'John Akpoborie',
    role: 'Mixed Farm Owner',
    avatar: '/Uche.jpg',
    quote: 'TrackFarmOps has enhanced our farm operations. The expense tracking alone has saved us thousands in just a few months.',
  },
  {
    name: 'Sarah Miller',
    role: 'Crop Farmer',
    avatar: '/Sarah.jpg',
    quote: 'The inventory management feature is exactly what we needed. We can now track our seed, fertilizer, and equipment in one place.',
  },
  {
    name: 'Ngozi Okafor',
    role: 'Mixed Farm Owner',
    avatar: '/Ngozi.jpg',
    quote: 'The analytics dashboard gives us insights we never had before. We can make better decisions based on real data.',
  },
  {
    name: 'Abdul Rahman',
    role: 'Poultry Farmer',
    avatar: '/Alex.jpg',
    quote: 'Managing multiple farm locations was a nightmare. Now I have real-time visibility into all my operations from one dashboard.',
  },
];

export const trustedAvatars = ['/Alex.jpg', '/Sarah.jpg', '/Ngozi.jpg', '/Uche.jpg', '/Amina.jpg', '/Emeka.jpg'];
