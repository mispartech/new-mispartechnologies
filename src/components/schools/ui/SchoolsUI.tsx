import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Sun, Moon, Monitor, LucideIcon } from 'lucide-react';
import { useSchoolsTheme } from '@/contexts/SchoolsThemeContext';

/* ============ Card ============ */
export const SchoolsCard = ({
  children, className, padded = true, interactive = false,
}: { children: ReactNode; className?: string; padded?: boolean; interactive?: boolean }) => (
  <div
    className={cn(
      'rounded-[var(--s-radius)] border bg-[hsl(var(--s-surface))] border-[hsl(var(--s-border))]',
      'shadow-[var(--s-shadow-sm)]',
      padded && 'p-5',
      interactive && 'transition hover:shadow-[var(--s-shadow-md)] hover:border-[hsl(var(--s-border-strong))]',
      className,
    )}
  >
    {children}
  </div>
);

/* ============ Section header ============ */
export const SectionHeader = ({
  eyebrow, title, description, action,
}: { eyebrow?: string; title: ReactNode; description?: ReactNode; action?: ReactNode }) => (
  <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
    <div>
      {eyebrow && (
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--s-text-subtle))]">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-xl font-semibold text-[hsl(var(--s-primary-ink))] mt-0.5">{title}</h2>
      {description && <p className="text-sm text-[hsl(var(--s-text-muted))] mt-1 max-w-2xl">{description}</p>}
    </div>
    {action}
  </div>
);

/* ============ Stat card ============ */
export type StatTone = 'primary' | 'accent' | 'warning' | 'danger' | 'info' | 'neutral';

const toneVarMap: Record<StatTone, string> = {
  primary: '--s-primary',
  accent: '--s-accent',
  warning: '--s-warning',
  danger: '--s-danger',
  info: '--s-info',
  neutral: '--s-text-muted',
};

export const StatCard = ({
  label, value, delta, deltaLabel, icon: Icon, tone = 'primary', footer,
}: {
  label: string;
  value: ReactNode;
  delta?: number;            // signed, percent
  deltaLabel?: string;
  icon?: LucideIcon;
  tone?: StatTone;
  footer?: ReactNode;
}) => {
  const positive = typeof delta === 'number' && delta > 0;
  const negative = typeof delta === 'number' && delta < 0;
  const TrendIcon = positive ? TrendingUp : negative ? TrendingDown : Minus;
  const toneVar = toneVarMap[tone];

  return (
    <SchoolsCard className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--s-text-subtle))]">
            {label}
          </div>
          <div className="mt-1.5 font-display text-3xl font-semibold tabular-nums text-[hsl(var(--s-primary-ink))]">
            {value}
          </div>
        </div>
        {Icon && (
          <div
            className="grid h-10 w-10 place-items-center rounded-xl"
            style={{
              background: `hsl(var(${toneVar}) / 0.12)`,
              color: `hsl(var(${toneVar}))`,
            }}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {(typeof delta === 'number' || footer) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {typeof delta === 'number' && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium tabular-nums"
              style={{
                color: positive ? 'hsl(var(--s-accent))' : negative ? 'hsl(var(--s-danger))' : 'hsl(var(--s-text-muted))',
                background: positive ? 'hsl(var(--s-accent) / 0.1)' : negative ? 'hsl(var(--s-danger) / 0.1)' : 'hsl(var(--s-surface-2))',
              }}
            >
              <TrendIcon className="h-3 w-3" />
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {deltaLabel && <span className="text-[hsl(var(--s-text-subtle))]">{deltaLabel}</span>}
          {footer}
        </div>
      )}
    </SchoolsCard>
  );
};

/* ============ Badge ============ */
export type BadgeTone = StatTone | 'subtle';
export const Badge = ({
  children, tone = 'subtle', className,
}: { children: ReactNode; tone?: BadgeTone; className?: string }) => {
  const styles: Record<BadgeTone, string> = {
    primary: 'bg-[hsl(var(--s-primary)/0.12)] text-[hsl(var(--s-primary))]',
    accent: 'bg-[hsl(var(--s-accent)/0.12)] text-[hsl(var(--s-accent))]',
    warning: 'bg-[hsl(var(--s-warning)/0.14)] text-[hsl(var(--s-warning))]',
    danger: 'bg-[hsl(var(--s-danger)/0.12)] text-[hsl(var(--s-danger))]',
    info: 'bg-[hsl(var(--s-info)/0.12)] text-[hsl(var(--s-info))]',
    neutral: 'bg-[hsl(var(--s-surface-2))] text-[hsl(var(--s-text-muted))]',
    subtle: 'bg-[hsl(var(--s-surface-2))] text-[hsl(var(--s-text-muted))]',
  };
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
      styles[tone], className,
    )}>
      {children}
    </span>
  );
};

