import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MotivationalEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  encouragement?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

const MotivationalEmptyState = ({
  icon: Icon,
  title,
  description,
  encouragement,
  actionLabel,
  onAction,
  actionHref,
  className,
}: MotivationalEmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      {/* Animated icon with glow ring */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl scale-150 animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-9 h-9 text-primary/70" />
        </div>
      </div>

      <h3 className="font-bold text-lg text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>

      {encouragement && (
        <p className="text-xs text-primary/70 font-medium mt-3 bg-primary/5 px-4 py-1.5 rounded-full">
          ✨ {encouragement}
        </p>
      )}

      {actionLabel && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 border-primary/20 hover:bg-primary/5"
          onClick={onAction}
          {...(actionHref ? { asChild: true } : {})}
        >
          {actionHref ? <a href={actionHref}>{actionLabel}</a> : actionLabel}
        </Button>
      )}
    </div>
  );
};

export default MotivationalEmptyState;
