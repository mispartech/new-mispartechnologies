import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import DashboardHome from './DashboardHome';
import MemberDashboard from './MemberDashboard';

interface DashboardContext { user: any; profile: any; session: any; }

const ADMIN_ROLES = [
  'super_admin', 'admin', 'manager', 'parish_pastor', 'secretary',
  'ushering_head_admin', 'usher_admin', 'department_head'
];

const DashboardRouter = () => {
  const context = useOutletContext<DashboardContext>();
  const { profile } = context;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!profile?.id) { setLoading(false); return; }

      // Use profile.role if available (from Django auth context)
      if (profile.role) {
        setUserRole(profile.role);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await djangoApi.getUserRole(profile.id);
        if (data && !error) {
          setUserRole(data.role);
        } else {
          setUserRole('member');
        }
      } catch {
        setUserRole('member');
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAdmin = userRole && ADMIN_ROLES.includes(userRole);
  return isAdmin ? <DashboardHome /> : <MemberDashboard />;
};

export default DashboardRouter;
