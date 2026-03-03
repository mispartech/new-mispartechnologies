import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { Target, Lightbulb, Globe, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const values = [
  { icon: Target, title: 'Mission-Driven', description: 'We exist to make identification seamless, secure, and accessible for every organization in Africa and beyond.' },
  { icon: Lightbulb, title: 'Innovation First', description: 'We invest heavily in R&D to stay at the cutting edge of computer vision and deep learning technologies.' },
  { icon: Globe, title: 'Built for Africa', description: 'Our AI models are trained on diverse African datasets, ensuring accuracy across all skin tones and conditions.' },
  { icon: Award, title: 'Trust & Transparency', description: 'We believe in ethical AI — every deployment comes with clear data policies and user consent frameworks.' },
];

const AboutUs = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-20">
          <div className="container-custom text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">About Us</span>
            <h1 className="text-white mb-6">Unlocking Every <span className="text-cyan">Barrier</span></h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">Mispar Technologies is a Lagos-based AI company building facial recognition solutions that work for African organizations — from churches to corporations, hospitals to schools.</p>
          </div>
        </section>
        <section className="section-darker py-20">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="glass-card p-8">
                <h2 className="text-white text-2xl font-bold mb-4">Our Story</h2>
                <p className="text-white/50 leading-relaxed">Founded in Lagos, Nigeria, Mispar Technologies was born from a simple observation: traditional attendance and access systems don't work well for African organizations. Manual registers get lost, biometric scanners break, and card systems get shared. We set out to build a facial recognition platform that's fast, accurate, and designed from the ground up for the African context — handling diverse lighting conditions, varied skin tones, and infrastructure constraints that global solutions often ignore.</p>
              </div>
              <div className="glass-card p-8">
                <h2 className="text-white text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-white/50 leading-relaxed">We envision a world where your face is your universal credential. No more forgotten badges, lost tokens, or shared passwords. Whether you're a student checking into class, a nurse accessing a medicine cabinet, or an employee walking into the office — your identity is verified instantly, securely, and contactlessly. We're building that future, one organization at a time.</p>
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold text-center mb-10">Our Values</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <div key={i} className="glass-card p-6 text-center card-lift">
                  <v.icon className="text-cyan mx-auto mb-4" size={32} />
                  <h3 className="text-white font-bold mb-2">{v.title}</h3>
                  <p className="text-white/50 text-sm">{v.description}</p>
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

export default AboutUs;
