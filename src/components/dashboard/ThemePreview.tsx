import { OrgBranding } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemePreviewProps {
  branding: OrgBranding;
}

const RADIUS_MAP: Record<string, string> = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};

const ThemePreview = ({ branding }: ThemePreviewProps) => {
  const radius = RADIUS_MAP[branding.border_radius] || '8px';

  const sidebarClasses = cn(
    'w-16 flex-shrink-0 flex flex-col items-center gap-2 py-3 px-1',
    branding.sidebar_style === 'glass' && 'backdrop-blur-sm',
    branding.sidebar_style === 'minimal' && 'border-r'
  );

  const cardClasses = cn(
    'p-2',
    branding.card_style === 'elevated' && 'shadow-md',
    branding.card_style === 'bordered' && 'border-2',
    branding.card_style === 'glass' && 'backdrop-blur-sm'
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
      <p className="text-xs text-muted-foreground px-3 py-2 border-b border-border bg-muted/50 font-medium">
        Live Preview
      </p>
      <div className="h-48 flex" style={{ fontSize: '10px' }}>
        {/* Mini sidebar */}
        <div
          className={sidebarClasses}
          style={{
            backgroundColor: branding.sidebar_bg,
            color: branding.sidebar_text,
            borderColor: branding.sidebar_style === 'minimal' ? branding.sidebar_text + '20' : undefined,
          }}
        >
          {branding.logo_url ? (
            <img src={branding.logo_url} alt="" className="w-6 h-6 rounded object-contain" />
          ) : (
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: branding.primary_color, borderRadius: radius }}
            />
          )}
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-10 h-3 rounded-sm opacity-60"
              style={{
                backgroundColor: i === 1 ? branding.primary_color : branding.sidebar_text,
                opacity: i === 1 ? 1 : 0.2,
                borderRadius: radius,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Mini header */}
          <div
            className="h-8 flex items-center px-3 border-b"
            style={{
              backgroundColor: branding.header_bg,
              borderColor: branding.header_bg === '#ffffff' ? '#e5e7eb' : 'transparent',
            }}
          >
            <div
              className="w-12 h-2.5 rounded-sm"
              style={{ backgroundColor: branding.primary_color, borderRadius: radius }}
            />
            <div className="ml-auto flex gap-1">
              <div className="w-4 h-4 rounded-full bg-muted" />
            </div>
          </div>

          {/* Mini content area */}
          <div className="flex-1 p-2 space-y-2 bg-muted/20">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-1.5">
              {['primary_color', 'secondary_color', 'accent_color'].map((key, i) => (
                <div
                  key={i}
                  className={cardClasses}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: radius,
                    borderColor: branding.card_style === 'bordered' ? branding[key as keyof OrgBranding] as string + '40' : undefined,
                  }}
                >
                  <div
                    className="w-full h-2 rounded-sm mb-1"
                    style={{
                      backgroundColor: branding[key as keyof OrgBranding] as string,
                      borderRadius: radius,
                    }}
                  />
                  <div className="w-3/4 h-1.5 bg-muted rounded-sm" />
                </div>
              ))}
            </div>

            {/* Button preview */}
            <div className="flex gap-1.5">
              <div
                className="px-3 py-1 text-white"
                style={{
                  backgroundColor: branding.primary_color,
                  borderRadius: radius,
                  fontSize: '8px',
                }}
              >
                Primary
              </div>
              <div
                className="px-3 py-1"
                style={{
                  backgroundColor: branding.secondary_color,
                  borderRadius: radius,
                  fontSize: '8px',
                  color: '#fff',
                }}
              >
                Secondary
              </div>
              <div
                className="px-3 py-1 border"
                style={{
                  borderColor: branding.accent_color,
                  color: branding.accent_color,
                  borderRadius: radius,
                  fontSize: '8px',
                }}
              >
                Accent
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
