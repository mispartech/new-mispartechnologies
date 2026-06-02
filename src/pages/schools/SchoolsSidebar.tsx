import { NavLink, useLocation } from 'react-router-dom';
import { ScanFace } from 'lucide-react';
import { MSSE_MODULES, MSSE_GROUP_ORDER } from './msseModules';
import { cn } from '@/lib/utils';

export const MsseSidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
          <ScanFace className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-white">MSSE</div>
          <div className="text-[10px] uppercase tracking-widest text-cyan-300/70">Smart School OS</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {MSSE_GROUP_ORDER.map((group) => {
          const items = MSSE_MODULES.filter((m) => m.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {group}
              </div>
              <ul className="space-y-0.5">
                {items.map((m) => {
                  const Icon = m.icon;
                  const to = m.slug ? `/msse/dashboard/${m.slug}` : '/msse/dashboard';
                  const active = pathname === to;
                  return (
                    <li key={m.slug || 'home'}>
                      <NavLink
                        to={to}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          active
                            ? 'bg-cyan-400/10 text-cyan-100 ring-1 ring-cyan-400/30'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white',
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                        <span className="flex-1 truncate">{m.label}</span>
                        {m.status === 'soon' && (
                          <span className="rounded-full bg-amber-400/10 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-amber-300">
                            Soon
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-3 text-[10px] uppercase tracking-widest text-slate-500">
        v2 · Mispar Technologies
      </div>
    </aside>
  );
};
