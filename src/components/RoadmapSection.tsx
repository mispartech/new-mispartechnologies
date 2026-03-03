import React, { useState, useRef, useEffect } from 'react';
import { Rocket, GraduationCap, Shield, Heart, Globe, CheckCircle2, Clock, Sparkles } from 'lucide-react';

const RoadmapSection = () => {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const sectionRef = useRef<HTMLDivElement>(null);
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
    { title: "System Launch", date: "Jan 2026", description: "Initial release of our core facial recognition platform. Pioneering automated biometric identification across Nigeria.", icon: Rocket, isCompleted: true },
    { title: "Smart Attendance Solution", date: "Mar 2026", description: "Automated attendance tracking for organizations, schools, and enterprises using real-time facial recognition check-ins.", icon: GraduationCap, isCurrent: true },
    { title: "Smart Security Solution", date: "Sep 2026", description: "Real-time surveillance, authentication & access control for restricted areas using face recognition, plus real-time monitoring and emotional detection against biometric coercion.", icon: Shield },
    { title: "Smart Health Solution", date: "Jan 2027", description: "Instant access to medical records via facial identification, plus emotion and mood recognition for facial symptom detection in clinical settings.", icon: Heart },
  ];

  const selected = milestones[selectedIndex];

  return (
    <section id="roadmap" className="section-dark py-16 md:py-20 lg:py-28" ref={sectionRef}>
      <div className="container-custom">
        <div className={`text-center max-w-3xl mx-auto mb-10 md:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-cyan/10 border border-cyan/20 mb-4 md:mb-6">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan" />
            <span className="text-xs md:text-sm font-medium text-cyan">Product Roadmap</span>
          </div>
          <h2 className="text-white mb-3 md:mb-4">Our Journey of Innovation</h2>
          <p className="text-white/40 text-sm md:text-lg">Tap any milestone to explore our progress.</p>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className={`hidden md:block max-w-4xl mx-auto mb-10 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative mb-6">
            <div className="absolute top-5 left-[8%] right-[8%] h-0.5 bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-mint via-cyan to-cyan-light rounded-full transition-none"
                style={{ width: `${Math.min(scrollProgress, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between overflow-x-auto pb-4 gap-2">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center cursor-pointer group transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-30'}`}
                  onClick={() => setSelectedIndex(index)}
                  style={{ minWidth: '160px', flex: 1 }}
                >
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${
                    selectedIndex === index
                      ? 'bg-cyan shadow-[0_0_30px_hsl(190_90%_50%/0.4)] scale-125'
                      : milestone.isCompleted
                        ? 'bg-mint'
                        : milestone.isCurrent
                          ? 'bg-cyan ring-4 ring-cyan/20 animate-glow-pulse'
                          : 'bg-navy-light border border-white/10'
                  }`}>
                    {milestone.isCompleted ? <CheckCircle2 size={18} className="text-navy-dark" /> : <Icon size={18} className={milestone.isCurrent ? 'text-navy-dark' : 'text-white/40'} />}
                    {milestone.isCurrent && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-mint rounded-full flex items-center justify-center">
                        <Sparkles size={8} className="text-navy-dark" />
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-medium mb-1 transition-colors ${selectedIndex === index ? 'text-cyan' : milestone.isCompleted ? 'text-mint' : milestone.isCurrent ? 'text-cyan' : 'text-white/30'}`}>
                    {milestone.date}
                  </span>
                  <span className={`text-sm font-semibold text-center max-w-[140px] transition-colors ${selectedIndex === index ? 'text-white' : 'text-white/50'}`}>
                    {milestone.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className={`md:hidden mb-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative pl-12">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-white/5 z-0">
              <div
                className="w-full bg-gradient-to-b from-mint via-cyan to-cyan-light rounded-full transition-none"
                style={{ height: `${Math.min(scrollProgress, 100)}%` }}
              />
            </div>

            <div className="space-y-5">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                const isSelected = selectedIndex === index;
                return (
                  <div
                    key={index}
                    className="relative cursor-pointer"
                    onClick={() => setSelectedIndex(index)}
                  >
                    {/* Dot on vertical line - positioned outside the card */}
                    <div className={`absolute -left-12 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isSelected
                        ? 'bg-cyan shadow-[0_0_20px_hsl(190_90%_50%/0.4)] scale-110'
                        : milestone.isCompleted
                          ? 'bg-mint'
                          : milestone.isCurrent
                            ? 'bg-cyan ring-2 ring-cyan/20'
                            : 'bg-navy-light border border-white/10'
                    }`}>
                      {milestone.isCompleted ? <CheckCircle2 size={14} className="text-navy-dark" /> : <Icon size={14} className={milestone.isCurrent ? 'text-navy-dark' : 'text-white/40'} />}
                    </div>

                    {/* Connector line from dot to card */}
                    <div className={`absolute -left-4 top-[26px] w-4 h-px ${
                      isSelected ? 'bg-cyan/40' : milestone.isCompleted ? 'bg-mint/30' : 'bg-white/10'
                    }`} />

                    {/* Card content */}
                    <div className={`glass-card p-4 transition-all duration-300 ${isSelected ? 'border-cyan/30 shadow-[0_0_20px_hsl(190_90%_50%/0.1)]' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          milestone.isCompleted ? 'bg-mint/10 text-mint' : milestone.isCurrent ? 'bg-cyan/20 text-cyan' : 'bg-white/5 text-white/30'
                        }`}>
                          {milestone.date}
                        </span>
                        {milestone.isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan text-navy-dark font-medium animate-pulse-soft">
                            Current
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">{milestone.title}</h3>
                      {isSelected && (
                        <p className="text-xs text-white/50 leading-relaxed animate-fade-in">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Detail Card - desktop only */}
        <div className={`hidden md:block max-w-2xl mx-auto transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
