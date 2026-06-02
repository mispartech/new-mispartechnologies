import { Radio } from 'lucide-react';

export interface FeedEvent {
  id: string;
  ts: string;
  label: string;
  meta?: string;
  tone?: 'ok' | 'warn' | 'alert';
}

interface RealtimeFeedProps {
  title?: string;
  events: FeedEvent[];
  emptyLabel?: string;
}

const toneDot: Record<NonNullable<FeedEvent['tone']>, string> = {
  ok: 'bg-emerald-400',
  warn: 'bg-amber-400',
  alert: 'bg-rose-400',
};

export const RealtimeFeed = ({ title = 'Live activity', events, emptyLabel = 'Waiting for live data…' }: RealtimeFeedProps) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Radio className="h-4 w-4 text-cyan-300" />
        {title}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-cyan-300/80">Realtime</span>
    </div>
    {events.length === 0 ? (
      <div className="py-8 text-center text-sm text-slate-400">{emptyLabel}</div>
    ) : (
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={e.id} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm">
            <span className={`mt-1.5 h-2 w-2 rounded-full ${toneDot[e.tone ?? 'ok']}`} />
            <div className="flex-1">
              <div className="text-slate-100">{e.label}</div>
              {e.meta && <div className="text-xs text-slate-400">{e.meta}</div>}
            </div>
            <span className="text-xs text-slate-500">{e.ts}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);
