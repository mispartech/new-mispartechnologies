import { Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

interface AiInsightCalloutProps {
  title: string;
  children: ReactNode;
}

export const AiInsightCallout = ({ title, children }: AiInsightCalloutProps) => (
  <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-blue-950/60 via-slate-950/60 to-cyan-950/40 p-5">
    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-cyan-400/10 p-2 text-cyan-300">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-widest text-cyan-300/80">AI Insight</div>
        <div className="mt-1 text-sm font-semibold text-white">{title}</div>
        <div className="mt-2 text-sm text-slate-300/90">{children}</div>
      </div>
    </div>
  </div>
);
