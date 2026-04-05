import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, Building2, ScanFace, FileText, Settings,
  ChevronLeft, ChevronRight, Image, ClipboardList, UserCheck, Shield, Activity,
  CalendarClock, Globe, Calendar, History, TrendingUp, Trophy, Palette, ChevronDown,
  SearchCheck, X, CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTerminology } from '@/contexts/TerminologyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
  profile: any;
}

const normalizeRole = (role: string) => {
  const normalized = role.trim().toLowerCase().replace(/\s+/g, '_');
  if (['employee', 'staff', 'user'].includes(normalized)) return 'member';
  return normalized;
};

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  icon: any;
  href: string;
  roles: string[];
  isDynamic?: boolean;
}

const DashboardSidebar = ({ isOpen, onToggle, currentPath, profile }: DashboardSidebarProps) => {
  const userRole = normalizeRole(profile?.role || 'member');
  const { getTerm } = useTerminology();
  const { branding } = useTheme();
  const logoUrl = branding?.logo_url || '';

  const navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['super_admin', 'admin', 'manager', 'member'] },
      ],
    },
    {
      label: 'My Space',
      items: [
        { label: 'My Attendance', icon: Calendar, href: '/dashboard/my-attendance', roles: ['member'] },
        { label: 'Attendance Summary', icon: TrendingUp, href: '/dashboard/attendance-summary', roles: ['member'] },
        { label: 'Streaks & Badges', icon: Trophy, href: '/dashboard/streaks', roles: ['member'] },
        { label: 'My Schedule', icon: CalendarClock, href: '/dashboard/my-schedule', roles: ['member'] },
      ],
    },
    {
      label: 'Attendance',
      items: [
        { label: 'Mark Attendance', icon: ScanFace, href: '/dashboard/attendance', roles: ['super_admin', 'admin', 'manager'] },
        { label: 'Attendance Logs', icon: ClipboardList, href: '/dashboard/attendance-logs', roles: ['super_admin', 'admin', 'manager'] },
        { label: 'Attendance History', icon: History, href: '/dashboard/attendance-history', roles: ['super_admin', 'admin', 'manager'] },
      ],
    },
    {
      label: 'People',
      items: [
        { label: getTerm('plural', true), icon: Users, href: '/dashboard/members', roles: ['super_admin', 'admin', 'manager'], isDynamic: true },
        { label: 'Temp Visitors', icon: UserPlus, href: '/dashboard/temp-members', roles: ['super_admin', 'admin'] },
        { label: 'Visitor Review', icon: SearchCheck, href: '/dashboard/visitor-review', roles: ['super_admin', 'admin'] },
        { label: 'Departments', icon: Building2, href: '/dashboard/departments', roles: ['super_admin', 'admin'] },
        { label: 'Face Gallery', icon: Image, href: '/dashboard/face-gallery', roles: ['super_admin', 'admin'] },
        { label: 'Admin Management', icon: Shield, href: '/dashboard/admin-management', roles: ['super_admin', 'admin'] },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { label: 'Reports', icon: FileText, href: '/dashboard/reports', roles: ['super_admin', 'admin', 'manager'] },
        { label: 'Activity Logs', icon: Activity, href: '/dashboard/activity-logs', roles: ['super_admin', 'admin'] },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { label: 'Schedules', icon: CalendarClock, href: '/dashboard/schedules', roles: ['super_admin', 'admin'] },
        { label: 'Site Management', icon: Globe, href: '/dashboard/site-management', roles: ['super_admin', 'admin'] },
        { label: 'Branding', icon: Palette, href: '/dashboard/branding', roles: ['super_admin', 'admin'] },
        { label: 'Subscription', icon: CreditCard, href: '/dashboard/subscription', roles: ['super_admin', 'admin'] },
        { label: 'Settings', icon: Settings, href: '/dashboard/settings', roles: ['super_admin', 'admin'] },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'My Profile', icon: UserCheck, href: '/dashboard/profile', roles: ['super_admin', 'admin', 'manager', 'member'] },
      ],
    },
  ];

  // Filter groups to only show items the user can access
  const filteredGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(userRole)),
    }))
    .filter(group => group.items.length > 0);

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  const renderNavItem = (item: NavItem, closeMobile?: () => void) => {
    const Icon = item.icon;
    const isActive = currentPath === item.href;
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={closeMobile}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          !isOpen && "justify-center px-2"
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
        )}
        <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-primary")} />
        {isOpen && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-border/50 flex-shrink-0">
        {(isOpen || isMobile) ? (
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <ScanFace className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <span className="text-sm font-bold text-foreground truncate">Mispar Technologies</span>
          </Link>
        ) : (
          <Link to="/dashboard" className="mx-auto">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ScanFace className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
        {filteredGroups.map((group) => {
          const groupHasActive = group.items.some(item => currentPath === item.href);

          if (!isOpen && !isMobile) {
            // Collapsed: just show icons, no group labels
            return (
              <div key={group.label} className="space-y-1">
                {group.items.map(item => renderNavItem(item))}
              </div>
            );
          }

          // Single-item groups don't need collapsible
          if (group.items.length === 1) {
            return (
              <div key={group.label}>
                {renderNavItem(group.items[0], isMobile ? onToggle : undefined)}
              </div>
            );
          }

          return (
            <Collapsible key={group.label} defaultOpen={groupHasActive || group.label === 'Overview'}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                <span>{group.label}</span>
                <ChevronDown className="w-3 h-3 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 mt-1">
                {group.items.map(item => renderNavItem(item, isMobile ? onToggle : undefined))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      {/* User card at bottom */}
      {(isOpen || isMobile) && (
        <div className="p-3 border-t border-border/50 flex-shrink-0">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarImage src={profile?.face_image_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 capitalize font-medium">
                {userRole.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onToggle} />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-card/95 backdrop-blur-md border-r border-border/50 transition-all duration-300 hidden lg:flex flex-col",
          isOpen ? "w-64" : "w-[68px]"
        )}
      >
        <SidebarContent />

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
        >
          {isOpen ? <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border transition-transform duration-300 lg:hidden flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={onToggle}
          className="absolute top-4 right-3 z-10 w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <SidebarContent isMobile />
      </aside>
    </>
  );
};

export default DashboardSidebar;
