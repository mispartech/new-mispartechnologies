import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const ScheduleManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Schedule Management</h1>
        <p className="text-muted-foreground">Configure attendance tracking schedules</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Schedule management is not yet available. Once the backend supports schedules, you'll be able to configure attendance tracking times here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleManagement;
