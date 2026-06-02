import { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { AttendanceTrendChart } from './AttendanceTrendChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BellRing, CalendarDays, CheckCircle2, Clock, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { PersonAttendanceSummary, PersonAttendanceDay } from '@/lib/api/schools/students';

interface Props {
  personId: string;
  personName: string;
  fetcher: (id: string) => Promise<PersonAttendanceSummary | null>;
  onNotify?: () => Promise<{ ok: boolean }>;
  notifyLabel?: string;
}

const stateStyle: Record<PersonAttendanceDay['state'], string> = {
  on_time: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  present: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  late: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  very_late: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  absent: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  excused: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
};

export const PersonAttendanceTab = ({ personId, personName, fetcher, onNotify, notifyLabel }: Props) => {
  const [summary, setSummary] = useState<PersonAttendanceSummary | null>(null);

  useEffect(() => { fetcher(personId).then(setSummary); }, [personId, fetcher]);

  const exportCsv = () => {
    if (!summary) return;
    const rows = [
      ['date', 'state', 'first_seen', 'last_seen', 'mode', 'location', 'confidence'],
      ...summary.recent.map(r => [r.date, r.state, r.first_seen ?? '', r.last_seen ?? '', r.mode ?? '', r.location ?? '', String(r.confidence ?? '')]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${personName.replace(/\s+/g, '_')}_attendance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!summary) {
    return <GlassCard className="mt-4"><div className="text-white/50 text-sm">Loading attendance…</div></GlassCard>;
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard glow>
          <div className="text-xs text-white/50 uppercase tracking-wide">30-day attendance</div>
          <div className="text-3xl font-bold text-white mt-1">{summary.attendance_pct_30d}%</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-white/50 uppercase tracking-wide">90-day attendance</div>
          <div className="text-3xl font-bold text-cyan-300 mt-1">{summary.attendance_pct_90d}%</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-white/50 uppercase tracking-wide">Late (30d)</div>
          <div className="text-3xl font-bold text-amber-300 mt-1">{summary.late_count_30d}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-white/50 uppercase tracking-wide">Absent days (30d)</div>
          <div className="text-3xl font-bold text-rose-300 mt-1">{summary.absent_days_30d}</div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-white">
            <CalendarDays className="w-4 h-4 text-cyan-300" />
            <span className="font-semibold">30-day trend</span>
          </div>
          <div className="flex gap-2">
            {onNotify && (
              <Button size="sm" variant="outline" className="border-white/15 text-white/80 hover:bg-white/10"
                onClick={async () => { await onNotify(); toast({ title: notifyLabel ?? 'Notification sent', description: `Notice queued for ${personName}.` }); }}>
                <BellRing className="w-3.5 h-3.5 mr-1.5" /> {notifyLabel ?? 'Notify'}
              </Button>
            )}
            <Button size="sm" variant="outline" className="border-white/15 text-white/80 hover:bg-white/10" onClick={exportCsv}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
            </Button>
          </div>
        </div>
        <AttendanceTrendChart data={summary.trend_30d} />
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 text-white font-semibold text-sm">Recent days</div>
        <div className="divide-y divide-white/5">
          {summary.recent.map(r => (
            <div key={r.date} className="flex items-center justify-between p-4 hover:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="text-white text-sm font-medium w-24">{r.date}</div>
                <Badge className={`${stateStyle[r.state]} border capitalize`}>{r.state.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/60">
                {r.first_seen && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.first_seen} → {r.last_seen}</span>}
                {r.location && <span className="hidden md:inline">{r.location}</span>}
                {r.confidence && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-cyan-300" />{Math.round(r.confidence * 100)}%</span>}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
