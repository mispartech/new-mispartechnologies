import { Outlet } from 'react-router-dom';
import { MsseThemeProvider } from '@/contexts/MsseThemeContext';
import { MsseSidebar } from './MsseSidebar';

const MsseLayout = () => (
  <MsseThemeProvider>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-3xl" />
      </div>
      <div className="relative flex min-h-screen">
        <MsseSidebar />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  </MsseThemeProvider>
);

export default MsseLayout;
