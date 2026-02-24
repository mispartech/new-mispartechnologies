import React, { useEffect, useRef, useState } from 'react';
import { Camera, Scan, UserCheck, ClipboardCheck } from 'lucide-react';

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stepNumber: number;
  isActive: boolean;
  isHovered: boolean;
  onHover: (hover: boolean) => void;
  onTap: () => void;
  delay: number;
}

const Step = ({ icon, title, description, stepNumber, isActive, isHovered, onHover, onTap, delay }: StepProps) => (
  <div
    className={`relative flex flex-col items-center text-center group transition-all duration-500 cursor-pointer ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    style={{ transitionDelay: `${delay}ms` }}
    onMouseEnter={() => onHover(true)}
    onMouseLeave={() => onHover(false)}
    onClick={onTap}
  >
    {/* Step number badge */}
    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center z-10 transition-all duration-300 ${isHovered ? 'bg-cyan text-navy-dark scale-125' : 'bg-cyan/80 text-navy-dark'}`}>
      {stepNumber}
    </div>

    {/* Icon container */}
    <div className={`relative w-16 h-16 md:w-28 md:h-28 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-all duration-500 ${isHovered ? 'bg-cyan/10 border-cyan/40 shadow-[0_0_40px_hsl(190_90%_50%/0.25)] scale-105 md:scale-110' : 'bg-white/5 border border-white/10'}`}>
      {/* Animated mapping points on hover */}
      {isHovered && stepNumber === 2 && (
        <div className="absolute inset-0 pointer-events-none">
          {[
            { x: 30, y: 25 }, { x: 70, y: 25 }, { x: 50, y: 40 },
            { x: 35, y: 55 }, { x: 65, y: 55 }, { x: 50, y: 65 },
          ].map((dot, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-cyan animate-scale-in"
              style={{ left: `${dot.x}%`, top: `${dot.y}%`, animationDelay: `${i * 50}ms` }}
            />
          ))}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
            <line x1="30" y1="25" x2="70" y2="25" stroke="hsl(190 90% 50%)" strokeWidth="0.5" />
            <line x1="30" y1="25" x2="50" y2="40" stroke="hsl(190 90% 50%)" strokeWidth="0.5" />
            <line x1="70" y1="25" x2="50" y2="40" stroke="hsl(190 90% 50%)" strokeWidth="0.5" />
          </svg>
        </div>
      )}

      {isHovered && stepNumber === 1 && (
        <div className="absolute inset-0 overflow-hidden rounded-xl md:rounded-2xl">
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan to-transparent animate-scan-line" />
        </div>
      )}

      {isHovered && stepNumber === 3 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full rounded-xl md:rounded-2xl border-2 border-mint/30 animate-scale-in" />
        </div>
      )}

      {isHovered && stepNumber === 4 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full rounded-xl md:rounded-2xl bg-mint/10 animate-glow-pulse" />
        </div>
      )}

      <div className={`transition-all duration-300 ${isHovered ? 'text-cyan scale-110' : 'text-cyan/70'}`}>
        {React.cloneElement(icon as React.ReactElement, { size: undefined, className: 'w-6 h-6 md:w-9 md:h-9' })}
      </div>
    </div>

    <h3 className={`font-inter font-semibold text-sm md:text-lg mb-1 md:mb-2 transition-colors duration-300 ${isHovered ? 'text-cyan' : 'text-white'}`}>
      {title}
    </h3>
    <p className={`text-xs md:text-sm max-w-[160px] md:max-w-[200px] transition-colors duration-300 ${isHovered ? 'text-white/70' : 'text-white/40'}`}>
      {description}
    </p>
  </div>
);

const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(100, ((viewportHeight - rect.top) / (viewportHeight + rect.height)) * 150));
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    { icon: <Camera />, title: "Face Capture", description: "Camera detects your face in a split second." },
    { icon: <Scan />, title: "Feature Mapping", description: "We map unique points that make you, you." },
    { icon: <UserCheck />, title: "Identity Matching", description: "Your face is matched securely and instantly." },
    { icon: <ClipboardCheck />, title: "Attendance Logged", description: "Done! Your attendance is recorded automatically." },
  ];

  return (
    <section
      id="how-it-works"
      className="section-dark py-16 md:py-20 lg:py-28"
      ref={sectionRef}
    >
      <div className="container-custom relative z-10">
        <div className={`text-center max-w-2xl mx-auto mb-10 md:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-3 md:px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs md:text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="mb-3 md:mb-4 text-white">How Face Recognition Works</h2>
          <p className="text-white/50 text-sm md:text-lg">
            Four simple steps. Zero hassle. Instant results.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Animated progress line - desktop horizontal */}
          <div className="hidden md:block absolute top-14 left-[10%] right-[10%] h-0.5 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-cyan via-cyan-light to-cyan rounded-full transition-none"
              style={{ width: `${scrollProgress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan shadow-[0_0_12px_hsl(190_90%_50%/0.6)] transition-none"
              style={{ left: `${scrollProgress}%` }}
            />
          </div>

          {/* Mobile vertical progress line */}
          <div className="md:hidden absolute left-[24px] top-0 bottom-0 w-0.5 bg-white/5">
            <div
              className="w-full bg-gradient-to-b from-cyan to-cyan-light rounded-full transition-none"
              style={{ height: `${scrollProgress}%` }}
            />
          </div>

          {/* Step indicators on the desktop line */}
          <div className="hidden md:flex absolute top-14 left-[10%] right-[10%] justify-between -translate-y-1/2">
            {steps.map((_, i) => {
              const stepPosition = (i / (steps.length - 1)) * 100;
              const isReached = scrollProgress >= stepPosition;
              return (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${isReached ? 'bg-cyan shadow-[0_0_12px_hsl(190_90%_50%/0.5)]' : 'bg-white/10'}`}
                />
              );
            })}
          </div>

          {/* Grid: 1 col mobile, 4 col desktop */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-6 pl-12 md:pl-0">
            {steps.map((step, index) => (
              <Step
                key={index}
                icon={step.icon}
                title={step.title}
                description={step.description}
                stepNumber={index + 1}
                isActive={isVisible}
                isHovered={hoveredStep === index}
                onHover={(hover) => setHoveredStep(hover ? index : null)}
                onTap={() => setHoveredStep(hoveredStep === index ? null : index)}
                delay={index * 150}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
