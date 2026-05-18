import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, BellRing, CheckCircle2, Clock, DoorOpen, Filter, GraduationCap,
  MapPin, MonitorSmartphone, ScanFace, ShieldAlert, Smartphone, Sparkles, Tv2, Users, Zap,
} from 'lucide-react';
import { GlassCard } from '@/components/msse/GlassCard';
import { LiveStatBadge } from '@/components/msse/LiveStatBadge';
import { AiInsightCallout } from '@/components/msse/AiInsightCallout';
import { useMsseRealtime } from '@/hooks/useMsseRealtime';
import {
  attendanceApi, AttendanceEvent, AttendanceKPIs, AttendanceState, CaptureMode,
  HeatmapCell, LiveCaptureSession, RiskLevel, RiskStudent,
} from '@/lib/api/msse/attendance';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const modeIcon: Record<CaptureMode, any> = {
  gate: DoorOpen, classroom: GraduationCap, event: Tv2, mobile: Smartphone, kiosk: MonitorSmartphone,
};

const stateStyle: Record<AttendanceState, string> = {
  on_time:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  present:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  late:      'bg-amber-500/15 text-amber-300 border-amber-500/30',
  very_late: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  absent:    'bg-rose-500/15 text-rose-300 border-rose-500/30',
  excused:   'bg-sky-500/15 text-sky-300 border-sky-500/30',
};

