import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useNavigate } from 'react-router-dom';
import { Users, Code, Cpu, Headphones, Clock } from 'lucide-react';

const departments = [
  { icon: Cpu, name: 'AI & Research', description: 'Our machine learning engineers and data scientists push the boundaries of facial recognition accuracy, working on models optimized for diverse African datasets.' },
  { icon: Code, name: 'Engineering', description: 'Full-stack engineers who build the platforms, APIs, and integrations that bring our AI to life in real-world deployments.' },
  { icon: Users, name: 'Product & Design', description: 'Designers and product managers who ensure every touchpoint is intuitive, accessible, and delightful to use.' },
  { icon: Headphones, name: 'Customer Success', description: 'Dedicated support team that helps organizations onboard, deploy, and get the most out of Mispar\'s solutions.' },
];

const OurTeam = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-20">
          <div className="container-custom text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">Our Team</span>
            <h1 className="text-white mb-6">The <span className="text-cyan">People</span> Behind the Technology</h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">A passionate team of engineers, designers, and AI researchers building the future of identification in Africa.</p>
          </div>
        </section>
        <section className="section-darker py-20 relative">
          <div className="absolute inset-0 z-10 flex items-start justify-center pt-20">
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-navy-dark/90 border border-cyan/30 shadow-lg shadow-cyan/10 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-cyan animate-pulse" />
              <span className="text-sm font-semibold text-white">Content coming soon</span>
            </div>
          </div>
          <div className="container-custom blur-sm pointer-events-none select-none">
            <div className="grid sm:grid-cols-2 gap-8">
              {departments.map((d, i) => (
                <div key={i} className="glass-card p-8">
                  <d.icon className="text-cyan mb-4" size={36} />
                  <h3 className="text-white text-xl font-bold mb-3">{d.name}</h3>
                  <p className="text-white/50">{d.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section-dark py-20 relative">
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-navy-dark/90 border border-cyan/30 shadow-lg shadow-cyan/10 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-cyan animate-pulse" />
              <span className="text-sm font-semibold text-white">Content coming soon</span>
            </div>
          </div>
          <div className="container-custom text-center blur-sm pointer-events-none select-none">
            <h2 className="text-white mb-4">Join Our Team</h2>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">We're always looking for talented individuals who are passionate about AI and want to make a real impact.</p>
            <span className="inline-flex items-center justify-center button-glow bg-cyan text-navy-dark px-6 py-3 rounded-md font-medium">View Open Positions</span>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default OurTeam;
