import React, { useRef, useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock, Fingerprint, Database, UserX, CheckCircle2, XCircle, Server, Smartphone, ArrowRight } from 'lucide-react';

const PrivacyTrustSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFlow, setActiveFlow] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Animate data flow
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => setActiveFlow(prev => (prev + 1) % 3), 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const whatWeCapture = [
    { icon: Eye, text: 'Facial geometry for recognition', subtext: 'Unique facial landmarks' },
    { icon: Fingerprint, text: 'Encrypted biometric template', subtext: 'Not a photo, just data points' },
    { icon: Server, text: 'Timestamp & location', subtext: 'For accurate attendance logs' },
  ];

  const whatWeNeverStore = [
    { icon: EyeOff, text: 'Raw photos of your face' },
    { icon: UserX, text: 'Personal identification documents' },
    { icon: Database, text: 'Data shared with third parties' },
  ];

  const securityFeatures = [
    { icon: Lock, text: 'AES-256 Encryption', subtext: 'Military-grade protection' },
    { icon: Shield, text: 'Explicit Consent Required', subtext: 'You control your data' },
    { icon: CheckCircle2, text: 'GDPR Compliant', subtext: 'International standards' },
  ];

  const flowSteps = [
    { label: 'Your Device', icon: Smartphone, description: 'Face captured locally' },
    { label: 'Encrypted Template', icon: Lock, description: 'Converted to data points' },
    { label: 'Secure Server', icon: Server, description: 'Stored in Nigeria' },
  ];

  return (
    <section className="section-darker py-20 md:py-28 relative overflow-hidden" ref={sectionRef}>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container-custom relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mint/10 border border-mint/20 mb-6">
            <Shield className="w-4 h-4 text-mint" />
            <span className="text-sm font-medium text-mint">Privacy Architecture</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your face. Your data. Your control.
          </h2>
          <p className="text-lg text-white/40">
            We built our system with privacy at its core—not as an afterthought.
          </p>
        </div>

        {/* Data Flow Visualization */}
        <div className={`max-w-3xl mx-auto mb-16 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="glass-card p-6 md:p-8">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-6 text-center">How Your Data Flows</h3>
            <div className="flex items-center justify-between gap-2 md:gap-4">
              {flowSteps.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = activeFlow >= i;
                return (
                  <React.Fragment key={i}>
                    <div className={`flex-1 text-center transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 ${
                        isActive ? 'bg-cyan/10 border border-cyan/30 shadow-[0_0_20px_hsl(190_90%_50%/0.15)]' : 'bg-white/5 border border-white/10'
                      }`}>
                        <StepIcon size={24} className={isActive ? 'text-cyan' : 'text-white/30'} />
                      </div>
                      <p className="text-sm font-medium text-white mb-1">{step.label}</p>
                      <p className="text-xs text-white/30">{step.description}</p>
                    </div>
                    {i < flowSteps.length - 1 && (
                      <div className="flex-shrink-0 px-1">
                        <ArrowRight size={20} className={`transition-all duration-500 ${activeFlow > i ? 'text-cyan' : 'text-white/10'}`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Animated data particles */}
            <div className="relative h-2 mx-8 mt-6 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan via-mint to-cyan rounded-full transition-all duration-1000"
                style={{ width: `${((activeFlow + 1) / flowSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interactive Split: What We Store vs What We Don't */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
          {/* What we capture */}
          <div className={`glass-card p-6 card-lift transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-cyan" />
              </div>
              <h3 className="text-lg font-semibold text-white">What we capture</h3>
            </div>
            <div className="space-y-4">
              {whatWeCapture.map((item, index) => (
                <div key={index} className="flex items-start gap-3 group p-3 rounded-lg hover:bg-cyan/5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-cyan/5 flex items-center justify-center shrink-0 group-hover:bg-cyan/10 group-hover:scale-110 transition-all">
                    <item.icon className="w-4 h-4 text-cyan" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{item.text}</p>
                    <p className="text-white/30 text-xs">{item.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What we never store */}
          <div className={`glass-card p-6 card-lift transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">What we <span className="text-red-400">NEVER</span> store</h3>
            </div>
            <div className="space-y-4">
              {whatWeNeverStore.map((item, index) => (
                <div key={index} className="flex items-start gap-3 group p-3 rounded-lg hover:bg-red-500/5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center shrink-0 group-hover:bg-red-500/10 group-hover:scale-110 transition-all relative">
                    <item.icon className="w-4 h-4 text-red-400" />
                    {/* Crossed out line */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-400/50 rotate-45 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center h-8">
                    <p className="text-white text-sm font-medium line-through decoration-red-400/30">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-white/30 italic">Your actual photos never leave your device.</p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className={`max-w-5xl mx-auto transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {securityFeatures.map((item, index) => (
              <div key={index} className="glass-card p-5 card-lift flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center shrink-0 group-hover:bg-mint/20 group-hover:scale-110 transition-all">
                  <item.icon className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.text}</p>
                  <p className="text-white/30 text-xs">{item.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-10 text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10">
            <Shield className="w-4 h-4 text-mint" />
            <span className="text-sm text-white/50">
              Your biometric data is encrypted and stored securely in Nigeria-based servers
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyTrustSection;
