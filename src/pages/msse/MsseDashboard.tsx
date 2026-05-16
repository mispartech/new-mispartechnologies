import { GlassCard } from '@/components/msse/GlassCard';
import { LiveStatBadge } from '@/components/msse/LiveStatBadge';
import { AiInsightCallout } from '@/components/msse/AiInsightCallout';
import { RealtimeFeed } from '@/components/msse/RealtimeFeed';
import { useMsseRealtime } from '@/hooks/useMsseRealtime';
import { MSSE_MODULES } from './msseModules';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MsseDashboard = () => {
  const { connected } = useMsseRealtime('dashboard');

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-cyan-300/80">Mispar Smart School Ecosystem</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Institutional Operating System</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            An AI-powered biometric operating system for educational institutions — identity, attendance, security,
            academics, and analytics in one realtime layer.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {connected ? 'Realtime online' : 'Awaiting backend channels'}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LiveStatBadge label="Enrolled identities" value="—" trend="Pending backend" tone="cyan" />
        <LiveStatBadge label="Today's attendance" value="—" trend="Awaiting capture data" tone="blue" />
        <LiveStatBadge label="Active security alerts" value="—" trend="Watchlist idle" tone="amber" />
        <LiveStatBadge label="At-risk students" value="—" trend="ML model pending" tone="rose" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h2 className="text-sm font-semibold text-white">Modules</h2>
            <p className="mt-1 text-xs text-slate-400">
              The full 15-module roadmap. Modules ship one step at a time; each carries its own backend spec under <code className="text-cyan-300">docs/msse/</code>.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {MSSE_MODULES.filter((m) => m.slug).map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.slug}
                    to={`/msse/dashboard/${m.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-100">{m.label}</div>
                      <div className="text-[11px] uppercase tracking-widest text-slate-500">Step {m.step}</div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-300" />
                  </Link>
                );
              })}
            </div>
          </GlassCard>

          <AiInsightCallout title="Your ecosystem is in scaffolding mode">
            The MSSE shell is live. As each module is implemented, this dashboard will surface realtime KPIs,
            attendance heatmaps, and dropout-risk forecasts powered by your institution's data.
          </AiInsightCallout>
        </div>

        <div className="space-y-6">
          <RealtimeFeed
            events={[]}
            emptyLabel="No realtime channel connected yet. Backend WebSocket (/ws/msse/dashboard/) pending."
          />
          <GlassCard>
            <h3 className="text-sm font-semibold text-white">Deployment</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>• Subdomain: <code className="text-cyan-300">school.mispartechnologies.com</code></li>
              <li>• Tenancy: institution → campus → faculty → department → class</li>
              <li>• Realtime: Django Channels over WSS</li>
              <li>• Storage: <code className="text-cyan-300">faces/{'{org_id}'}/{'{user_id}'}/</code></li>
            </ul>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default MsseDashboard;
