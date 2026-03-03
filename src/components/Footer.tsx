import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Mail, MapPin, ScanFace, Fingerprint, Eye, Shield, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const solutions = [
    { name: 'Smart Attendance', path: '/smart-attendance', icon: ScanFace },
    { name: 'Security Systems', path: '/security-systems', icon: Shield },
    { name: 'Healthcare Integration', path: '/healthcare-integration', icon: Fingerprint },
    { name: 'Educational Solutions', path: '/educational-solutions', icon: Eye },
    { name: 'Corporate Access', path: '/corporate-access', icon: ScanFace },
  ];

  const company = [
    { name: 'About Us', path: '/about' },
    { name: 'Our Team', path: '/team' },
    { name: 'Careers', path: '/careers' },
    { name: 'Press & Media', path: '/press' },
    { name: 'Blog', path: '/blog' },
  ];

  const socials = [
    {
      name: 'Twitter',
      href: 'https://x.com/mispartech',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/mispartechnologies',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
      ),
    },
  ];

  return (
    <footer ref={footerRef} className="relative overflow-hidden border-t border-white/5" style={{ background: 'linear-gradient(180deg, hsl(210 60% 6%) 0%, hsl(210 63% 3%) 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Face scan grid pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, hsl(190 90% 50%), transparent 1px, transparent 24px), repeating-linear-gradient(90deg, hsl(190 90% 50%), transparent 1px, transparent 24px)`,
        }} />
        {/* Subtle scanning line */}
        <div className="absolute top-0 left-1/4 w-px h-full opacity-[0.06]" style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(190 90% 50%) 50%, transparent 100%)',
          animation: 'scan-line 8s linear infinite',
        }} />
        {/* Glow orb */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-[0.04]" style={{
          background: 'radial-gradient(circle, hsl(190 90% 50%) 0%, transparent 70%)',
        }} />
      </div>

      <div className="container-custom relative z-10 py-12 md:py-20">
        <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
              <div className="w-9 h-9 rounded-lg bg-cyan/10 flex items-center justify-center group-hover:bg-cyan/20 transition-colors">
                <ScanFace size={20} className="text-cyan" />
              </div>
              <h2 className="text-xl md:text-2xl font-inter font-bold text-white">Mispar<span className="text-cyan">Tech</span></h2>
            </Link>
            <p className="text-white/40 mb-6 text-sm leading-relaxed">
              Unlocking every barrier with innovative face recognition technology. Transform the way your organization handles identification, security, and access.
            </p>
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-cyan/15 hover:text-cyan active:scale-95 transition-all duration-300 tap-target group"
                >
                  <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-5 flex items-center gap-2">
              <Shield size={14} className="text-cyan" />
              Solutions
            </h3>
            <ul className="space-y-3">
              {solutions.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="group flex items-center gap-2 text-white/40 hover:text-cyan transition-colors text-sm">
                    <item.icon size={13} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan" />
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-5 flex items-center gap-2">
              <Eye size={14} className="text-cyan" />
              Company
            </h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="group flex items-center gap-1.5 text-white/40 hover:text-cyan transition-colors text-sm">
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.name}</span>
                    <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-5 flex items-center gap-2">
              <Fingerprint size={14} className="text-cyan" />
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 shrink-0 group-hover:bg-cyan/10 transition-colors">
                  <MapPin size={14} className="text-cyan" />
                </div>
                <span className="text-white/40 text-sm pt-1">Mispar Technologies, Lekki Phase 1, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 shrink-0 group-hover:bg-cyan/10 transition-colors">
                  <PhoneCall size={14} className="text-cyan" />
                </div>
                <a href="tel:+2348012345678" className="text-white/40 hover:text-cyan transition-colors text-sm">+234 801 234 5678</a>
              </li>
              <li className="flex items-center group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 shrink-0 group-hover:bg-cyan/10 transition-colors">
                  <Mail size={14} className="text-cyan" />
                </div>
                <a href="mailto:info@mispartech.com" className="text-white/40 hover:text-cyan transition-colors text-sm">info@mispartech.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-white/25 text-xs">&copy; {currentYear} Mispar Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {[
              { label: 'Privacy Policy', path: '/privacy-policy' },
              { label: 'Terms of Service', path: '/terms-of-service' },
              { label: 'Cookie Policy', path: '/cookie-policy' },
            ].map((item) => (
              <Link key={item.label} to={item.path} className="text-white/25 hover:text-cyan transition-colors text-xs">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom spacer for sticky mobile CTA bar */}
      <div className="h-20 md:hidden" />
    </footer>
  );
};

export default Footer;
