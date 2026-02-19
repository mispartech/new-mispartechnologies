import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Camera, Shield, Bell, Lock, Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NotificationSettings from '@/components/dashboard/NotificationSettings';

const ProfileSettings = () => {
  const { user, profile } = useOutletContext<{ user: any; profile: any }>();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({ first_name: '', last_name: '', email: '', phone_number: '', gender: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [faceImageUrl, setFaceImageUrl] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setProfileData({ first_name: profile.first_name || '', last_name: profile.last_name || '', email: profile.email || '', phone_number: profile.phone_number || '', gender: profile.gender || '' });
      setFaceImageUrl(profile.face_image_url);
    }
    fetchUserRole();
  }, [profile]);

  const fetchUserRole = async () => {
    if (!user) return;
    const result = await djangoApi.getUserRole(user.id);
    if (!result.error && result.data) setUserRole(result.data.role);
    else if (profile?.role) setUserRole(profile.role);
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      const result = await djangoApi.updateProfile(user.id, {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number: profileData.phone_number,
        gender: profileData.gender,
      });
      if (result.error) throw new Error(result.error);
      toast({ title: 'Profile Updated', description: 'Your profile has been updated successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update profile.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) { toast({ title: 'Password Mismatch', description: 'New passwords do not match.', variant: 'destructive' }); return; }
    if (passwords.new.length < 6) { toast({ title: 'Weak Password', description: 'Password must be at least 6 characters.', variant: 'destructive' }); return; }
    setIsLoading(true);
    try {
      // Use Supabase auth for password change (auth operation, not business data)
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      setPasswords({ current: '', new: '', confirm: '' });
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to change password.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setUploadProgress('Preparing upload...');
    try {
      toast({ title: 'Uploading Image', description: 'Please wait while your photo is being uploaded...' });
      setUploadProgress('Uploading to storage...');
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/face.${fileExt}`;
      // Storage upload stays with Supabase (Auth + Storage)
      const { error: uploadError } = await supabase.storage.from('face-images').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      setUploadProgress('Processing image...');
      const { data: { publicUrl } } = supabase.storage.from('face-images').getPublicUrl(fileName);
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      setUploadProgress('Updating profile...');
      // Update profile via Django
      const result = await djangoApi.updateProfile(user.id, { face_image_url: publicUrl });
      if (result.error) throw new Error(result.error);
      setFaceImageUrl(urlWithTimestamp);
      setUploadProgress(null);
      toast({ title: 'Face Image Updated', description: 'Your face image has been uploaded successfully.' });
    } catch (error: any) {
      setUploadProgress(null);
      toast({ title: 'Upload Failed', description: error.message || 'Failed to upload face image.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => `${profileData.first_name?.[0] || ''}${profileData.last_name?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Profile Settings</h1><p className="text-muted-foreground">Manage your account settings and preferences</p></div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" />Profile</TabsTrigger>
          <TabsTrigger value="face" className="gap-2"><Camera className="w-4 h-4" />Face ID</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4" />Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" />Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle><CardDescription>Update your personal details</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20"><AvatarImage src={faceImageUrl || undefined} /><AvatarFallback className="text-xl">{getInitials()}</AvatarFallback></Avatar>
                <div><h3 className="font-semibold">{profileData.first_name} {profileData.last_name}</h3><p className="text-sm text-muted-foreground">{profileData.email}</p>{userRole && <Badge variant="secondary" className="mt-1 capitalize">{userRole.replace('_', ' ')}</Badge>}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={profileData.first_name} onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))} className="mt-1" /></div>
                <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={profileData.last_name} onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))} className="mt-1" /></div>
                <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={profileData.phone_number} onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))} className="mt-1" /></div>
                <div><Label htmlFor="gender">Gender</Label><Input id="gender" value={profileData.gender} onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))} placeholder="Male / Female" className="mt-1" /></div>
              </div>
              <Button onClick={handleProfileUpdate} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="face">
          <Card>
            <CardHeader><CardTitle>Face Recognition Setup</CardTitle><CardDescription>Upload a clear photo of your face for attendance recognition</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-lg">
                {faceImageUrl ? (<div className="relative"><img src={faceImageUrl} alt="Face" className="w-48 h-48 rounded-lg object-cover" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2" onClick={() => setFaceImageUrl(null)}><Trash2 className="w-4 h-4" /></Button></div>) : (<div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center"><Camera className="w-16 h-16 text-muted-foreground" /></div>)}
                <input type="file" ref={fileInputRef} onChange={handleFaceImageUpload} accept="image/*" className="hidden" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="gap-2"><Upload className="w-4 h-4" />{isLoading ? (uploadProgress || 'Uploading...') : (faceImageUrl ? 'Change Photo' : 'Upload Photo')}</Button>
                {uploadProgress && <div className="flex items-center gap-2 text-sm text-primary"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div><span>{uploadProgress}</span></div>}
                <p className="text-sm text-muted-foreground text-center max-w-md">For best results, use a clear, front-facing photo with good lighting.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />Change Password</CardTitle><CardDescription>Update your password to keep your account secure</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {(['current', 'new', 'confirm'] as const).map((field) => (
                <div key={field}>
                  <Label htmlFor={`${field}Password`}>{field === 'current' ? 'Current' : field === 'new' ? 'New' : 'Confirm New'} Password</Label>
                  <div className="relative mt-1">
                    <Input id={`${field}Password`} type={showPasswords[field] ? 'text' : 'password'} value={passwords[field]} onChange={(e) => setPasswords(prev => ({ ...prev, [field]: e.target.value }))} />
                    <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
              ))}
              <Button onClick={handlePasswordChange} disabled={isLoading}>{isLoading ? 'Updating...' : 'Update Password'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications"><NotificationSettings userId={user.id} /></TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;
