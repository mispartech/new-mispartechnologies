import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Building2, Users, FileText, BarChart3, Newspaper, Briefcase,
  MessageSquare, Settings, LogOut, Shield, Clock,
} from 'lucide-react';

const stats = [
  { label: 'Total Organizations', value: '—', icon: Building2 },
  { label: 'Total Users', value: '—', icon: Users },
  { label: 'Demo Requests', value: '—', icon: MessageSquare },
  { label: 'Active Plans', value: '—', icon: BarChart3 },
];

const sections = [
  { label: 'Organizations', description: 'View and manage all registered organizations', icon: Building2, status: 'coming-soon' as const },
  { label: 'Demo Requests', description: 'Review submitted demo requests', icon: MessageSquare, status: 'coming-soon' as const },
  { label: 'Blog Management', description: 'Create and publish blog posts', icon: FileText, status: 'coming-soon' as const },
  { label: 'Press & Media', description: 'Manage press releases and media items', icon: Newspaper, status: 'coming-soon' as const },
  { label: 'Careers', description: 'Manage job listings and applications', icon: Briefcase, status: 'coming-soon' as const },
  { label: 'Platform Settings', description: 'Global platform configuration', icon: Settings, status: 'coming-soon' as const },
];

const PlatformAdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen section-dark">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-navy/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-cyan" />
            <span className="font-bold text-white">Mispar <span className="text-cyan">Admin</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm hidden sm:block">Platform Administrator</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white"
              onClick={() => navigate('/')}
            >
              <LogOut className="w-4 h-4 mr-1" /> Exit
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Platform Dashboard</h1>
          <p className="text-white/40 text-sm">Manage organizations, content, and platform operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="w-5 h-5 text-cyan" />
                <span className="text-white/40 text-xs">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Management sections */}
        <h2 className="text-lg font-semibold text-white mb-4">Management</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <div key={section.label} className="glass-card p-6 relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center shrink-0">
                  <section.icon className="w-5 h-5 text-cyan" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{section.label}</h3>
                  <p className="text-white/40 text-sm">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <Clock className="w-3 h-3" />
                <span>Backend integration required</span>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-10 glass-card p-6 border-cyan/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-cyan shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-1">Backend Integration Required</h3>
              <p className="text-white/40 text-sm">
                This platform admin dashboard requires backend endpoints for authentication, organization management,
                and content management. See the backend implementation prompt for details on required Django models and API endpoints.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlatformAdminDashboard;
