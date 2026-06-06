import { useEffect, useMemo, useState } from 'react';
import {
  Activity, Users, GraduationCap, UserCheck, Clock, AlertTriangle, Download,
  ScanFace, MapPin, Radio,
} from 'lucide-react';
import {
  SchoolsCard, StatCard, SectionHeader, Badge, TabBar, ProgressBar, EmptyState, SchoolsButton, Avatar,
} from '@/components/schools/ui/SchoolsUI';
import { AttendanceTrendChart } from '@/components/schools/AttendanceTrendChart';
import {
  attendanceApi, type AttendanceKPIs, type LiveCaptureSession, type AttendanceEvent, type RiskStudent, type HeatmapCell,
} from '@/lib/api/schools/attendance';

type Scope = 'all' | 'students' | 'staff' | 'visitors';

const SchoolsAttendanceAdmin = () => {
  const [scope, setScope] = useState<Scope>('all');
  const [kpis, setKpis] = useState<AttendanceKPIs | null>(null);
  const [sessions, setSessions] = useState<LiveCaptureSession[]>([]);
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [risk, setRisk] = useState<RiskStudent[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);

  useEffect(() => {
    attendanceApi.kpis().then(setKpis).catch(() => {});
    attendanceApi.sessions().then(setSessions).catch(() => {});
    attendanceApi.events().then(setEvents).catch(() => {});
    attendanceApi.risk().then(setRisk).catch(() => {});
    attendanceApi.heatmap().then(setHeatmap).catch(() => {});
  }, []);

  const filteredEvents = useMemo(() => {
    if (scope === 'all') return events;
    if (scope === 'students') return events.filter(e => e.person_role === 'student');
    if (scope === 'staff') return events.filter(e => e.person_role === 'staff');
    return events.filter(e => e.person_role === 'visitor');
  }, [events, scope]);

  const trend = useMemo(() => {
    if (!heatmap.length) return [] as { date: string; rate: number }[];
    const grouped = new Map<string, { sum: number; n: number }>();
    heatmap.forEach((c) => {
      const g = grouped.get(c.day) ?? { sum: 0, n: 0 };
      g.sum += Math.round((c.rate ?? 0) * 100);
      g.n += 1;
      grouped.set(c.day, g);
    });
    return Array.from(grouped.entries()).map(([date, v]) => ({ date, rate: v.n ? Math.round(v.sum / v.n) : 0 }));
  }, [heatmap]);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-8 space-y-6 s-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--s-accent))]">Attendance Operations</div>
          <h1 className="mt-1 font-display text-2xl lg:text-3xl font-bold text-[hsl(var(--s-primary-ink))]">
            Attendance Admin
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--s-text-muted))]">
            Live oversight of every check-in, capture point and at-risk learner.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="h-10 rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface))] px-3 text-sm text-[hsl(var(--s-text))]"
          />
          <SchoolsButton variant="outline" size="md"><Download className="h-4 w-4" /> Export CSV</SchoolsButton>
        </div>
      </div>

      {/* Scope tabs */}
      <TabBar<Scope>
        value={scope}
        onChange={setScope}
        tabs={[
          { value: 'all', label: 'All', count: events.length },
          { value: 'students', label: 'Students', count: events.filter(e => e.person_role === 'student').length },
          { value: 'staff', label: 'Staff', count: events.filter(e => e.person_role === 'staff').length },
          { value: 'visitors', label: 'Visitors', count: events.filter(e => e.person_role === 'visitor').length },
        ]}
      />

      {/* KPIs */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard label="Present today" value={kpis?.present_today.toLocaleString() ?? '—'} icon={UserCheck} tone="accent" delta={2.4} />
        <StatCard label="Expected" value={kpis?.total_expected.toLocaleString() ?? '—'} icon={Users} tone="primary" />
        <StatCard label="On-time rate" value={kpis ? `${Math.round(kpis.on_time_rate * 100)}%` : '—'} icon={Clock} tone="accent" delta={0.8} />
        <StatCard label="Late rate" value={kpis ? `${Math.round(kpis.late_rate * 100)}%` : '—'} icon={Clock} tone="warning" delta={-1.1} />
        <StatCard label="At-risk students" value={kpis?.at_risk_students ?? '—'} icon={AlertTriangle} tone="danger" />
      </section>

      {/* Trends + Live capture board */}
      <section className="grid gap-6 lg:grid-cols-3">
        <SchoolsCard className="lg:col-span-2">
          <SectionHeader
            eyebrow="Last 14 days"
            title="Attendance trend"
            description="Daily rate across the entire campus."
          />
          <AttendanceTrendChart data={trend14} height={260} />
        </SchoolsCard>

        <SchoolsCard>
          <SectionHeader
            eyebrow="Capture points"
            title="Live board"
            action={<span className="inline-flex items-center gap-1.5 text-[11px] text-[hsl(var(--s-accent))]"><Radio className="h-3 w-3 s-pulse-dot" /> live</span>}
          />
          <ul className="space-y-2.5">
            {sessions.map(s => (
              <li key={s.id} className="rounded-xl border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] p-3">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.active ? 'bg-[hsl(var(--s-accent))] s-pulse-dot' : 'bg-[hsl(var(--s-text-subtle))]'}`} />
                  <span className="text-sm font-medium text-[hsl(var(--s-text))]">{s.location}</span>
                  <Badge tone="subtle" className="ml-auto">{s.mode}</Badge>
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5 text-xs">
                  <span className="font-display text-lg font-semibold tabular-nums text-[hsl(var(--s-primary-ink))]">
                    {s.recognized_today}
                  </span>
                  <span className="text-[hsl(var(--s-text-muted))]">recognized</span>
                  <span className="ml-auto text-[hsl(var(--s-text-subtle))]">{s.unique_faces} unique</span>
                </div>
              </li>
            ))}
          </ul>
        </SchoolsCard>
      </section>

      {/* At-risk panel */}
      <SchoolsCard>
        <SectionHeader
          eyebrow="Chronic absenteeism"
          title="At-risk learners"
          description="Students whose pattern requires counselor or parent intervention."
        />
        {risk.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No at-risk learners flagged" />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[hsl(var(--s-text-subtle))]">
                  <th className="px-5 py-2 font-medium">Student</th>
                  <th className="px-5 py-2 font-medium">Class</th>
                  <th className="px-5 py-2 font-medium">Attendance</th>
                  <th className="px-5 py-2 font-medium">Late (30d)</th>
                  <th className="px-5 py-2 font-medium">Risk</th>
                  <th className="px-5 py-2 font-medium">AI note</th>
                </tr>
              </thead>
              <tbody>
                {risk.map(r => (
                  <tr key={r.id} className="border-t border-[hsl(var(--s-border))] hover:bg-[hsl(var(--s-surface-2))]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.name} attendancePct={r.attendance_pct} size={32} />
                        <span className="font-medium text-[hsl(var(--s-text))]">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[hsl(var(--s-text-muted))]">{r.class}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-medium text-[hsl(var(--s-text))]">{r.attendance_pct}%</span>
                        <div className="w-16"><ProgressBar value={r.attendance_pct} tone={r.attendance_pct >= 75 ? 'primary' : 'danger'} height={4} /></div>
                      </div>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-[hsl(var(--s-text-muted))]">{r.late_count_30d}</td>
                    <td className="px-5 py-3">
                      <Badge tone={r.risk === 'critical' ? 'danger' : r.risk === 'high' ? 'warning' : 'info'}>{r.risk}</Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-[hsl(var(--s-text-muted))] max-w-md">{r.ai_note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SchoolsCard>

      {/* Recent captures */}
      <SchoolsCard>
        <SectionHeader
          eyebrow="Activity"
          title="Recent captures"
          description={`${filteredEvents.length} most recent events`}
        />
        {filteredEvents.length === 0 ? (
          <EmptyState icon={Activity} title="No captures yet" />
        ) : (
          <ul className="space-y-2">
            {filteredEvents.map(e => {
              const stateTone = e.state === 'on_time' || e.state === 'present' ? 'accent'
                : e.state === 'late' ? 'warning' : e.state === 'very_late' ? 'danger' : 'subtle';
              const RoleIcon = e.person_role === 'student' ? GraduationCap : e.person_role === 'staff' ? Users : UserCheck;
              return (
                <li key={e.id} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-[hsl(var(--s-surface))] text-[hsl(var(--s-primary))]">
                    <ScanFace className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-[hsl(var(--s-text))]">{e.person_name}</span>
                      <Badge tone="subtle"><RoleIcon className="h-3 w-3" /> {e.person_role}</Badge>
                      <span className="text-xs text-[hsl(var(--s-text-muted))]">· {e.class_or_dept}</span>
                    </div>
                    <div className="mt-0.5 inline-flex items-center gap-2 text-[11px] text-[hsl(var(--s-text-subtle))]">
                      <MapPin className="h-3 w-3" /> {e.location} · {Math.round(e.confidence * 100)}% match
                    </div>
                  </div>
                  <Badge tone={stateTone as any}>{e.state.replace('_', ' ')}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </SchoolsCard>
    </div>
  );
};

export default SchoolsAttendanceAdmin;
