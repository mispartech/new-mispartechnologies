import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MemberSkeletonProps {
  variant?: 'dashboard' | 'list' | 'detail' | 'stats';
  className?: string;
}

const MemberSkeleton = ({ variant = 'dashboard', className }: MemberSkeletonProps) => {
  if (variant === 'stats') {
    return (
      <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4", className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 p-5 space-y-3 bg-card/80">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border/50">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // dashboard variant
  return (
    <div className={cn("space-y-6", className)}>
      {/* Welcome banner skeleton */}
      <div className="rounded-2xl border border-border/30 p-6 bg-card/50">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-60" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 p-5 space-y-3 bg-card/80">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Focus strip skeleton */}
      <div className="rounded-2xl border border-border/50 p-4 bg-card/80">
        <div className="flex items-center gap-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Content area skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border/50 p-5 space-y-4 bg-card/80">
          <Skeleton className="h-5 w-40" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/50 p-5 space-y-4 bg-card/80">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <Skeleton className="h-5 w-32 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
          <div className="space-y-3 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSkeleton;
