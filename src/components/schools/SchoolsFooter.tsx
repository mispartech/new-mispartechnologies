import { Link } from 'react-router-dom';
import { ScanFace, Mail, Phone, MapPin } from 'lucide-react';

export const SchoolsFooter = () => (
  <footer className="mt-10 border-t border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface))]">
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-8 grid gap-8 md:grid-cols-4 text-sm">
      <div>
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[hsl(var(--s-primary))] to-[hsl(var(--s-academic))]">
            <ScanFace className="h-4 w-4 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold text-[hsl(var(--s-primary-ink))]">Mispar Schools</div>
            <div className="text-[10px] uppercase tracking-widest text-[hsl(var(--s-text-subtle))]">Smart Campus OS</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-[hsl(var(--s-text-muted))]">
          Biometric-powered operating system for modern African education.
        </p>
      </div>
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--s-text-subtle))]">Platform</div>
        <ul className="space-y-1.5 text-xs text-[hsl(var(--s-text-muted))]">
          <li><Link to="/schools/dashboard" className="hover:text-[hsl(var(--s-primary))]">Dashboard</Link></li>
          <li><Link to="/schools/dashboard/attendance" className="hover:text-[hsl(var(--s-primary))]">Attendance</Link></li>
          <li><Link to="/schools/dashboard/security" className="hover:text-[hsl(var(--s-primary))]">Security</Link></li>
          <li><Link to="/schools/dashboard/students" className="hover:text-[hsl(var(--s-primary))]">Students</Link></li>
        </ul>
      </div>
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--s-text-subtle))]">Company</div>
        <ul className="space-y-1.5 text-xs text-[hsl(var(--s-text-muted))]">
          <li><Link to="/about" className="hover:text-[hsl(var(--s-primary))]">About</Link></li>
          <li><Link to="/team" className="hover:text-[hsl(var(--s-primary))]">Team</Link></li>
          <li><Link to="/careers" className="hover:text-[hsl(var(--s-primary))]">Careers</Link></li>
          <li><Link to="/privacy-policy" className="hover:text-[hsl(var(--s-primary))]">Privacy</Link></li>
        </ul>
      </div>
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--s-text-subtle))]">Contact</div>
        <ul className="space-y-1.5 text-xs text-[hsl(var(--s-text-muted))]">
          <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> school@mispartechnologies.com</li>
          <li className="flex items-center gap-2"><Phone className="h-3 w-3" /> +234 800 MISPAR</li>
          <li className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Lagos, Nigeria</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-[hsl(var(--s-border))] py-4 text-center text-[11px] text-[hsl(var(--s-text-subtle))]">
      © {new Date().getFullYear()} Mispar Technologies. All rights reserved.
    </div>
  </footer>
);
