import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Users, Activity, UserCheck, UserX, AlertTriangle,
  ScanFace, ShieldCheck, Calendar, Sparkles, ArrowRight, Radio,
} from 'lucide-react';
import {
  SchoolsCard, StatCard, SectionHeader, MetricRing, ProgressBar, Badge, EmptyState, SchoolsButton, Avatar,
} from '@/components/schools/ui/SchoolsUI';
import { AttendanceTrendChart } from '@/components/schools/AttendanceTrendChart';
import { attendanceApi, type RiskStudent } from '@/lib/api/schools/attendance';
import { overviewApi, type SchoolsOverview } from '@/lib/api/schools/overview';
import { useSchoolsRealtime } from '@/hooks/useSchoolsRealtime';

const SchoolsDashboard = () => {
  const [risk, setRisk] = useState<RiskStudent[]>([]);
  const [overview, setOverview] = useState<SchoolsOverview | null>(null);

  const reload = () => {
    attendanceApi.risk().then(setRisk).catch(() => {});
    overviewApi.get().then(setOverview).catch(() => {});
  };

  useEffect(() => { reload(); }, []);
  useSchoolsRealtime('overview', { onMessage: () => reload() });


  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const trend30 = Array.from({ length: 14 }).map((_, i) => ({
    date: `D${i + 1}`,
    rate: Math.round(82 + Math.sin(i / 2) * 9 + (i % 5 === 0 ? -6 : 0)),
  }));

  const departments = [
    { name: 'JSS1', present: 118, expected: 124 },
    { name: 'JSS2', present: 132, expected: 140 },
    { name: 'JSS3', present: 121, expected: 135 },
    { name: 'SS1 Sciences', present: 88, expected: 92 },
    { name: 'SS2 Sciences', present: 95, expected: 102 },
    { name: 'SS3 Arts', present: 71, expected: 78 },
  ];

  const events = [
    { date: 'Dec 3', title: 'PTA Meeting — SS3 cohort', tone: 'primary' as const },
    { date: 'Dec 7', title: 'Inter-house Sports Day', tone: 'accent' as const },
    { date: 'Dec 12', title: 'Mid-term Examinations begin', tone: 'warning' as const },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-8 space-y-8 s-fade-up">
      {/* Welcome */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--s-accent))]">
            School Command Center
          </div>
          <h1 className="mt-1 font-display text-3xl lg:text-4xl font-bold tracking-tight text-[hsl(var(--s-primary-ink))]">
            {greeting}, Principal Adekunle
          </h1>
          <p className="mt-1.5 text-sm text-[hsl(var(--s-text-muted))]">
            Greenfield Academy · {today}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--s-accent)/0.12)] px-2.5 py-1 font-medium text-[hsl(var(--s-accent))]">
            <Radio className="h-3 w-3 s-pulse-dot" /> Live
          </span>
          <Link to="/schools/dashboard/attendance/admin">
            <SchoolsButton size="sm" variant="primary">
              Attendance Admin <ArrowRight className="h-3.5 w-3.5" />
            </SchoolsButton>
          </Link>
        </div>
      </header>

      {/* Stat grid */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        <StatCard label="Students Present" value="1,284" delta={2.1} deltaLabel="vs yesterday" icon={GraduationCap} tone="primary" />
        <StatCard label="Students Absent" value="136" delta={-1.4} deltaLabel="vs yesterday" icon={UserX} tone="danger" />
        <StatCard label="Staff Present" value="92" delta={0.6} icon={Users} tone="accent" />
        <StatCard label="Staff Absent" value="6" delta={-0.3} icon={UserX} tone="warning" />
        <StatCard label="Visitors Today" value="11" icon={UserCheck} tone="info" />
        <StatCard label="Attendance Rate" value="90.4%" delta={1.2} icon={Activity} tone="accent" />
      </section>

      {/* Health + Trends */}
      <section className="grid gap-6 lg:grid-cols-3">
        <SchoolsCard className="lg:col-span-1">
          <SectionHeader
            eyebrow="Campus Health"
            title="Today's score"
            description="Composite of attendance, security, staff presence and engagement."
          />
          <div className="flex flex-col items-center gap-4 py-2">
            <MetricRing value={87} label="of 100" tone="accent" size={160} />
            <div className="w-full space-y-2 text-xs">
              {[
                { label: 'Attendance', v: 90, tone: 'accent' as const },
                { label: 'Security', v: 96, tone: 'primary' as const },
                { label: 'Staff Presence', v: 94, tone: 'accent' as const },
                { label: 'Engagement', v: 72, tone: 'warning' as const },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[hsl(var(--s-text-muted))]">{s.label}</span>
                    <span className="font-medium tabular-nums text-[hsl(var(--s-text))]">{s.v}</span>
                  </div>
                  <ProgressBar value={s.v} tone={s.tone} />
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] p-3 text-xs text-[hsl(var(--s-text-muted))]">
              <Sparkles className="inline h-3 w-3 mr-1 text-[hsl(var(--s-primary))]" />
              Campus is performing above term average. Engagement dipped — consider reviewing afternoon class schedules.
            </div>
          </div>
        </SchoolsCard>

        <SchoolsCard className="lg:col-span-2">
          <SectionHeader
            eyebrow="Attendance trends"
            title="Last 14 days"
            description="Daily attendance rate across the campus."
          />
          <AttendanceTrendChart data={trend30} height={240} />
        </SchoolsCard>
      </section>

      {/* At risk + Departments */}
      <section className="grid gap-6 lg:grid-cols-3">
        <SchoolsCard className="lg:col-span-2">
          <SectionHeader
            eyebrow="Intervention queue"
            title="At-risk students"
            description="AI-flagged students who need a counselor or parent touch-point."
            action={<Link to="/schools/dashboard/students" className="text-xs font-medium text-[hsl(var(--s-primary))] hover:underline">View all →</Link>}
          />
          {risk.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No at-risk students" description="Everyone is on track today." />
          ) : (
            <ul className="divide-y divide-[hsl(var(--s-border))]">
              {risk.map(r => (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <Avatar name={r.name} attendancePct={r.attendance_pct} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[hsl(var(--s-text))]">{r.name}</span>
                      <Badge tone="neutral">{r.class}</Badge>
                      <Badge tone={r.risk === 'critical' ? 'danger' : r.risk === 'high' ? 'warning' : 'info'}>
                        {r.risk}
                      </Badge>
                    </div>
                    <p className="text-xs text-[hsl(var(--s-text-muted))] mt-0.5 truncate">{r.ai_note}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-base font-semibold tabular-nums text-[hsl(var(--s-primary-ink))]">
                      {r.attendance_pct}%
                    </div>
                    <div className="text-[10px] text-[hsl(var(--s-text-subtle))]">attendance</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SchoolsCard>

        <SchoolsCard>
          <SectionHeader eyebrow="By department" title="Class performance" />
          <ul className="space-y-3">
            {departments.map(d => {
              const pct = Math.round((d.present / d.expected) * 100);
              const tone = pct >= 90 ? 'accent' : pct >= 80 ? 'primary' : 'warning';
              return (
                <li key={d.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[hsl(var(--s-text))]">{d.name}</span>
                    <span className="tabular-nums text-[hsl(var(--s-text-muted))]">
                      {d.present}<span className="text-[hsl(var(--s-text-subtle))]">/{d.expected}</span>
                    </span>
                  </div>
                  <ProgressBar value={pct} tone={tone} />
                </li>
              );
            })}
          </ul>
        </SchoolsCard>
      </section>

      {/* Security snapshot + Events */}
      <section className="grid gap-6 lg:grid-cols-3">
        <SchoolsCard className="lg:col-span-2">
          <SectionHeader
            eyebrow="Security snapshot"
            title="Campus is calm"
            action={<Link to="/schools/dashboard/security" className="text-xs font-medium text-[hsl(var(--s-primary))] hover:underline">Open security →</Link>}
          />
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Open alerts', value: '2', tone: 'warning' as const, icon: AlertTriangle },
              { label: 'Visitors on site', value: '11', tone: 'info' as const, icon: UserCheck },
              { label: 'Cameras online', value: '22 / 24', tone: 'accent' as const, icon: ShieldCheck },
              { label: 'Face match avg', value: '97.4%', tone: 'primary' as const, icon: ScanFace },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] p-3">
                <s.icon className="h-4 w-4" style={{ color: `hsl(var(--s-${s.tone === 'accent' ? 'accent' : s.tone === 'warning' ? 'warning' : s.tone === 'info' ? 'info' : 'primary'}))` }} />
                <div className="mt-2 font-display text-xl font-semibold tabular-nums text-[hsl(var(--s-primary-ink))]">{s.value}</div>
                <div className="text-[11px] text-[hsl(var(--s-text-muted))]">{s.label}</div>
              </div>
            ))}
          </div>
        </SchoolsCard>

        <SchoolsCard>
          <SectionHeader eyebrow="Upcoming" title="School events" />
          <ul className="space-y-2.5">
            {events.map(e => (
              <li key={e.title} className="flex items-start gap-3 rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[hsl(var(--s-surface))] border border-[hsl(var(--s-border))]">
                  <Calendar className="h-4 w-4 text-[hsl(var(--s-primary))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[hsl(var(--s-text))]">{e.title}</div>
                  <div className="text-[11px] text-[hsl(var(--s-text-subtle))]">{e.date}</div>
                </div>
              </li>
            ))}
          </ul>
        </SchoolsCard>
      </section>
    </div>
  );
};

export default SchoolsDashboard;
