import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Download, Mail } from 'lucide-react';

const pressItems = [
  { date: 'Feb 2026', title: 'Mispar Technologies Raises Seed Round to Scale AI-Powered Attendance Across Africa', source: 'TechCabal' },
  { date: 'Jan 2026', title: 'How Lagos-Based Mispar Is Solving the Attendance Problem with Face Recognition', source: 'Disrupt Africa' },
  { date: 'Dec 2025', title: 'Mispar Technologies Named Among Top 10 African AI Startups to Watch', source: 'Ventures Africa' },
  { date: 'Nov 2025', title: 'Face Recognition in Nigerian Churches: How Mispar Is Changing Congregation Management', source: 'Guardian Nigeria' },
];

const PressMedia = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-20">
          <div className="container-custom text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">Press & Media</span>
            <h1 className="text-white mb-6">Mispar in the <span className="text-cyan">News</span></h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">Read what the media is saying about our mission to transform identification and attendance management in Africa.</p>
          </div>
        </section>
        <section className="section-darker py-20">
          <div className="container-custom max-w-3xl">
            <div className="space-y-6 mb-16">
              {pressItems.map((p, i) => (
                <div key={i} className="glass-card p-6 hover:border-cyan/30 transition-colors">
                  <span className="text-cyan text-sm">{p.date}</span>
                  <h3 className="text-white font-bold text-lg mt-2 mb-1">{p.title}</h3>
                  <p className="text-white/40 text-sm">{p.source}</p>
                </div>
              ))}
            </div>
            <div className="glass-card p-8 text-center">
              <Mail className="text-cyan mx-auto mb-4" size={32} />
              <h2 className="text-white text-xl font-bold mb-3">Media Inquiries</h2>
              <p className="text-white/50 mb-4">For press kits, interviews, or media partnerships, reach out to our communications team.</p>
              <a href="mailto:press@mispartech.com" className="text-cyan hover:underline">press@mispartech.com</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default PressMedia;
