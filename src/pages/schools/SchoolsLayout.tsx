import { Outlet } from 'react-router-dom';
import { SchoolsThemeProvider, useSchoolsTheme } from '@/contexts/SchoolsThemeContext';
import { SchoolsSidebar } from './SchoolsSidebar';
import { SchoolsTopBar } from '@/components/schools/SchoolsTopBar';
import { SchoolsFooter } from '@/components/schools/SchoolsFooter';
import { useEffect, useState } from 'react';
import { schoolsRequest } from '@/lib/api/schools/schoolsClient';
import { SCHOOLS_API_ROUTES, isSchoolsApiConfigured } from '@/lib/api/schools/schoolsApiRoutes';
import { AlertTriangle, WifiOff } from 'lucide-react';

type HealthStatus = 'idle' | 'ok' | 'forbidden' | 'unreachable' | 'unauthorized';

const HealthBanner = ({ status, message }: { status: HealthStatus; message: string | null }) => {
  if (status === 'idle' || status === 'ok') return null;
  const tone =
    status === 'unreachable' ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300'
    : 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300';
  const Icon = status === 'unreachable' ? WifiOff : AlertTriangle;
  const title =
    status === 'unreachable' ? 'Schools backend unreachable'
    : status === 'forbidden' ? 'No school organisation linked to your account'
    : status === 'unauthorized' ? 'Sign in to access the Schools workspace'
    : 'Schools backend issue';
  return (
    <div className={`border-b ${tone}`}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-2.5 flex items-start gap-2 text-sm">
        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="flex-1">
          <span className="font-medium">{title}.</span>{' '}
          <span className="opacity-80">{message ?? 'Live data and realtime updates are temporarily unavailable.'}</span>
        </div>
      </div>
    </div>
  );
};

const Shell = () => {
  const { resolved } = useSchoolsTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus>('idle');
  const [healthMessage, setHealthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSchoolsApiConfigured()) {
      setHealth('unreachable');
      setHealthMessage('VITE_SCHOOLS_API_URL is not configured for this build.');
      return;
    }
    schoolsRequest<{ ok: boolean }>(SCHOOLS_API_ROUTES.HEALTH, { silent: true })
      .then(res => {
        if (res.status === 0) { setHealth('unreachable'); setHealthMessage(res.error ?? null); return; }
        if (res.status === 401) { setHealth('unauthorized'); setHealthMessage(res.error ?? null); return; }
        if (res.status === 403) { setHealth('forbidden'); setHealthMessage(res.error ?? 'Your user is not a member of a school organisation.'); return; }
        if (res.error) { setHealth('unreachable'); setHealthMessage(res.error); return; }
        setHealth('ok');
      });
  }, []);

  return (
    <div className="schools-root" data-theme={resolved}>
      <div className="flex min-h-dvh">
        <SchoolsSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <SchoolsTopBar onMenuClick={() => setMobileOpen(true)} />
          <HealthBanner status={health} message={healthMessage} />
          <main className="flex-1">
            <Outlet />
          </main>
          <SchoolsFooter />
        </div>
      </div>
    </div>
  );
};

const SchoolsLayout = () => (
  <SchoolsThemeProvider>
    <Shell />
  </SchoolsThemeProvider>
);

export default SchoolsLayout;
