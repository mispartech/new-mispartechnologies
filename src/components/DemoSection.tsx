import React, { useRef, useEffect, useState } from 'react';
import { Upload, Scan, CheckCircle2, Camera, Sparkles, Clock } from 'lucide-react';
import InteractiveFaceDemo from './InteractiveFaceDemo';
import LightweightDemoForm from './LightweightDemoForm';

const DemoSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } }); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  const wizardSteps = [
    { icon: Upload, label: 'Upload', description: 'Enroll your face' },
    { icon: Scan, label: 'AI Scan', description: 'Face detection' },
    { icon: CheckCircle2, label: 'Verified', description: 'Identity confirmed' },
  ];

  return (
    <section id="demo" className="section-dark py-16 md:py-20 lg:py-28" ref={sectionRef}>
      <div className="container-custom">
        <div className={`text-center max-w-2xl mx-auto mb-8 md:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-cyan/10 border border-cyan/20 mb-4 md:mb-6">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan" />
            <span className="text-xs md:text-sm font-medium text-cyan">Live Experience</span>
          </div>
          <h2 className="mb-3 md:mb-4 text-white">Experience the Magic</h2>
          <p className="text-white/50 text-sm md:text-lg">
            Three steps. Real AI. See it for yourself.
          </p>
        </div>

        {/* Step Wizard Progress */}
        <div className={`max-w-sm md:max-w-lg mx-auto mb-8 md:mb-10 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1.5 md:mb-2 transition-all duration-500 ${
                      i === 0 ? 'bg-cyan text-navy-dark shadow-[0_0_20px_hsl(190_90%_50%/0.3)]' : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                      <StepIcon size={18} className="md:w-5 md:h-5" />
                    </div>
                    <span className={`text-[10px] md:text-xs font-medium ${i === 0 ? 'text-cyan' : 'text-white/30'}`}>{step.label}</span>
                    <span className="text-[9px] md:text-[10px] text-white/20 hidden sm:block">{step.description}</span>
                  </div>
                  {i < wizardSteps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-white/5 mx-2 md:mx-3 mb-4 md:mb-6">
                      <div className="h-full bg-cyan/20 rounded-full" style={{ width: '0%' }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Blurred interactive area with Coming Soon overlay */}
        <div className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Coming Soon overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-navy-dark/90 border border-cyan/30 shadow-lg shadow-cyan/10 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-cyan animate-pulse" />
              <span className="text-sm font-semibold text-white">Coming Soon</span>
              <span className="text-xs text-white/50">— Backend integration in progress</span>
            </div>
          </div>
          {/* Blurred content */}
          <div className="blur-sm pointer-events-none select-none">
            <InteractiveFaceDemo onComplete={() => {}} />
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/10 opacity-0">
              <LightweightDemoForm isVisible={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
