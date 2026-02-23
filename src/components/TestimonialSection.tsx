import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Building2, GraduationCap, Church, TrendingUp, Users } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  type: 'school' | 'church' | 'company';
  quote: string;
  impactMetric: string;
  impactLabel: string;
}

const TestimonialSection = () => {
  const testimonials: Testimonial[] = [
    { id: 1, name: "Dr. Sarah Johnson", role: "Principal", company: "Heritage Academy", type: 'school', quote: "Our staff saves hours each day on attendance. Students can no longer have friends answer for them—it's completely transformed our classroom management.", impactMetric: "3 hrs", impactLabel: "Saved daily" },
    { id: 2, name: "Michael Thompson", role: "IT Director", company: "GlobalTech Corp", type: 'company', quote: "Implementation was smooth, and the security enhancements have been remarkable. Their support team is always available when we need them.", impactMetric: "98%", impactLabel: "Accuracy rate" },
    { id: 3, name: "Pastor Emmanuel Okonkwo", role: "Senior Pastor", company: "Grace Fellowship Church", type: 'church', quote: "Our congregation of over 2,000 members now enjoys a seamless attendance experience. We can focus more on ministry instead of administrative tasks.", impactMetric: "2,000+", impactLabel: "Members tracked" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const nextTestimonial = () => {
    if (isAnimating) return;
    setSlideDirection('right');
    setIsAnimating(true);
    setTimeout(() => { setCurrentIndex((prev) => (prev + 1) % testimonials.length); setIsAnimating(false); }, 300);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setSlideDirection('left');
    setIsAnimating(true);
    setTimeout(() => { setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length); setIsAnimating(false); }, 300);
  };

  const getTypeIcon = (type: string) => {
    switch (type) { case 'school': return GraduationCap; case 'church': return Church; default: return Building2; }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'school': return { label: 'Education', color: 'bg-cyan/10 text-cyan border-cyan/20' };
      case 'church': return { label: 'Religious Org', color: 'bg-mint/10 text-mint border-mint/20' };
      default: return { label: 'Enterprise', color: 'bg-cyan-light/10 text-cyan-light border-cyan-light/20' };
    }
  };

  useEffect(() => {
    autoPlayRef.current = setInterval(nextTestimonial, 6000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, []);

  const current = testimonials[currentIndex];
  const TypeIcon = getTypeIcon(current.type);
  const typeBadge = getTypeBadge(current.type);

  return (
    <section className="section-dark py-20 md:py-28 overflow-hidden">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan/10 border border-cyan/20 mb-6">
            <Users className="w-4 h-4 text-cyan" />
            <span className="text-sm font-medium text-cyan">Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Organizations Like Yours
          </h2>
          <p className="text-lg text-white/40">
            See how schools, churches, and companies are transforming their operations.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className={`glass-card p-8 md:p-10 transition-all duration-300 ${isAnimating ? (slideDirection === 'right' ? 'opacity-0 translate-x-8' : 'opacity-0 -translate-x-8') : 'opacity-100 translate-x-0'}`}>
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-cyan flex items-center justify-center">
                <Quote size={16} className="text-navy-dark" />
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan/20 to-cyan-light/10 flex items-center justify-center mb-4 ring-2 ring-cyan/20">
                    <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center">
                      <TypeIcon className="w-8 h-8 text-cyan" />
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-lg">{current.name}</h4>
                  <p className="text-white/40 text-sm mb-3">{current.role}</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${typeBadge.color}`}>
                    <TypeIcon size={12} /> {typeBadge.label}
                  </span>
                  <div className="mt-6 p-4 rounded-xl bg-cyan/5 border border-cyan/10 w-full">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp size={14} className="text-cyan" />
                      <span className="text-2xl font-bold text-cyan">{current.impactMetric}</span>
                    </div>
                    <p className="text-xs text-white/40">{current.impactLabel}</p>
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col justify-center">
                  <blockquote className="text-xl md:text-2xl text-white/80 leading-relaxed mb-6">
                    "{current.quote}"
                  </blockquote>
                  <p className="text-cyan font-medium">{current.company}</p>
                </div>
              </div>
            </div>

            <button onClick={prevTestimonial} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-10 h-10 rounded-full bg-navy-light border border-white/10 text-white hover:bg-cyan hover:border-cyan hover:text-navy-dark transition-all duration-300 flex items-center justify-center" aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextTestimonial} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-10 h-10 rounded-full bg-navy-light border border-white/10 text-white hover:bg-cyan hover:border-cyan hover:text-navy-dark transition-all duration-300 flex items-center justify-center" aria-label="Next">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating) return;
                  setSlideDirection(index > currentIndex ? 'right' : 'left');
                  setIsAnimating(true);
                  setTimeout(() => { setCurrentIndex(index); setIsAnimating(false); }, 300);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-cyan' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
