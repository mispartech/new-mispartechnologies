import { useEffect, useState } from 'react';
import { ShieldAlert, Camera, DoorOpen, Activity, Users, Timer, AlertTriangle, CheckCircle2, Radio, MapPin, Search } from 'lucide-react';
import { GlassCard } from '@/components/msse/GlassCard';
import { LiveStatBadge } from '@/components/msse/LiveStatBadge';
import { AiInsightCallout } from '@/components/msse/AiInsightCallout';
import { useMsseRealtime } from '@/hooks/useMsseRealtime';
import {
  securityApi,
  type SecurityKPIs,
  type CameraFeed,
  type WatchlistMatch,
  type IncidentLog,
  type GateEvent,
  type RestrictedZoneAlert,
  type IncidentSeverity,
} from '@/lib/api/msse/security';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const severityClass: Record<IncidentSeverity, string> = {
  info: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  critical: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
};

const fmtTime = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
};

export default function MsseSecurity() {
  useMsseRealtime('security/feed');
  const [kpis, setKpis] = useState<SecurityKPIs | null>(null);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [matches, setMatches] = useState<WatchlistMatch[]>([]);
  const [incidents, setIncidents] = useState<IncidentLog[]>([]);
  const [gateEvents, setGateEvents] = useState<GateEvent[]>([]);
  const [zoneAlerts, setZoneAlerts] = useState<RestrictedZoneAlert[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    Promise.all([
      securityApi.kpis(),
      securityApi.cameras(),
      securityApi.watchlistMatches(),
      securityApi.incidents(),
      securityApi.gateEvents(),
      securityApi.restrictedAlerts(),
    ]).then(([k, c, m, i, g, z]) => {
      setKpis(k); setCameras(c); setMatches(m); setIncidents(i); setGateEvents(g); setZoneAlerts(z);
    });
  }, []);

  const filteredGate = gateEvents.filter(e =>
    !q || `${e.person_name} ${e.gate} ${e.method}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-300/80">
            <ShieldAlert className="h-3.5 w-3.5" />
            Step 4 · Smart Campus Security
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white">Security Operations Center</h1>
          <p className="text-sm text-slate-400">Live CCTV, AI watchlist, smart gates and incident response — campus-wide.</p>
        </div>
        <LiveStatBadge label="AI Vision" tone="ok" />
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Camera className="h-4 w-4" />} label="Active cameras" value={kpis ? `${kpis.active_cameras}/${kpis.total_cameras}` : '—'} />
        <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="Open incidents" value={kpis?.open_incidents ?? '—'} tone={kpis && kpis.open_incidents > 0 ? 'warn' : 'ok'} />
        <Kpi icon={<Activity className="h-4 w-4" />} label="Watchlist hits (24h)" value={kpis?.watchlist_hits_24h ?? '—'} tone={kpis && kpis.watchlist_hits_24h > 0 ? 'alert' : 'ok'} />
        <Kpi icon={<DoorOpen className="h-4 w-4" />} label="Unauthorized (24h)" value={kpis?.unauthorized_attempts_24h ?? '—'} />
        <Kpi icon={<Timer className="h-4 w-4" />} label="Avg response (min)" value={kpis?.avg_response_minutes ?? '—'} />
        <Kpi icon={<Users className="h-4 w-4" />} label="Visitors on premises" value={kpis?.visitors_on_premises ?? '—'} />
        <Kpi icon={<DoorOpen className="h-4 w-4" />} label="Gates online" value={kpis?.gates_online ?? '—'} tone="ok" />
        <Kpi icon={<Radio className="h-4 w-4" />} label="Realtime channel" value="connected" tone="ok" />
      </div>

      {/* AI insight */}
      {matches.length > 0 && (
        <AiInsightCallout title={`${matches.length} watchlist match${matches.length === 1 ? '' : 'es'} in last hour`}>
          Highest priority: <span className="text-white">{matches[0].name}</span> seen at <span className="text-white">{matches[0].camera}</span> ({Math.round(matches[0].confidence * 100)}% confidence). Officer Bello dispatched.
        </AiInsightCallout>
      )}

      <Tabs defaultValue="cctv" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="cctv">Live CCTV</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="gates">Smart Gates</TabsTrigger>
          <TabsTrigger value="zones">Restricted Zones</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        {/* CCTV grid */}
        <TabsContent value="cctv" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cameras.map(cam => (
              <GlassCard key={cam.id} className="overflow-hidden p-0">
                <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className={`h-10 w-10 ${cam.status === 'online' ? 'text-cyan-300/60' : 'text-slate-600'}`} />
                  </div>
                  {cam.motion && cam.status === 'online' && (
                    <div className="absolute inset-2 rounded-lg border-2 border-cyan-400/40 animate-pulse" />
                  )}
                  {cam.watchlist_match && (
                    <div className="absolute left-2 top-2 rounded-md bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Watchlist
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <span className={`inline-flex h-2 w-2 rounded-full ${cam.status === 'online' ? 'bg-emerald-400' : cam.status === 'degraded' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
                    <span className="rounded bg-black/60 px-1.5 py-0.5 text-white">{cam.name}</span>
                    <span className="rounded bg-black/60 px-1.5 py-0.5 text-slate-300">{fmtTime(cam.last_frame_at)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="text-slate-400">{cam.zone}</span>
                  <span className={`capitalize ${cam.status === 'online' ? 'text-emerald-300' : cam.status === 'degraded' ? 'text-amber-300' : 'text-rose-300'}`}>{cam.status}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </TabsContent>

        {/* Incidents */}
        <TabsContent value="incidents" className="mt-4">
          <GlassCard className="p-0">
            <div className="border-b border-white/5 p-4 text-sm font-semibold text-white">Incident timeline</div>
            <ul className="divide-y divide-white/5">
              {incidents.map(inc => (
                <li key={inc.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={severityClass[inc.severity]}>{inc.severity}</Badge>
                        <Badge variant="outline" className="border-white/10 text-slate-300 capitalize">{inc.status}</Badge>
                        <span className="text-xs text-slate-500">{fmtTime(inc.ts)} · {inc.zone}</span>
                      </div>
                      <div className="mt-1.5 text-sm font-medium text-white">{inc.title}</div>
                      <div className="text-xs text-slate-400">Reported by {inc.reported_by}{inc.assigned_to ? ` · Assigned to ${inc.assigned_to}` : ''}</div>
                      {inc.ai_summary && (
                        <div className="mt-2 rounded-md border border-cyan-400/20 bg-cyan-950/20 p-2 text-xs text-cyan-100/90">
                          <span className="font-semibold text-cyan-300">AI summary · </span>{inc.ai_summary}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {inc.status !== 'resolved' && (
                        <>
                          <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => { securityApi.acknowledgeIncident(inc.id); toast({ title: 'Acknowledged' }); }}>
                            Acknowledge
                          </Button>
                          <Button size="sm" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                            onClick={() => { securityApi.dispatchOfficer(inc.id, 'Officer Bello'); toast({ title: 'Officer dispatched' }); }}>
                            Dispatch
                          </Button>
                        </>
                      )}
                      {inc.status === 'resolved' && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Resolved</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </TabsContent>

        {/* Gates */}
        <TabsContent value="gates" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, gate or method…" className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-500" />
          </div>
          <GlassCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Gate</th>
                    <th className="px-4 py-3">Person</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Direction</th>
                    <th className="px-4 py-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {filteredGate.map(e => (
                    <tr key={e.id}>
                      <td className="px-4 py-3 text-slate-400">{fmtTime(e.ts)}</td>
                      <td className="px-4 py-3">{e.gate}</td>
                      <td className="px-4 py-3">
                        <div className="text-white">{e.person_name}</div>
                        <div className="text-xs text-slate-500 capitalize">{e.person_role}</div>
                      </td>
                      <td className="px-4 py-3 uppercase text-xs">{e.method.replace('_', ' ')}</td>
                      <td className="px-4 py-3 capitalize">{e.direction}</td>
                      <td className="px-4 py-3">
                        {e.authorized ? (
                          <Badge variant="outline" className="border-emerald-400/30 bg-emerald-500/10 text-emerald-300">Authorized</Badge>
                        ) : (
                          <div>
                            <Badge variant="outline" className="border-rose-400/30 bg-rose-500/10 text-rose-300">Denied</Badge>
                            {e.reason && <div className="mt-1 text-xs text-slate-500">{e.reason}</div>}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </TabsContent>

        {/* Zones */}
        <TabsContent value="zones" className="mt-4">
          <GlassCard className="p-0">
            <div className="border-b border-white/5 p-4 text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-300" /> Restricted zone activity
            </div>
            <ul className="divide-y divide-white/5">
              {zoneAlerts.map(a => (
                <li key={a.id} className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={severityClass[a.severity]}>{a.severity}</Badge>
                      <span className="text-sm font-medium text-white">{a.zone}</span>
                      {a.person_name && <span className="text-xs text-slate-400">· {a.person_name}</span>}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">{a.description}</div>
                  </div>
                  <span className="text-xs text-slate-500">{fmtTime(a.ts)}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </TabsContent>

        {/* Watchlist */}
        <TabsContent value="watchlist" className="mt-4">
          <GlassCard className="p-0">
            <div className="border-b border-white/5 p-4 text-sm font-semibold text-white">AI watchlist matches</div>
            <ul className="divide-y divide-white/5">
              {matches.map(m => (
                <li key={m.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-rose-400/30 bg-rose-500/10 text-rose-300 capitalize">{m.reason}</Badge>
                        <span className="text-sm font-medium text-white">{m.name}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-400">{m.zone} · {m.camera} · {Math.round(m.confidence * 100)}% confidence</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{fmtTime(m.ts)}</span>
                      <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">View frame</Button>
                    </div>
                  </div>
                </li>
              ))}
              {matches.length === 0 && (
                <li className="p-8 text-center text-sm text-slate-400">No matches in the last 24 hours.</li>
              )}
            </ul>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ icon, label, value, tone = 'neutral' }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone?: 'ok' | 'warn' | 'alert' | 'neutral' }) {
  const toneClass = tone === 'ok' ? 'text-emerald-300' : tone === 'warn' ? 'text-amber-300' : tone === 'alert' ? 'text-rose-300' : 'text-white';
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="text-cyan-300/70">{icon}</span>
      </div>
      <div className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</div>
    </GlassCard>
  );
}
