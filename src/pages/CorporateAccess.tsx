import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { Building2, DoorOpen, UserCog, Layers, Globe, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: DoorOpen, title: 'Touchless Entry', description: 'Employees walk in seamlessly — doors unlock automatically upon face recognition, no cards needed.' },
  { icon: Building2, title: 'Multi-Floor Access', description: 'Assign floor-level and zone-level permissions per employee, enforced by facial recognition at each checkpoint.' },
  { icon: UserCog, title: 'Role-Based Permissions', description: 'Executives, managers, and staff get different access levels — all managed from one central dashboard.' },
  { icon: Layers, title: 'HR Integration', description: 'Sync with existing HR platforms for automatic onboarding and offboarding of access credentials.' },
  { icon: Globe, title: 'Multi-Site Management', description: 'Manage access across all office locations from a single platform with unified employee profiles.' },
  { icon: Fingerprint, title: 'Biometric Backup', description: 'Optional multi-factor authentication combining face recognition with fingerprint or PIN for high-security zones.' },
];

const CorporateAccess = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-20">
          <div className="container-custom text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">Corporate Access</span>
            <h1 className="text-white mb-6">Your Face Is Your <span className="text-cyan">Key Card</span></h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">Replace outdated badge systems with intelligent facial recognition that knows your team and secures your workplace.</p>
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
            <h2 className="text-white mb-4">Upgrade Your Workplace</h2>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">See how enterprises are ditching key cards for facial recognition access control.</p>
            <Button onClick={() => navigate('/#demo')} className="button-glow bg-cyan text-navy-dark hover:bg-cyan-light">Talk to Sales</Button>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default CorporateAccess;
