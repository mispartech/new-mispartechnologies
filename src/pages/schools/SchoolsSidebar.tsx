import { NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, X } from 'lucide-react';
import { SCHOOLS_MODULES, SCHOOLS_GROUP_ORDER } from './schoolsModules';
import { cn } from '@/lib/utils';

interface Props {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SchoolsSidebar = ({ mobileOpen = false, onCloseMobile }: Props) => {
  const { pathname } = useLocation();

  const content = (
    <>
      <div className="flex items-center justify-between gap-2.5 px-5 h-16 border-b border-[hsl(var(--s-border))]">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--s-primary))] to-[hsl(var(--s-academic))] shadow-[0_4px_16px_-4px_hsl(var(--s-primary)/0.4)]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold text-[hsl(var(--s-primary-ink))]">Mispar Schools</div>
            <div className="text-[10px] uppercase tracking-widest text-[hsl(var(--s-text-subtle))]">Smart Campus OS</div>
          </div>
        </div>
        <button
          aria-label="Close menu"
          onClick={onCloseMobile}
          className="lg:hidden grid h-9 w-9 place-items-center rounded-lg text-[hsl(var(--s-text-muted))] hover:bg-[hsl(var(--s-surface-2))]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {SCHOOLS_GROUP_ORDER.map((group) => {
          const items = SCHOOLS_MODULES.filter((m) => m.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--s-text-subtle))]">
                {group}
              </div>
              <ul className="space-y-0.5">
                {items.map((m) => {
                  const Icon = m.icon;
                  const to = m.slug ? `/schools/dashboard/${m.slug}` : '/schools/dashboard';
                  const active = pathname === to || (m.slug === 'attendance/admin' && pathname.endsWith('/admin'));
                  return (
                    <li key={m.slug || 'home'}>
                      <NavLink
                        to={to}
                        onClick={onCloseMobile}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          active
                            ? 'bg-[hsl(var(--s-primary)/0.1)] text-[hsl(var(--s-primary))] font-medium'
                            : 'text-[hsl(var(--s-text-muted))] hover:bg-[hsl(var(--s-surface-2))] hover:text-[hsl(var(--s-text))]',
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="flex-1 truncate">{m.label}</span>
                        {m.status === 'soon' && (
                          <span className="rounded-full bg-[hsl(var(--s-warning)/0.12)] px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-[hsl(var(--s-warning))]">
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

      <div className="border-t border-[hsl(var(--s-border))] px-5 py-3 text-[10px] uppercase tracking-widest text-[hsl(var(--s-text-subtle))]">
        v2 · Mispar Technologies
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-[hsl(var(--s-surface))] border-r border-[hsl(var(--s-border))] z-30">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-[hsl(var(--s-surface))] border-r border-[hsl(var(--s-border))] s-fade-up">
            {content}
          </aside>
        </>
      )}
    </>
  );
};
