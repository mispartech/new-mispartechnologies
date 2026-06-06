import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Users, Activity, UserCheck, UserX, AlertTriangle,
  ScanFace, ShieldCheck, ArrowRight, Radio, Camera,
} from 'lucide-react';
import {
  SchoolsCard, StatCard, SectionHeader, MetricRing, ProgressBar, Badge, EmptyState, SchoolsButton, Avatar,
} from '@/components/schools/ui/SchoolsUI';
import { AttendanceTrendChart } from '@/components/schools/AttendanceTrendChart';
import { attendanceApi, type RiskStudent, type HeatmapCell } from '@/lib/api/schools/attendance';
import { overviewApi, type SchoolsOverview } from '@/lib/api/schools/overview';
import { securityApi, type SecurityKPIs } from '@/lib/api/schools/security';
import { useSchoolsRealtime } from '@/hooks/useSchoolsRealtime';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';

const SchoolsDashboard = () => {
  const { user } = useDjangoAuth();
  const [risk, setRisk] = useState<RiskStudent[]>([]);
  const [overview, setOverview] = useState<SchoolsOverview | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [security, setSecurity] = useState<SecurityKPIs | null>(null);

  const reload = () => {
    attendanceApi.risk().then(setRisk).catch(() => {});
    overviewApi.get().then(setOverview).catch(() => {});
    attendanceApi.heatmap().then(setHeatmap).catch(() => {});
    securityApi.kpis().then(setSecurity).catch(() => {});
  };

  useEffect(() => { reload(); }, []);
  useSchoolsRealtime('overview', { onMessage: () => reload() });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : '';
  const orgName = user?.organization_name || '';

  // Build daily trend by aggregating heatmap cells by day
  const trendByDay = (() => {
    if (!heatmap.length) return [] as { date: string; rate: number }[];
    const grouped = new Map<string, { sum: number; n: number }>();
    heatmap.forEach((c) => {
      const g = grouped.get(c.day) ?? { sum: 0, n: 0 };
      g.sum += Math.round((c.rate ?? 0) * 100);
      g.n += 1;
      grouped.set(c.day, g);
    });
    return Array.from(grouped.entries()).map(([date, v]) => ({ date, rate: v.n ? Math.round(v.sum / v.n) : 0 }));
  })();

  // Composite campus-health derived from live data only
  const att = overview?.attendance_today;
  const attTotal = att ? att.present + att.late + att.absent : 0;
  const attendanceScore = attTotal > 0 ? Math.round((att!.present / attTotal) * 100) : null;
  const securityScore = security && security.total_cameras > 0
    ? Math.round((security.active_cameras / security.total_cameras) * 100)
    : null;
  const compositeScores = [attendanceScore, securityScore].filter((v): v is number => v !== null);
  const compositeScore = compositeScores.length
    ? Math.round(compositeScores.reduce((a, b) => a + b, 0) / compositeScores.length)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-8 space-y-8 s-fade-up">
      {/* Welcome */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--s-accent))]">
            School Command Center
          </div>
          <h1 className="mt-1 font-display text-3xl lg:text-4xl font-bold tracking-tight text-[hsl(var(--s-primary-ink))]">
            {greeting}{displayName ? `, ${displayName}` : ''}
          </h1>
          <p className="mt-1.5 text-sm text-[hsl(var(--s-text-muted))]">
            {orgName ? `${orgName} · ` : ''}{today}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {overview?.realtime_connected && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--s-accent)/0.12)] px-2.5 py-1 font-medium text-[hsl(var(--s-accent))]">
              <Radio className="h-3 w-3 s-pulse-dot" /> Live
            </span>
          )}
          <Link to="/schools/dashboard/attendance/admin">
            <SchoolsButton size="sm" variant="primary">
              Attendance Admin <ArrowRight className="h-3.5 w-3.5" />
            </SchoolsButton>
          </Link>
        </div>
      </header>

      {/* Stat grid */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        <StatCard label="Present Today" value={overview ? overview.attendance_today.present.toLocaleString() : '—'} icon={GraduationCap} tone="primary" />
        <StatCard label="Late" value={overview?.attendance_today.late ?? '—'} icon={UserX} tone="warning" />
        <StatCard label="Absent" value={overview?.attendance_today.absent ?? '—'} icon={UserX} tone="danger" />
        <StatCard label="Enrolled Identities" value={overview ? overview.enrolled_identities.toLocaleString() : '—'} icon={Users} tone="accent" />
        <StatCard label="Active Sessions" value={overview?.active_sessions ?? '—'} icon={UserCheck} tone="info" />
        <StatCard label="At-Risk Students" value={overview?.at_risk_students ?? '—'} icon={AlertTriangle} tone="danger" />
      </section>

      {/* Health + Trends */}
      <section className="grid gap-6 lg:grid-cols-3">
        <SchoolsCard className="lg:col-span-1">
          <SectionHeader
            eyebrow="Campus Health"
            title="Today's score"
            description="Composite of attendance and security uptime."
          />
          {compositeScore === null ? (
            <EmptyState icon={Activity} title="No score yet" description="Awaiting live data from the backend." />
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <MetricRing value={compositeScore} label="of 100" tone="accent" size={160} />
              <div className="w-full space-y-2 text-xs">
                {attendanceScore !== null && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[hsl(var(--s-text-muted))]">Attendance</span>
                      <span className="font-medium tabular-nums text-[hsl(var(--s-text))]">{attendanceScore}</span>
                    </div>
                    <ProgressBar value={attendanceScore} tone="accent" />
                  </div>
                )}
                {securityScore !== null && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[hsl(var(--s-text-muted))]">Security uptime</span>
                      <span className="font-medium tabular-nums text-[hsl(var(--s-text))]">{securityScore}</span>
                    </div>
                    <ProgressBar value={securityScore} tone="primary" />
                  </div>
                )}
              </div>
            </div>
          )}
        </SchoolsCard>

        <SchoolsCard className="lg:col-span-2">
          <SectionHeader
            eyebrow="Attendance trends"
            title="Recent days"
            description="Daily attendance rate aggregated from the live heatmap."
          />
          {trendByDay.length === 0 ? (
            <EmptyState icon={Activity} title="No trend data" description="No attendance history available yet." />
          ) : (
            <AttendanceTrendChart data={trendByDay} height={240} />
          )}
        </SchoolsCard>
      </section>

      {/* At risk */}
      <SchoolsCard>
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

      {/* Security snapshot */}
      <SchoolsCard>
        <SectionHeader
          eyebrow="Security snapshot"
          title="Live operations"
          action={<Link to="/schools/dashboard/security" className="text-xs font-medium text-[hsl(var(--s-primary))] hover:underline">Open security →</Link>}
        />
        {!security ? (
          <EmptyState icon={ShieldCheck} title="Security feed unavailable" description="The security KPI endpoint is not reachable yet." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-4">
            <SnapshotTile icon={AlertTriangle} label="Open incidents" value={security.open_incidents} tone="warning" />
            <SnapshotTile icon={UserCheck} label="Visitors on site" value={security.visitors_on_premises} tone="info" />
            <SnapshotTile icon={Camera} label="Cameras online" value={`${security.active_cameras} / ${security.total_cameras}`} tone="accent" />
            <SnapshotTile icon={ScanFace} label="Avg response" value={`${security.avg_response_minutes}m`} tone="primary" />
          </div>
        )}
      </SchoolsCard>
    </div>
  );
};

const SnapshotTile = ({ icon: Icon, label, value, tone }: { icon: any; label: string; value: any; tone: 'warning' | 'info' | 'accent' | 'primary' }) => (
  <div className="rounded-xl border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] p-3">
    <Icon className="h-4 w-4" style={{ color: `hsl(var(--s-${tone}))` }} />
    <div className="mt-2 font-display text-xl font-semibold tabular-nums text-[hsl(var(--s-primary-ink))]">{value}</div>
    <div className="text-[11px] text-[hsl(var(--s-text-muted))]">{label}</div>
  </div>
);

export default SchoolsDashboard;
