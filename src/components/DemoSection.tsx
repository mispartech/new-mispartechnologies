import React, { useRef, useEffect, useState } from 'react';
import { Upload, Scan, CheckCircle2, Camera, Sparkles } from 'lucide-react';
import InteractiveFaceDemo from './InteractiveFaceDemo';
import LightweightDemoForm from './LightweightDemoForm';

const DemoSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } }); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  const wizardSteps = [
    { icon: Upload, label: 'Upload Photo', description: 'Enroll your face' },
    { icon: Scan, label: 'AI Scan', description: 'Face detection' },
    { icon: CheckCircle2, label: 'Verified', description: 'Identity confirmed' },
  ];

  return (
    <section id="demo" className="section-dark py-20 md:py-28" ref={sectionRef}>
      <div className="container-custom">
        <div className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan/10 border border-cyan/20 mb-6">
            <Sparkles className="w-4 h-4 text-cyan" />
            <span className="text-sm font-medium text-cyan">Live Experience</span>
          </div>
          <h2 className="mb-4 text-white">Experience the Magic</h2>
          <p className="text-white/50 text-lg">
            Three steps. Real AI. See it for yourself.
          </p>
        </div>

        {/* Step Wizard Progress */}
        <div className={`max-w-lg mx-auto mb-10 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${
                      i === 0 ? 'bg-cyan text-navy-dark shadow-[0_0_20px_hsl(190_90%_50%/0.3)]' : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                      <StepIcon size={20} />
                    </div>
                    <span className={`text-xs font-medium ${i === 0 ? 'text-cyan' : 'text-white/30'}`}>{step.label}</span>
                    <span className="text-[10px] text-white/20">{step.description}</span>
                  </div>
                  {i < wizardSteps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-white/5 mx-3 mb-6">
                      <div className="h-full bg-cyan/20 rounded-full" style={{ width: '0%' }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <InteractiveFaceDemo onComplete={() => setShowForm(true)} />
          <div className={`mt-12 pt-8 border-t border-white/10 transition-all duration-500 ${showForm ? 'opacity-100' : 'opacity-0'}`}>
            <LightweightDemoForm isVisible={showForm} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
