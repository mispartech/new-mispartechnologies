import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import GlassStatCard from '@/components/dashboard/GlassStatCard';
import MemberSkeleton from '@/components/dashboard/MemberSkeleton';
import MotivationalEmptyState from '@/components/dashboard/MotivationalEmptyState';
import { 
  Calendar, Clock, CheckCircle2, XCircle, User, Building2, 
  CalendarDays, History, Flame, Trophy, CalendarClock, 
  ScanFace, ArrowRight, TrendingUp, Sparkles
} from 'lucide-react';
import { format, isToday, startOfMonth, startOfWeek, isWithinInterval, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTerminology } from '@/contexts/TerminologyContext';

interface DashboardContext { user: any; profile: any; session: any; }

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const MemberDashboard = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const { getTerm } = useTerminology();
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) fetchMemberData();
  }, [profile?.id]);

  const fetchMemberData = async () => {
    try {
      const { data } = await djangoApi.getAttendance(
        { user_id: profile.id },
        { silent: true }
      );
      if (data) setAttendanceRecords(data);
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);

    const attendedToday = attendanceRecords.some(r => {
      try { return isToday(new Date(r.date || r.created_at)); } catch { return false; }
    });

    const thisWeek = attendanceRecords.filter(r => {
      try {
        const d = new Date(r.date || r.created_at);
        return isWithinInterval(d, { start: weekStart, end: today });
      } catch { return false; }
    }).length;

    const thisMonth = attendanceRecords.filter(r => {
      try {
        const d = new Date(r.date || r.created_at);
        return isWithinInterval(d, { start: monthStart, end: today });
      } catch { return false; }
    }).length;

    return { totalAttendance: attendanceRecords.length, thisMonth, thisWeek, attendedToday };
  }, [attendanceRecords]);

  // Streak calculation
  const currentStreak = useMemo(() => {
    if (attendanceRecords.length === 0) return 0;
    const uniqueDates = [...new Set(attendanceRecords.map((d: any) => (d.date || d.created_at || '').slice(0, 10)))].sort().reverse();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = (new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000;
      if (diff === 1) streak++; else break;
    }
    return streak;
  }, [attendanceRecords]);

  const recentAttendance = useMemo(() =>
    [...attendanceRecords]
      .sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())
      .slice(0, 5),
    [attendanceRecords]
  );

  if (loading) return <MemberSkeleton variant="dashboard" />;

  const initials = `${profile?.first_name?.[0] || 'U'}${profile?.last_name?.[0] || ''}`;
  const hasEnrolledFace = !!profile?.face_image_url;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.08] via-accent/[0.04] to-transparent p-5 sm:p-7">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/[0.06] blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent/[0.06] blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar with enrollment ring */}
          <div className="relative">
            <div className={cn(
              "absolute -inset-1 rounded-full",
              hasEnrolledFace
                ? "bg-gradient-to-br from-green-400 to-green-600 opacity-70"
                : "bg-gradient-to-br from-amber-400 to-amber-600 opacity-50"
            )} />
            <Avatar className="relative w-16 h-16 sm:w-20 sm:h-20 border-[3px] border-background shadow-lg">
              <AvatarImage src={profile?.face_image_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Status dot */}
            <div className={cn(
              "absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center",
              stats.attendedToday ? "bg-green-500" : "bg-muted"
            )}>
              {stats.attendedToday && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{getGreeting()},</p>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
              {profile?.first_name || getTerm('title')} {profile?.last_name || ''} 👋
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile?.organization_name && (
                <Badge variant="secondary" className="text-xs font-medium gap-1">
                  <Building2 className="w-3 h-3" />{profile.organization_name}
                </Badge>
              )}
              {profile?.department && (
                <Badge variant="outline" className="text-xs">{profile.department}</Badge>
              )}
            </div>
          </div>

          {/* Today status pill */}
          <div className="flex-shrink-0">
            {stats.attendedToday ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-green-600">Marked Today</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 border border-border">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span className="text-sm font-medium text-muted-foreground">Not Marked</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Glass Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlassStatCard
          title="Total"
          value={stats.totalAttendance}
          subtitle="All time records"
          icon={Calendar}
          gradient="from-blue-500/10 via-blue-400/5 to-transparent"
          iconGradient="from-blue-500 to-blue-600"
        />
        <GlassStatCard
          title="This Month"
          value={stats.thisMonth}
          subtitle={format(new Date(), 'MMMM yyyy')}
          icon={CalendarDays}
          gradient="from-purple-500/10 via-purple-400/5 to-transparent"
          iconGradient="from-purple-500 to-purple-600"
        />
        <GlassStatCard
          title="This Week"
          value={stats.thisWeek}
          subtitle="Current week"
          icon={TrendingUp}
          gradient="from-green-500/10 via-green-400/5 to-transparent"
          iconGradient="from-green-500 to-green-600"
        />
        <GlassStatCard
          title="Today"
          value={stats.attendedToday ? '✓' : '—'}
          subtitle={format(new Date(), 'EEEE, MMM d')}
          icon={Clock}
          gradient={stats.attendedToday ? "from-green-500/10 via-green-400/5 to-transparent" : "from-muted/30 to-transparent"}
          iconGradient={stats.attendedToday ? "from-green-500 to-emerald-600" : "from-muted-foreground/60 to-muted-foreground/40"}
          animateValue={false}
        />
      </div>

      {/* ── Today's Focus Strip ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm">
        {/* Streak */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-500/5 border border-orange-500/10 flex-1 min-w-0">
          <Flame className={cn("w-6 h-6", currentStreak > 0 ? "text-orange-500 animate-pulse" : "text-muted-foreground")} />
          <div>
            <p className="text-lg font-bold leading-tight">{currentStreak}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Day Streak</p>
          </div>
        </div>

        {/* Next badge progress */}
        <Link to="/dashboard/streaks" className="flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10 flex-1 min-w-0 group hover:border-purple-500/20 transition-colors">
          <Trophy className="w-6 h-6 text-purple-500" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Badges</p>
            <div className="w-full bg-muted/60 rounded-full h-1.5 mt-1">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-400 rounded-full h-1.5 transition-all duration-700"
                style={{ width: `${Math.min((currentStreak / 7) * 100, 100)}%` }}
              />
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
        </Link>

        {/* Quick schedule */}
        <Link to="/dashboard/my-schedule" className="flex items-center gap-3 px-4 py-2 rounded-xl bg-accent/5 border border-accent/10 flex-1 group hover:border-accent/20 transition-colors">
          <CalendarClock className="w-6 h-6 text-accent" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Schedule</p>
            <p className="text-sm font-medium text-foreground">View Today</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors ml-auto" />
        </Link>
      </div>

      {/* ── Quick Actions Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Attendance History', icon: History, href: '/dashboard/my-attendance', color: 'from-blue-500/10 to-blue-600/5' },
          { label: 'My Schedule', icon: CalendarClock, href: '/dashboard/my-schedule', color: 'from-emerald-500/10 to-emerald-600/5' },
          { label: 'Streaks & Badges', icon: Trophy, href: '/dashboard/streaks', color: 'from-purple-500/10 to-purple-600/5' },
          ...(!hasEnrolledFace ? [{ label: 'Enroll Face', icon: ScanFace, href: '/dashboard/face-enrollment', color: 'from-amber-500/10 to-amber-600/5' }] : [{ label: 'My Profile', icon: User, href: '/dashboard/profile', color: 'from-cyan-500/10 to-cyan-600/5' }]),
        ].map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={cn(
              "group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/50",
              "bg-gradient-to-br transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20",
              action.color
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-card/80 border border-border/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <action.icon className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-semibold text-center text-foreground/80">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Recent Attendance + Profile ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent attendance */}
        <Card className="lg:col-span-2 border-border/50 bg-card/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
            <Link to="/dashboard/my-attendance" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <MotivationalEmptyState
                icon={Calendar}
                title="No attendance yet"
                description="Your attendance records will show up here once you're marked."
                encouragement="Your journey starts with day one!"
              />
            ) : (
              <div className="space-y-2">
                {recentAttendance.map((record: any, index: number) => {
                  const recordDate = new Date(record.date || record.created_at);
                  const isRecordToday = isToday(recordDate);
                  const relativeTime = formatDistanceToNow(recordDate, { addSuffix: true });
                  return (
                    <div
                      key={record.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                        "hover:shadow-sm",
                        isRecordToday
                          ? 'bg-primary/[0.04] border-primary/15'
                          : 'bg-card border-border/40 hover:bg-muted/30'
                      )}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                          isRecordToday
                            ? 'bg-gradient-to-br from-primary to-accent text-white'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{format(recordDate, 'EEEE, MMM d')}</p>
                          <p className="text-[11px] text-muted-foreground">{relativeTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.confidence_score && (
                          <div className="hidden sm:flex items-center gap-1.5">
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                style={{ width: `${Math.round(record.confidence_score * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {Math.round(record.confidence_score * 100)}%
                            </span>
                          </div>
                        )}
                        {isRecordToday && (
                          <Badge className="bg-primary/10 text-primary text-[10px] font-semibold border-0">Today</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile card */}
        <Card className="border-border/50 bg-card/90 backdrop-blur-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent" />
          <CardContent className="space-y-4 -mt-10 pb-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className={cn(
                  "absolute -inset-1 rounded-full",
                  hasEnrolledFace ? "bg-gradient-to-br from-green-400/60 to-green-600/60" : "bg-gradient-to-br from-amber-400/50 to-amber-600/50"
                )} />
                <Avatar className="relative w-20 h-20 border-[3px] border-background shadow-md">
                  <AvatarImage src={profile?.face_image_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials}</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="font-bold mt-3 text-foreground">{profile?.first_name} {profile?.last_name}</h3>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
              {hasEnrolledFace ? (
                <Badge className="mt-2 bg-green-500/10 text-green-600 border-0 text-[10px]">
                  <ScanFace className="w-3 h-3 mr-1" /> Face Enrolled
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-2 text-amber-600 border-amber-300/30 text-[10px]">
                  <ScanFace className="w-3 h-3 mr-1" /> Not Enrolled
                </Badge>
              )}
            </div>

            <div className="space-y-2.5 pt-3 border-t border-border/50">
              {[
                { label: 'Phone', value: profile?.phone_number || 'Not set' },
                { label: 'Gender', value: profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not set' },
                { label: 'Department', value: profile?.department || 'Not assigned' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <span className="font-medium text-xs text-foreground">{value}</span>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="w-full border-primary/20 hover:bg-primary/5 text-xs" asChild>
              <Link to="/dashboard/profile"><User className="w-3.5 h-3.5 mr-1.5" />Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;
