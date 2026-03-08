import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberPageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

const MemberPageHeader = ({ icon: Icon, title, subtitle, actions, className }: MemberPageHeaderProps) => {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
            )}
            {title}
          </h1>
          {subtitle && <p className="text-sm text-muted-foreground ml-[46px] sm:ml-0">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      <div className="h-px bg-gradient-to-r from-primary/30 via-accent/15 to-transparent mt-4" />
    </div>
  );
};

export default MemberPageHeader;
