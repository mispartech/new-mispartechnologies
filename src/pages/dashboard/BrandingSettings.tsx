import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTheme, DEFAULT_BRANDING, OrgBranding } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ColorPicker from '@/components/dashboard/ColorPicker';
import ThemePreview from '@/components/dashboard/ThemePreview';
import PreloaderPreview from '@/components/dashboard/PreloaderPreview';
import {
  Palette, Type, Layout, Loader, Upload, RotateCcw, Save, Image, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BrandingSettings = () => {
  const { profile } = useOutletContext<{ profile: any }>();
  const { branding, updateBranding, saveBranding, resetBranding, hasUnsavedChanges, isSaving } = useTheme();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null);

  const handleSave = async () => {
    const ok = await saveBranding();
    toast({
      title: ok ? 'Branding saved' : 'Failed to save',
      description: ok ? 'Your theme has been applied across the dashboard.' : 'Please try again.',
      variant: ok ? 'default' : 'destructive',
    });
  };

  const handleReset = () => {
    resetBranding();
    toast({ title: 'Reset to defaults', description: 'Save to apply the default theme.' });
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'favicon') => {
    if (!profile?.organization_id) return;
    setUploading(type);

    const ext = file.name.split('.').pop();
    const path = `${profile.organization_id}/${type}.${ext}`;

    const { error } = await supabase.storage
      .from('org-assets')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('org-assets').getPublicUrl(path);
    updateBranding({ [type === 'logo' ? 'logo_url' : 'favicon_url']: publicUrl });
    setUploading(null);
    toast({ title: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded` });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Branding</h1>
          <p className="text-muted-foreground">
            Customize the look and feel of your organization's dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-400">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasUnsavedChanges || isSaving}>
            <Save className="w-4 h-4 mr-1" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Settings panel */}
        <div className="xl:col-span-2">
          <Tabs defaultValue="colors" className="space-y-4">
            <TabsList className="flex flex-nowrap overflow-x-auto h-auto gap-1 bg-muted p-1 w-full">
              <TabsTrigger value="colors" className="gap-1.5"><Palette className="w-4 h-4" /> Colors</TabsTrigger>
              <TabsTrigger value="identity" className="gap-1.5"><Image className="w-4 h-4" /> Identity</TabsTrigger>
              <TabsTrigger value="typography" className="gap-1.5"><Type className="w-4 h-4" /> Typography</TabsTrigger>
              <TabsTrigger value="layout" className="gap-1.5"><Layout className="w-4 h-4" /> Layout</TabsTrigger>
              <TabsTrigger value="preloader" className="gap-1.5"><Loader className="w-4 h-4" /> Preloader</TabsTrigger>
              <TabsTrigger value="content" className="gap-1.5"><Eye className="w-4 h-4" /> Content</TabsTrigger>
            </TabsList>

            {/* ─── Colors ─── */}
            <TabsContent value="colors">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>
                    Set your organization's color palette. These colors will be applied to buttons, links, headers, and UI elements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <ColorPicker
                    label="Primary Color"
                    description="Main brand color — buttons, active states, key elements"
                    value={branding.primary_color}
                    onChange={(c) => updateBranding({ primary_color: c })}
                  />
                  <ColorPicker
                    label="Secondary Color"
                    description="Supporting color — badges, secondary buttons"
                    value={branding.secondary_color}
                    onChange={(c) => updateBranding({ secondary_color: c })}
                  />
                  <ColorPicker
                    label="Accent Color"
                    description="Highlight color — links, focus rings, hover effects"
                    value={branding.accent_color}
                    onChange={(c) => updateBranding({ accent_color: c })}
                  />
                  <ColorPicker
                    label="Sidebar Background"
                    description="Background color of the navigation sidebar"
                    value={branding.sidebar_bg}
                    onChange={(c) => updateBranding({ sidebar_bg: c })}
                  />
                  <ColorPicker
                    label="Sidebar Text"
                    description="Text and icon color in the sidebar"
                    value={branding.sidebar_text}
                    onChange={(c) => updateBranding({ sidebar_text: c })}
                  />
                  <ColorPicker
                    label="Header Background"
                    description="Background color of the top header bar"
                    value={branding.header_bg}
                    onChange={(c) => updateBranding({ header_bg: c })}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Identity ─── */}
            <TabsContent value="identity">
              <Card>
                <CardHeader>
                  <CardTitle>Logo & Favicon</CardTitle>
                  <CardDescription>
                    Upload your organization logo and favicon. Logo appears in the sidebar, favicon in the browser tab.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo upload */}
                  <div className="space-y-3">
                    <Label>Organization Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
                        {branding.logo_url ? (
                          <img src={branding.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageUpload(f, 'logo');
                            }}
                          />
                          <Button variant="outline" size="sm" asChild disabled={uploading === 'logo'}>
                            <span>{uploading === 'logo' ? 'Uploading...' : 'Upload Logo'}</span>
                          </Button>
                        </label>
                        <p className="text-xs text-muted-foreground">PNG, SVG or JPG. Max 2MB.</p>
                        {branding.logo_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => updateBranding({ logo_url: '' })}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Favicon upload */}
                  <div className="space-y-3">
                    <Label>Favicon</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
                        {branding.favicon_url ? (
                          <img src={branding.favicon_url} alt="Favicon" className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <Upload className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/png,image/x-icon,image/svg+xml"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageUpload(f, 'favicon');
                            }}
                          />
                          <Button variant="outline" size="sm" asChild disabled={uploading === 'favicon'}>
                            <span>{uploading === 'favicon' ? 'Uploading...' : 'Upload Favicon'}</span>
                          </Button>
                        </label>
                        <p className="text-xs text-muted-foreground">ICO, PNG or SVG. 32×32 recommended.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Typography ─── */}
            <TabsContent value="typography">
              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                  <CardDescription>
                    Choose fonts and border radius to match your brand's personality.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Body Font</Label>
                      <Select
                        value={branding.font_family}
                        onValueChange={(v) => updateBranding({ font_family: v as OrgBranding['font_family'] })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="space-grotesk">Space Grotesk</SelectItem>
                          <SelectItem value="poppins">Poppins</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="system">System Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Heading Font</Label>
                      <Select
                        value={branding.heading_font}
                        onValueChange={(v) => updateBranding({ heading_font: v as OrgBranding['heading_font'] })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="space-grotesk">Space Grotesk</SelectItem>
                          <SelectItem value="poppins">Poppins</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="system">System Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Border Radius</Label>
                    <div className="flex flex-wrap gap-2">
                      {(['none', 'sm', 'md', 'lg', 'full'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => updateBranding({ border_radius: r })}
                          className={cn(
                            'px-4 py-2 border transition-all text-sm',
                            branding.border_radius === r
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:bg-muted'
                          )}
                          style={{
                            borderRadius: r === 'none' ? '0' : r === 'sm' ? '4px' : r === 'md' ? '8px' : r === 'lg' ? '12px' : '9999px',
                          }}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font preview */}
                  <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Font Preview</p>
                    <h3 className="text-lg font-bold" style={{ fontFamily: branding.heading_font === 'system' ? 'inherit' : branding.heading_font }}>
                      The Quick Brown Fox Jumps Over
                    </h3>
                    <p className="text-sm" style={{ fontFamily: branding.font_family === 'system' ? 'inherit' : branding.font_family }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Layout ─── */}
            <TabsContent value="layout">
              <Card>
                <CardHeader>
                  <CardTitle>Layout Style</CardTitle>
                  <CardDescription>
                    Choose how the sidebar and cards appear in your dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sidebar style */}
                  <div className="space-y-3">
                    <Label>Sidebar Style</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { value: 'solid', label: 'Solid', desc: 'Classic opaque sidebar' },
                        { value: 'glass', label: 'Glass', desc: 'Frosted glass effect' },
                        { value: 'minimal', label: 'Minimal', desc: 'Subtle border only' },
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateBranding({ sidebar_style: opt.value })}
                          className={cn(
                            'p-3 rounded-lg border-2 text-left transition-all',
                            branding.sidebar_style === opt.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                          )}
                        >
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card style */}
                  <div className="space-y-3">
                    <Label>Card Style</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {([
                        { value: 'flat', label: 'Flat' },
                        { value: 'elevated', label: 'Elevated' },
                        { value: 'bordered', label: 'Bordered' },
                        { value: 'glass', label: 'Glass' },
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateBranding({ card_style: opt.value })}
                          className={cn(
                            'p-3 rounded-lg border-2 text-center transition-all',
                            branding.card_style === opt.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                          )}
                        >
                          <p className="text-sm font-medium">{opt.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dark mode */}
                  <div className="space-y-2">
                    <Label>Color Mode</Label>
                    <Select
                      value={branding.dark_mode}
                      onValueChange={(v) => updateBranding({ dark_mode: v as OrgBranding['dark_mode'] })}
                    >
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System Default</SelectItem>
                        <SelectItem value="light">Always Light</SelectItem>
                        <SelectItem value="dark">Always Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Preloader ─── */}
            <TabsContent value="preloader">
              <Card>
                <CardHeader>
                  <CardTitle>Loading Animation</CardTitle>
                  <CardDescription>
                    Choose the loading animation shown when the dashboard is loading.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {([
                      { value: 'spinner', label: 'Spinner' },
                      { value: 'pulse', label: 'Pulse' },
                      { value: 'logo', label: 'Logo Pulse' },
                      { value: 'dots', label: 'Bouncing Dots' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateBranding({ preloader_style: opt.value })}
                        className={cn(
                          'p-3 rounded-lg border-2 text-center transition-all',
                          branding.preloader_style === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/30'
                        )}
                      >
                        <p className="text-sm font-medium">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                  <PreloaderPreview
                    style={branding.preloader_style}
                    primaryColor={branding.primary_color}
                    logoUrl={branding.logo_url}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Content ─── */}
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Content & Visibility</CardTitle>
                  <CardDescription>
                    Set welcome messages and control theme visibility for members.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Welcome Message</Label>
                    <Textarea
                      placeholder="Welcome to our organization dashboard!"
                      value={branding.welcome_message}
                      onChange={(e) => updateBranding({ welcome_message: e.target.value })}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown on the dashboard home page. Leave empty for default greeting.
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium">Apply theme to members</p>
                      <p className="text-xs text-muted-foreground">
                        When enabled, members/employees see the same branded dashboard.
                        When disabled, they see the default theme.
                      </p>
                    </div>
                    <Switch
                      checked={branding.member_theme_enabled}
                      onCheckedChange={(v) => updateBranding({ member_theme_enabled: v })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview panel (sticky on desktop) */}
        <div className="xl:col-span-1">
          <div className="sticky top-20 space-y-4">
            <ThemePreview branding={branding} />

            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Quick Summary</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sidebar</span>
                    <span className="capitalize">{branding.sidebar_style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cards</span>
                    <span className="capitalize">{branding.card_style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Radius</span>
                    <span className="uppercase">{branding.border_radius}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Body font</span>
                    <span className="capitalize">{branding.font_family.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member theme</span>
                    <span>{branding.member_theme_enabled ? 'On' : 'Off'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingSettings;
