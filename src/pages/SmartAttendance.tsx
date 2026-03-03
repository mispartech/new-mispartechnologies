import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { ScanFace, Clock, MapPin, BarChart3, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: ScanFace, title: 'Instant Face Check-In', description: 'Employees simply look at a device to clock in — no badges, PINs, or fingerprints required.' },
  { icon: Clock, title: 'Real-Time Tracking', description: 'Monitor attendance as it happens with live dashboards and instant notifications for late arrivals.' },
  { icon: MapPin, title: 'Geo-Fenced Verification', description: 'Ensure check-ins happen at designated locations, preventing buddy-punching and time fraud.' },
  { icon: BarChart3, title: 'Automated Reports', description: 'Generate daily, weekly, and monthly attendance reports automatically — exportable to PDF and Excel.' },
  { icon: Shield, title: 'Anti-Spoofing Protection', description: 'Advanced liveness detection prevents photo or video-based impersonation attempts.' },
  { icon: Zap, title: 'Sub-Second Recognition', description: 'Our AI processes faces in under 500ms, ensuring zero queues even during peak hours.' },
];

const SmartAttendance = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-20">
          <div className="container-custom text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">Smart Attendance</span>
            <h1 className="text-white mb-6">Attendance That <span className="text-cyan">Recognizes</span> You</h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">Eliminate manual roll calls, buddy punching, and time theft with AI-powered facial recognition attendance that works in under a second.</p>
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
            <h2 className="text-white mb-4">Ready to Modernize Your Attendance?</h2>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">Join hundreds of organizations that have eliminated time fraud and streamlined their workforce management.</p>
            <Button onClick={() => navigate('/#demo')} className="button-glow bg-cyan text-navy-dark hover:bg-cyan-light">Request a Demo</Button>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default SmartAttendance;
