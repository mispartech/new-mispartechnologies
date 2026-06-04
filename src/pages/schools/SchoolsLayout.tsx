import { Outlet } from 'react-router-dom';
import { SchoolsThemeProvider, useSchoolsTheme } from '@/contexts/SchoolsThemeContext';
import { SchoolsSidebar } from './SchoolsSidebar';
import { SchoolsTopBar } from '@/components/schools/SchoolsTopBar';
import { SchoolsFooter } from '@/components/schools/SchoolsFooter';
import { useState } from 'react';

const Shell = () => {
  const { resolved } = useSchoolsTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="schools-root" data-theme={resolved}>
      <div className="flex min-h-dvh">
        <SchoolsSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <SchoolsTopBar onMenuClick={() => setMobileOpen(true)} />
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
