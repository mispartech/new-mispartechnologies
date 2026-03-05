import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { djangoApi } from '@/lib/api';

// ── Types ──

export interface OrgBranding {
  // Colors (hex)
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  sidebar_bg: string;
  sidebar_text: string;
  header_bg: string;

  // Logo & identity
  logo_url: string;
  favicon_url: string;

  // Preloader
  preloader_style: 'spinner' | 'pulse' | 'logo' | 'dots';

  // Typography
  font_family: 'inter' | 'space-grotesk' | 'poppins' | 'roboto' | 'system';
  heading_font: 'inter' | 'space-grotesk' | 'poppins' | 'roboto' | 'system';
  border_radius: 'none' | 'sm' | 'md' | 'lg' | 'full';

  // Layout
  sidebar_style: 'solid' | 'glass' | 'minimal';
  card_style: 'flat' | 'elevated' | 'bordered' | 'glass';
  dark_mode: 'system' | 'light' | 'dark';

  // Content
  welcome_message: string;

  // Member theme
  member_theme_enabled: boolean;
}

export const DEFAULT_BRANDING: OrgBranding = {
  primary_color: '#0f2a4a',
  secondary_color: '#00bcd4',
  accent_color: '#00acc1',
  sidebar_bg: '#ffffff',
  sidebar_text: '#374151',
  header_bg: '#ffffff',
  logo_url: '',
  favicon_url: '',
  preloader_style: 'spinner',
  font_family: 'space-grotesk',
  heading_font: 'inter',
  border_radius: 'md',
  sidebar_style: 'solid',
  card_style: 'elevated',
  dark_mode: 'system',
  welcome_message: '',
  member_theme_enabled: true,
};

interface ThemeContextType {
  branding: OrgBranding;
  isLoading: boolean;
  updateBranding: (updates: Partial<OrgBranding>) => void;
  saveBranding: () => Promise<boolean>;
  resetBranding: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};

// ── Hex → HSL conversion ──

function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslString(hex: string): string {
  const hsl = hexToHSL(hex);
  if (!hsl) return '0 0% 0%';
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

// Compute a foreground color (light or dark) based on background luminance
function autoForeground(bgHex: string): string {
  const hsl = hexToHSL(bgHex);
  if (!hsl) return '0 0% 100%';
  return hsl.l > 55 ? '210 60% 10%' : '0 0% 98%';
}

// ── Border radius mapping ──

const RADIUS_MAP: Record<string, string> = {
  none: '0rem',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  full: '9999px',
};

// ── Font family mapping ──

const FONT_MAP: Record<string, string> = {
  inter: "'Inter', sans-serif",
  'space-grotesk': "'Space Grotesk', sans-serif",
  poppins: "'Poppins', sans-serif",
  roboto: "'Roboto', sans-serif",
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const GOOGLE_FONT_URLS: Record<string, string> = {
  poppins: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
  roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
};

// ── Provider ──

interface ThemeProviderProps {
  children: ReactNode;
  organizationId?: string;
  userRole?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, organizationId, userRole }) => {
  const [branding, setBranding] = useState<OrgBranding>(DEFAULT_BRANDING);
  const [savedBranding, setSavedBranding] = useState<OrgBranding>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const shouldApply = isAdmin || branding.member_theme_enabled;

  // Fetch branding from org
  useEffect(() => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    const fetch = async () => {
      const res = await djangoApi.getOrganization(organizationId);
      if (res.data?.branding && Object.keys(res.data.branding).length > 0) {
        const merged = { ...DEFAULT_BRANDING, ...res.data.branding };
        setBranding(merged);
        setSavedBranding(merged);
      }
      setIsLoading(false);
    };

    fetch();
  }, [organizationId]);

  // Inject CSS variables when branding changes
  useEffect(() => {
    if (!shouldApply) return;

    const root = document.documentElement;

    // Colors
    root.style.setProperty('--primary', hslString(branding.primary_color));
    root.style.setProperty('--primary-foreground', autoForeground(branding.primary_color));
    root.style.setProperty('--secondary', hslString(branding.secondary_color));
    root.style.setProperty('--secondary-foreground', autoForeground(branding.secondary_color));
    root.style.setProperty('--accent', hslString(branding.accent_color));
    root.style.setProperty('--accent-foreground', autoForeground(branding.accent_color));

    // Sidebar & header
    root.style.setProperty('--sidebar-bg', hslString(branding.sidebar_bg));
    root.style.setProperty('--sidebar-text', hslString(branding.sidebar_text));
    root.style.setProperty('--header-bg', hslString(branding.header_bg));
    root.style.setProperty('--header-text', autoForeground(branding.header_bg));

    // Border radius
    root.style.setProperty('--radius', RADIUS_MAP[branding.border_radius] || '0.5rem');

    // Ring color follows accent
    root.style.setProperty('--ring', hslString(branding.accent_color));

    return () => {
      // Clean up custom properties on unmount
      const props = [
        '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
        '--accent', '--accent-foreground', '--sidebar-bg', '--sidebar-text',
        '--header-bg', '--header-text', '--radius', '--ring',
      ];
      props.forEach(p => root.style.removeProperty(p));
    };
  }, [branding, shouldApply]);

  // Dynamic font loading
  useEffect(() => {
    const fonts = new Set([branding.font_family, branding.heading_font]);
    fonts.forEach(font => {
      const url = GOOGLE_FONT_URLS[font];
      if (url && !document.querySelector(`link[href="${url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
      }
    });
  }, [branding.font_family, branding.heading_font]);

  // Apply font families to dashboard root
  useEffect(() => {
    if (!shouldApply) return;
    const root = document.documentElement;
    root.style.setProperty('--font-body', FONT_MAP[branding.font_family] || FONT_MAP.system);
    root.style.setProperty('--font-heading', FONT_MAP[branding.heading_font] || FONT_MAP.inter);

    return () => {
      root.style.removeProperty('--font-body');
      root.style.removeProperty('--font-heading');
    };
  }, [branding.font_family, branding.heading_font, shouldApply]);

  // Favicon override
  useEffect(() => {
    if (!branding.favicon_url) return;
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    const originalHref = link?.href;
    if (link) {
      link.href = branding.favicon_url;
    } else {
      link = document.createElement('link');
      link.rel = 'icon';
      link.href = branding.favicon_url;
      document.head.appendChild(link);
    }
    return () => {
      if (originalHref && link) link.href = originalHref;
    };
  }, [branding.favicon_url]);

  const updateBranding = useCallback((updates: Partial<OrgBranding>) => {
    setBranding(prev => ({ ...prev, ...updates }));
  }, []);

  const saveBranding = useCallback(async (): Promise<boolean> => {
    if (!organizationId) return false;
    setIsSaving(true);
    const res = await djangoApi.updateOrganization(organizationId, { branding });
    setIsSaving(false);
    if (res.status < 300) {
      setSavedBranding(branding);
      return true;
    }
    return false;
  }, [organizationId, branding]);

  const resetBranding = useCallback(() => {
    setBranding(DEFAULT_BRANDING);
  }, []);

  const hasUnsavedChanges = JSON.stringify(branding) !== JSON.stringify(savedBranding);

  return (
    <ThemeContext.Provider value={{ branding, isLoading, updateBranding, saveBranding, resetBranding, hasUnsavedChanges, isSaving }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
