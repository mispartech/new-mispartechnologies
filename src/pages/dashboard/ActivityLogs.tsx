import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

const ActivityLogs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-muted-foreground">Track all user actions in your organization</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Activity className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Activity logging is not yet available. This feature will track all user actions across your organization once the backend is ready.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;
