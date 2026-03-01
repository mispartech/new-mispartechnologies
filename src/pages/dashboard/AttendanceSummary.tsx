import { useOutletContext } from 'react-router-dom';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import AttendanceHeatmap from '@/components/dashboard/AttendanceHeatmap';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface DashboardContext { user: any; profile: any; }

const AttendanceSummary = () => {
  const { profile } = useOutletContext<DashboardContext>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Attendance Summary
        </h1>
        <p className="text-muted-foreground mt-1">
          Visual overview of your attendance trends and patterns
        </p>
      </div>

      <AttendanceChart userId={profile?.id} showVisitors={false} />
      <AttendanceHeatmap userId={profile?.id} />

      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p className="text-sm">More detailed analytics and insights will appear here as your attendance data grows.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSummary;
