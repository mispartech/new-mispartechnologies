import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard = ({ children, className, glow = false }: GlassCardProps) => (
  <div
    className={cn(
      'relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_8px_32px_-12px_rgba(8,18,40,0.6)]',
      glow && 'before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-br before:from-cyan-400/20 before:to-blue-600/20 before:blur-xl',
      className,
    )}
  >
    {children}
  </div>
);
