import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Full-page skeleton for the dashboard home */
export const DashboardHomeSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    {/* Welcome banner */}
    <Skeleton className="h-28 w-full rounded-2xl" />

    {/* Stats row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[120px] rounded-xl" />
      ))}
    </div>

    {/* Chart area */}
    <Skeleton className="h-72 rounded-xl" />

    {/* Two-column content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  </div>
);

/** Generic page skeleton with header + content blocks */
export const PageSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-64" />
    </div>
    <Skeleton className="h-px w-full" />
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

/** Stats card skeleton */
export const StatsCardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
  </div>
);
