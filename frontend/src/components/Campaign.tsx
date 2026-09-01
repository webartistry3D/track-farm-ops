import Navigation from './Navigation';
import CampaignHero from './campaign/CampaignHero';
import StorySection from './campaign/StorySection';
import CapabilitiesSection from './campaign/CapabilitiesSection';
import WhySupportSection from './campaign/WhySupportSection';
import SponsorFarmSection from './campaign/SponsorFarmSection';
import SupporterTiers from './campaign/SupporterTiers';
import FundAllocation from './campaign/FundAllocation';
import MilestoneTimeline from './campaign/MilestoneTimeline';
import SocialProofSection from './campaign/SocialProofSection';
import DiasporaSection from './campaign/DiasporaSection';
import CampaignFooterCTA from './campaign/CampaignFooterCTA';
import LandingFooter from './landing/LandingFooter';

const Campaign = () => (
  <div className="min-h-screen overflow-x-hidden bg-white">
    <Navigation />
    <main>
      <CampaignHero />
      <StorySection />
      <CapabilitiesSection />
      <WhySupportSection />
      <SponsorFarmSection />
      <SupporterTiers />
      <FundAllocation />
      <MilestoneTimeline />
      <SocialProofSection />
      <DiasporaSection />
      <CampaignFooterCTA />
    </main>
    <LandingFooter />
  </div>
);

export default Campaign;
