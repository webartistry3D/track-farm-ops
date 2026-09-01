import SectionHeading from '../landing/SectionHeading';
import Reveal from '../animations/Reveal';

const StorySection = () => {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Story"
          title="Built. Deployed. Now We Need to Reach More Farmers."
          titleDelay={0.2}
        />
        
        <Reveal delay={0.4} className="max-w-3xl mx-auto">
          <div className="prose prose-lg prose-emerald">
            <p className="text-gray-600 leading-relaxed mb-6">
              TrackFarmOps already exists. It's not a concept or a prototype—it's a fully built farm management 
              system that's currently being used by a paying Nigerian farm to manage their daily operations.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              The next challenge isn't building the product. The product is built. The challenge is farmer 
              acquisition and sustainable growth. We need to reach more Nigerian farms and help them discover 
              tools that can transform their operations.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Support from this campaign will help cover operating costs, product maintenance, marketing efforts, 
              and farmer acquisition initiatives. We're not asking for charity—we're inviting partners who believe 
              Nigerian farmers deserve better digital tools.
            </p>
            <p className="text-gray-600 leading-relaxed">
              The product is built. The journey has started. We're opening the journey to supporters who want 
              to help us take TrackFarmOps from 1 farm to 100.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default StorySection;
