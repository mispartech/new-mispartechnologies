import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { Heart, Stethoscope, FileCheck, Users, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: Heart, title: 'Patient Identification', description: 'Eliminate patient mix-ups with instant facial verification at registration, wards, and pharmacy counters.' },
  { icon: Stethoscope, title: 'Staff Authentication', description: 'Ensure only authorized medical staff access sensitive areas, medications, and patient records.' },
  { icon: FileCheck, title: 'Records Matching', description: 'Automatically link patients to their medical records, reducing administrative errors and wait times.' },
  { icon: Users, title: 'Visitor Screening', description: 'Control hospital visitor flow, enforce visiting hours, and maintain infection control protocols.' },
  { icon: ShieldCheck, title: 'HIPAA Compliant', description: 'All data is encrypted end-to-end with full audit trails meeting healthcare regulatory standards.' },
  { icon: Clock, title: 'Shift Management', description: 'Track healthcare worker attendance across shifts with fatigue-aware scheduling insights.' },
];

const HealthcareIntegration = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-20">
          <div className="container-custom text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">Healthcare</span>
            <h1 className="text-white mb-6">Face Recognition for <span className="text-cyan">Healthcare</span></h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">Improve patient safety, streamline operations, and secure sensitive areas with contactless facial recognition built for healthcare.</p>
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
            <h2 className="text-white mb-4">Transform Patient Care</h2>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">See how leading hospitals are using Mispar to reduce errors and improve patient experiences.</p>
            <Button onClick={() => navigate('/#demo')} className="button-glow bg-cyan text-navy-dark hover:bg-cyan-light">Schedule a Demo</Button>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default HealthcareIntegration;
