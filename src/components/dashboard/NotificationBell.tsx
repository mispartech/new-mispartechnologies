import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell } from 'lucide-react';

interface NotificationBellProps { userId: string; }

/**
 * Notification bell — currently a static placeholder.
 * The /api/notifications/ endpoint is not yet implemented.
 * When available, re-enable fetching and realtime subscriptions.
 */
const NotificationBell = ({ userId: _userId }: NotificationBellProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No notifications yet</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
