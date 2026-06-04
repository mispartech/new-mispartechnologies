import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, BellRing, CheckCircle2, Clock, DoorOpen, Filter, GraduationCap,
  MapPin, MonitorSmartphone, ScanFace, ShieldAlert, Smartphone, Sparkles, Tv2, Users, Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  SchoolsCard, StatCard, Badge, SchoolsButton, TabBar, EmptyState, SectionHeader, Avatar,
} from '@/components/schools/ui/SchoolsUI';
import { useSchoolsRealtime } from '@/hooks/useSchoolsRealtime';
import {
  attendanceApi, AttendanceEvent, AttendanceKPIs, AttendanceState, CaptureMode,
  HeatmapCell, LiveCaptureSession, RiskLevel, RiskStudent,
} from '@/lib/api/schools/attendance';
import { toast } from '@/hooks/use-toast';

const modeIcon: Record<CaptureMode, LucideIcon> = {
  gate: DoorOpen, classroom: GraduationCap, event: Tv2, mobile: Smartphone, kiosk: MonitorSmartphone,
};

const stateTone: Record<AttendanceState, 'accent' | 'warning' | 'danger' | 'info'> = {
  on_time: 'accent', present: 'accent', late: 'warning', very_late: 'warning', absent: 'danger', excused: 'info',
};

const riskTone: Record<RiskLevel, 'accent' | 'warning' | 'danger'> = {
  low: 'accent', medium: 'warning', high: 'danger', critical: 'danger',
};

type Tab = 'live' | 'events' | 'risk' | 'heatmap';

