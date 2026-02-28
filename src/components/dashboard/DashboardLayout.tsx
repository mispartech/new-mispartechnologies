import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { TerminologyProvider } from '@/contexts/TerminologyContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user: djangoUser, isLoading: djangoLoading, isAuthenticated } = useDjangoAuth();

  // Derive enrollment status directly from profile
  const isEnrolled = djangoUser?.face_enrolled === true;

  useEffect(() => {
    if (djangoLoading) return;
    if (!isAuthenticated || !djangoUser) {
      navigate('/auth', { replace: true });
    }
  }, [djangoLoading, isAuthenticated, djangoUser, navigate]);

  // Enforce onboarding + enrollment gates from profile
  useEffect(() => {
    if (djangoLoading || !djangoUser) return;

    if (djangoUser.is_onboarded !== true) {
      navigate('/onboarding', { replace: true });
      return;
    }

    if (!isEnrolled && location.pathname !== '/dashboard/face-enrollment') {
      navigate('/dashboard/face-enrollment');
    }
  }, [isEnrolled, djangoLoading, djangoUser, location.pathname, navigate]);

  if (djangoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!djangoUser) return null;

  // Build profile object from djangoUser (single source of truth)
  const profile = {
    id: djangoUser.id,
    email: djangoUser.email,
    first_name: djangoUser.first_name,
    last_name: djangoUser.last_name,
    role: djangoUser.role,
    organization_id: djangoUser.organization_id,
    department: djangoUser.department,
    department_id: djangoUser.department_id,
    face_image_url: djangoUser.face_image_url,
    face_enrolled: djangoUser.face_enrolled,
    phone_number: djangoUser.phone_number,
    gender: djangoUser.gender,
    is_onboarded: djangoUser.is_onboarded,
  };

  const mockUser = {
    id: profile.id,
    email: profile.email,
    app_metadata: {},
    user_metadata: {
      first_name: profile.first_name,
      last_name: profile.last_name,
    },
    aud: 'authenticated',
    created_at: '',
  };

  // Simplified layout for enrollment page
  if (location.pathname === '/dashboard/face-enrollment') {
    return (
      <TerminologyProvider organizationId={profile.organization_id}>
        <div className="min-h-screen bg-muted/30">
          <DashboardHeader 
            user={mockUser as any} 
            profile={profile}
            onMenuToggle={() => {}}
          />
          <main className="p-4 lg:p-6 mt-16">
            <Outlet context={{ user: mockUser, profile, session: null }} />
          </main>
        </div>
      </TerminologyProvider>
    );
  }

  return (
    <TerminologyProvider organizationId={profile.organization_id}>
      <div className="min-h-screen bg-muted/30">
        <DashboardSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          currentPath={location.pathname}
          profile={profile}
        />
        
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <DashboardHeader 
            user={mockUser as any} 
            profile={profile}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <main className="p-4 lg:p-6 mt-16">
            <Outlet context={{ user: mockUser, profile, session: null }} />
          </main>
        </div>
      </div>
    </TerminologyProvider>
  );
};

export default DashboardLayout;
