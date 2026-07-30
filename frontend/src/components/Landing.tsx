import Navigation from './Navigation';
import Pricing from './Pricing';
import BenefitsSection from './landing/BenefitsSection';
import FeaturesSection from './landing/FeaturesSection';
import Hero from './landing/Hero';
import HowItWorksSection from './landing/HowItWorksSection';
import LandingFooter from './landing/LandingFooter';
import ProblemsSection from './landing/ProblemsSection';
import SolutionsSection from './landing/SolutionsSection';
import TestimonialsSection from './landing/TestimonialsSection';

const Landing = () => (
  <div className="min-h-screen overflow-x-hidden bg-white">
    <Navigation />
    <main>
      <Hero />
      <ProblemsSection />
      <SolutionsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <BenefitsSection />
      <TestimonialsSection />
      <Pricing />
    </main>
    <LandingFooter />
  </div>
);

export default Landing;
