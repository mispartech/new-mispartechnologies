import React, { useEffect, useRef, useState } from 'react';
import { Camera, Scan, UserCheck, ClipboardCheck } from 'lucide-react';

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stepNumber: number;
  isActive: boolean;
  delay: number;
}

const Step = ({ icon, title, description, stepNumber, isActive, delay }: StepProps) => (
  <div 
    className={`relative flex flex-col items-center text-center group transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cyan text-navy-dark text-xs font-bold flex items-center justify-center z-10">
      {stepNumber}
    </div>
    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-cyan/30 group-hover:shadow-[0_0_30px_hsl(190_90%_50%/0.15)] transition-all duration-500">
      <div className="text-cyan group-hover:text-cyan-light transition-colors duration-300">
        {icon}
      </div>
    </div>
    <h3 className="font-inter font-semibold text-lg mb-2 text-white group-hover:text-cyan transition-colors duration-300">
      {title}
    </h3>
    <p className="text-white/50 text-sm max-w-[180px]">
      {description}
    </p>
  </div>
);

const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setTimeout(() => setLineProgress(100), 300);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  const steps = [
    { icon: <Camera size={32} />, title: "Face Capture", description: "Camera detects your face in a split second." },
    { icon: <Scan size={32} />, title: "Feature Mapping", description: "We map unique points that make you, you." },
    { icon: <UserCheck size={32} />, title: "Identity Matching", description: "Your face is matched securely and instantly." },
    { icon: <ClipboardCheck size={32} />, title: "Attendance Logged", description: "Done! Your attendance is recorded automatically." },
  ];

  return (
    <section 
      id="how-it-works" 
      className="section-dark py-20 md:py-28"
      ref={sectionRef}
    >
      <div className="container-custom relative z-10">
        <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="mb-4 text-white">How Face Recognition Works</h2>
          <p className="text-white/50 text-lg">
            Four simple steps. Zero hassle. Instant results.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-white/5">
            <div 
              className="h-full bg-gradient-to-r from-cyan via-cyan-light to-cyan transition-all duration-1000 ease-out"
              style={{ width: `${lineProgress}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {steps.map((step, index) => (
              <Step key={index} icon={step.icon} title={step.title} description={step.description} stepNumber={index + 1} isActive={isVisible} delay={index * 150} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
