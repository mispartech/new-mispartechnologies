import { useState, useEffect } from 'react';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, BellRing, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences { push_enabled: boolean; attendance_alerts: boolean; email_notifications: boolean; }
interface NotificationSettingsProps { userId: string; }

const NotificationSettings = ({ userId }: NotificationSettingsProps) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({ push_enabled: false, attendance_alerts: true, email_notifications: false });
  const [isLoading, setIsLoading] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) { setPushSupported(true); setPushPermission(Notification.permission); }
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    const { data } = await djangoApi.getProfile();
    if (data?.notification_preferences) {
      setPreferences(data.notification_preferences as NotificationPreferences);
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    setIsLoading(true);
    try {
      const { error } = await djangoApi.updateProfile(userId, { notification_preferences: newPreferences });
      if (error) throw new Error(error);
      setPreferences(newPreferences);
      toast({ title: 'Settings Updated', description: 'Your notification preferences have been saved.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update preferences.', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const requestPushPermission = async () => {
    if (!pushSupported) { toast({ title: 'Not Supported', description: 'Push notifications are not supported in this browser.', variant: 'destructive' }); return; }
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      if (permission === 'granted') {
        await updatePreferences({ ...preferences, push_enabled: true });
        new Notification('Notifications Enabled! 🎉', { body: 'You will now receive attendance alerts.', icon: '/favicon.svg' });
      } else if (permission === 'denied') {
        toast({ title: 'Permission Denied', description: 'Please enable notifications in your browser settings.', variant: 'destructive' });
      }
    } catch (error) { console.error('Push permission error:', error); }
  };

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (key === 'push_enabled' && value && pushPermission !== 'granted') { await requestPushPermission(); return; }
    await updatePreferences({ ...preferences, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Notification Settings</CardTitle>
        <CardDescription>Manage how you receive notifications about your attendance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-muted-foreground" /><Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label></div>
            <p className="text-sm text-muted-foreground">Receive browser notifications for important updates</p>
            {!pushSupported && <p className="text-xs text-destructive">Not supported in this browser</p>}
            {pushPermission === 'denied' && <p className="text-xs text-destructive">Blocked by browser. Check your browser settings.</p>}
          </div>
          <Switch id="push-notifications" checked={preferences.push_enabled && pushPermission === 'granted'} onCheckedChange={(checked) => handleToggle('push_enabled', checked)} disabled={isLoading || !pushSupported || pushPermission === 'denied'} />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2"><BellRing className="w-4 h-4 text-muted-foreground" /><Label htmlFor="attendance-alerts" className="font-medium">Attendance Alerts</Label></div>
            <p className="text-sm text-muted-foreground">Get notified when your attendance is marked</p>
          </div>
          <Switch id="attendance-alerts" checked={preferences.attendance_alerts} onCheckedChange={(checked) => handleToggle('attendance_alerts', checked)} disabled={isLoading} />
        </div>
        {preferences.push_enabled && pushPermission === 'granted' && (
          <Button variant="outline" size="sm" className="w-full" onClick={() => { new Notification('Test Notification', { body: 'Your notifications are working correctly!', icon: '/favicon.svg' }); }}>Send Test Notification</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
