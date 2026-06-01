import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, AlertTriangle, BellRing, Download, GraduationCap, ScanFace, ShieldCheck,
  Sparkles, Users, Zap,
} from 'lucide-react';
import { GlassCard } from '@/components/msse/GlassCard';
import { LiveStatBadge } from '@/components/msse/LiveStatBadge';
import { AiInsightCallout } from '@/components/msse/AiInsightCallout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMsseRealtime } from '@/hooks/useMsseRealtime';
import { attendanceApi } from '@/lib/api/msse/attendance';
import { studentsApi, type Student } from '@/lib/api/msse/students';
import { staffApi, type Staff } from '@/lib/api/msse/staff';
import { toast } from '@/hooks/use-toast';

type Scope = 'students' | 'staff';

const stateForToday = (i: number, late: number, absent: number): 'on_time' | 'late' | 'absent' => {
  if (i < absent) return 'absent';
  if (i < absent + late) return 'late';
  return 'on_time';
};

const stateStyle = {
  on_time: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  late: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  absent: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
} as const;

export default function MsseAttendanceAdmin() {
  const { connected } = useMsseRealtime('attendance');
  const { data: kpis } = useQuery({ queryKey: ['msse-att-kpis'], queryFn: () => attendanceApi.kpis() });
  const { data: students = [] } = useQuery({ queryKey: ['msse-students'], queryFn: () => studentsApi.list() });
  const { data: staff = [] } = useQuery({ queryKey: ['msse-staff'], queryFn: () => staffApi.list() });

  const [scope, setScope] = useState<Scope>('students');
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'on_time' | 'late' | 'absent'>('all');
  const [range, setRange] = useState('today');

  // synthesize today's roster state from 30d metrics (until backend lands)
  const studentRoster = useMemo(() => students.map((s, i) => ({
    id: s.id, name: s.full_name, group: s.class, enrolled: s.enrollment === 'enrolled',
    state: stateForToday(i, s.late_count_30d > 5 ? 1 : 0, s.attendance_pct_30d < 70 ? 1 : 0),
    firstSeen: '07:48', mode: 'gate' as const, location: 'Main Gate', confidence: 0.96,
    raw: s,
  })), [students]);

  const staffRoster = useMemo(() => staff.map((s, i) => ({
    id: s.id, name: s.full_name, group: `${s.role} · ${s.department}`, enrolled: s.enrollment === 'enrolled',
    state: stateForToday(i, s.punctuality_pct_30d < 80 ? 1 : 0, s.attendance_pct_30d < 70 ? 1 : 0),
    firstSeen: '07:42', mode: 'gate' as const, location: 'Staff Gate', confidence: 0.97,
    raw: s,
  })), [staff]);

  const roster = scope === 'students' ? studentRoster : staffRoster;
  const filtered = roster.filter(r =>
    (filterState === 'all' || r.state === filterState) &&
    (!search || r.name.toLowerCase().includes(search.toLowerCase()))
  );

  const studentSplit = useMemo(() => ({
    present: studentRoster.filter(r => r.state !== 'absent').length,
    late: studentRoster.filter(r => r.state === 'late').length,
    absent: studentRoster.filter(r => r.state === 'absent').length,
    total: studentRoster.length,
  }), [studentRoster]);

  const staffSplit = useMemo(() => ({
    present: staffRoster.filter(r => r.state !== 'absent').length,
    late: staffRoster.filter(r => r.state === 'late').length,
    absent: staffRoster.filter(r => r.state === 'absent').length,
    total: staffRoster.length,
  }), [staffRoster]);

  const studentExceptions = students.filter(s => s.risk === 'high' || s.risk === 'critical');
  const staffExceptions = staff.filter(s => s.punctuality_pct_30d < 75 || s.absent_days_30d > 3);

  const exportCsv = () => {
    const rows = [
      ['scope', 'name', 'group', 'state', 'first_seen', 'mode', 'location', 'confidence'],
      ...filtered.map(r => [scope, r.name, r.group, r.state, r.firstSeen, r.mode, r.location, String(r.confidence)]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `msse_attendance_${scope}_${range}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({ title: 'CSV exported', description: `${filtered.length} rows downloaded.` });
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-cyan-400" /> Attendance Admin Console
          </h1>
          <p className="text-white/60 mt-1">
            Unified oversight of staff and student attendance. MVP centerpiece for school administrators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LiveStatBadge label={connected ? 'Live channel' : 'Realtime pending'} value={connected ? 'ON' : 'IDLE'} tone={connected ? 'emerald' : 'cyan'} />
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" /> Export current view
          </Button>
        </div>
      </div>

      {/* KPI overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard glow>
          <div className="flex items-center gap-2 text-white mb-3"><GraduationCap className="w-5 h-5 text-cyan-300" /><span className="font-semibold">Students — today</span></div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="text-2xl font-bold text-emerald-300">{studentSplit.present - studentSplit.late}</div><div className="text-[10px] text-white/50 uppercase">On time</div></div>
            <div><div className="text-2xl font-bold text-amber-300">{studentSplit.late}</div><div className="text-[10px] text-white/50 uppercase">Late</div></div>
            <div><div className="text-2xl font-bold text-rose-300">{studentSplit.absent}</div><div className="text-[10px] text-white/50 uppercase">Absent</div></div>
          </div>
          <div className="text-xs text-white/40 mt-3 text-center">{studentSplit.present}/{studentSplit.total} present</div>
        </GlassCard>
        <GlassCard glow>
          <div className="flex items-center gap-2 text-white mb-3"><Users className="w-5 h-5 text-cyan-300" /><span className="font-semibold">Staff — today</span></div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="text-2xl font-bold text-emerald-300">{staffSplit.present - staffSplit.late}</div><div className="text-[10px] text-white/50 uppercase">On time</div></div>
            <div><div className="text-2xl font-bold text-amber-300">{staffSplit.late}</div><div className="text-[10px] text-white/50 uppercase">Late</div></div>
            <div><div className="text-2xl font-bold text-rose-300">{staffSplit.absent}</div><div className="text-[10px] text-white/50 uppercase">Absent</div></div>
          </div>
          <div className="text-xs text-white/40 mt-3 text-center">{staffSplit.present}/{staffSplit.total} present</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard>
          <div className="text-xs text-white/50 uppercase tracking-wide">Active capture sessions</div>
          <div className="text-3xl font-bold text-white mt-1">{kpis?.active_sessions ?? '—'}</div>
          <div className="text-xs text-white/40 mt-1 flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-300" />Gate · classroom · kiosk</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-white/50 uppercase tracking-wide">Avg recognition</div>
          <div className="text-3xl font-bold text-cyan-300 mt-1">{kpis?.avg_recognition_ms ?? '—'}<span className="text-base text-white/40">ms</span></div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-white/50 uppercase tracking-wide">Student exceptions</div>
          <div className="text-3xl font-bold text-rose-300 mt-1">{studentExceptions.length}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-white/50 uppercase tracking-wide">Staff exceptions</div>
          <div className="text-3xl font-bold text-rose-300 mt-1">{staffExceptions.length}</div>
        </GlassCard>
      </div>

      <AiInsightCallout title="Cross-population insight">
        Staff punctuality dropped 4% week-over-week, concentrated in Finance and Physics. Student lateness in JSS3 correlates with the same morning windows — investigate gate throughput between 7:30–8:00 AM.
      </AiInsightCallout>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="roster">Live roster</TabsTrigger>
          <TabsTrigger value="exceptions">Risk & exceptions</TabsTrigger>
          <TabsTrigger value="reports">Reports & export</TabsTrigger>
        </TabsList>

        {/* ROSTER */}
        <TabsContent value="roster" className="mt-4 space-y-3">
          <GlassCard>
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <Select value={scope} onValueChange={(v: Scope) => setScope(v)}>
                <SelectTrigger className="md:w-40 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Search name…" value={search} onChange={e => setSearch(e.target.value)} className="md:w-60 bg-white/5 border-white/10 text-white" />
              <Select value={filterState} onValueChange={(v: typeof filterState) => setFilterState(v)}>
                <SelectTrigger className="md:w-40 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="on_time">On time</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
              <div className="md:ml-auto text-xs text-white/50">{filtered.length} of {roster.length}</div>
            </div>
          </GlassCard>

          <GlassCard className="p-0 overflow-hidden">
            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead className="text-left text-white/50 text-xs uppercase tracking-wide">
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">{scope === 'students' ? 'Class' : 'Role / Dept'}</th>
                    <th className="px-5 py-3">Today</th>
                    <th className="px-5 py-3">First seen</th>
                    <th className="px-5 py-3">Mode</th>
                    <th className="px-5 py-3">Confidence</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 flex items-center justify-center text-white text-xs font-semibold ${r.enrolled ? 'border-emerald-400/60' : 'border-amber-400/60'}`}>
                            {r.name.charAt(0)}
                          </div>
                          <div className="text-white">{r.name}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-white/70">{r.group}</td>
                      <td className="px-5 py-3"><Badge className={`${stateStyle[r.state]} border capitalize`}>{r.state.replace('_', ' ')}</Badge></td>
                      <td className="px-5 py-3 text-white/70">{r.state === 'absent' ? '—' : r.firstSeen}</td>
                      <td className="px-5 py-3 text-white/70 capitalize">{r.mode} · {r.location}</td>
                      <td className="px-5 py-3 text-white/70">{Math.round(r.confidence * 100)}%</td>
                      <td className="px-5 py-3 text-right space-x-2">
                        <Button size="sm" variant="ghost" className="text-white/70 hover:bg-white/10"
                          onClick={() => toast({ title: 'Marked excused', description: `${r.name} flagged as excused.` })}>
                          Excuse
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/15 text-white/80 hover:bg-white/10"
                          onClick={async () => {
                            if (scope === 'students') await studentsApi.notifyParent(r.id);
                            else await staffApi.notifyManager(r.id);
                            toast({ title: scope === 'students' ? 'Parent notified' : 'Manager notified', description: r.name });
                          }}>
                          <BellRing className="w-3.5 h-3.5 mr-1.5" /> Notify
                        </Button>
                        <Link to={`/msse/dashboard/${scope}/${r.id}`}>
                          <Button size="sm" variant="ghost" className="text-cyan-300 hover:bg-white/10">Open</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-white/5">
              {filtered.map(r => (
                <div key={r.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 flex items-center justify-center text-white text-sm font-semibold ${r.enrolled ? 'border-emerald-400/60' : 'border-amber-400/60'}`}>
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{r.name}</div>
                        <div className="text-xs text-white/50">{r.group}</div>
                      </div>
                    </div>
                    <Badge className={`${stateStyle[r.state]} border capitalize`}>{r.state.replace('_', ' ')}</Badge>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Link to={`/msse/dashboard/${scope}/${r.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full border-white/15 text-white/80">Open profile</Button>
                    </Link>
                    <Button size="sm" variant="outline" className="border-white/15 text-white/80"
                      onClick={async () => {
                        if (scope === 'students') await studentsApi.notifyParent(r.id);
                        else await staffApi.notifyManager(r.id);
                        toast({ title: 'Notification sent', description: r.name });
                      }}>
                      <BellRing className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && <div className="p-10 text-center text-white/50 text-sm">No matching rows.</div>}
          </GlassCard>
        </TabsContent>

        {/* EXCEPTIONS */}
        <TabsContent value="exceptions" className="mt-4 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard>
              <div className="flex items-center gap-2 text-white mb-3">
                <AlertTriangle className="w-4 h-4 text-rose-300" /><span className="font-semibold">Student absenteeism risk</span>
              </div>
              <div className="space-y-2">
                {studentExceptions.map(s => (
                  <ExceptionRow key={s.id} name={s.full_name} sub={s.class} metric={`${s.attendance_pct_30d}%`}
                    badge={s.risk} tone={s.risk === 'critical' ? 'rose' : 'amber'}
                    note={`${s.late_count_30d} lates · ${s.absent_days_30d} absent days (30d)`}
                    href={`/msse/dashboard/students/${s.id}`}
                    onNotify={async () => { await studentsApi.notifyParent(s.id); toast({ title: 'Parent notified', description: s.full_name }); }}
                    notifyLabel="Notify parent" />
                ))}
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-2 text-white mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-300" /><span className="font-semibold">Staff punctuality offenders</span>
              </div>
              <div className="space-y-2">
                {staffExceptions.map(s => (
                  <ExceptionRow key={s.id} name={s.full_name} sub={`${s.role} · ${s.department}`} metric={`${s.punctuality_pct_30d}%`}
                    badge={s.punctuality_pct_30d < 70 ? 'critical' : 'high'} tone="amber"
                    note={`${s.late_count_30d} lates · ${s.absent_days_30d} absent days (30d)`}
                    href={`/msse/dashboard/staff/${s.id}`}
                    onNotify={async () => { await staffApi.notifyManager(s.id); toast({ title: 'Manager notified', description: s.full_name }); }}
                    notifyLabel="Notify manager" />
                ))}
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports" className="mt-4 space-y-3">
          <GlassCard>
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <div className="flex items-center gap-2 text-white"><Activity className="w-4 h-4 text-cyan-300" /><span className="font-semibold">Export attendance report</span></div>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="md:w-44 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="term">Current term</SelectItem>
                </SelectContent>
              </Select>
              <Select value={scope} onValueChange={(v: Scope) => setScope(v)}>
                <SelectTrigger className="md:w-44 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 md:ml-auto">
                <Button variant="outline" className="border-white/15 text-white/80 hover:bg-white/10" onClick={exportCsv}>
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
                  onClick={() => toast({ title: 'PDF export queued', description: 'Server-rendered PDF ships with backend.' })}>
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 text-white mb-2"><Sparkles className="w-4 h-4 text-cyan-300" /><span className="font-semibold">What's in the report</span></div>
            <ul className="text-sm text-white/70 list-disc pl-5 space-y-1">
              <li>Per-person daily state (on time / late / very late / absent / excused)</li>
              <li>Aggregate rates by class or department</li>
              <li>Capture mode breakdown and average recognition confidence</li>
              <li>Lateness/absenteeism flags and AI risk notes</li>
              <li>Signed PDF cover for principal sign-off (backend)</li>
            </ul>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExceptionRow({
  name, sub, metric, badge, tone, note, onNotify, notifyLabel, href,
}: {
  name: string; sub: string; metric: string; badge: string;
  tone: 'rose' | 'amber'; note: string; onNotify: () => Promise<void>;
  notifyLabel: string; href: string;
}) {
  const t = tone === 'rose' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
      <div className="min-w-0">
        <div className="text-white font-medium truncate">{name}</div>
        <div className="text-xs text-white/50 truncate">{sub} · {note}</div>
      </div>
      <div className="flex items-center gap-2 ml-3">
        <div className="text-right">
          <div className="text-white font-semibold">{metric}</div>
          <Badge className={`${t} border capitalize text-[10px]`}>{badge}</Badge>
        </div>
        <Button size="sm" variant="outline" className="border-white/15 text-white/80 hover:bg-white/10" onClick={onNotify}>
          <BellRing className="w-3.5 h-3.5 mr-1.5" />{notifyLabel}
        </Button>
        <Link to={href}><Button size="sm" variant="ghost" className="text-cyan-300 hover:bg-white/10">Open</Button></Link>
      </div>
    </div>
  );
}
