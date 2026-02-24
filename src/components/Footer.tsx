import React from 'react';
import { PhoneCall, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-deeper text-white border-t border-white/5">
      <div className="container-custom py-10 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 md:mb-5">
              <h2 className="text-xl md:text-2xl font-inter font-bold text-white">Mispar<span className="text-cyan">Tech</span></h2>
            </div>
            <p className="text-white/40 mb-5 md:mb-6 text-sm">
              Unlocking every barrier with innovative face recognition technology. Transform the way your organization handles identification, security, and access.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-cyan/20 hover:text-cyan active:scale-95 transition-all duration-300 tap-target">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white">Solutions</h3>
            <ul className="space-y-2.5 md:space-y-3">
              {['Smart Attendance', 'Security Systems', 'Healthcare Integration', 'Educational Solutions', 'Corporate Access'].map(item => (
                <li key={item}><a href="#" className="text-white/40 hover:text-cyan active:text-cyan transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white">Company</h3>
            <ul className="space-y-2.5 md:space-y-3">
              {['About Us', 'Our Team', 'Careers', 'Press & Media', 'Blog'].map(item => (
                <li key={item}><a href="#" className="text-white/40 hover:text-cyan active:text-cyan transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white">Contact Us</h3>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start">
                <MapPin size={16} className="mr-3 shrink-0 text-cyan mt-0.5 md:w-[18px] md:h-[18px]" />
                <span className="text-white/40 text-sm">Mispar Technologies, Lekki Phase 1, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center">
                <PhoneCall size={16} className="mr-3 shrink-0 text-cyan md:w-[18px] md:h-[18px]" />
                <a href="tel:+2348012345678" className="text-white/40 hover:text-cyan active:text-cyan transition-colors text-sm">+234 801 234 5678</a>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-3 shrink-0 text-cyan md:w-[18px] md:h-[18px]" />
                <a href="mailto:info@mispartech.com" className="text-white/40 hover:text-cyan active:text-cyan transition-colors text-sm">info@mispartech.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/5 text-white/30 text-xs md:text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {currentYear} Mispar Technologies. All rights reserved.</p>
          <div className="flex space-x-4 md:space-x-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" className="hover:text-cyan active:text-cyan transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom spacer for floating mobile CTA */}
      <div className="h-16 md:hidden" />
    </footer>
  );
};

export default Footer;
