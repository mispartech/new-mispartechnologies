import React, { useRef, useEffect, useState } from 'react';
import { Shield, Heart, GraduationCap, Users, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AttendanceSimulation from './AttendanceSimulation';

interface SecondarySolutionProps {
  icon: React.ReactNode;
  title: string;
  whoItsFor: string;
  problemSolved: string;
  delay: number;
  isVisible: boolean;
}

const SecondarySolution = ({ icon, title, whoItsFor, problemSolved, delay, isVisible }: SecondarySolutionProps) => (
  <Card 
    className={`group h-full overflow-hidden bg-white/[0.03] border-white/10 hover:border-cyan/30 card-lift transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <CardContent className="p-6 h-full flex flex-col">
      <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(190_90%_50%/0.2)] transition-all duration-300">
        <div className="text-cyan">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-cyan transition-colors">{title}</h3>
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white/40 mb-1">
          <Users size={14} />
          <span>Who it's for</span>
        </div>
        <p className="text-white/70 text-sm">{whoItsFor}</p>
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 text-sm font-medium text-white/40 mb-1">
          <Target size={14} />
          <span>Problem solved</span>
        </div>
        <p className="text-white/70 text-sm">{problemSolved}</p>
      </div>
      <button className="mt-4 text-cyan text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
        Learn more
        <ArrowRight size={14} />
      </button>
    </CardContent>
  </Card>
);

const SolutionsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  const secondarySolutions = [
    { icon: <Shield size={24} />, title: "Security Access", whoItsFor: "Offices, banks, and gated communities", problemSolved: "Eliminates unauthorized access and security breaches with instant face verification." },
    { icon: <Heart size={24} />, title: "Healthcare Systems", whoItsFor: "Hospitals, clinics, and pharmacies", problemSolved: "Prevents medical identity fraud and ensures correct patient records every time." },
    { icon: <GraduationCap size={24} />, title: "Education Solutions", whoItsFor: "Schools, universities, and training centers", problemSolved: "Automates student attendance and enhances campus security effortlessly." },
  ];

  return (
    <section id="solutions" className="section-darker py-20 md:py-28" ref={sectionRef}>
      <div className="container-custom relative z-10">
        <div className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-sm font-medium mb-4">
            Our Solutions
          </span>
          <h2 className="mb-4 text-white">One Technology, Many Applications</h2>
          <p className="text-white/50 text-lg">
            Face recognition that adapts to your industry's unique needs.
          </p>
        </div>

        <div className={`mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="overflow-hidden border-cyan/20 bg-gradient-to-br from-navy-light/50 via-navy/50 to-cyan/5">
            <CardContent className="p-8 lg:p-10">
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="px-3 py-1 rounded-full bg-cyan text-navy-dark text-sm font-bold">
                  Flagship Product
                </span>
              </div>
              <AttendanceSimulation />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondarySolutions.map((solution, index) => (
            <SecondarySolution key={index} icon={solution.icon} title={solution.title} whoItsFor={solution.whoItsFor} problemSolved={solution.problemSolved} delay={200 + index * 100} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