const riskStyle: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  high: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  critical: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export default function MsseAttendance() {
  const { connected } = useMsseRealtime('attendance');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ScanFace className="w-8 h-8 text-cyan-400" />
            Smart Attendance
          </h1>
          <p className="text-white/60 mt-1">
            Real-time multi-mode attendance, AI lateness analysis, and absenteeism risk dashboards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LiveStatBadge label={connected ? 'Live channel' : 'Realtime pending'} value={connected ? 'ON' : 'IDLE'} tone={connected ? 'emerald' : 'cyan'} />
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
            <Zap className="w-4 h-4 mr-2" /> Start Capture Session
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard glow>
          <div className="text-xs text-white/50 uppercase tracking-wide">Present today</div>
          <div className="text-3xl font-bold text-white mt-1">{kpis?.present_today ?? '—'}</div>
          <div className="text-xs text-white/40 mt-1">of {kpis?.total_expected ?? '—'} expected</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-white/50 uppercase tracking-wide">On-time rate</div>
          <div className="text-3xl font-bold text-emerald-300 mt-1">{kpis ? Math.round(kpis.on_time_rate * 100) : '—'}%</div>
          <div className="text-xs text-white/40 mt-1">Late {kpis ? Math.round(kpis.late_rate * 100) : '—'}% · Absent {kpis ? Math.round(kpis.absent_rate * 100) : '—'}%</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-white/50 uppercase tracking-wide">At-risk students</div>
          <div className="text-3xl font-bold text-rose-300 mt-1">{kpis?.at_risk_students ?? '—'}</div>
          <div className="text-xs text-white/40 mt-1">Flagged by absenteeism AI</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-white/50 uppercase tracking-wide">Avg recognition</div>
          <div className="text-3xl font-bold text-cyan-300 mt-1">{kpis?.avg_recognition_ms ?? '—'}<span className="text-base text-white/40">ms</span></div>
          <div className="text-xs text-white/40 mt-1">{kpis?.active_sessions ?? 0} active sessions</div>
        </GlassCard>
      </div>

      <AiInsightCallout title="MSSE AI · Daily Insight">
        Lateness is concentrated on Mondays between 7:30–8:15 AM, primarily from students in the western catchment area. Consider a staggered first-period schedule or a transport advisory.
      </AiInsightCallout>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="live">Live Capture</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="risk">Absenteeism Risk</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>

        {/* LIVE CAPTURE */}
        <TabsContent value="live" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessions.map(s => {
              const Icon = modeIcon[s.mode];
              return (
                <GlassCard key={s.id} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-cyan-300" />
                      </div>
                      <div>
                        <div className="text-white font-semibold capitalize">{s.mode}</div>
                        <div className="text-xs text-white/50 flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</div>
                      </div>
                    </div>
                    <Badge className={s.active ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-white/40 border border-white/10'}>
                      {s.active ? 'LIVE' : 'IDLE'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-white/5 border border-white/10 p-2">
                      <div className="text-xs text-white/40">Recognized</div>
                      <div className="text-white font-semibold">{s.recognized_today}</div>
                    </div>
                    <div className="rounded-lg bg-white/5 border border-white/10 p-2">
                      <div className="text-xs text-white/40">Unique</div>
                      <div className="text-white font-semibold">{s.unique_faces}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-white/15 text-white/80 hover:bg-white/10">
                    Open Session
                  </Button>
                </GlassCard>
              );
            })}
          </div>
        </TabsContent>

        {/* EVENTS */}
        <TabsContent value="events" className="mt-4 space-y-3">
          <GlassCard>
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <div className="flex items-center gap-2 text-white/70 text-sm"><Filter className="w-4 h-4" /> Filters</div>
              <Input placeholder="Search name…" value={search} onChange={e => setSearch(e.target.value)} className="md:w-60 bg-white/5 border-white/10 text-white" />
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="md:w-40 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="visitor">Visitors</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger className="md:w-40 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="on_time">On time</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="very_late">Very late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </GlassCard>

          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-white/5">
              {filteredEvents.map(e => (
                <div key={e.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4 hover:bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-white/10 flex items-center justify-center text-white text-sm font-semibold">
                      {e.person_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{e.person_name}</div>
                      <div className="text-xs text-white/50">{e.class_or_dept} · {e.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-white/15 text-white/70 capitalize">{e.mode}</Badge>
                    <Badge className={`${stateStyle[e.state]} border capitalize`}>{e.state.replace('_', ' ')}</Badge>
                    <span className="text-xs text-white/40 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-cyan-300" />{Math.round(e.confidence * 100)}%</span>
                    <span className="text-xs text-white/40 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(e.ts).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <div className="p-10 text-center text-white/50 text-sm">No matching events.</div>
              )}
            </div>
          </GlassCard>
        </TabsContent>

        {/* RISK */}
        <TabsContent value="risk" className="mt-4 space-y-3">
          <GlassCard>
            <div className="flex items-center gap-2 text-white">
              <ShieldAlert className="w-5 h-5 text-rose-300" />
              <span className="font-semibold">Absenteeism Risk Dashboard</span>
              <span className="text-xs text-white/50 ml-2">AI-generated · refreshed nightly</span>
            </div>
          </GlassCard>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {risk.map(r => (
              <GlassCard key={r.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold flex items-center gap-2">
                      {r.name}
                      <Badge className={`${riskStyle[r.risk]} border capitalize`}>{r.risk}</Badge>
                    </div>
                    <div className="text-xs text-white/50">{r.class}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{r.attendance_pct}%</div>
                    <div className="text-[10px] text-white/40 uppercase">Attendance</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="rounded bg-white/5 border border-white/10 p-2">
                    <div className="text-white/40">Consecutive absences</div>
                    <div className="text-white font-semibold">{r.consecutive_absences}</div>
                  </div>
                  <div className="rounded bg-white/5 border border-white/10 p-2">
                    <div className="text-white/40">Late (30d)</div>
                    <div className="text-white font-semibold">{r.late_count_30d}</div>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-sm text-white/80 flex gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5" />
                  <span>{r.ai_note}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="border-white/15 text-white/80 hover:bg-white/10"
                    onClick={() => { attendanceApi.notifyParent(r.id); toast({ title: 'Parent notified', description: `${r.name}'s guardian will receive an SMS + email.` }); }}>
                    <BellRing className="w-3.5 h-3.5 mr-1.5" /> Notify Parent
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white/70 hover:bg-white/10">View Profile</Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </TabsContent>

        {/* HEATMAP */}
        <TabsContent value="heatmap" className="mt-4">
          <GlassCard>
            <div className="flex items-center gap-2 text-white mb-4">
              <Activity className="w-5 h-5 text-cyan-300" />
              <span className="font-semibold">Weekly Attendance Heatmap</span>
              <span className="text-xs text-white/50 ml-2">% present by period</span>
            </div>
            <div className="overflow-x-auto">
              <div className="inline-grid gap-1" style={{ gridTemplateColumns: `60px repeat(${periods.length}, minmax(60px, 1fr))` }}>
                <div />
                {periods.map(p => <div key={p} className="text-xs text-white/50 text-center pb-1">{p}</div>)}
                {days.map(d => (
                  <>
                    <div key={d} className="text-xs text-white/50 flex items-center">{d}</div>
                    {periods.map(p => {
                      const cell = heatmap.find(h => h.day === d && h.period === p);
                      const r = cell?.rate ?? 0;
                      const bg = `rgba(34, 211, 238, ${0.15 + r * 0.7})`;
                      return (
                        <div key={`${d}-${p}`} title={`${d} ${p}: ${Math.round(r * 100)}%`}
                          className="h-10 rounded-md border border-white/10 flex items-center justify-center text-xs text-white/90 font-medium"
                          style={{ backgroundColor: bg }}>
                          {Math.round(r * 100)}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 text-xs text-white/50">
              <span>Lower</span>
              <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-cyan-500/15 to-cyan-400" />
              <span>Higher</span>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <GlassCard>
              <div className="flex items-center gap-2 text-white"><AlertTriangle className="w-4 h-4 text-amber-300" /><span className="font-semibold">Worst slot</span></div>
              <div className="text-white/70 text-sm mt-2">Mon · P8 — sustained drop in last period attendance.</div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-2 text-white"><Users className="w-4 h-4 text-cyan-300" /><span className="font-semibold">Best class</span></div>
              <div className="text-white/70 text-sm mt-2">SS3 Science — 96% average across the week.</div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-2 text-white"><Sparkles className="w-4 h-4 text-cyan-300" /><span className="font-semibold">AI suggestion</span></div>
              <div className="text-white/70 text-sm mt-2">Move high-engagement subjects into P1–P3; reserve P7–P8 for practicals.</div>
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
