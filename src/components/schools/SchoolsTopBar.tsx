import { Search, Bell, Menu, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ui/SchoolsUI';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';

interface Props {
  onMenuClick?: () => void;
}

const roleLabel = (role?: string) => {
  if (!role) return 'Member';
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const SchoolsTopBar = ({ onMenuClick }: Props) => {
  const { user } = useDjangoAuth();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const orgName = user?.organization_name;
  const initials = user
    ? `${(user.first_name || '').charAt(0)}${(user.last_name || '').charAt(0)}`.toUpperCase() || (user.email || '?').charAt(0).toUpperCase()
    : '?';
  const displayRole = roleLabel(user?.role);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface)/0.85)] backdrop-blur-xl px-4 lg:px-6">
      <button
        aria-label="Open menu"
        onClick={onMenuClick}
        className="lg:hidden grid h-10 w-10 place-items-center rounded-lg text-[hsl(var(--s-text-muted))] hover:bg-[hsl(var(--s-surface-2))]"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:flex items-center gap-2 text-xs">
        {orgName && (
          <span className="rounded-full bg-[hsl(var(--s-accent)/0.12)] px-2.5 py-1 font-medium text-[hsl(var(--s-accent))]">
            {orgName}
          </span>
        )}
        <span className="text-[hsl(var(--s-text-muted))]">{today}</span>
      </div>

      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--s-text-subtle))]" />
          <input
            type="search"
            placeholder="Search students, staff, classes…"
            className="h-10 w-full rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] pl-9 pr-3 text-sm text-[hsl(var(--s-text))] placeholder:text-[hsl(var(--s-text-subtle))] focus:outline-none focus:border-[hsl(var(--s-primary))]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-lg text-[hsl(var(--s-text-muted))] hover:bg-[hsl(var(--s-surface-2))]"
        >
          <Bell className="h-4 w-4" />
        </button>
        {user && (
          <button className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface))] px-2.5 py-1.5 hover:bg-[hsl(var(--s-surface-2))]">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[hsl(var(--s-primary))] to-[hsl(var(--s-academic))] text-[10px] font-semibold text-white">
              {initials}
            </div>
            <span className="text-xs font-medium text-[hsl(var(--s-text))]">{displayRole}</span>
            <ChevronDown className="h-3 w-3 text-[hsl(var(--s-text-muted))]" />
          </button>
        )}
      </div>
    </header>
  );
};

