import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatsCard from '@/components/dashboard/StatsCard';
import { DashboardHomeSkeleton } from '@/components/dashboard/DashboardSkeleton';
import EmptyState from '@/components/dashboard/EmptyState';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import AttendanceHeatmap from '@/components/dashboard/AttendanceHeatmap';
import { useTerminology } from '@/contexts/TerminologyContext';
import {
  Users, UserCheck, Building2, Clock, TrendingUp, Calendar as CalendarIcon,
  ScanFace, FileText, ArrowRight,
} from 'lucide-react';
import { format, isToday, startOfWeek, isWithinInterval } from 'date-fns';

interface DashboardContext { user: any; profile: any; session: any; }

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const DashboardHome = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { personPlural, getTerm } = useTerminology();

  useEffect(() => {
    fetchDashboardData();
  }, [profile?.organization_id]);

  const fetchDashboardData = async () => {
    if (!profile?.organization_id) { setLoading(false); return; }
    try {
      const [attendanceRes, membersRes, departmentsRes] = await Promise.all([
        djangoApi.getAttendance({ limit: 100 }, { silent: true }),
        djangoApi.getMembers({ limit: 50 }),
        djangoApi.getDepartments(),
      ]);
      if (attendanceRes.data) setAttendanceRecords(attendanceRes.data);
      if (membersRes.data) setMembers(membersRes.data);
      if (departmentsRes.data) setDepartments(departmentsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const attendedToday = attendanceRecords.filter(r => {
      try { return isToday(new Date(r.date || r.created_at)); } catch { return false; }
    }).length;
    const attendedThisWeek = attendanceRecords.filter(r => {
      try {
        const d = new Date(r.date || r.created_at);
        return isWithinInterval(d, { start: weekStart, end: today });
      } catch { return false; }
    }).length;
    return {
      totalMembers: members.length,
      totalAdmins: members.filter(m => ['admin', 'super_admin'].includes(m.role?.toLowerCase?.())).length,
      totalDepartments: departments.length,
      attendedToday,
      attendedThisWeek,
    };
  }, [attendanceRecords, members, departments]);

  const recentAttendance = useMemo(() =>
    [...attendanceRecords]
      .sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())
      .slice(0, 5),
    [attendanceRecords]
  );

  const recentMembers = useMemo(() =>
    [...members]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5),
    [members]
  );

  if (loading) return <DashboardHomeSkeleton />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent/80 p-6 sm:p-8 text-primary-foreground">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium mb-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {getGreeting()}, {profile?.first_name || 'Admin'} 👋
            </h1>
            <p className="text-primary-foreground/70 mt-1 text-sm sm:text-base">
              Here's what's happening with your attendance system today.
            </p>
          </div>
          {profile?.organization_name && (
            <div className="flex flex-col items-start md:items-end gap-1.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-foreground/60" />
                <span className="font-semibold">{profile.organization_name}</span>
              </div>
              <div className="flex gap-2">
                {profile.organization_type && (
                  <Badge className="bg-white/15 text-primary-foreground border-0 capitalize text-xs backdrop-blur-sm">
                    {profile.organization_type.replace('_', ' ')}
                  </Badge>
                )}
                {profile.organization_size_range && (
                  <Badge className="bg-white/10 text-primary-foreground border-0 text-xs backdrop-blur-sm">
                    {profile.organization_size_range}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={`Total ${getTerm('plural', true)}`}
          value={stats.totalMembers}
          subtitle={`Registered ${personPlural}`}
          icon={Users}
          iconClassName="bg-blue-500"
        />
        <StatsCard
          title="Attended Today"
          value={stats.attendedToday}
          subtitle={format(new Date(), 'EEEE, MMM d')}
          icon={UserCheck}
          iconClassName="bg-green-500"
        />
        <StatsCard
          title="Departments"
          value={stats.totalDepartments}
          subtitle="Active departments"
          icon={Building2}
          iconClassName="bg-purple-500"
        />
        <StatsCard
          title="Admins"
          value={stats.totalAdmins}
          subtitle="System administrators"
          icon={TrendingUp}
          iconClassName="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: ScanFace, label: 'Mark Attendance', href: '/dashboard/attendance', color: 'bg-blue-500/10 text-blue-600' },
          { icon: Users, label: `View ${getTerm('plural', true)}`, href: '/dashboard/members', color: 'bg-purple-500/10 text-purple-600' },
          { icon: Building2, label: 'Departments', href: '/dashboard/departments', color: 'bg-green-500/10 text-green-600' },
          { icon: FileText, label: 'Reports', href: '/dashboard/reports', color: 'bg-orange-500/10 text-orange-600' },
        ].map(action => (
          <Link
            key={action.href}
            to={action.href}
            className="group flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color} transition-transform group-hover:scale-110`}>
              <action.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Attendance Chart */}
      <AttendanceChart organizationId={profile?.organization_id} showVisitors={true} />

      {/* Attendance Heatmap */}
      <AttendanceHeatmap organizationId={profile?.organization_id} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Attendance</CardTitle>
            <Link to="/dashboard/attendance-logs" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No attendance records yet"
                description="Records will appear here once attendance is marked."
                actionLabel="Mark Attendance"
                actionHref="/dashboard/attendance"
              />
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between group hover:bg-muted/30 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={record.profiles?.face_image_url || record.face_image_url} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {record.profiles?.first_name?.[0] || record.first_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {record.profiles?.first_name || record.first_name} {record.profiles?.last_name || record.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{record.date} at {record.time}</p>
                      </div>
                    </div>
                    {record.confidence_score && (
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {Math.round(record.confidence_score * 100)}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent {getTerm('plural', true)}</CardTitle>
            <Link to="/dashboard/members" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {recentMembers.length === 0 ? (
              <EmptyState
                icon={Users}
                title={`No ${personPlural} registered yet`}
                description={`Add ${personPlural} to start tracking attendance.`}
                actionLabel={`Add ${getTerm('singular', true)}`}
                actionHref="/dashboard/members"
              />
            ) : (
              <div className="space-y-3">
                {recentMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between group hover:bg-muted/30 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={member.face_image_url} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {member.first_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize text-[10px]">{member.role?.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
