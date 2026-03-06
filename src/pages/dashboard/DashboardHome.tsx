import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatsCard from '@/components/dashboard/StatsCard';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import AttendanceHeatmap from '@/components/dashboard/AttendanceHeatmap';
import { useTerminology } from '@/contexts/TerminologyContext';
import { 
  Users, UserCheck, Building2, Clock, TrendingUp, Calendar as CalendarIcon
} from 'lucide-react';
import { format, isToday, startOfWeek, isWithinInterval } from 'date-fns';

interface DashboardContext {
  user: any;
  profile: any;
  session: any;
}

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
    if (!profile?.organization_id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch attendance, members, and departments in parallel
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

  // Compute stats client-side from attendance data
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

    const totalMembers = members.length;
    const totalDepartments = departments.length;
    const totalAdmins = members.filter(m => 
      ['admin', 'super_admin'].includes(m.role?.toLowerCase?.())
    ).length;

    return { totalMembers, totalAdmins, totalDepartments, attendedToday, attendedThisWeek };
  }, [attendanceRecords, members, departments]);

  // Recent records for display
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message with organization context */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {profile?.first_name || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your attendance system today.
            </p>
          </div>
          {profile?.organization_name && (
            <div className="flex flex-col items-start md:items-end gap-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{profile.organization_name}</span>
              </div>
              <div className="flex gap-2">
                {profile.organization_type && (
                  <Badge variant="secondary" className="capitalize">{profile.organization_type.replace('_', ' ')}</Badge>
                )}
                {profile.organization_size_range && (
                  <Badge variant="outline">{profile.organization_size_range}</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title={`Total ${getTerm('plural', true)}`} value={stats.totalMembers} subtitle={`Registered ${personPlural}`} icon={Users} iconClassName="bg-blue-500" />
        <StatsCard title="Attended Today" value={stats.attendedToday} subtitle={format(new Date(), 'EEEE, MMM d')} icon={UserCheck} iconClassName="bg-green-500" />
        <StatsCard title="Departments" value={stats.totalDepartments} subtitle="Active departments" icon={Building2} iconClassName="bg-purple-500" />
        <StatsCard title="Admins" value={stats.totalAdmins} subtitle="System administrators" icon={TrendingUp} iconClassName="bg-orange-500" />
      </div>

      {/* Attendance Chart */}
      <AttendanceChart organizationId={profile?.organization_id} showVisitors={true} />

      {/* Attendance Heatmap */}
      <AttendanceHeatmap organizationId={profile?.organization_id} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Attendance</CardTitle>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium text-foreground mb-1">No attendance records yet</p>
                <p className="text-sm text-muted-foreground">Records will appear here once attendance is marked.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAttendance.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={record.profiles?.face_image_url || record.face_image_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
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
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(record.confidence_score * 100)}% match
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent {getTerm('plural', true)}</CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium text-foreground mb-1">No {personPlural} registered yet</p>
                <p className="text-sm text-muted-foreground">Add {personPlural} to start tracking attendance.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.face_image_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.first_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">{member.role?.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard icon={CalendarIcon} label="Mark Attendance" href="/dashboard/attendance" />
            <QuickActionCard icon={Users} label={`View ${getTerm('plural', true)}`} href="/dashboard/members" />
            <QuickActionCard icon={Building2} label="Departments" href="/dashboard/departments" />
            <QuickActionCard icon={TrendingUp} label="Reports" href="/dashboard/reports" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QuickActionCard = ({ icon: Icon, label, href }: { icon: any; label: string; href: string }) => (
  <a href={href} className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
    <Icon className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
    <span className="text-sm font-medium text-foreground">{label}</span>
  </a>
);

export default DashboardHome;
