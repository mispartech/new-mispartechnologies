import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { GraduationCap, BookOpen, Bus, ShieldAlert, BarChart3, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: GraduationCap, title: 'Student Attendance', description: 'Automate classroom attendance with a quick face scan — no more manual roll calls eating into lecture time.' },
  { icon: BookOpen, title: 'Exam Verification', description: 'Prevent exam impersonation by verifying student identity at exam halls before they take their seat.' },
  { icon: Bus, title: 'Campus Access', description: 'Secure campus gates, hostels, and libraries with facial recognition entry — only enrolled students get in.' },
  { icon: ShieldAlert, title: 'Safety Alerts', description: 'Instantly flag unauthorized individuals on campus and alert security personnel in real-time.' },
  { icon: BarChart3, title: 'Engagement Analytics', description: 'Track attendance patterns to identify at-risk students and enable proactive academic interventions.' },
  { icon: Bell, title: 'Parent Notifications', description: 'Automatically notify parents when their child checks in or out of school — peace of mind, digitized.' },
];

const EducationalSolutions = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-20">
          <div className="container-custom text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">Education</span>
            <h1 className="text-white mb-6">Smarter Schools with <span className="text-cyan">Face Recognition</span></h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">From automated attendance to campus security, give educators more time to teach and students a safer environment to learn.</p>
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
            <h2 className="text-white mb-4">Modernize Your Institution</h2>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">Join schools and universities already using Mispar to create safer, smarter campuses.</p>
            <Button onClick={() => navigate('/#demo')} className="button-glow bg-cyan text-navy-dark hover:bg-cyan-light">Learn More</Button>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default EducationalSolutions;