export default function SchoolsAttendance() {
  const { connected } = useSchoolsRealtime('attendance');
  const [tab, setTab] = useState<Tab>('live');
  const [kpis, setKpis] = useState<AttendanceKPIs | null>(null);
  const [sessions, setSessions] = useState<LiveCaptureSession[]>([]);
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [risk, setRisk] = useState<RiskStudent[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      attendanceApi.kpis(), attendanceApi.sessions(), attendanceApi.events(),
      attendanceApi.risk(), attendanceApi.heatmap(),
    ]).then(([k, s, e, r, h]) => { setKpis(k); setSessions(s); setEvents(e); setRisk(r); setHeatmap(h); });
  }, []);

  const filteredEvents = useMemo(() => events.filter(e =>
    (filterRole === 'all' || e.person_role === filterRole) &&
    (filterState === 'all' || e.state === filterState) &&
    (!search || e.person_name.toLowerCase().includes(search.toLowerCase()))
  ), [events, filterRole, filterState, search]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-8 space-y-6 s-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--s-accent))]">Live Operations</div>
          <h1 className="mt-1 font-display text-2xl lg:text-3xl font-bold text-[hsl(var(--s-primary-ink))] flex items-center gap-2">
            <ScanFace className="h-7 w-7 text-[hsl(var(--s-primary))]" />
            Smart Attendance
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--s-text-muted))] max-w-2xl">
            Real-time multi-mode attendance with AI lateness analysis and absenteeism risk dashboards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={connected ? 'accent' : 'warning'}>
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-[hsl(var(--s-accent))]' : 'bg-[hsl(var(--s-warning))]'} s-pulse-dot`} />
            {connected ? 'Realtime live' : 'Realtime pending'}
          </Badge>
          <SchoolsButton variant="primary">
            <Zap className="h-4 w-4" /> Start Capture Session
          </SchoolsButton>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Present today" value={kpis?.present_today ?? '—'} icon={Users} tone="primary"
          deltaLabel={`of ${kpis?.total_expected ?? '—'} expected`}
        />
        <StatCard
          label="On-time rate" value={`${kpis ? Math.round(kpis.on_time_rate * 100) : '—'}%`} icon={Clock} tone="accent"
          deltaLabel={`Late ${kpis ? Math.round(kpis.late_rate * 100) : '—'}% · Absent ${kpis ? Math.round(kpis.absent_rate * 100) : '—'}%`}
        />
        <StatCard
          label="At-risk students" value={kpis?.at_risk_students ?? '—'} icon={AlertTriangle} tone="danger"
          deltaLabel="Flagged by absenteeism AI"
        />
        <StatCard
          label="Avg recognition" value={<><span className="tabular-nums">{kpis?.avg_recognition_ms ?? '—'}</span><span className="text-base text-[hsl(var(--s-text-muted))]">ms</span></>}
          icon={ScanFace} tone="info" deltaLabel={`${kpis?.active_sessions ?? 0} active sessions`}
        />
      </div>

      {/* AI insight */}
      <SchoolsCard className="border-l-4 border-l-[hsl(var(--s-primary))]">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--s-primary)/0.1)] text-[hsl(var(--s-primary))]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--s-primary))]">AI insight</div>
            <div className="font-display text-sm font-semibold text-[hsl(var(--s-primary-ink))]">Schools AI · Daily insight</div>
            <p className="mt-1 text-sm text-[hsl(var(--s-text-muted))]">
              Lateness is concentrated on Mondays between 7:30–8:15 AM, primarily from students in the western catchment area.
              Consider a staggered first-period schedule or a transport advisory.
            </p>
          </div>
        </div>
      </SchoolsCard>

      {/* Tabs */}
      <TabBar<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'live', label: 'Live Capture', count: sessions.length },
          { value: 'events', label: 'Events', count: events.length },
          { value: 'risk', label: 'Absenteeism Risk', count: risk.length },
          { value: 'heatmap', label: 'Heatmap' },
        ]}
      />

      {/* LIVE CAPTURE */}
      {tab === 'live' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sessions.map(s => {
            const Icon = modeIcon[s.mode];
            return (
              <SchoolsCard key={s.id} interactive className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--s-primary)/0.1)] text-[hsl(var(--s-primary))]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-semibold text-[hsl(var(--s-primary-ink))] capitalize">{s.mode}</div>
                      <div className="text-xs text-[hsl(var(--s-text-muted))] flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</div>
                    </div>
                  </div>
                  <Badge tone={s.active ? 'accent' : 'neutral'}>
                    {s.active && <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--s-accent))] s-pulse-dot" />}
                    {s.active ? 'LIVE' : 'IDLE'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-[hsl(var(--s-surface-2))] p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--s-text-subtle))]">Recognized</div>
                    <div className="font-display font-semibold text-[hsl(var(--s-primary-ink))] tabular-nums">{s.recognized_today}</div>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--s-surface-2))] p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--s-text-subtle))]">Unique</div>
                    <div className="font-display font-semibold text-[hsl(var(--s-primary-ink))] tabular-nums">{s.unique_faces}</div>
                  </div>
                </div>
                <SchoolsButton variant="outline" size="sm">Open session</SchoolsButton>
              </SchoolsCard>
            );
          })}
          {sessions.length === 0 && (
            <SchoolsCard className="md:col-span-2 lg:col-span-3">
              <EmptyState icon={ScanFace} title="No capture sessions yet" description="Start a session from a gate, classroom, kiosk, or mobile device." />
            </SchoolsCard>
          )}
        </div>
      )}

      {/* EVENTS */}
      {tab === 'events' && (
        <div className="space-y-3">
          <SchoolsCard>
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--s-text-muted))]">
                <Filter className="h-4 w-4" /> Filters
              </div>
              <input
                placeholder="Search by name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 md:w-60 rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] px-3 text-sm text-[hsl(var(--s-text))] placeholder:text-[hsl(var(--s-text-subtle))] focus:outline-none focus:border-[hsl(var(--s-primary))]"
              />
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="h-9 md:w-40 rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] px-2 text-sm text-[hsl(var(--s-text))]"
              >
                <option value="all">All roles</option>
                <option value="student">Students</option>
                <option value="staff">Staff</option>
                <option value="visitor">Visitors</option>
              </select>
              <select
                value={filterState}
                onChange={e => setFilterState(e.target.value)}
                className="h-9 md:w-40 rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] px-2 text-sm text-[hsl(var(--s-text))]"
              >
                <option value="all">All states</option>
                <option value="on_time">On time</option>
                <option value="late">Late</option>
                <option value="very_late">Very late</option>
                <option value="absent">Absent</option>
                <option value="excused">Excused</option>
              </select>
            </div>
          </SchoolsCard>

          <SchoolsCard padded={false}>
            <div className="divide-y divide-[hsl(var(--s-border))]">
              {filteredEvents.map(e => (
                <div key={e.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4 hover:bg-[hsl(var(--s-surface-2))]">
                  <div className="flex items-center gap-3">
                    <Avatar name={e.person_name} size={36} />
                    <div>
                      <div className="text-sm font-semibold text-[hsl(var(--s-primary-ink))]">{e.person_name}</div>
                      <div className="text-xs text-[hsl(var(--s-text-muted))]">{e.class_or_dept} · {e.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="neutral"><span className="capitalize">{e.mode}</span></Badge>
                    <Badge tone={stateTone[e.state]}><span className="capitalize">{e.state.replace('_', ' ')}</span></Badge>
                    <span className="text-xs text-[hsl(var(--s-text-muted))] flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-[hsl(var(--s-accent))]" />{Math.round(e.confidence * 100)}%
                    </span>
                    <span className="text-xs text-[hsl(var(--s-text-muted))] flex items-center gap-1">
                      <Clock className="h-3 w-3" />{new Date(e.ts).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <EmptyState icon={Filter} title="No matching events" description="Try adjusting your filters." />
              )}
            </div>
          </SchoolsCard>
        </div>
      )}

      {/* RISK */}
      {tab === 'risk' && (
        <div className="space-y-3">
          <SchoolsCard>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[hsl(var(--s-danger))]" />
              <span className="font-display font-semibold text-[hsl(var(--s-primary-ink))]">Absenteeism Risk Dashboard</span>
              <Badge tone="info" className="ml-2">AI · refreshed nightly</Badge>
            </div>
          </SchoolsCard>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {risk.map(r => (
              <SchoolsCard key={r.id} interactive>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.name} attendancePct={r.attendance_pct} />
                    <div>
                      <div className="font-display text-sm font-semibold text-[hsl(var(--s-primary-ink))] flex items-center gap-2">
                        {r.name}
                        <Badge tone={riskTone[r.risk]}><span className="capitalize">{r.risk}</span></Badge>
                      </div>
                      <div className="text-xs text-[hsl(var(--s-text-muted))]">{r.class}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold tabular-nums text-[hsl(var(--s-primary-ink))]">{r.attendance_pct}%</div>
                    <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--s-text-subtle))]">Attendance</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="rounded-lg bg-[hsl(var(--s-surface-2))] p-2.5">
                    <div className="text-[hsl(var(--s-text-subtle))]">Consecutive absences</div>
                    <div className="font-display font-semibold text-[hsl(var(--s-primary-ink))] tabular-nums">{r.consecutive_absences}</div>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--s-surface-2))] p-2.5">
                    <div className="text-[hsl(var(--s-text-subtle))]">Late (30d)</div>
                    <div className="font-display font-semibold text-[hsl(var(--s-primary-ink))] tabular-nums">{r.late_count_30d}</div>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-[hsl(var(--s-primary)/0.06)] border border-[hsl(var(--s-primary)/0.18)] text-sm text-[hsl(var(--s-text))] flex gap-2">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--s-primary))] shrink-0 mt-0.5" />
                  <span>{r.ai_note}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <SchoolsButton variant="outline" size="sm"
                    onClick={() => { attendanceApi.notifyParent(r.id); toast({ title: 'Parent notified', description: `${r.name}'s guardian will receive an SMS + email.` }); }}>
                    <BellRing className="h-3.5 w-3.5" /> Notify parent
                  </SchoolsButton>
                  <SchoolsButton variant="ghost" size="sm">View profile</SchoolsButton>
                </div>
              </SchoolsCard>
            ))}
            {risk.length === 0 && (
              <SchoolsCard className="lg:col-span-2">
                <EmptyState icon={ShieldAlert} title="No at-risk students" description="Absenteeism AI hasn't flagged any students this week." />
              </SchoolsCard>
            )}
          </div>
        </div>
      )}

      {/* HEATMAP */}
      {tab === 'heatmap' && (
        <div className="space-y-3">
          <SchoolsCard>
            <SectionHeader
              eyebrow="Weekly heatmap"
              title="Attendance by day & period"
              description="Percentage of students present per period across the week."
            />
            <div className="overflow-x-auto">
              <div className="inline-grid gap-1" style={{ gridTemplateColumns: `60px repeat(${periods.length}, minmax(60px, 1fr))` }}>
                <div />
                {periods.map(p => <div key={p} className="text-xs text-[hsl(var(--s-text-muted))] text-center pb-1">{p}</div>)}
                {days.map(d => (
                  <div key={d} className="contents">
                    <div className="text-xs text-[hsl(var(--s-text-muted))] flex items-center">{d}</div>
                    {periods.map(p => {
                      const cell = heatmap.find(h => h.day === d && h.period === p);
                      const r = cell?.rate ?? 0;
                      return (
                        <div key={`${d}-${p}`} title={`${d} ${p}: ${Math.round(r * 100)}%`}
                          className="h-10 rounded-md border border-[hsl(var(--s-border))] flex items-center justify-center text-xs font-medium tabular-nums"
                          style={{ backgroundColor: `hsl(var(--s-accent) / ${0.1 + r * 0.55})`, color: r > 0.5 ? 'white' : 'hsl(var(--s-text))' }}>
                          {Math.round(r * 100)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 text-xs text-[hsl(var(--s-text-muted))]">
              <span>Lower</span>
              <div className="h-2 flex-1 rounded-full" style={{ background: 'linear-gradient(to right, hsl(var(--s-accent) / 0.1), hsl(var(--s-accent)))' }} />
              <span>Higher</span>
            </div>
          </SchoolsCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SchoolsCard>
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[hsl(var(--s-warning))]" />
                <span className="font-display font-semibold text-[hsl(var(--s-primary-ink))]">Worst slot</span></div>
              <p className="text-sm text-[hsl(var(--s-text-muted))] mt-2">Mon · P8 — sustained drop in last period attendance.</p>
            </SchoolsCard>
            <SchoolsCard>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[hsl(var(--s-primary))]" />
                <span className="font-display font-semibold text-[hsl(var(--s-primary-ink))]">Best class</span></div>
              <p className="text-sm text-[hsl(var(--s-text-muted))] mt-2">SS3 Science — 96% average across the week.</p>
            </SchoolsCard>
            <SchoolsCard>
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[hsl(var(--s-primary))]" />
                <span className="font-display font-semibold text-[hsl(var(--s-primary-ink))]">AI suggestion</span></div>
              <p className="text-sm text-[hsl(var(--s-text-muted))] mt-2">Move high-engagement subjects into P1–P3; reserve P7–P8 for practicals.</p>
            </SchoolsCard>
          </div>
        </div>
      )}
    </div>
  );
}
