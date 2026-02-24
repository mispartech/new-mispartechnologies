import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Building2, GraduationCap, Church, TrendingUp, Users, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  type: 'school' | 'church' | 'company';
  quote: string;
  impactMetrics: { value: string; label: string }[];
  rating: number;
}

const TestimonialSection = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1, name: "Dr. Sarah Johnson", role: "Principal", company: "Heritage Academy", type: 'school',
      quote: "Our staff saves hours each day on attendance. Students can no longer have friends answer for them—it's completely transformed our classroom management.",
      impactMetrics: [
        { value: '3 hrs', label: 'Saved daily' },
        { value: '1,200+', label: 'Students enrolled' },
        { value: '0', label: 'Proxy incidents' },
      ],
      rating: 5,
    },
    {
      id: 2, name: "Michael Thompson", role: "IT Director", company: "GlobalTech Corp", type: 'company',
      quote: "Implementation was smooth, and the security enhancements have been remarkable. Their support team is always available when we need them.",
      impactMetrics: [
        { value: '98%', label: 'Accuracy rate' },
        { value: '15 hrs', label: 'Saved weekly' },
        { value: '<1s', label: 'Check-in time' },
      ],
      rating: 5,
    },
    {
      id: 3, name: "Pastor Emmanuel Okonkwo", role: "Senior Pastor", company: "Grace Fellowship Church", type: 'church',
      quote: "Our congregation of over 2,000 members now enjoys a seamless attendance experience. We can focus more on ministry instead of administrative tasks.",
      impactMetrics: [
        { value: '2,000+', label: 'Members tracked' },
        { value: '5 min', label: 'Setup time' },
        { value: '100%', label: 'Satisfaction' },
      ],
      rating: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const navigate = (direction: 'left' | 'right') => {
    if (isAnimating) return;
    setSlideDirection(direction);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        direction === 'right'
          ? (prev + 1) % testimonials.length
          : (prev - 1 + testimonials.length) % testimonials.length
      );
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    autoPlayRef.current = setInterval(() => navigate('right'), 6000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, []);

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

  const current = testimonials[currentIndex];
  const TypeIcon = getTypeIcon(current.type);
  const typeBadge = getTypeBadge(current.type);

  return (
    <section className="section-dark py-20 md:py-28 overflow-hidden" ref={sectionRef}>
      <div className="container-custom">
        <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan/10 border border-cyan/20 mb-6">
            <Users className="w-4 h-4 text-cyan" />
            <span className="text-sm font-medium text-cyan">Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Organizations Like Yours
          </h2>
          <p className="text-lg text-white/40">
            Real results from schools, churches, and companies transforming their operations.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Main testimonial card */}
          <div className="relative">
            <div className={`glass-card overflow-hidden transition-all duration-300 ${isAnimating ? (slideDirection === 'right' ? 'opacity-0 translate-x-8' : 'opacity-0 -translate-x-8') : 'opacity-100 translate-x-0'}`}>
              <div className="grid md:grid-cols-5 gap-0">
                {/* Left: Quote & Person */}
                <div className="md:col-span-3 p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center">
                      <Quote size={18} className="text-cyan" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${typeBadge.color}`}>
                      <TypeIcon size={12} /> {typeBadge.label}
                    </span>
                  </div>

                  <blockquote className="text-xl md:text-2xl text-white/80 leading-relaxed mb-8 font-light italic">
                    "{current.quote}"
                  </blockquote>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: current.rating }).map((_, i) => (
                      <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan/20 to-mint/10 flex items-center justify-center ring-2 ring-white/10">
                      <span className="text-lg font-bold text-cyan">{current.name[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{current.name}</h4>
                      <p className="text-white/40 text-sm">{current.role}, {current.company}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Impact Snapshot */}
                <div className="md:col-span-2 bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/5 p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={16} className="text-cyan" />
                    <span className="text-sm font-medium text-cyan">Impact Snapshot</span>
                  </div>

                  <div className="space-y-4">
                    {current.impactMetrics.map((metric, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan/20 transition-all duration-300 group">
                        <div className="text-2xl font-bold text-cyan mb-1 group-hover:scale-105 transition-transform origin-left">
                          {metric.value}
                        </div>
                        <div className="text-xs text-white/40">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <button onClick={() => navigate('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-10 h-10 rounded-full bg-navy-light border border-white/10 text-white hover:bg-cyan hover:border-cyan hover:text-navy-dark transition-all duration-300 flex items-center justify-center" aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => navigate('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-10 h-10 rounded-full bg-navy-light border border-white/10 text-white hover:bg-cyan hover:border-cyan hover:text-navy-dark transition-all duration-300 flex items-center justify-center" aria-label="Next">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dots */}
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

          {/* Organization logos placeholder */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-center text-xs text-white/20 mb-6 uppercase tracking-wider">Trusted by organizations across Africa</p>
            <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap">
              {['Heritage Academy', 'GlobalTech Corp', 'Grace Fellowship', 'Unity Schools', 'SecureBank'].map((name, i) => (
                <div key={i} className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-white/20 text-sm font-medium hover:text-white/40 hover:border-white/10 transition-all duration-300">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
