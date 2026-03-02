import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Building2, 
  ScanFace, 
  FileText, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Image,
  ClipboardList,
  UserCheck,
  Shield,
  Activity,
  CalendarClock,
  Globe,
  Calendar,
  History,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTerminology } from '@/contexts/TerminologyContext';

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
  profile: any;
}

const normalizeRole = (role: string) => {
  const normalized = role.trim().toLowerCase().replace(/\s+/g, '_');
  // Map common aliases to canonical sidebar roles
  if (['employee', 'staff', 'user'].includes(normalized)) return 'member';
  return normalized;
};

const DashboardSidebar = ({ isOpen, onToggle, currentPath, profile }: DashboardSidebarProps) => {
  const userRole = normalizeRole(profile?.role || 'member');
  const { getTerm } = useTerminology();

  const getMembersLabel = () => getTerm('plural', true);
  const getTempMembersLabel = () => `Temporary ${getTerm('plural', true)}`;

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['super_admin', 'admin', 'manager', 'member'] },
    { label: 'My Attendance', icon: Calendar, href: '/dashboard/my-attendance', roles: ['member'] },
    { label: 'Attendance Summary', icon: TrendingUp, href: '/dashboard/attendance-summary', roles: ['member'] },
    { label: 'My Streaks & Badges', icon: Trophy, href: '/dashboard/streaks', roles: ['member'] },
    { label: 'My Schedule', icon: CalendarClock, href: '/dashboard/my-schedule', roles: ['member'] },
    { label: 'Mark Attendance', icon: ScanFace, href: '/dashboard/attendance', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Attendance Logs', icon: ClipboardList, href: '/dashboard/attendance-logs', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Attendance History', icon: History, href: '/dashboard/attendance-history', roles: ['super_admin', 'admin', 'manager'] },
    { label: getMembersLabel(), icon: Users, href: '/dashboard/members', roles: ['super_admin', 'admin', 'manager'], isDynamic: true },
    { label: getTempMembersLabel(), icon: UserPlus, href: '/dashboard/temp-members', roles: ['super_admin', 'admin'], isDynamic: true },
    { label: 'Departments', icon: Building2, href: '/dashboard/departments', roles: ['super_admin', 'admin'] },
    { label: 'Face Gallery', icon: Image, href: '/dashboard/face-gallery', roles: ['super_admin', 'admin'] },
    { label: 'Reports', icon: FileText, href: '/dashboard/reports', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'My Profile', icon: UserCheck, href: '/dashboard/profile', roles: ['super_admin', 'admin', 'manager', 'member'] },
    { label: 'Admin Management', icon: Shield, href: '/dashboard/admin-management', roles: ['super_admin', 'admin'] },
    { label: 'Activity Logs', icon: Activity, href: '/dashboard/activity-logs', roles: ['super_admin', 'admin'] },
    { label: 'Schedules', icon: CalendarClock, href: '/dashboard/schedules', roles: ['super_admin', 'admin'] },
    { label: 'Site Management', icon: Globe, href: '/dashboard/site-management', roles: ['super_admin', 'admin'] },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings', roles: ['super_admin', 'admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
      )}
      
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300",
        isOpen ? "w-64" : "w-20",
        "hidden lg:block"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {isOpen ? (
            <Link to="/dashboard" className="flex items-center gap-2">
              <ScanFace className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Mispar Technologies</span>
            </Link>
          ) : (
            <Link to="/dashboard" className="mx-auto">
              <ScanFace className="w-8 h-8 text-primary" />
            </Link>
          )}
        </div>

        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  !isOpen && "justify-center"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {isOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium text-foreground capitalize">{userRole.replace(/_/g, ' ')}</p>
              {profile?.job_title && (
                <p className="text-xs text-muted-foreground mt-0.5">{profile.job_title}</p>
              )}
            </div>
          </div>
        )}
      </aside>

      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ScanFace className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Mispar Technologies</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onToggle}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium text-foreground capitalize">{userRole.replace(/_/g, ' ')}</p>
            {profile?.job_title && (
              <p className="text-xs text-muted-foreground mt-0.5">{profile.job_title}</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
