import { cn } from '@/lib/utils';

interface LiveStatBadgeProps {
  label: string;
  value: string | number;
  trend?: string;
  tone?: 'cyan' | 'blue' | 'amber' | 'rose' | 'emerald';
}

const toneMap: Record<NonNullable<LiveStatBadgeProps['tone']>, string> = {
  cyan: 'from-cyan-500/30 to-cyan-500/5 text-cyan-100',
  blue: 'from-blue-500/30 to-blue-500/5 text-blue-100',
  amber: 'from-amber-500/30 to-amber-500/5 text-amber-100',
  rose: 'from-rose-500/30 to-rose-500/5 text-rose-100',
  emerald: 'from-emerald-500/30 to-emerald-500/5 text-emerald-100',
};

export const LiveStatBadge = ({ label, value, trend, tone = 'cyan' }: LiveStatBadgeProps) => (
  <div className={cn('rounded-xl border border-white/10 bg-gradient-to-br p-4', toneMap[tone])}>
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-80">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {label}
    </div>
    <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
    {trend && <div className="mt-1 text-xs opacity-70">{trend}</div>}
  </div>
);
