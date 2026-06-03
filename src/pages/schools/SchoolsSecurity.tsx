import { useEffect, useState } from 'react';
import {
  ShieldCheck, AlertTriangle, Camera, Users, DoorOpen, Activity, Radio,
  Eye, EyeOff, CheckCircle2, MapPin,
} from 'lucide-react';
import {
  SchoolsCard, StatCard, SectionHeader, Badge, EmptyState, SchoolsButton, TabBar,
} from '@/components/schools/ui/SchoolsUI';
import {
  securityApi, type SecurityKPIs, type CameraFeed, type IncidentLog, type GateEvent, type WatchlistMatch,
} from '@/lib/api/schools/security';

type IncidentFilter = 'all' | 'open' | 'investigating' | 'resolved';

const SchoolsSecurity = () => {
  const [kpis, setKpis] = useState<SecurityKPIs | null>(null);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [incidents, setIncidents] = useState<IncidentLog[]>([]);
  const [gates, setGates] = useState<GateEvent[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistMatch[]>([]);
  const [incidentFilter, setIncidentFilter] = useState<IncidentFilter>('all');

  useEffect(() => {
    securityApi.kpis().then(setKpis);
    securityApi.cameras().then(setCameras);
    securityApi.incidents().then(setIncidents);
    securityApi.gateEvents().then(setGates);
    securityApi.watchlistMatches().then(setWatchlist);
  }, []);

  const status = (kpis?.open_incidents ?? 0) >= 3 ? 'Elevated' : (kpis?.open_incidents ?? 0) > 0 ? 'Monitoring' : 'Calm';
  const statusTone = status === 'Calm' ? 'accent' : status === 'Monitoring' ? 'info' : 'warning';

  const filteredIncidents = incidents.filter(i => incidentFilter === 'all' || i.status === incidentFilter);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-8 space-y-6 s-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--s-accent))]">Campus Operations</div>
          <h1 className="mt-1 font-display text-2xl lg:text-3xl font-bold text-[hsl(var(--s-primary-ink))]">
            Security Center
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--s-text-muted))]">
            Live camera grid, gate activity, visitor verification and incident response.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ background: `hsl(var(--s-${statusTone})/0.12)`, color: `hsl(var(--s-${statusTone}))` }}>
            <Radio className="h-3 w-3 s-pulse-dot" /> Campus status: {status}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cameras online" value={`${kpis?.active_cameras ?? '—'}/${kpis?.total_cameras ?? '—'}`} icon={Camera} tone="accent" />
        <StatCard label="Open incidents" value={kpis?.open_incidents ?? '—'} icon={AlertTriangle} tone="warning" />
        <StatCard label="Visitors on site" value={kpis?.visitors_on_premises ?? '—'} icon={Users} tone="info" />
        <StatCard label="Avg response" value={`${kpis?.avg_response_minutes ?? '—'}m`} icon={Activity} tone="primary" />
      </section>

      {/* Live monitoring */}
      <SchoolsCard>
        <SectionHeader
          eyebrow="Live monitoring"
          title="Capture points"
          action={<span className="inline-flex items-center gap-1.5 text-[11px] text-[hsl(var(--s-accent))]"><Radio className="h-3 w-3 s-pulse-dot" /> Live feeds</span>}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cameras.map(c => {
            const StatusIcon = c.status === 'online' ? Eye : EyeOff;
            const tone = c.status === 'online' ? 'accent' : c.status === 'degraded' ? 'warning' : 'danger';
            return (
              <div key={c.id} className="rounded-xl border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] overflow-hidden">
                <div className="aspect-video relative bg-gradient-to-br from-[hsl(var(--s-navy))] to-[hsl(var(--s-academic))] grid place-items-center">
                  <Camera className="h-8 w-8 text-white/30" />
                  {c.watchlist_match && (
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[hsl(var(--s-danger))] px-2 py-0.5 text-[10px] font-semibold text-white">
                      <AlertTriangle className="h-3 w-3" /> MATCH
                    </div>
                  )}
                  {c.motion && c.status === 'online' && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[hsl(var(--s-accent))] s-pulse-dot" />
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[hsl(var(--s-text))] truncate">{c.name}</span>
                    <Badge tone={tone as any}><StatusIcon className="h-3 w-3" /> {c.status}</Badge>
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[hsl(var(--s-text-subtle))]">
                    <MapPin className="h-3 w-3" /> {c.zone}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SchoolsCard>

      {/* Watchlist + Gates */}
      <section className="grid gap-6 lg:grid-cols-2">
        <SchoolsCard>
          <SectionHeader eyebrow="AI vision" title="Watchlist matches" description="Recent face matches against the school watchlist." />
          {watchlist.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="No watchlist matches" description="The campus is clear." />
          ) : (
            <ul className="space-y-2">
              {watchlist.map(w => (
                <li key={w.id} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--s-danger)/0.3)] bg-[hsl(var(--s-danger)/0.06)] p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-[hsl(var(--s-danger)/0.12)] text-[hsl(var(--s-danger))]">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[hsl(var(--s-text))] truncate">{w.name}</div>
                    <div className="text-[11px] text-[hsl(var(--s-text-muted))]">{w.camera} · {w.zone} · {Math.round(w.confidence * 100)}%</div>
                  </div>
                  <Badge tone="danger">{w.reason}</Badge>
                </li>
              ))}
            </ul>
          )}
        </SchoolsCard>

        <SchoolsCard>
          <SectionHeader eyebrow="Access" title="Recent gate activity" />
          <ul className="space-y-2">
            {gates.slice(0, 6).map(g => (
              <li key={g.id} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] p-3">
                <div className={`grid h-10 w-10 place-items-center rounded-lg ${g.authorized ? 'bg-[hsl(var(--s-accent)/0.12)] text-[hsl(var(--s-accent))]' : 'bg-[hsl(var(--s-danger)/0.12)] text-[hsl(var(--s-danger))]'}`}>
                  {g.authorized ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[hsl(var(--s-text))]">{g.person_name}</div>
                  <div className="text-[11px] text-[hsl(var(--s-text-subtle))]">
                    <DoorOpen className="inline h-3 w-3 mr-0.5" />{g.gate} · {g.method} · {g.direction}
                    {g.reason && <span className="ml-1 text-[hsl(var(--s-danger))]">· {g.reason}</span>}
                  </div>
                </div>
                <Badge tone="subtle">{g.person_role}</Badge>
              </li>
            ))}
          </ul>
        </SchoolsCard>
      </section>

      {/* Incidents */}
      <SchoolsCard>
        <SectionHeader
          eyebrow="Incident response"
          title="Incident reports"
          action={
            <TabBar<IncidentFilter>
              value={incidentFilter}
              onChange={setIncidentFilter}
              tabs={[
                { value: 'all', label: 'All', count: incidents.length },
                { value: 'open', label: 'Open', count: incidents.filter(i => i.status === 'open').length },
                { value: 'investigating', label: 'Active', count: incidents.filter(i => i.status === 'investigating').length },
                { value: 'resolved', label: 'Resolved', count: incidents.filter(i => i.status === 'resolved').length },
              ]}
            />
          }
        />
        {filteredIncidents.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No incidents" description="Nothing to action right now." />
        ) : (
          <ul className="space-y-2">
            {filteredIncidents.map(i => {
              const tone = i.severity === 'critical' ? 'danger' : i.severity === 'warning' ? 'warning' : 'info';
              return (
                <li key={i.id} className="rounded-xl border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[hsl(var(--s-text))]">{i.title}</span>
                        <Badge tone={tone as any}>{i.severity}</Badge>
                        <Badge tone={i.status === 'resolved' ? 'accent' : i.status === 'investigating' ? 'info' : 'warning'}>
                          {i.status}
                        </Badge>
                      </div>
                      <div className="mt-1 text-[11px] text-[hsl(var(--s-text-subtle))]">
                        <MapPin className="inline h-3 w-3 mr-0.5" />{i.zone} · reported by {i.reported_by}
                        {i.assigned_to && <span> · assigned to {i.assigned_to}</span>}
                      </div>
                      {i.ai_summary && (
                        <p className="mt-2 text-xs text-[hsl(var(--s-text-muted))] border-l-2 border-[hsl(var(--s-primary))] pl-2">
                          {i.ai_summary}
                        </p>
                      )}
                    </div>
                    {i.status !== 'resolved' && (
                      <SchoolsButton size="sm" variant="outline">Acknowledge</SchoolsButton>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SchoolsCard>
    </div>
  );
};

export default SchoolsSecurity;
