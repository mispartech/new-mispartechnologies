import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import SolutionsSection from '@/components/SolutionsSection';
import RoadmapSection from '@/components/RoadmapSection';
import DemoSection from '@/components/DemoSection';
import TestimonialSection from '@/components/TestimonialSection';
import PrivacyTrustSection from '@/components/PrivacyTrustSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import DemoRequestModal from '@/components/DemoRequestModal';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';

const Index = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useDjangoAuth();

  // If user lands on / with an auth hash (email confirmation redirect), 
  // or is already authenticated, redirect appropriately
  useEffect(() => {
    // Check for auth hash fragment from email confirmation
    const hash = window.location.hash;
    if (hash && hash.includes('access_token') && hash.includes('type=signup')) {
      // Supabase will process the hash. Once auth resolves, redirect.
      return;
    }
  }, []);

  // Redirect authenticated users who land on home page
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) {
      const isOnboarded = user.is_onboarded === true;
      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  useEffect(() => {
    // Update document title
    document.title = 'Mispar Technologies - Facial Recognition Solutions';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Unlock every barrier with Mispar Technologies facial recognition solutions. Smart attendance, security, and access control for organizations.');
    }
  }, []);

  const openDemoModal = () => setIsDemoModalOpen(true);
  const closeDemoModal = () => setIsDemoModalOpen(false);

  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={openDemoModal} />
      <main>
        <HeroSection onRequestDemo={openDemoModal} />
        <HowItWorksSection />
        <SolutionsSection />
        <TestimonialSection />
        <PrivacyTrustSection />
        <RoadmapSection />
        <DemoSection />
        <CTASection onRequestDemo={openDemoModal} />
      </main>
      <Footer />
      <ScrollToTop />
      <DemoRequestModal isOpen={isDemoModalOpen} onClose={closeDemoModal} />
    </div>
  );
};

export default Index;
