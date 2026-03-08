import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';

interface GlassStatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: string;
  iconGradient?: string;
  className?: string;
  animateValue?: boolean;
}

const GlassStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'from-primary/10 via-primary/5 to-transparent',
  iconGradient = 'from-primary to-accent',
  className,
  animateValue = true,
}: GlassStatCardProps) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const isNumeric = typeof value === 'number';
  const { count, ref } = useCountUp(numericValue, 1200, true);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 p-5",
        "backdrop-blur-sm bg-card/80",
        "transition-all duration-500 ease-out",
        "hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1",
        className
      )}
    >
      {/* Glass gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", gradient)} />
      
      {/* Shimmer on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
            {title}
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums tracking-tight">
            {isNumeric && animateValue ? count : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70 font-medium">{subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br shadow-lg transition-all duration-300",
            "group-hover:scale-110 group-hover:shadow-xl",
            iconGradient
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default GlassStatCard;
