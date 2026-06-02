/**
 * Ednitio Platform Admin — /schools/admin
 * Internal Mispar Technologies cockpit for the Schools vertical.
 * Gated server-side by platform_admin + vertical='schools' claim.
 */
import { useEffect, useState } from 'react';
import { SchoolsThemeProvider } from '@/contexts/SchoolsThemeContext';
import { GlassCard } from '@/components/schools/GlassCard';
import { LiveStatBadge } from '@/components/schools/LiveStatBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { schoolsPlatformApi, type TenantSummary, type PlatformAuditEntry, type DuplicateSuspect } from '@/lib/api/schools/platform';
import type { FaceEngineHealth } from '@/lib/api/schools/faceClient';
import { Building2, Cpu, ShieldAlert, ScrollText, GraduationCap, Activity } from 'lucide-react';

export default function SchoolsPlatformAdmin() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [health, setHealth] = useState<FaceEngineHealth | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateSuspect[]>([]);
  const [audit, setAudit] = useState<PlatformAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [t, h, d, a] = await Promise.all([
        schoolsPlatformApi.tenants(),
        schoolsPlatformApi.faceEngineHealth(),
        schoolsPlatformApi.duplicates(),
        schoolsPlatformApi.auditLog(),
      ]);
      setTenants(t.data ?? []); setHealth(h.data ?? null);
      setDuplicates(d.data ?? []); setAudit(a.data ?? []);
      setLoading(false);
    })();
  }, []);

  const totalEnrolled = tenants.reduce((s, t) => s + t.enrolled_identities, 0);
  const totalMau = tenants.reduce((s, t) => s + t.mau, 0);
  const onboardingQueue = tenants.filter((t) => !t.onboarding_complete);

  return (
    <SchoolsThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-100">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Ednitio · Platform Admin</h1>
                <p className="text-sm text-slate-400">Mispar Technologies · Schools vertical oversight</p>
              </div>
            </div>
            <LiveStatBadge label={loading ? 'Loading' : 'Live'} active={!loading} />
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-4">
            <Kpi icon={Building2} label="Tenants" value={tenants.length} hint={`${onboardingQueue.length} pending`} />
            <Kpi icon={GraduationCap} label="Enrolled identities" value={totalEnrolled.toLocaleString()} />
            <Kpi icon={Activity} label="MAU (schools)" value={totalMau.toLocaleString()} />
            <Kpi icon={Cpu} label="FR p95 latency" value={health ? `${health.p95_ms} ms` : '—'} hint={health?.model_version} />
          </div>

          <Tabs defaultValue="tenants" className="space-y-4">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="tenants"><Building2 className="h-4 w-4 mr-1.5" />Tenants</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding queue</TabsTrigger>
              <TabsTrigger value="engine"><Cpu className="h-4 w-4 mr-1.5" />Face engine</TabsTrigger>
              <TabsTrigger value="duplicates"><ShieldAlert className="h-4 w-4 mr-1.5" />Duplicates</TabsTrigger>
              <TabsTrigger value="audit"><ScrollText className="h-4 w-4 mr-1.5" />Audit log</TabsTrigger>
            </TabsList>

            <TabsContent value="tenants">
              <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
                    <tr><Th>Name</Th><Th>Type</Th><Th>Plan</Th><Th className="text-right">MAU</Th><Th className="text-right">Enrolled</Th><Th className="text-right">Health</Th><Th>Last seen</Th></tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => (
                      <tr key={t.organization_id} className="border-t border-white/5 hover:bg-white/[0.03]">
                        <Td className="font-medium text-white">{t.name}</Td>
                        <Td className="capitalize">{t.institution_type}</Td>
                        <Td><PlanBadge plan={t.plan} /></Td>
                        <Td className="text-right">{t.mau.toLocaleString()}</Td>
                        <Td className="text-right">{t.enrolled_identities.toLocaleString()}</Td>
                        <Td className="text-right"><HealthChip pct={t.attendance_health_pct} /></Td>
                        <Td className="text-slate-400">{t.last_seen_at ? new Date(t.last_seen_at).toLocaleString() : '—'}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </TabsContent>

            <TabsContent value="onboarding">
              <GlassCard className="p-4">
                {onboardingQueue.length === 0 ? (
                  <p className="text-sm text-slate-400">No incomplete onboardings.</p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {onboardingQueue.map((t) => (
                      <li key={t.organization_id} className="flex items-center justify-between py-3">
                        <div>
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-slate-400 capitalize">{t.institution_type} · {t.plan}</div>
                        </div>
                        <Badge variant="outline" className="border-amber-400/40 text-amber-300">Pending</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            </TabsContent>

            <TabsContent value="engine">
              <GlassCard className="p-5">
                {health ? (
                  <div className="grid gap-4 sm:grid-cols-4">
                    <Metric label="GPU" value={health.gpu ? 'Online' : 'CPU'} />
                    <Metric label="Queue depth" value={String(health.queue_depth)} />
                    <Metric label="p50" value={`${health.p50_ms} ms`} />
                    <Metric label="p95" value={`${health.p95_ms} ms`} />
                  </div>
                ) : <p className="text-sm text-slate-400">Face engine offline.</p>}
              </GlassCard>
            </TabsContent>

            <TabsContent value="duplicates">
              <GlassCard className="p-4">
                {duplicates.length === 0 ? (
                  <p className="text-sm text-slate-400">No duplicate suspects across tenants.</p>
                ) : (
                  <ul className="divide-y divide-white/5 text-sm">
                    {duplicates.map((d) => (
                      <li key={d.id} className="flex items-center justify-between py-2">
                        <span>{d.primary_person_id} ⇄ {d.candidate_person_id}</span>
                        <Badge variant="outline">{Math.round(d.similarity * 100)}%</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            </TabsContent>

            <TabsContent value="audit">
              <GlassCard className="p-4">
                <ul className="divide-y divide-white/5 text-sm">
                  {audit.map((e) => (
                    <li key={e.id} className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-white">{e.action}</div>
                        <div className="text-xs text-slate-400">{e.actor} · {new Date(e.ts).toLocaleString()}</div>
                      </div>
                      {e.tenant_id && <Badge variant="outline" className="text-xs">{e.tenant_id}</Badge>}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SchoolsThemeProvider>
  );
}

function Kpi({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string | number; hint?: string }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      {hint && <div className="text-xs text-slate-500">{hint}</div>}
    </GlassCard>
  );
}

const Th = ({ children, className }: any) => <th className={`px-4 py-3 text-left ${className ?? ''}`}>{children}</th>;
const Td = ({ children, className }: any) => <td className={`px-4 py-3 ${className ?? ''}`}>{children}</td>;

const PlanBadge = ({ plan }: { plan: TenantSummary['plan'] }) => {
  const map: Record<string, string> = {
    starter: 'border-slate-400/40 text-slate-300',
    pro: 'border-cyan-400/40 text-cyan-300',
    business: 'border-purple-400/40 text-purple-300',
  };
  return <Badge variant="outline" className={`capitalize ${map[plan]}`}>{plan}</Badge>;
};

const HealthChip = ({ pct }: { pct: number }) => {
  const color = pct >= 90 ? 'text-emerald-300' : pct >= 75 ? 'text-amber-300' : 'text-rose-300';
  return <span className={`font-medium ${color}`}>{pct}%</span>;
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs uppercase tracking-widest text-slate-400">{label}</div>
    <div className="mt-1 text-2xl font-bold text-white">{value}</div>
  </div>
);
