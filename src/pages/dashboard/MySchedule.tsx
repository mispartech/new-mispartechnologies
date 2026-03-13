import { Card, CardContent } from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';

const MySchedule = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-primary" />
          My Schedule
        </h1>
        <p className="text-muted-foreground mt-1">View your upcoming schedules</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CalendarClock className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No schedules available yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Your organization's schedules will appear here once they are set up.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MySchedule;
