import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useNavigate } from 'react-router-dom';
import { Rocket, Heart, Globe, Zap, Clock } from 'lucide-react';

const perks = [
  { icon: Rocket, title: 'Cutting-Edge Tech', description: 'Work with state-of-the-art AI, computer vision, and deep learning technologies every day.' },
  { icon: Heart, title: 'Impact-Driven Work', description: 'Your work directly improves security, efficiency, and experiences for thousands of people.' },
  { icon: Globe, title: 'Remote-Friendly', description: 'We embrace flexible work. Contribute from anywhere while staying connected with the team.' },
  { icon: Zap, title: 'Growth Culture', description: 'Learning budgets, conference attendance, and mentorship to accelerate your career.' },
];

const openings = [
  { title: 'Senior ML Engineer', team: 'AI & Research', type: 'Full-time' },
  { title: 'Full-Stack Developer', team: 'Engineering', type: 'Full-time' },
  { title: 'Product Designer', team: 'Product & Design', type: 'Full-time' },
  { title: 'DevOps Engineer', team: 'Engineering', type: 'Full-time' },
  { title: 'Customer Success Manager', team: 'Customer Success', type: 'Full-time' },
];

const Careers = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-20">
          <div className="container-custom text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">Careers</span>
            <h1 className="text-white mb-6">Build the Future of <span className="text-cyan">Identity</span></h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">Join a team that's redefining how organizations identify, verify, and manage people with AI-powered facial recognition.</p>
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
            <h2 className="text-white text-2xl font-bold text-center mb-10">Why Mispar?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {perks.map((p, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <p.icon className="text-cyan mx-auto mb-4" size={32} />
                  <h3 className="text-white font-bold mb-2">{p.title}</h3>
                  <p className="text-white/50 text-sm">{p.description}</p>
                </div>
              ))}
            </div>
            <h2 className="text-white text-2xl font-bold text-center mb-10">Open Positions</h2>
            <div className="max-w-2xl mx-auto space-y-4">
              {openings.map((o, i) => (
                <div key={i} className="glass-card p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">{o.title}</h3>
                    <p className="text-white/40 text-sm">{o.team} · {o.type}</p>
                  </div>
                  <span className="text-cyan text-sm">Apply →</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Careers;
