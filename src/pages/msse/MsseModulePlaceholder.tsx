import { useParams, Link } from 'react-router-dom';
import { GlassCard } from '@/components/msse/GlassCard';
import { MSSE_MODULES } from './msseModules';
import { ArrowLeft, Construction } from 'lucide-react';

const MsseModulePlaceholder = () => {
  const { module } = useParams<{ module: string }>();
  const meta = MSSE_MODULES.find((m) => m.slug === module);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/msse/dashboard" className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200">
        <ArrowLeft className="h-3 w-3" /> Back to dashboard
      </Link>

      <GlassCard className="mt-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-400/10 text-amber-300">
            <Construction className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-amber-300">Step {meta?.step ?? '?'} · Coming soon</div>
            <h1 className="mt-1 text-2xl font-bold text-white">{meta?.label ?? 'Module'}</h1>
            <p className="mt-2 text-sm text-slate-400">
              This module is part of the MSSE roadmap and will be implemented in step {meta?.step ?? '?'} of the
              rollout. The dedicated backend specification will live at{' '}
              <code className="text-cyan-300">docs/msse/step-{meta?.step ?? 'X'}-backend-prompt.md</code>.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default MsseModulePlaceholder;
