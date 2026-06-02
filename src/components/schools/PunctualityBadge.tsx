import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PunctualityBadgeProps {
  pct: number; // 0..100
  className?: string;
}

export const PunctualityBadge = ({ pct, className }: PunctualityBadgeProps) => {
  const tone =
    pct >= 90 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    : pct >= 75 ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    : 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  return <Badge className={cn('border capitalize', tone, className)}>{pct}% punctual</Badge>;
};
