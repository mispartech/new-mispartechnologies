import { cn } from '@/lib/utils';

interface PreloaderPreviewProps {
  style: 'spinner' | 'pulse' | 'logo' | 'dots';
  primaryColor: string;
  logoUrl?: string;
}

const PreloaderPreview = ({ style, primaryColor, logoUrl }: PreloaderPreviewProps) => {
  return (
    <div className="flex items-center justify-center h-24 rounded-lg bg-background border border-border">
      {style === 'spinner' && (
        <div
          className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
          style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
        />
      )}

      {style === 'pulse' && (
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-pulse"
              style={{
                backgroundColor: primaryColor,
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
      )}

      {style === 'logo' && (
        <div className="animate-pulse">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-12 h-12 object-contain" />
          ) : (
            <div
              className="w-12 h-12 rounded-lg"
              style={{ backgroundColor: primaryColor }}
            />
          )}
        </div>
      )}

      {style === 'dots' && (
        <div className="flex gap-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: primaryColor,
                animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
              }}
            />
          ))}
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
              40% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default PreloaderPreview;

// Standalone preloader component used in DashboardLayout
export const DashboardPreloader = ({
  style,
  primaryColor,
  logoUrl,
}: PreloaderPreviewProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <PreloaderPreview style={style} primaryColor={primaryColor} logoUrl={logoUrl} />
    </div>
  );
};
