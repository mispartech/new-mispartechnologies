import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, User, LogOut, LayoutDashboard } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-navy/90 backdrop-blur-xl border-b border-white/5 py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-inter font-bold text-white">
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

          <button className="md:hidden text-white" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-navy/95 backdrop-blur-xl border-t border-white/5">
          <div className="container-custom py-4">
            <ul className="space-y-4 font-inter">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="block text-white/70 hover:text-cyan transition-colors" onClick={toggleMenu}>
                    {link.label}
                  </a>
                </li>
              ))}
              {isLoading ? (
                <li><div className="w-full h-10 bg-white/5 animate-pulse rounded-md" /></li>
              ) : isAuthenticated ? (
                <>
                  <li>
                    <Button variant="outline" className="w-full gap-2 border-white/10 text-white hover:bg-white/5" onClick={() => { navigate('/dashboard'); toggleMenu(); }}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full gap-2 text-red-400 hover:text-red-300 hover:bg-white/5" onClick={() => { handleLogout(); toggleMenu(); }}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Button variant="outline" className="w-full gap-2 border-white/10 text-white hover:bg-white/5" onClick={() => { navigate('/auth'); toggleMenu(); }}>
                      <LogIn className="w-4 h-4" /> Login
                    </Button>
                  </li>
                  <li>
                    <Button className="w-full button-glow bg-cyan text-navy-dark font-semibold" onClick={() => { onRequestDemo?.(); toggleMenu(); }}>
                      Request Demo
                    </Button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
