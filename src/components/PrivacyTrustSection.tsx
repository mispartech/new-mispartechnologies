import React from 'react';
import { Shield, Eye, EyeOff, Lock, Fingerprint, Database, UserX, CheckCircle2, XCircle, Server } from 'lucide-react';

const PrivacyTrustSection = () => {
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

  return (
    <section className="section-darker py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mint/10 border border-mint/20 mb-6">
            <Shield className="w-4 h-4 text-mint" />
            <span className="text-sm font-medium text-mint">Privacy & Trust</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your face. Your data. Your control.
          </h2>
          <p className="text-lg text-white/40">
            We built our system with privacy at its core—not as an afterthought.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="glass-card p-6 card-lift">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-cyan" />
              </div>
              <h3 className="text-lg font-semibold text-white">What we capture</h3>
            </div>
            <div className="space-y-4">
              {whatWeCapture.map((item, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-cyan/5 flex items-center justify-center shrink-0 group-hover:bg-cyan/10 transition-colors">
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

          <div className="glass-card p-6 card-lift">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">What we NEVER store</h3>
            </div>
            <div className="space-y-4">
              {whatWeNeverStore.map((item, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center shrink-0 group-hover:bg-red-500/10 transition-colors">
                    <item.icon className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex items-center h-8">
                    <p className="text-white text-sm font-medium">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-white/30 italic">Your actual photos never leave your device.</p>
            </div>
          </div>

          <div className="glass-card p-6 card-lift">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-mint" />
              </div>
              <h3 className="text-lg font-semibold text-white">Security & Consent</h3>
            </div>
            <div className="space-y-4">
              {securityFeatures.map((item, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-mint/5 flex items-center justify-center shrink-0 group-hover:bg-mint/10 transition-colors">
                    <item.icon className="w-4 h-4 text-mint" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{item.text}</p>
                    <p className="text-white/30 text-xs">{item.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
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
