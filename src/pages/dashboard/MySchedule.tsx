import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Clock, MapPin } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { useTerminology } from '@/contexts/TerminologyContext';

interface DashboardContext { user: any; profile: any; }

const MySchedule = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { organizationType } = useTerminology();

  const getScheduleLabel = () => {
    switch (organizationType) {
      case 'church': case 'religious': return 'Services & Events';
      case 'school': case 'university': case 'education': return 'Classes & Sessions';
      default: return 'Shifts & Schedules';
    }
  };

  useEffect(() => {
    if (profile?.organization_id) fetchSchedules();
    else setLoading(false);
  }, [profile?.organization_id]);

  const fetchSchedules = async () => {
    try {
      const { data, status } = await djangoApi.getSchedules(profile.organization_id);
      if (status === 404) { setLoading(false); return; }
      setSchedules(data || []);
    } catch (error) { console.error('Error fetching schedules:', error); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const now = new Date();
  const upcoming = schedules.filter(s => {
    try { return isAfter(parseISO(s.date || s.start_date), now); } catch { return false; }
  }).sort((a, b) => new Date(a.date || a.start_date).getTime() - new Date(b.date || b.start_date).getTime());
  const past = schedules.filter(s => !upcoming.includes(s));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-primary" />
          My Schedule
        </h1>
        <p className="text-muted-foreground mt-1">View your upcoming {getScheduleLabel().toLowerCase()}</p>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarClock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No schedules available yet</p>
            <p className="text-sm text-muted-foreground mt-1">Your organization's schedules will appear here once they are set up.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Upcoming</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {upcoming.map((schedule) => (
                  <ScheduleItem key={schedule.id} schedule={schedule} isUpcoming />
                ))}
              </CardContent>
            </Card>
          )}

          {past.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg text-muted-foreground">Past</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {past.slice(0, 10).map((schedule) => (
                  <ScheduleItem key={schedule.id} schedule={schedule} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

const ScheduleItem = ({ schedule, isUpcoming }: { schedule: any; isUpcoming?: boolean }) => {
  const dateStr = schedule.date || schedule.start_date;
  let formattedDate = dateStr;
  try { formattedDate = format(parseISO(dateStr), 'EEEE, MMMM d, yyyy'); } catch {}

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${isUpcoming ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUpcoming ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <CalendarClock className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-sm">{schedule.name || schedule.title || 'Schedule'}</p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
          <div className="flex items-center gap-3 mt-1">
            {(schedule.start_time || schedule.time) && (
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{schedule.start_time || schedule.time}</span>
            )}
            {schedule.location && (
              <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{schedule.location}</span>
            )}
          </div>
        </div>
      </div>
      {isUpcoming && <Badge variant="secondary" className="text-xs">Upcoming</Badge>}
    </div>
  );
};

export default MySchedule;
