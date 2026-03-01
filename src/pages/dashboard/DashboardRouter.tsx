import { useOutletContext } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import MemberDashboard from './MemberDashboard';

interface DashboardContext { user: any; profile: any; session: any; }

const ADMIN_ROLES = [
  'super_admin', 'admin', 'manager', 'parish_pastor', 'secretary',
  'ushering_head_admin', 'usher_admin', 'department_head'
];

const normalizeRole = (role: string) =>
  role.trim().toLowerCase().replace(/\s+/g, '_');

const DashboardRouter = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const role = normalizeRole(profile?.role || 'member');
  const isAdmin = ADMIN_ROLES.includes(role);

  return isAdmin ? <DashboardHome /> : <MemberDashboard />;
};

export default DashboardRouter;
