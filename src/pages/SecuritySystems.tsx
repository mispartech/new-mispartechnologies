import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { ShieldCheck, Eye, Lock, AlertTriangle, MonitorSmartphone, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: Eye, title: 'Watchlist Monitoring', description: 'Automatically flag individuals on security watchlists in real-time as they approach entry points.' },
  { icon: Lock, title: 'Secure Access Control', description: 'Replace keycards and PINs with facial recognition — impossible to lose, share, or duplicate.' },
  { icon: AlertTriangle, title: 'Threat Alerts', description: 'Instant push notifications and alarms when unauthorized individuals attempt to gain access.' },
  { icon: MonitorSmartphone, title: 'Multi-Camera Integration', description: 'Connect to existing CCTV infrastructure for seamless facility-wide facial recognition coverage.' },
  { icon: UserCheck, title: 'Visitor Management', description: 'Pre-register visitors, auto-verify on arrival, and track visit history with full audit trails.' },
  { icon: ShieldCheck, title: 'Compliance Ready', description: 'Built-in compliance with GDPR, NDPR, and international data protection regulations.' },
];

const SecuritySystems = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-20">
          <div className="container-custom text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">Security Systems</span>
            <h1 className="text-white mb-6">Intelligent <span className="text-cyan">Security</span> That Never Sleeps</h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">Protect your facilities with AI-driven facial recognition that identifies threats before they become incidents.</p>
          </div>
        </section>
        <section className="section-darker py-20">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i} className="glass-card p-6 card-lift">
                  <f.icon className="text-cyan mb-4" size={32} />
                  <h3 className="text-white text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section-dark py-20">
          <div className="container-custom text-center">
            <h2 className="text-white mb-4">Secure Your Premises Today</h2>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">Talk to our security experts and discover how facial recognition can transform your facility's safety.</p>
            <Button onClick={() => navigate('/#demo')} className="button-glow bg-cyan text-navy-dark hover:bg-cyan-light">Get Started</Button>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default SecuritySystems;
