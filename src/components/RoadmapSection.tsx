import React, { useState, useRef, useEffect } from 'react';
import { Rocket, GraduationCap, Shield, Heart, Globe, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface MilestoneProps {
  title: string;
  date: string;
  description: string;
  icon: React.ElementType;
  isCompleted?: boolean;
  isCurrent?: boolean;
  isActive: boolean;
  onClick: () => void;
  isSelected: boolean;
  index: number;
  total: number;
}

const Milestone = ({ title, date, description, icon: Icon, isCompleted, isCurrent, isActive, onClick, isSelected, index, total }: MilestoneProps) => (
  <div
    className={`flex flex-col items-center cursor-pointer group transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}
    onClick={onClick}
    style={{ minWidth: '160px', flex: 1 }}
  >
    {/* Dot on timeline */}
    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${
      isSelected
        ? 'bg-cyan shadow-[0_0_30px_hsl(190_90%_50%/0.4)] scale-125'
        : isCompleted
          ? 'bg-mint'
          : isCurrent
            ? 'bg-cyan ring-4 ring-cyan/20 animate-glow-pulse'
            : 'bg-navy-light border border-white/10'
    }`}>
      {isCompleted ? (
        <CheckCircle2 size={18} className="text-navy-dark" />
      ) : isCurrent ? (
        <>
          <Icon size={18} className="text-navy-dark" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-mint rounded-full flex items-center justify-center">
            <Sparkles size={8} className="text-navy-dark" />
          </div>
        </>
      ) : (
        <Icon size={18} className="text-white/40" />
      )}
    </div>

    {/* Label */}
    <span className={`text-xs font-medium mb-1 transition-colors ${isSelected ? 'text-cyan' : isCompleted ? 'text-mint' : isCurrent ? 'text-cyan' : 'text-white/30'}`}>
      {date}
    </span>
    <span className={`text-sm font-semibold text-center max-w-[140px] transition-colors ${isSelected ? 'text-white' : 'text-white/50 group-hover:text-white/70'}`}>
      {title}
    </span>
  </div>
);

const RoadmapSection = () => {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll-triggered progress
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

  const milestones = [
    { title: "System Launch", date: "Jan 2023", description: "Initial release of our core facial recognition attendance tracking solution. Pioneering automated biometric check-ins across Nigeria.", icon: Rocket, isCompleted: true },
    { title: "Education Integration", date: "Jun 2023", description: "Specialized features for schools and universities—automated class attendance, exam verification, and campus security.", icon: GraduationCap, isCompleted: true },
    { title: "Enhanced Security", date: "Dec 2023", description: "Advanced multi-factor authentication, watchlist screening, and enterprise-grade access control systems.", icon: Shield, isCurrent: true },
    { title: "Healthcare Systems", date: "Mar 2024", description: "Patient identification, medical record access, and pharmacy verification for hospitals and clinics.", icon: Heart },
    { title: "Global Expansion", date: "Sep 2024", description: "Mobile applications, API platform, and international market expansion across Africa and beyond.", icon: Globe },
  ];

  const selected = milestones[selectedIndex];

  return (
    <section id="roadmap" className="section-dark py-20 md:py-28" ref={sectionRef}>
      <div className="container-custom">
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan/10 border border-cyan/20 mb-6">
            <Clock className="w-4 h-4 text-cyan" />
            <span className="text-sm font-medium text-cyan">Product Roadmap</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Journey of Innovation</h2>
          <p className="text-white/40 text-lg">Click any milestone to explore our progress.</p>
        </div>

        {/* Horizontal Timeline */}
        <div className={`max-w-4xl mx-auto mb-10 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Timeline bar */}
          <div className="relative mb-6">
            <div className="absolute top-5 left-[8%] right-[8%] h-0.5 bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-mint via-cyan to-cyan-light rounded-full transition-none"
                style={{ width: `${Math.min(scrollProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Milestones */}
          <div ref={timelineRef} className="flex justify-between overflow-x-auto pb-4 scrollbar-hide gap-2">
            {milestones.map((milestone, index) => (
              <Milestone
                key={index}
                {...milestone}
                index={index}
                total={milestones.length}
                isActive={isVisible}
                isSelected={selectedIndex === index}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Selected Detail Card */}
        <div className={`max-w-2xl mx-auto transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className={`glass-card p-8 transition-all duration-300 ${selected.isCurrent ? 'border-cyan/30 shadow-[0_0_40px_hsl(190_90%_50%/0.1)]' : ''}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                selected.isCompleted ? 'bg-mint/10 text-mint' : selected.isCurrent ? 'bg-cyan/20 text-cyan' : 'bg-white/5 text-white/30'
              }`}>
                {selected.date}
              </span>
              {selected.isCurrent && (
                <span className="text-xs px-3 py-1 rounded-full bg-cyan text-navy-dark font-medium animate-pulse-soft">
                  Current Phase
                </span>
              )}
              {!selected.isCompleted && !selected.isCurrent && (
                <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/30 font-medium animate-pulse-soft">
                  Coming Soon
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{selected.title}</h3>
            <p className="text-white/50 leading-relaxed">{selected.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
