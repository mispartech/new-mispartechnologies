import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionHref, onAction, className }: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onAction}
          {...(actionHref ? { asChild: true } : {})}
        >
          {actionHref ? <a href={actionHref}>{actionLabel}</a> : actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
