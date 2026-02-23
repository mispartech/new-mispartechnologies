import React from 'react';
import { PhoneCall, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-deeper text-white border-t border-white/5">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="mb-5">
              <h2 className="text-2xl font-inter font-bold text-white">Mispar<span className="text-cyan">Tech</span></h2>
            </div>
            <p className="text-white/40 mb-6">
              Unlocking every barrier with innovative face recognition technology. Transform the way your organization handles identification, security, and access.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-cyan/20 hover:text-cyan transition-all duration-300">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Solutions</h3>
            <ul className="space-y-3">
              {['Smart Attendance', 'Security Systems', 'Healthcare Integration', 'Educational Solutions', 'Corporate Access'].map(item => (
                <li key={item}><a href="#" className="text-white/40 hover:text-cyan transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              {['About Us', 'Our Team', 'Careers', 'Press & Media', 'Blog'].map(item => (
                <li key={item}><a href="#" className="text-white/40 hover:text-cyan transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 shrink-0 text-cyan mt-0.5" />
                <span className="text-white/40 text-sm">Mispar Technologies, Lekki Phase 1, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center">
                <PhoneCall size={18} className="mr-3 shrink-0 text-cyan" />
                <a href="tel:+2348012345678" className="text-white/40 hover:text-cyan transition-colors text-sm">+234 801 234 5678</a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 shrink-0 text-cyan" />
                <a href="mailto:info@mispartech.com" className="text-white/40 hover:text-cyan transition-colors text-sm">info@mispartech.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-white/30 text-sm flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {currentYear} Mispar Technologies. All rights reserved.</p>
          <div className="flex mt-4 md:mt-0 space-x-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" className="hover:text-cyan transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
