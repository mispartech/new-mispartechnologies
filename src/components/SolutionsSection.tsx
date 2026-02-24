import React, { useRef, useEffect, useState } from 'react';
import { GraduationCap, Heart, Building2, Church, Shield, Users, TrendingUp, Clock, CheckCircle2, Zap } from 'lucide-react';

interface IndustryTab {
  id: string;
  label: string;
  icon: React.ElementType;
  headline: string;
  description: string;
  stats: { value: string; label: string }[];
  features: string[];
  accentColor: string;
}

const industries: IndustryTab[] = [
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    headline: 'Smarter Campus Management',
    description: 'Automate student attendance, secure exam halls, and streamline campus access with face recognition built for education.',
    stats: [
      { value: '3hrs', label: 'Saved daily' },
      { value: '99.7%', label: 'Accuracy' },
      { value: '0', label: 'Proxy attendance' },
    ],
    features: ['Automated class attendance', 'Exam identity verification', 'Campus access control', 'Parent notification system'],
    accentColor: 'cyan',
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    icon: Heart,
    headline: 'Patient-First Identity',
    description: 'Eliminate medical identity fraud, ensure accurate patient records, and streamline check-ins across clinics and hospitals.',
    stats: [
      { value: '60%', label: 'Faster check-in' },
      { value: '0', label: 'ID mix-ups' },
      { value: '24/7', label: 'Secure access' },
    ],
    features: ['Patient identity verification', 'Medical record protection', 'Staff access management', 'Pharmacy verification'],
    accentColor: 'mint',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    icon: Building2,
    headline: 'Workforce Intelligence',
    description: 'Transform HR operations with frictionless check-ins, eliminate buddy punching, and gain real-time workforce insights.',
    stats: [
      { value: '<1s', label: 'Check-in time' },
      { value: '100%', label: 'Fraud prevention' },
      { value: '15hrs', label: 'Saved weekly' },
    ],
    features: ['Touchless time tracking', 'Payroll auto-sync', 'Multi-site management', 'Real-time analytics dashboard'],
    accentColor: 'cyan',
  },
  {
    id: 'religious',
    label: 'Religious',
    icon: Church,
    headline: 'Community Connection',
    description: 'Track congregation attendance effortlessly, manage events, and focus on what matters — building your community.',
    stats: [
      { value: '2,000+', label: 'Members tracked' },
      { value: '5min', label: 'Setup time' },
      { value: '∞', label: 'Peace of mind' },
    ],
    features: ['Seamless member check-in', 'Event attendance tracking', 'Visitor management', 'Automated reports'],
    accentColor: 'mint',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    headline: 'Zero-Compromise Access',
    description: 'Secure buildings, gates, and restricted zones with instant face verification that never sleeps.',
    stats: [
      { value: '0.3s', label: 'Verification' },
      { value: '99.9%', label: 'Uptime' },
      { value: '0', label: 'Unauthorized entry' },
    ],
    features: ['Multi-factor authentication', 'Watchlist screening', 'Visitor pre-registration', 'Real-time alerts'],
    accentColor: 'cyan',
  },
];

const SolutionsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('education');
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const switchTab = (id: string) => {
    if (id === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(id);
      setIsTransitioning(false);
    }, 200);
  };

  const active = industries.find(i => i.id === activeTab)!;
  const ActiveIcon = active.icon;

  return (
    <section id="solutions" className="section-darker py-20 md:py-28" ref={sectionRef}>
      <div className="container-custom relative z-10">
        <div className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-sm font-medium mb-4">
            Industry Solutions
          </span>
          <h2 className="mb-4 text-white">One Technology, Every Industry</h2>
          <p className="text-white/50 text-lg">
            Click an industry to see how face recognition transforms it.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`flex flex-wrap justify-center gap-2 md:gap-3 mb-10 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {industries.map((industry) => {
            const Icon = industry.icon;
            const isActive = activeTab === industry.id;
            return (
              <button
                key={industry.id}
                onClick={() => switchTab(industry.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan text-navy-dark shadow-[0_0_20px_hsl(190_90%_50%/0.3)]'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80 hover:border-white/20'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{industry.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className={`max-w-5xl mx-auto transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <div className="glass-card overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: Info */}
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-${active.accentColor}/10 flex items-center justify-center`}>
                    <ActiveIcon size={24} className={`text-${active.accentColor}`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full bg-${active.accentColor}/10 text-${active.accentColor} text-xs font-medium border border-${active.accentColor}/20`}>
                    {active.label}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{active.headline}</h3>
                <p className="text-white/50 mb-8 leading-relaxed">{active.description}</p>

                {/* Features */}
                <div className="space-y-3">
                  {active.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-cyan/10 flex items-center justify-center shrink-0 group-hover:bg-cyan/20 transition-colors">
                        <CheckCircle2 size={12} className="text-cyan" />
                      </div>
                      <span className="text-white/70 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Stats & Visual */}
              <div className="bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/5 p-8 lg:p-10 flex flex-col justify-center">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {active.stats.map((stat, i) => (
                    <div key={i} className="text-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan/20 transition-all duration-300 group">
                      <div className="text-2xl md:text-3xl font-bold text-cyan mb-1 group-hover:scale-110 transition-transform">
                        {stat.value}
                      </div>
                      <div className="text-xs text-white/40">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Visual indicator */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-mint animate-pulse" />
                    <span className="text-xs text-white/40 font-mono">LIVE SYSTEM STATUS</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Recognition Speed</span>
                      <span className="text-sm text-cyan font-medium">Instant</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[95%] bg-gradient-to-r from-cyan to-mint rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">System Accuracy</span>
                      <span className="text-sm text-mint font-medium">99.7%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[99%] bg-gradient-to-r from-mint to-cyan rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Uptime</span>
                      <span className="text-sm text-cyan font-medium">99.9%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[99.9%] bg-gradient-to-r from-cyan to-cyan-light rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
