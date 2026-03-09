import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { TerminologyProvider } from '@/contexts/TerminologyContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { DashboardPreloader } from './PreloaderPreview';

const DashboardLayoutInner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const { user: djangoUser, isLoading: djangoLoading, isAuthenticated, refreshUser } = useDjangoAuth();
  const enrollCheckDone = useRef(false);

  const isEnrolled = djangoUser?.face_enrolled === true;

  useEffect(() => {
    if (djangoLoading) return;
    if (!isAuthenticated || !djangoUser) {
      navigate('/auth', { replace: true });
    }
  }, [djangoLoading, isAuthenticated, djangoUser, navigate]);

  // If profile says not enrolled, do one refresh to check for stale data before redirecting
  useEffect(() => {
    if (djangoLoading || !djangoUser) return;

    if (djangoUser.is_onboarded !== true) {
      navigate('/onboarding', { replace: true });
      return;
    }

    if (isEnrolled) {
      // Already enrolled — if on enrollment page, redirect away
      if (location.pathname === '/dashboard/face-enrollment') {
        navigate('/dashboard', { replace: true });
      }
      return;
    }

    // Not enrolled according to profile — do one refresh to catch stale data
    if (!enrollCheckDone.current) {
      enrollCheckDone.current = true;
      refreshUser(); // Will re-trigger this effect with fresh data
      return;
    }

    // After refresh, still not enrolled — redirect to enrollment
    if (location.pathname !== '/dashboard/face-enrollment') {
      navigate('/dashboard/face-enrollment');
    }
  }, [isEnrolled, djangoLoading, djangoUser, location.pathname, navigate, refreshUser]);

  // Access theme for preloader customization
  let themePreloader: { style: any; color: string; logo: string } | null = null;
  try {
    const { branding } = useTheme();
    themePreloader = {
      style: branding.preloader_style,
      color: branding.primary_color,
      logo: branding.logo_url,
    };
  } catch {
    // ThemeProvider not ready yet
  }

  if (djangoLoading) {
    if (themePreloader) {
      return (
        <DashboardPreloader
          style={themePreloader.style}
          primaryColor={themePreloader.color}
          logoUrl={themePreloader.logo}
        />
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!djangoUser) return null;

  const profile = {
    id: djangoUser.id,
    email: djangoUser.email,
    first_name: djangoUser.first_name,
    last_name: djangoUser.last_name,
    role: djangoUser.role,
    organization_id: djangoUser.organization_id,
    organization_name: djangoUser.organization_name,
    organization_type: djangoUser.organization_type,
    organization_size_range: djangoUser.organization_size_range,
    department: djangoUser.department,
    department_id: djangoUser.department_id,
    face_image_url: djangoUser.face_image_url,
    face_enrolled: djangoUser.face_enrolled,
    phone_number: djangoUser.phone_number,
    gender: djangoUser.gender,
    is_onboarded: djangoUser.is_onboarded,
    job_title: djangoUser.job_title,
  };

  const mockUser = {
    id: profile.id,
    email: profile.email,
    app_metadata: {},
    user_metadata: { first_name: profile.first_name, last_name: profile.last_name },
    aud: 'authenticated',
    created_at: '',
  };

  if (location.pathname === '/dashboard/face-enrollment') {
    return (
      <div className="min-h-screen bg-background dashboard-themed">
        <DashboardHeader user={mockUser as any} profile={profile} onMenuToggle={() => {}} />
        <main className="p-4 lg:p-6 mt-14">
          <Outlet context={{ user: mockUser, profile, session: null }} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dashboard-themed">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPath={location.pathname}
        profile={profile}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[68px]'}`}>
        <DashboardHeader
          user={mockUser as any}
          profile={profile}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 lg:p-6 mt-14">
          <Outlet context={{ user: mockUser, profile, session: null }} />
        </main>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const { user: djangoUser } = useDjangoAuth();

  const normalizeRole = (role: string) => {
    const normalized = role.trim().toLowerCase().replace(/\s+/g, '_');
    if (['employee', 'staff', 'user'].includes(normalized)) return 'member';
    return normalized;
  };

  return (
    <TerminologyProvider
      organizationType={djangoUser?.organization_type}
      organizationName={djangoUser?.organization_name}
    >
      <ThemeProvider
        organizationId={djangoUser?.organization_id}
        userRole={djangoUser?.role ? normalizeRole(djangoUser.role) : 'member'}
        initialBranding={djangoUser?.organization_branding}
      >
        <DashboardLayoutInner />
      </ThemeProvider>
    </TerminologyProvider>
  );
};

export default DashboardLayout;
