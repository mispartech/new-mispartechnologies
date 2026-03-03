import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-10">
          <div className="container-custom text-center">
            <h1 className="text-white mb-4">Privacy <span className="text-cyan">Policy</span></h1>
            <p className="text-white/40 text-sm">Last updated: March 1, 2026</p>
          </div>
        </section>
        <section className="section-darker py-16">
          <div className="container-custom max-w-3xl prose-invert">
            <div className="space-y-8 text-white/60 text-sm leading-relaxed">
              <div>
                <h2 className="text-white text-xl font-bold mb-3">1. Information We Collect</h2>
                <p>We collect personal information you provide directly, including name, email address, organization name, and facial biometric data (facial embeddings) when you enroll in our face recognition system. We also collect device information, IP addresses, and usage analytics.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">2. How We Use Biometric Data</h2>
                <p>Facial embeddings are mathematical representations of facial features — not photographs. They are used solely for identity verification and attendance tracking. Embeddings are encrypted at rest and in transit. We never sell or share biometric data with third parties.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">3. Data Storage & Security</h2>
                <p>All data is stored on encrypted servers with AES-256 encryption. Access is restricted to authorized personnel only. We conduct regular security audits and penetration testing. Data is retained only for the duration of your organization's subscription plus 30 days.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">4. Your Rights</h2>
                <p>You have the right to access, correct, or delete your personal data at any time. Organization administrators can remove member data through the dashboard. You may also request a complete data export or account deletion by contacting us at privacy@mispartech.com.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">5. Compliance</h2>
                <p>Mispar Technologies complies with the Nigeria Data Protection Regulation (NDPR), the General Data Protection Regulation (GDPR), and applicable international data protection laws. We appoint a Data Protection Officer and maintain records of all processing activities.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">6. Contact</h2>
                <p>For privacy-related inquiries, contact our Data Protection Officer at <a href="mailto:privacy@mispartech.com" className="text-cyan hover:underline">privacy@mispartech.com</a>.</p>
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

export default PrivacyPolicy;
