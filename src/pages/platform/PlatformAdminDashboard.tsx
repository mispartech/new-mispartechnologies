import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2, Users, FileText, BarChart3, Newspaper, Briefcase,
  MessageSquare, Settings, LogOut, Shield, Clock, Save,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchDashboardStats, updatePlatformStats, type DashboardStats } from '@/lib/api/platformApi';

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
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stat overrides for public-facing values
  const [overrides, setOverrides] = useState({ total_users: '', total_organizations: '', accuracy_rate: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDashboardStats().then((data) => {
      setStats(data);
      setOverrides({
        total_users: String(data.total_users),
        total_organizations: String(data.total_organizations),
        accuracy_rate: String(data.accuracy_rate),
      });
      setIsLoading(false);
    });
  }, []);

  const handleSaveOverrides = async () => {
    setIsSaving(true);
    const result = await updatePlatformStats({
      total_users: Number(overrides.total_users) || 0,
      total_organizations: Number(overrides.total_organizations) || 0,
      accuracy_rate: Number(overrides.accuracy_rate) || 99,
    });
    if (result.success) {
      toast({ title: 'Stats Updated', description: 'Public-facing stats have been saved.' });
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to save stats.', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const statCards = [
    { label: 'Total Organizations', value: stats?.total_organizations, icon: Building2 },
    { label: 'Total Users', value: stats?.total_users, icon: Users },
    { label: 'Demo Requests', value: stats?.demo_requests, icon: MessageSquare },
    { label: 'Active Plans', value: stats?.active_plans, icon: BarChart3 },
  ];

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
          {statCards.map((stat) => (
            <div key={stat.label} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="w-5 h-5 text-cyan" />
                <span className="text-white/40 text-xs">{stat.label}</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-20 bg-white/10" />
              ) : (
                <p className="text-2xl font-bold text-white">
                  {stat.value?.toLocaleString() ?? '0'}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Site Stats Management */}
        <Card className="mb-10 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan" />
              Public Site Stats
            </CardTitle>
            <CardDescription className="text-white/40">
              Override the stats displayed on the public website (homepage hero, CTA section).
              These values are shown until automatic calculation from the database is ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-white/60 text-xs">Total Users</Label>
                <Input
                  type="number"
                  value={overrides.total_users}
                  onChange={(e) => setOverrides(p => ({ ...p, total_users: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs">Total Organizations</Label>
                <Input
                  type="number"
                  value={overrides.total_organizations}
                  onChange={(e) => setOverrides(p => ({ ...p, total_organizations: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs">Accuracy Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={overrides.accuracy_rate}
                  onChange={(e) => setOverrides(p => ({ ...p, accuracy_rate: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleSaveOverrides}
              disabled={isSaving}
              className="bg-cyan text-navy-dark hover:bg-cyan/90 gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Public Stats'}
            </Button>
          </CardContent>
        </Card>

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
