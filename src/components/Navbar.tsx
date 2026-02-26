import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavbarProps {
  onRequestDemo?: () => void;
}

const Navbar = ({ onRequestDemo }: NavbarProps) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user: djangoUser, isAuthenticated, isLoading, logout } = useDjangoAuth();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const getInitials = () => {
    if (djangoUser?.first_name && djangoUser?.last_name) {
      return `${djangoUser.first_name[0]}${djangoUser.last_name[0]}`.toUpperCase();
    }
    return djangoUser?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (djangoUser?.first_name && djangoUser?.last_name) {
      return `${djangoUser.first_name} ${djangoUser.last_name}`;
    }
    return djangoUser?.email || 'User';
  };

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#solutions', label: 'Solutions' },
    { href: '#roadmap', label: 'Roadmap' },
    { href: '#demo', label: 'Demo' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-navy/90 backdrop-blur-xl border-b border-white/5 py-2 md:py-3' 
            : 'bg-navy/80 backdrop-blur-xl py-3 md:py-5'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <span className="text-xl md:text-2xl font-inter font-bold text-white">
                Mispar <span className="text-cyan">Technologies</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className="flex items-center space-x-8 font-inter">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a 
                      href={link.href} 
                      className="text-white/60 hover:text-cyan transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <div className="w-20 h-9 bg-white/5 animate-pulse rounded-md" />
                ) : isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2 px-2 text-white hover:bg-white/5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-cyan/20 text-cyan text-sm">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden lg:inline text-white/80">{getDisplayName()}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-navy border-white/10">
                      <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-white/80 hover:text-white focus:bg-white/5">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/dashboard/profile')} className="text-white/80 hover:text-white focus:bg-white/5">
                        <User className="mr-2 h-4 w-4" /> My Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 focus:bg-white/5">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="gap-2 text-white/70 hover:text-white hover:bg-white/5"
                      onClick={() => navigate('/auth')}
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                    <Button 
                      className="button-glow bg-cyan text-navy-dark font-semibold hover:bg-cyan-light" 
                      onClick={onRequestDemo}
                    >
                      Request Demo
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile hamburger */}
            <button 
              className="md:hidden tap-target flex items-center justify-center text-white" 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-in Drawer */}
      {isMenuOpen && (
        <div className="drawer-overlay md:hidden" onClick={closeMenu} />
      )}
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-navy-dark/98 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <span className="text-lg font-inter font-bold text-white">Menu</span>
          <button 
            className="tap-target flex items-center justify-center text-white/60"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex flex-col h-[calc(100%-65px)] overflow-y-auto">
          <ul className="space-y-1 font-inter">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a 
                  href={link.href} 
                  className="flex items-center tap-target px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors text-base"
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="my-4 border-t border-white/5" />

          {/* CTA inside drawer */}
          <Button 
            className="w-full button-glow bg-cyan text-navy-dark font-semibold tap-target text-base"
            onClick={() => { onRequestDemo?.(); closeMenu(); }}
          >
            Request Demo
          </Button>

          <div className="mt-auto pt-6 space-y-2">
            {isLoading ? (
              <div className="w-full h-12 bg-white/5 animate-pulse rounded-xl" />
            ) : isAuthenticated ? (
              <>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 border-white/10 text-white hover:bg-white/5 tap-target"
                  onClick={() => { navigate('/dashboard'); closeMenu(); }}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full gap-2 text-red-400 hover:text-red-300 hover:bg-white/5 tap-target"
                  onClick={() => { handleLogout(); closeMenu(); }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="w-full gap-2 border-white/10 text-white hover:bg-white/5 tap-target"
                onClick={() => { navigate('/auth'); closeMenu(); }}
              >
                <LogIn className="w-4 h-4" /> Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA bar for mobile */}
      <div className="sticky-bottom-cta" aria-label="Quick actions">
        <div className="flex gap-2">
          <Button 
            className="flex-1 button-glow bg-cyan text-navy-dark font-semibold rounded-full shadow-lg shadow-cyan/20 tap-target text-sm"
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Try Live Demo
          </Button>
          <a
            href="tel:+2348012345678"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/10 text-white active:bg-white/20 transition-colors tap-target"
            aria-label="Call us"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </a>
          <a
            href="mailto:info@mispartech.com"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/10 text-white active:bg-white/20 transition-colors tap-target"
            aria-label="Email us"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
