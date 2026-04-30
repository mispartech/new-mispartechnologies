import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationBellProps { userId: string; }

/**
 * Notification bell — UI is fully wired (mark-all-read, relative timestamps,
 * unread badge). The /api/notifications/ endpoint is not yet implemented,
 * so the list starts empty. When the endpoint ships, replace the empty
 * initialiser with a fetch + realtime subscription.
 */
const NotificationBell = ({ userId: _userId }: NotificationBellProps) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);

  const unreadCount = useMemo(() => items.filter(i => !i.read).length, [items]);

  const markAllRead = () => {
    setItems(prev => prev.map(i => ({ ...i, read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {items.length > 0 && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={markAllRead}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ul className="max-h-80 overflow-y-auto divide-y">
            {items.map(item => (
              <li
                key={item.id}
                className={cn(
                  'p-3 text-sm hover:bg-muted/40 transition-colors cursor-pointer',
                  !item.read && 'bg-primary/5',
                )}
                onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, read: true } : i))}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('font-medium leading-tight', !item.read && 'text-foreground')}>
                    {item.title}
                  </p>
                  {!item.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                </div>
                {item.body && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.body}</p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">
                  {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
