import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

interface CTASectionProps {
  onRequestDemo: () => void;
}

const CTASection = ({ onRequestDemo }: CTASectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) setIsVisible(true); }); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-dark">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cyan/10 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan/5 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan/20 to-transparent animate-scan-down" />
        </div>
      </div>

      <div className="container-custom relative z-10">
        <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-cyan" />
            <span className="text-sm font-medium text-white/50">Ready to transform your organization?</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            See yourself in the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-cyan-light to-mint">
              future of attendance.
            </span>
          </h2>
          <p className="text-xl text-white/40 mb-10 max-w-xl mx-auto">
            Join thousands of organizations who have made attendance effortless.
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Button 
              size="lg" 
              className="button-glow bg-cyan text-navy-dark font-semibold text-lg px-8 py-6 hover:bg-cyan-light group"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Try Live Demo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/20 text-white hover:bg-white/5 hover:border-cyan/30 text-lg px-8 py-6 group"
              onClick={onRequestDemo}
            >
              <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Talk to an Expert
            </Button>
          </div>
          <p className={`mt-10 text-sm text-white/30 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            No commitment required • 5-minute setup • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
