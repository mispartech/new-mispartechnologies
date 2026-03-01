import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Star, Zap, Award, Target, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DashboardContext { user: any; profile: any; }

const ALL_BADGES = [
  { id: 'starter', label: 'Starter', days: 3, icon: <Star className="w-5 h-5" />, color: 'bg-blue-500', description: 'Attend 3 days in a row' },
  { id: 'week', label: 'Week Warrior', days: 7, icon: <Zap className="w-5 h-5" />, color: 'bg-green-500', description: 'Maintain a 7-day streak' },
  { id: 'fortnight', label: 'Consistent', days: 14, icon: <Flame className="w-5 h-5" />, color: 'bg-orange-500', description: 'Keep a 14-day streak going' },
  { id: 'month', label: 'Monthly Star', days: 30, icon: <Trophy className="w-5 h-5" />, color: 'bg-purple-500', description: 'Achieve a 30-day streak' },
  { id: 'champion', label: 'Champion', days: 60, icon: <Award className="w-5 h-5" />, color: 'bg-yellow-500', description: 'Reach a 60-day streak' },
  { id: 'legend', label: 'Legend', days: 90, icon: <Target className="w-5 h-5" />, color: 'bg-red-500', description: 'Maintain a 90-day streak' },
];

const StreaksAndBadges = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) calculateStreaks();
  }, [profile?.id]);

  const calculateStreaks = async () => {
    try {
      const { data, status } = await djangoApi.getAttendance({ user_id: profile.id }, { silent: true });
      if (status === 404 || !data || data.length === 0) { setLoading(false); return; }

      const uniqueDates = [...new Set(data.map((d: any) => d.date))].sort().reverse() as string[];
      setTotalDays(uniqueDates.length);

      let streak = 0;
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const diff = (new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000;
          if (diff === 1) streak++; else break;
        }
      }

      let maxStreak = 1, tempStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const diff = (new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000;
        if (diff === 1) { tempStreak++; maxStreak = Math.max(maxStreak, tempStreak); } else tempStreak = 1;
      }

      setCurrentStreak(streak);
      setLongestStreak(Math.max(maxStreak, streak));
    } catch (error) { console.error('Error calculating streaks:', error); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const nextBadge = ALL_BADGES.find(b => b.days > currentStreak);
  const daysToNext = nextBadge ? nextBadge.days - currentStreak : 0;
  const progressPercent = nextBadge ? Math.min((currentStreak / nextBadge.days) * 100, 100) : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          My Streaks & Badges
        </h1>
        <p className="text-muted-foreground mt-1">Track your consistency and unlock achievements</p>
      </div>

      {/* Streak Hero */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-6 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 rounded-2xl">
            <Flame className={cn("w-12 h-12 mx-auto mb-2", currentStreak > 0 ? "text-orange-500 animate-pulse" : "text-muted-foreground")} />
            <span className="text-5xl font-bold">{currentStreak}</span>
            <p className="text-muted-foreground mt-1">{currentStreak === 0 ? "Start your streak today!" : currentStreak === 1 ? "day streak" : "days streak"}</p>
            {nextBadge && currentStreak > 0 && (
              <div className="mt-4 max-w-xs mx-auto">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{currentStreak} days</span>
                  <span>{nextBadge.days} days — "{nextBadge.label}"</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{daysToNext} more day{daysToNext !== 1 ? 's' : ''} to go!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><Flame className="w-6 h-6 mx-auto mb-1 text-orange-500" /><p className="text-2xl font-bold">{currentStreak}</p><p className="text-xs text-muted-foreground">Current Streak</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="w-6 h-6 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{longestStreak}</p><p className="text-xs text-muted-foreground">Longest Streak</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Calendar className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="text-2xl font-bold">{totalDays}</p><p className="text-xs text-muted-foreground">Total Days</p></CardContent></Card>
      </div>

      {/* Badges Grid */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Achievement Badges</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_BADGES.map(badge => {
              const achieved = currentStreak >= badge.days;
              return (
                <div key={badge.id} className={cn("p-4 rounded-xl border-2 transition-all", achieved ? "border-primary/50 bg-primary/5" : "border-border opacity-60")}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", achieved ? badge.color : "bg-muted text-muted-foreground")}>
                      {badge.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{badge.label}</p>
                      <p className="text-xs text-muted-foreground">{badge.days}-day streak</p>
                    </div>
                    {achieved && <Badge className="ml-auto bg-green-500/10 text-green-600 text-xs">Unlocked</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreaksAndBadges;
