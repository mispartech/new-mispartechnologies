import { Link } from 'react-router-dom';
import { ScanFace, ShieldCheck, BarChart3, Users, ArrowRight, Sparkles } from 'lucide-react';
import { MsseThemeProvider } from '@/contexts/MsseThemeContext';

const MsseLanding = () => (
  <MsseThemeProvider>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[32rem] w-[32rem] rounded-full bg-blue-600/15 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
            <ScanFace className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-bold">MSSE</span>
        </div>
        <Link
          to="/msse/dashboard"
          className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15 transition"
        >
          Open dashboard
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <section className="py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3 w-3" /> AI-powered biometric infrastructure for education
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold tracking-tight md:text-6xl">
            The operating system for <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">smart schools</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400">
            Mispar Smart School Ecosystem unifies biometric identity, attendance, security, academics, and AI
            analytics into one realtime layer — engineered for African institutions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/msse/dashboard" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950">
              Explore the platform <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="/#contact" className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium hover:bg-white/5">
              Book a demo
            </a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ScanFace, t: 'Biometric Identity', d: 'Face, RFID, NFC, QR — one unified identity layer.' },
            { icon: ShieldCheck, t: 'Smart Security', d: 'Watchlists, intrusion alerts, smart gates.' },
            { icon: Users, t: 'Parent Portal', d: 'Real-time visibility for guardians.' },
            { icon: BarChart3, t: 'AI Analytics', d: 'Dropout risk, behaviour, performance forecasts.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <Icon className="h-5 w-5 text-cyan-300" />
              <div className="mt-3 text-sm font-semibold">{t}</div>
              <div className="mt-1 text-xs text-slate-400">{d}</div>
            </div>
          ))}
        </section>

        <section className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/60 to-slate-950/60 p-10 text-center">
          <h2 className="text-3xl font-bold">Built for the next decade of African education.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            Designed for secondary schools, polytechnics, universities, and government institutions. Multi-campus,
            offline-first, enterprise-grade.
          </p>
        </section>
      </main>
    </div>
  </MsseThemeProvider>
);

export default MsseLanding;
