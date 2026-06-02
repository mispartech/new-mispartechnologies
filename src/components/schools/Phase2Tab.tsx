import { Construction } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface Phase2TabProps {
  title: string;
  description?: string;
}

export const Phase2Tab = ({ title, description }: Phase2TabProps) => (
  <GlassCard className="mt-4">
    <div className="flex items-start gap-4">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-400/10 text-amber-300">
        <Construction className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-widest text-amber-300">Phase 2</div>
        <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-400">
          {description ?? 'This area is part of the post-MVP roadmap. The current MVP focuses on staff and student attendance — this tab will activate in Phase 2.'}
        </p>
      </div>
    </div>
  </GlassCard>
);
