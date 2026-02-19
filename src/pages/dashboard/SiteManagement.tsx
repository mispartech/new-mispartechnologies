import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Palette, Save, Upload, Eye, Loader2, Monitor, Smartphone, Tablet, RefreshCw, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useDocumentTitle from '@/hooks/useDocumentTitle';

interface SiteSettings {
  favicon_url: string; logo_url: string; logo_dark_url: string; site_name: string;
  preloader_enabled: boolean; preloader_color: string; preloader_type: 'spinner' | 'pulse' | 'dots';
}

const defaultSettings: SiteSettings = { favicon_url: '/favicon.ico', logo_url: '', logo_dark_url: '', site_name: 'Mispar Technologies', preloader_enabled: true, preloader_color: '#8B5CF6', preloader_type: 'spinner' };

const SiteManagement = () => {
  useDocumentTitle('Site Management | Mispar Technologies');
  const { profile } = useOutletContext<{ profile: any }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDarkFile, setLogoDarkFile] = useState<File | null>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoDarkInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { fetchSettings(); }, [profile]);

  const fetchSettings = async () => {
    if (!profile?.organization_id) { setIsLoading(false); return; }
    try {
      const result = await djangoApi.getOrganization(profile.organization_id);
      if (result.error) throw new Error(result.error);
      if (result.data?.settings && typeof result.data.settings === 'object') {
        const orgSettings = result.data.settings as Record<string, any>;
        setSettings({ ...defaultSettings, ...orgSettings.site_settings });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Storage uploads stay with Supabase
  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!profile?.organization_id) return;
    setIsSaving(true);
    try {
      let updatedSettings = { ...settings };
      if (faviconFile) updatedSettings.favicon_url = await uploadFile(faviconFile, `${profile.organization_id}/favicon.${faviconFile.name.split('.').pop()}`);
      if (logoFile) updatedSettings.logo_url = await uploadFile(logoFile, `${profile.organization_id}/logo.${logoFile.name.split('.').pop()}`);
      if (logoDarkFile) updatedSettings.logo_dark_url = await uploadFile(logoDarkFile, `${profile.organization_id}/logo-dark.${logoDarkFile.name.split('.').pop()}`);

      // Get existing settings from Django
      const existingResult = await djangoApi.getOrganization(profile.organization_id);
      const existingSettings = existingResult.data?.settings && typeof existingResult.data.settings === 'object' ? existingResult.data.settings as Record<string, any> : {};

      // Update via Django
      const result = await djangoApi.updateOrganization(profile.organization_id, { settings: { ...existingSettings, site_settings: updatedSettings } });
      if (result.error) throw new Error(result.error);

      setSettings(updatedSettings);
      setFaviconFile(null); setLogoFile(null); setLogoDarkFile(null);
      toast({ title: 'Settings Saved', description: 'Site management settings have been updated.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save settings.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (type: 'favicon' | 'logo' | 'logo_dark', file: File | null) => {
    if (!file) return;
    if (type === 'favicon') setFaviconFile(file);
    else if (type === 'logo') setLogoFile(file);
    else setLogoDarkFile(file);
  };

  const getPreviewWidth = () => previewDevice === 'mobile' ? 'max-w-[375px]' : previewDevice === 'tablet' ? 'max-w-[768px]' : 'max-w-full';

  if (isLoading) return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-xl sm:text-2xl font-bold text-foreground">Site Management</h1><p className="text-sm sm:text-base text-muted-foreground">Manage your site's branding and appearance</p></div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 w-full sm:w-auto">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isSaving ? 'Saving...' : 'Save Changes'}</Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Tabs defaultValue="branding" className="space-y-6">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="branding" className="gap-2 flex-1 min-w-[120px]"><Image className="w-4 h-4" /><span className="hidden sm:inline">Branding</span></TabsTrigger>
              <TabsTrigger value="preloader" className="gap-2 flex-1 min-w-[120px]"><Palette className="w-4 h-4" /><span className="hidden sm:inline">Preloader</span></TabsTrigger>
              <TabsTrigger value="seo" className="gap-2 flex-1 min-w-[120px]"><Globe className="w-4 h-4" /><span className="hidden sm:inline">SEO</span></TabsTrigger>
            </TabsList>

            <TabsContent value="branding">
              <Card>
                <CardHeader><CardTitle className="text-lg">Branding Assets</CardTitle><CardDescription>Upload your logo and favicon</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2"><Label htmlFor="siteName">Site Name</Label><Input id="siteName" value={settings.site_name} onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))} placeholder="Your Organization Name" /></div>
                  {[
                    { type: 'favicon' as const, label: 'Favicon', desc: 'The small icon shown in browser tabs. Recommended: 32x32 or 64x64px.', file: faviconFile, url: settings.favicon_url, ref: faviconInputRef, accept: '.ico,.png,.svg', size: 'w-16 h-16', imgSize: 'w-8 h-8' },
                    { type: 'logo' as const, label: 'Logo (Light Mode)', desc: 'Your organization logo for light backgrounds. Recommended width: 200-400px.', file: logoFile, url: settings.logo_url, ref: logoInputRef, accept: '.png,.svg,.jpg,.jpeg,.webp', size: 'w-32 h-16', imgSize: 'max-w-full max-h-full', bg: 'bg-white' },
                    { type: 'logo_dark' as const, label: 'Logo (Dark Mode)', desc: 'Your organization logo for dark backgrounds.', file: logoDarkFile, url: settings.logo_dark_url, ref: logoDarkInputRef, accept: '.png,.svg,.jpg,.jpeg,.webp', size: 'w-32 h-16', imgSize: 'max-w-full max-h-full', bg: 'bg-gray-900' },
                  ].map(({ type, label, desc, file, url, ref, accept, size, imgSize, bg }) => (
                    <div key={type} className="space-y-2">
                      <Label>{label}</Label><p className="text-sm text-muted-foreground">{desc}</p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className={`${size} rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center ${bg || 'bg-muted/50'}`}>
                          {file ? <img src={URL.createObjectURL(file)} alt={`${label} preview`} className={`${imgSize} object-contain`} /> : url ? <img src={url} alt={`Current ${label}`} className={`${imgSize} object-contain`} /> : <Image className="w-6 h-6 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                          <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => handleFileSelect(type, e.target.files?.[0] || null)} />
                          <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => ref.current?.click()}><Upload className="w-4 h-4" />Upload {label.split(' ')[0]}</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preloader">
              <Card>
                <CardHeader><CardTitle className="text-lg">Preloader Settings</CardTitle><CardDescription>Configure the loading animation</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between"><div><p className="font-medium">Enable Preloader</p><p className="text-sm text-muted-foreground">Show a loading animation when the page loads</p></div><Switch checked={settings.preloader_enabled} onCheckedChange={(checked) => setSettings(prev => ({ ...prev, preloader_enabled: checked }))} /></div>
                  {settings.preloader_enabled && (
                    <>
                      <div className="space-y-2"><Label>Preloader Color</Label><div className="flex items-center gap-3"><input type="color" value={settings.preloader_color} onChange={(e) => setSettings(prev => ({ ...prev, preloader_color: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border-0" /><Input value={settings.preloader_color} onChange={(e) => setSettings(prev => ({ ...prev, preloader_color: e.target.value }))} className="w-32" /></div></div>
                      <div className="space-y-2"><Label>Preloader Style</Label><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{(['spinner', 'pulse', 'dots'] as const).map((type) => (<button key={type} onClick={() => setSettings(prev => ({ ...prev, preloader_type: type }))} className={`p-4 rounded-lg border-2 transition-colors ${settings.preloader_type === type ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/50'}`}><p className="font-medium capitalize">{type}</p></button>))}</div></div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card><CardHeader><CardTitle className="text-lg">SEO Settings</CardTitle><CardDescription>Search engine optimization settings</CardDescription></CardHeader><CardContent><p className="text-muted-foreground">SEO settings coming soon.</p></CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Eye className="w-5 h-5" />Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                {[{ icon: Monitor, device: 'desktop' as const }, { icon: Tablet, device: 'tablet' as const }, { icon: Smartphone, device: 'mobile' as const }].map(({ icon: Icon, device }) => (
                  <Button key={device} variant={previewDevice === device ? 'default' : 'outline'} size="icon" onClick={() => setPreviewDevice(device)}><Icon className="w-4 h-4" /></Button>
                ))}
              </div>
              <div className={`mx-auto border rounded-lg overflow-hidden ${getPreviewWidth()}`}>
                <div className="bg-muted/50 p-3 flex items-center gap-2 border-b">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
                  <div className="flex-1 bg-background rounded px-3 py-1 text-xs text-muted-foreground truncate">{settings.site_name}</div>
                </div>
                <div className="p-4 bg-background min-h-[200px]">
                  <div className="flex items-center gap-3 mb-4 p-3 border-b">
                    {(logoFile || settings.logo_url) ? <img src={logoFile ? URL.createObjectURL(logoFile) : settings.logo_url} alt="Logo" className="h-8 object-contain" /> : <div className="h-8 w-24 bg-muted rounded" />}
                    <span className="font-semibold text-sm">{settings.site_name}</span>
                  </div>
                  <div className="space-y-2"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-4 bg-muted rounded w-1/2" /><div className="h-4 bg-muted rounded w-2/3" /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SiteManagement;
