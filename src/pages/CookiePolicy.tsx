import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useNavigate } from 'react-router-dom';

const CookiePolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-10">
          <div className="container-custom text-center">
            <h1 className="text-white mb-4">Cookie <span className="text-cyan">Policy</span></h1>
            <p className="text-white/40 text-sm">Last updated: March 1, 2026</p>
          </div>
        </section>
        <section className="section-darker py-16">
          <div className="container-custom max-w-3xl">
            <div className="space-y-8 text-white/60 text-sm leading-relaxed">
              <div>
                <h2 className="text-white text-xl font-bold mb-3">1. What Are Cookies</h2>
                <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience, remember your preferences, and understand how you interact with our platform.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">2. Essential Cookies</h2>
                <p>These cookies are necessary for the website to function properly. They enable core functionality like authentication, session management, and security features. You cannot opt out of essential cookies.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">3. Analytics Cookies</h2>
                <p>We use analytics cookies to understand how visitors interact with our website. This helps us improve our services and user experience. Analytics data is anonymized and aggregated.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">4. Managing Cookies</h2>
                <p>You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. However, blocking essential cookies may affect the functionality of our platform.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">5. Contact</h2>
                <p>For questions about our cookie practices, contact us at <a href="mailto:privacy@mispartech.com" className="text-cyan hover:underline">privacy@mispartech.com</a>.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default CookiePolicy;
