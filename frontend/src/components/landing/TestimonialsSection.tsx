import { Star } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { testimonials } from './content';

const TestimonialCard = ({ testimonial }: { testimonial: (typeof testimonials)[number] }) => (
  <article className="w-[320px] shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:w-[370px]">
    <div className="flex gap-1 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
    </div>
    <blockquote className="mt-5 text-sm leading-7 text-slate-600">“{testimonial.quote}”</blockquote>
    <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
      <img src={testimonial.avatar} alt={testimonial.name} className="h-10 w-10 rounded-full object-cover" />
      <div>
        <p className="text-sm font-bold text-slate-900">{testimonial.name}</p>
        <p className="text-xs text-slate-500">{testimonial.role}</p>
      </div>
    </div>
  </article>
);

const TestimonialsSection = () => {
  const doubledTestimonials = [...testimonials, ...testimonials];
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="absolute inset-0 z-0 bg-[url('/testimonial2.png')] bg-cover bg-fixed bg-center opacity-60" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Loved in the field" title="The numbers matter. So do the people behind them." /*description="Farm owners are replacing uncertainty with clear, confident action every day."*/ />
      </div>
      <div className="marquee-track relative z-10 mt-4 overflow-hidden">
        <div className="animate-marquee flex w-max gap-5 px-2">
          {doubledTestimonials.map((testimonial, index) => <TestimonialCard key={`${testimonial.name}-${index}`} testimonial={testimonial} />)}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
