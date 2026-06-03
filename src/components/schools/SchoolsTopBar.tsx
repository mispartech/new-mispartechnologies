import { Search, Bell, Menu, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ui/SchoolsUI';

interface Props {
  onMenuClick?: () => void;
}

export const SchoolsTopBar = ({ onMenuClick }: Props) => {
  const term = 'Term 2 · 2025/2026';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

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
        <span className="rounded-full bg-[hsl(var(--s-accent)/0.12)] px-2.5 py-1 font-medium text-[hsl(var(--s-accent))]">
          {term}
        </span>
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
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[hsl(var(--s-danger))] s-pulse-dot" />
        </button>
        <button className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface))] px-2.5 py-1.5 hover:bg-[hsl(var(--s-surface-2))]">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[hsl(var(--s-primary))] to-[hsl(var(--s-academic))] text-[10px] font-semibold text-white">
            PR
          </div>
          <span className="text-xs font-medium text-[hsl(var(--s-text))]">Principal</span>
          <ChevronDown className="h-3 w-3 text-[hsl(var(--s-text-muted))]" />
        </button>
      </div>
    </header>
  );
};