/* ============ Button ============ */
interface SchoolsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}
export const SchoolsButton = ({
  variant = 'primary', size = 'md', className, children, ...rest
}: SchoolsButtonProps) => {
  const variants: Record<string, string> = {
    primary: 'bg-[hsl(var(--s-primary))] text-[hsl(var(--s-primary-fg))] hover:brightness-110 shadow-[var(--s-shadow-sm)]',
    secondary: 'bg-[hsl(var(--s-surface-2))] text-[hsl(var(--s-text))] hover:bg-[hsl(var(--s-surface-3))]',
    outline: 'border border-[hsl(var(--s-border-strong))] text-[hsl(var(--s-text))] hover:bg-[hsl(var(--s-surface-2))]',
    ghost: 'text-[hsl(var(--s-text-muted))] hover:bg-[hsl(var(--s-surface-2))] hover:text-[hsl(var(--s-text))]',
  };
  const sizes: Record<string, string> = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-11 px-5 text-sm gap-2',
    icon: 'h-10 w-10 p-0',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

/* ============ Empty state ============ */
export const EmptyState = ({
  icon: Icon, title, description, action,
}: { icon?: LucideIcon; title: string; description?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
    {Icon && (
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--s-surface-2))] text-[hsl(var(--s-text-muted))]">
        <Icon className="h-5 w-5" />
      </div>
    )}
    <div className="mt-3 text-sm font-semibold text-[hsl(var(--s-text))]">{title}</div>
    {description && <p className="mt-1 text-xs text-[hsl(var(--s-text-muted))] max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/* ============ Avatar with attendance ring ============ */
export const Avatar = ({
  name, size = 40, attendancePct, src,
}: { name: string; size?: number; attendancePct?: number; src?: string }) => {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const ring = attendancePct == null ? 'hsl(var(--s-border))'
    : attendancePct >= 90 ? 'hsl(var(--s-accent))'
    : attendancePct >= 75 ? 'hsl(var(--s-warning))'
    : 'hsl(var(--s-danger))';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(${ring} ${(attendancePct ?? 100) * 3.6}deg, hsl(var(--s-surface-3)) 0)` }}
      />
      <div
        className="absolute inset-[3px] grid place-items-center rounded-full bg-[hsl(var(--s-surface))] font-display font-semibold text-[hsl(var(--s-primary-ink))]"
        style={{ fontSize: size * 0.36 }}
      >
        {src ? <img src={src} alt={name} className="h-full w-full rounded-full object-cover" /> : initials}
      </div>
    </div>
  );
};

/* ============ Metric ring ============ */
export const MetricRing = ({
  value, label, size = 140, tone = 'primary',
}: { value: number; label?: string; size?: number; tone?: StatTone }) => {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const color = `hsl(var(${toneVarMap[tone]}))`;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--s-surface-3))" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <div className="font-display text-3xl font-bold tabular-nums text-[hsl(var(--s-primary-ink))]">
          {Math.round(value)}
        </div>
        {label && <div className="text-[10px] font-medium uppercase tracking-widest text-[hsl(var(--s-text-subtle))]">{label}</div>}
      </div>
    </div>
  );
};

/* ============ Progress bar ============ */
export const ProgressBar = ({
  value, tone = 'primary', height = 6,
}: { value: number; tone?: StatTone; height?: number }) => (
  <div className="w-full rounded-full bg-[hsl(var(--s-surface-3))] overflow-hidden" style={{ height }}>
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{
        width: `${Math.max(0, Math.min(100, value))}%`,
        background: `hsl(var(${toneVarMap[tone]}))`,
      }}
    />
  </div>
);

/* ============ Theme toggle ============ */
export const ThemeToggle = () => {
  const { theme, setTheme } = useSchoolsTheme();
  const opts: { v: 'light' | 'dark' | 'system'; icon: LucideIcon; label: string }[] = [
    { v: 'light', icon: Sun, label: 'Light' },
    { v: 'system', icon: Monitor, label: 'System' },
    { v: 'dark', icon: Moon, label: 'Dark' },
  ];
  return (
    <div className="inline-flex items-center rounded-full border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface))] p-0.5">
      {opts.map(({ v, icon: Icon, label }) => (
        <button
          key={v}
          aria-label={`${label} theme`}
          onClick={() => setTheme(v)}
          className={cn(
            'grid h-7 w-7 place-items-center rounded-full transition',
            theme === v
              ? 'bg-[hsl(var(--s-primary))] text-[hsl(var(--s-primary-fg))]'
              : 'text-[hsl(var(--s-text-muted))] hover:text-[hsl(var(--s-text))]',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
};

/* ============ Tabs (simple) ============ */
export const TabBar = <T extends string>({
  tabs, value, onChange,
}: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) => (
  <div className="inline-flex rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface))] p-0.5">
    {tabs.map(t => (
      <button
        key={t.value}
        onClick={() => onChange(t.value)}
        className={cn(
          'rounded-md px-3 py-1.5 text-xs font-medium transition inline-flex items-center gap-1.5',
          value === t.value
            ? 'bg-[hsl(var(--s-primary))] text-[hsl(var(--s-primary-fg))] shadow-[var(--s-shadow-sm)]'
            : 'text-[hsl(var(--s-text-muted))] hover:text-[hsl(var(--s-text))]',
        )}
      >
        {t.label}
        {typeof t.count === 'number' && (
          <span className={cn(
            'rounded-full px-1.5 py-px text-[10px] tabular-nums',
            value === t.value ? 'bg-white/20' : 'bg-[hsl(var(--s-surface-2))]',
          )}>{t.count}</span>
        )}
      </button>
    ))}
  </div>
);
