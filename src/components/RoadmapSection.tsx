import React, { useState, useRef, useEffect } from 'react';
import { Rocket, GraduationCap, Shield, Heart, Globe, ChevronDown, CheckCircle2, Clock, Users, Sparkles } from 'lucide-react';

interface RoadmapItemProps {
  title: string; date: string; description: string; userBenefit: string;
  icon: React.ElementType; isCompleted?: boolean; isCurrent?: boolean;
  isExpanded: boolean; onToggle: () => void; delay?: number;
}

const RoadmapItem = ({ title, date, description, userBenefit, icon: Icon, isCompleted = false, isCurrent = false, isExpanded, onToggle, delay = 0 }: RoadmapItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { setTimeout(() => setIsVisible(true), delay); observer.unobserve(entry.target); } }); },
      { threshold: 0.1 }
    );
    if (itemRef.current) observer.observe(itemRef.current);
    return () => { if (itemRef.current) observer.unobserve(itemRef.current); };
  }, [delay]);

  return (
    <div ref={itemRef} className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-cyan/30 to-transparent" />
      <div className={`relative flex gap-4 cursor-pointer group ${isCurrent ? 'z-10' : ''}`} onClick={onToggle}>
        <div className={`relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isCompleted ? 'bg-mint text-navy-dark' : isCurrent ? 'bg-cyan text-navy-dark ring-4 ring-cyan/20 animate-glow-pulse' : 'bg-navy-light text-white/40'
        }`}>
          {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
          {isCurrent && <div className="absolute -top-1 -right-1 w-4 h-4 bg-mint rounded-full flex items-center justify-center"><Sparkles size={10} className="text-navy-dark" /></div>}
        </div>

        <div className={`flex-1 pb-8 ${isCurrent ? 'pb-10' : ''}`}>
          <div className={`glass-card overflow-hidden transition-all duration-300 ${
            isCurrent ? 'border-cyan/30 shadow-[0_0_30px_hsl(190_90%_50%/0.1)]' : isExpanded ? 'border-white/10' : 'border-white/5 group-hover:border-white/10'
          }`}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isCompleted ? 'bg-mint/10 text-mint' : isCurrent ? 'bg-cyan/20 text-cyan' : 'bg-white/5 text-white/30'
                  }`}>{date}</span>
                  {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan text-navy-dark font-medium">Current Phase</span>}
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
              <ChevronDown size={20} className={`text-white/30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-48' : 'max-h-0'}`}>
              <div className="px-4 pb-4 space-y-3">
                <p className="text-white/50 text-sm">{description}</p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-cyan/5 border border-cyan/10">
                  <Users size={16} className="text-cyan shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-cyan font-medium mb-0.5">What this means for you</p>
                    <p className="text-sm text-white/60">{userBenefit}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoadmapSection = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(2);
  const headingRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { setHeadingVisible(true); observer.unobserve(entry.target); } }); },
      { threshold: 0.1 }
    );
    if (headingRef.current) observer.observe(headingRef.current);
    return () => { if (headingRef.current) observer.unobserve(headingRef.current); };
  }, []);

  const roadmapItems = [
    { title: "Smart Attendance System Launch", date: "January 2023", description: "Initial release of our core facial recognition attendance tracking solution.", userBenefit: "Eliminate manual attendance tracking and save hours daily.", icon: Rocket, isCompleted: true, delay: 0 },
    { title: "Educational Sector Integration", date: "June 2023", description: "Specialized features for schools and universities.", userBenefit: "Seamless check-ins with real-time attendance insights.", icon: GraduationCap, isCompleted: true, delay: 100 },
    { title: "Enhanced Security Solutions", date: "December 2023", description: "Advanced security features including multi-factor authentication.", userBenefit: "More secure premises with frictionless access control.", icon: Shield, isCurrent: true, delay: 200 },
    { title: "Healthcare System Integration", date: "March 2024", description: "Patient identification and record access for healthcare.", userBenefit: "Faster patient check-ins and secure medical records.", icon: Heart, delay: 300 },
    { title: "Mobile Platform & Global Expansion", date: "September 2024", description: "Mobile applications and international market expansion.", userBenefit: "Access features from anywhere on your mobile device.", icon: Globe, delay: 400 },
  ];

  return (
    <section id="roadmap" className="section-dark py-20 md:py-28">
      <div className="container-custom">
        <div ref={headingRef} className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan/10 border border-cyan/20 mb-6">
            <Clock className="w-4 h-4 text-cyan" />
            <span className="text-sm font-medium text-cyan">Product Roadmap</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Journey of Innovation</h2>
          <p className="text-white/40 text-lg">Tap on any milestone to learn more about our progress.</p>
        </div>
        <div className="max-w-2xl mx-auto">
          {roadmapItems.map((item, index) => (
            <RoadmapItem key={index} {...item} isExpanded={expandedIndex === index} onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
