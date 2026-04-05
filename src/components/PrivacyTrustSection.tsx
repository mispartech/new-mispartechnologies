import React, { useRef, useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock, Fingerprint, Database, Ban, CheckCircle2, XCircle, Server, Smartphone, ArrowRight, ArrowDown, ShieldOff, UserX } from 'lucide-react';

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

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => setActiveFlow(prev => (prev + 1) % 3), 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const whatWeCapture = [
    { icon: Eye, text: 'Facial geometry for recognition', subtext: 'Unique facial landmarks' },
    { icon: Fingerprint, text: 'Encrypted biometric template', subtext: 'Secure data points for matching' },
    { icon: Database, text: 'Face images (stored securely per organization)', subtext: 'Protected & org-isolated' },
    { icon: Server, text: 'Timestamp & location', subtext: 'For accurate attendance logs' },
  ];

  const whatWeNeverDo = [
    { icon: Ban, text: 'Sell your data to third parties' },
    { icon: ShieldOff, text: 'Share face images outside your organization' },
    { icon: UserX, text: 'Access data without organizational authorization' },
  ];

  const securityFeatures = [
    { icon: Lock, text: 'AES-256 Encryption', subtext: 'Military-grade protection' },
    { icon: Shield, text: 'Explicit Consent Required', subtext: 'You control your data' },
    { icon: CheckCircle2, text: 'GDPR Compliant', subtext: 'International standards' },
  ];

  const flowSteps = [
    { label: 'Your Device', icon: Smartphone, description: 'Face captured locally' },
    { label: 'Encrypted Template', icon: Lock, description: 'Converted to data points' },
    { label: 'Secure Server', icon: Server, description: 'Stored per organization' },
  ];

  return (
    <section className="section-darker py-16 md:py-20 lg:py-28 relative overflow-hidden" ref={sectionRef}>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container-custom relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-10 md:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-mint/10 border border-mint/20 mb-4 md:mb-6">
            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-mint" />
            <span className="text-xs md:text-sm font-medium text-mint">Privacy Architecture</span>
          </div>
          <h2 className="text-white mb-3 md:mb-4">
            Your face. Your data. Your control.
          </h2>
          <p className="text-sm md:text-lg text-white/40">
            We built our system with privacy at its core—not as an afterthought.
          </p>
        </div>

        {/* Data Flow Visualization */}
        <div className={`max-w-3xl mx-auto mb-10 md:mb-16 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="glass-card p-5 md:p-8">
            <h3 className="text-xs md:text-sm font-medium text-white/40 uppercase tracking-wider mb-5 md:mb-6 text-center">How Your Data Flows</h3>
            
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-2">
              {flowSteps.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = activeFlow >= i;
                return (
                  <React.Fragment key={i}>
                    <div className={`flex md:flex-col items-center md:text-center gap-3 md:gap-0 md:flex-1 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center md:mb-3 shrink-0 transition-all duration-500 ${
                        isActive ? 'bg-cyan/10 border border-cyan/30 shadow-[0_0_20px_hsl(190_90%_50%/0.15)]' : 'bg-white/5 border border-white/10'
                      }`}>
                        <StepIcon size={20} className={`md:w-6 md:h-6 ${isActive ? 'text-cyan' : 'text-white/30'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{step.label}</p>
                        <p className="text-xs text-white/30">{step.description}</p>
                      </div>
                    </div>
                    {i < flowSteps.length - 1 && (
                      <div className="flex-shrink-0">
                        <ArrowDown size={18} className={`md:hidden transition-all duration-500 ${activeFlow > i ? 'text-cyan' : 'text-white/10'}`} />
                        <ArrowRight size={20} className={`hidden md:block transition-all duration-500 ${activeFlow > i ? 'text-cyan' : 'text-white/10'}`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="relative h-1.5 md:h-2 mx-0 md:mx-8 mt-5 md:mt-6 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan via-mint to-cyan rounded-full transition-all duration-1000"
                style={{ width: `${((activeFlow + 1) / flowSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interactive Split: What We Capture vs What We Never Do */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto mb-6 md:mb-8">
          {/* What we capture */}
          <div className={`glass-card p-5 md:p-6 card-lift transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
                <Eye className="w-4 h-4 md:w-5 md:h-5 text-cyan" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white">What we capture</h3>
            </div>
            <div className="space-y-3 md:space-y-4">
              {whatWeCapture.map((item, index) => (
                <div key={index} className="flex items-start gap-3 group p-2 md:p-3 rounded-lg active:bg-cyan/5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-cyan/5 flex items-center justify-center shrink-0">
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

          {/* What we NEVER do */}
          <div className={`glass-card p-5 md:p-6 card-lift transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white">What we <span className="text-red-400">NEVER</span> do</h3>
            </div>
            <div className="space-y-3 md:space-y-4">
              {whatWeNeverDo.map((item, index) => (
                <div key={index} className="flex items-start gap-3 group p-2 md:p-3 rounded-lg active:bg-red-500/5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center shrink-0 relative">
                    <item.icon className="w-4 h-4 text-red-400" />
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
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/5">
              <p className="text-xs text-white/30 italic">All face data is encrypted and isolated per organization. Only authorized org admins can access it.</p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className={`max-w-5xl mx-auto transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {securityFeatures.map((item, index) => (
              <div key={index} className="glass-card p-4 md:p-5 card-lift flex items-start gap-3 group">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-mint/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 md:w-5 md:h-5 text-mint" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.text}</p>
                  <p className="text-white/30 text-xs">{item.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-8 md:mt-10 text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-white/5 border border-white/10">
            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-mint" />
            <span className="text-xs md:text-sm text-white/50">
              Biometric data encrypted & stored in Nigeria-based servers
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyTrustSection;
