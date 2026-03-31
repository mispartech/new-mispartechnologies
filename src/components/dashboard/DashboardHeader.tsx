import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Menu, LogOut, User as UserIcon, Settings, Home, ChevronRight, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NotificationBell from './NotificationBell';
import { useTerminology } from '@/contexts/TerminologyContext';

interface DashboardHeaderProps {
  user: User;
  profile: any;
  onMenuToggle: () => void;
  sidebarOpen?: boolean;
}

// Static route labels (non-dynamic ones)
const STATIC_ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/attendance': 'Mark Attendance',
  '/dashboard/attendance-logs': 'Attendance Logs',
  '/dashboard/attendance-history': 'Attendance History',
  '/dashboard/attendance-summary': 'Attendance Summary',
  '/dashboard/departments': 'Departments',
  '/dashboard/face-gallery': 'Face Gallery',
  '/dashboard/face-enrollment': 'Face Enrollment',
  '/dashboard/reports': 'Reports',
  '/dashboard/profile': 'My Profile',
  '/dashboard/admin-management': 'Admin Management',
  '/dashboard/activity-logs': 'Activity Logs',
  '/dashboard/schedules': 'Schedules',
  '/dashboard/site-management': 'Site Management',
  '/dashboard/branding': 'Branding',
  '/dashboard/settings': 'Settings',
  '/dashboard/my-attendance': 'My Attendance',
  '/dashboard/my-schedule': 'My Schedule',
  '/dashboard/streaks': 'Streaks & Badges',
  '/dashboard/visitor-review': 'Visitor Review',
  '/dashboard/temp-members': 'Temp Visitors',
};

const DashboardHeader = ({ user, profile, onMenuToggle, sidebarOpen }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { logout } = useDjangoAuth();
  const { getTerm } = useTerminology();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return user.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user.email || 'User';
  };

  const breadcrumbLabel = useMemo(() => {
    if (location.pathname === '/dashboard/members') return getTerm('plural', true);
    return STATIC_ROUTE_LABELS[location.pathname] || '';
  }, [location.pathname, getTerm]);

  return (
    <header className={cn("fixed top-0 right-0 z-40 h-14 bg-card/80 backdrop-blur-xl border-b border-border/50 left-0 transition-all duration-300", sidebarOpen ? "lg:left-64" : "lg:left-[68px]")}>
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: mobile menu + breadcrumbs */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={onMenuToggle}>
            <Menu className="w-5 h-5" />
          </Button>

          {/* Breadcrumbs */}
          {breadcrumbLabel && location.pathname !== '/dashboard' && (
            <nav className="hidden sm:flex items-center gap-1.5 text-sm">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              <span className="font-medium text-foreground">{breadcrumbLabel}</span>
            </nav>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Home */}
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate('/')} title="Go to Homepage">
            <Home className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <NotificationBell userId={user.id} />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={profile?.face_image_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">{getDisplayName()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{getDisplayName()}</span>
                  <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                  <Badge variant="secondary" className="w-fit mt-1 text-[10px] capitalize">
                    {profile?.role?.replace(/_/g, ' ') || 'member'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                <UserIcon className="w-4 h-4 mr-2" />My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <Settings className="w-4 h-4 mr-2" />Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
