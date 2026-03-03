import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-10">
          <div className="container-custom text-center">
            <h1 className="text-white mb-4">Terms of <span className="text-cyan">Service</span></h1>
            <p className="text-white/40 text-sm">Last updated: March 1, 2026</p>
          </div>
        </section>
        <section className="section-darker py-16">
          <div className="container-custom max-w-3xl">
            <div className="space-y-8 text-white/60 text-sm leading-relaxed">
              <div>
                <h2 className="text-white text-xl font-bold mb-3">1. Acceptance of Terms</h2>
                <p>By accessing or using Mispar Technologies' services, you agree to be bound by these Terms of Service. If you are using our services on behalf of an organization, you represent that you have authority to bind that organization.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">2. Service Description</h2>
                <p>Mispar Technologies provides AI-powered facial recognition solutions for attendance management, access control, and identity verification. Our services include web-based dashboards, API access, and mobile applications.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">3. User Responsibilities</h2>
                <p>You are responsible for obtaining proper consent from individuals whose facial data is enrolled in the system. You must inform all members about the use of facial recognition and provide opt-out mechanisms where required by law.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">4. Data Ownership</h2>
                <p>You retain ownership of all data you upload to our platform. Mispar Technologies processes your data solely to provide the agreed-upon services. Upon termination, you may export your data within 30 days.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">5. Service Availability</h2>
                <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance windows will be communicated at least 48 hours in advance. We are not liable for downtime caused by factors beyond our control.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">6. Limitation of Liability</h2>
                <p>Mispar Technologies' total liability shall not exceed the amount paid by you in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages arising from use of our services.</p>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-3">7. Contact</h2>
                <p>For questions about these terms, contact us at <a href="mailto:legal@mispartech.com" className="text-cyan hover:underline">legal@mispartech.com</a>.</p>
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

export default TermsOfService;
