import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ScanFace, ShieldCheck, BarChart3, Users, ArrowRight, Sparkles, Bus, Bed,
  Library, CreditCard, MessageSquare, Camera, GraduationCap, Brain, Globe2,
  CheckCircle2, Building2, Lock, Radio, Cpu, ChevronDown, Phone, Mail, MapPin,
} from 'lucide-react';
import { MsseThemeProvider } from '@/contexts/MsseThemeContext';
import DemoRequestModal from '@/components/DemoRequestModal';

const NAV = [
  { label: 'Platform', href: '#platform' },
  { label: 'Modules', href: '#modules' },
  { label: 'AI', href: '#ai' },
  { label: 'Security', href: '#security' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const PILLARS = [
  { icon: ScanFace, t: 'Biometric Identity', d: 'Face, RFID, NFC, QR — one unified identity per student, staff, parent and visitor.' },
  { icon: Camera, t: 'Smart Attendance', d: 'Classroom, exam hall, hostel, kiosk, CCTV and offline-sync capture modes.' },
  { icon: ShieldCheck, t: 'Smart Security', d: 'Live CCTV grid, watchlists, intruder alerts, smart-gate console.' },
  { icon: Users, t: 'Parent Portal', d: 'Real-time alerts, pickup authorization, fees, academics, messaging.' },
  { icon: Brain, t: 'AI Intelligence', d: 'Dropout-risk prediction, behaviour analytics, "Ask MSSE" assistant.' },
  { icon: Globe2, t: 'Multi-Institution', d: 'District / state tenancy. Built for groups, ministries and chains.' },
];

const MODULES = [
  { icon: GraduationCap, t: 'Student Management' },
  { icon: Users, t: 'Staff Management' },
  { icon: ScanFace, t: 'Examination System' },
  { icon: Bed, t: 'Hostel Management' },
  { icon: Library, t: 'Library Management' },
  { icon: Bus, t: 'Transportation' },
  { icon: CreditCard, t: 'Finance & Payments' },
  { icon: MessageSquare, t: 'Communications' },
  { icon: BarChart3, t: 'AI Analytics' },
  { icon: Camera, t: 'CCTV & Security' },
  { icon: Building2, t: 'Visitor Management' },
  { icon: Lock, t: 'RBAC & Audit' },
];

const USE_CASES = [
  { t: 'Secondary schools', d: 'Attendance, parent visibility, exam integrity.' },
  { t: 'Polytechnics & colleges', d: 'Multi-faculty, hostel, exam, library control.' },
  { t: 'Universities', d: 'Campus-wide identity, security, predictive analytics.' },
  { t: 'Government / ministries', d: 'District tenancy, oversight dashboards, audit.' },
];

const PRICING = [
  { name: 'Starter', price: '₦150,000', period: '/term', tag: 'Up to 500 members', features: ['Biometric attendance', 'Parent SMS alerts', 'Email support', '1 campus'] },
  { name: 'Growth', price: '₦450,000', period: '/term', tag: 'Up to 2,000 members', features: ['Everything in Starter', 'CCTV watchlist (4 cams)', 'Hostel + library', 'Priority support', 'Up to 3 campuses'], featured: true },
  { name: 'Institution', price: 'Custom', period: '', tag: 'Unlimited', features: ['Everything in Growth', 'AI analytics & forecasts', 'District tenancy', 'On-prem option', 'Dedicated success engineer'] },
];

const FAQ = [
  { q: 'Does MSSE work offline?', a: 'Yes. Attendance kiosks queue locally and sync when connectivity returns. Most write paths are offline-tolerant.' },
  { q: 'Where is biometric data stored?', a: 'Encrypted, organization-scoped storage. Templates never leave the institution\'s namespace and are never sold or shared.' },
  { q: 'Can parents see their wards?', a: 'Yes — a dedicated parent portal shows attendance, alerts, fees, academics, pickup authorizations and messages.' },
  { q: 'Do you support multiple campuses?', a: 'Yes. The platform is multi-tenant by institution → campus → faculty → department → class.' },
  { q: 'What about CCTV integration?', a: 'MSSE ingests RTSP feeds, overlays watchlist matches, and routes incidents to your Security Center.' },
];

const MsseLanding = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <MsseThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-100">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[32rem] w-[32rem] rounded-full bg-blue-600/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        {/* NAV */}
        <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/msse" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_24px_-4px_rgba(34,211,238,0.6)]">
              <ScanFace className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold">MSSE</div>
              <div className="text-[10px] uppercase tracking-widest text-cyan-300/80">Smart School OS</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-white transition">{n.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setDemoOpen(true)} className="hidden rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5 md:inline-flex">Book a demo</button>
            <Link to="/msse/dashboard" className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950">Open dashboard</Link>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
          {/* HERO */}
          <section className="py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
              <Sparkles className="h-3 w-3" /> AI-powered biometric infrastructure for education
            </div>
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
              The operating system for{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                smart schools
              </span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 md:text-lg">
              Mispar Smart School Ecosystem unifies biometric identity, attendance, security, academics, hostel,
              transport, finance and AI analytics into one realtime layer — engineered for African institutions.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={() => setDemoOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_32px_-8px_rgba(34,211,238,0.6)]">
                Book a live demo <ArrowRight className="h-4 w-4" />
              </button>
              <Link to="/msse/dashboard" className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium hover:bg-white/5">
                Explore the dashboard
              </Link>
            </div>

            {/* trust strip */}
            <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 text-xs text-slate-400 md:grid-cols-4">
              {[
                ['99.9%', 'Uptime'],
                ['<300ms', 'Face match'],
                ['Offline', 'First-class'],
                ['NDPR', 'Compliant'],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-xl">
                  <div className="text-base font-semibold text-white">{v}</div>
                  <div className="mt-0.5 uppercase tracking-widest">{l}</div>
                </div>
              ))}
            </div>
          </section>

          {/* PILLARS */}
          <section id="platform" className="py-16">
            <div className="mb-10 text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">The platform</div>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">One realtime layer. Every campus signal.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PILLARS.map(({ icon: Icon, t, d }) => (
                <div key={t} className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-white/[0.08]">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 ring-1 ring-cyan-400/30">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div className="mt-4 text-base font-semibold">{t}</div>
                  <div className="mt-1.5 text-sm text-slate-400">{d}</div>
                </div>
              ))}
            </div>
          </section>

          {/* MODULES */}
          <section id="modules" className="py-16">
            <div className="mb-10 text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">15 integrated modules</div>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Everything the modern institution runs on.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {MODULES.map(({ icon: Icon, t }) => (
                <div key={t} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                  <Icon className="h-4 w-4 text-cyan-300" />
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </section>

          {/* AI */}
          <section id="ai" className="py-16">
            <div className="grid items-center gap-10 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/70 to-slate-950/70 p-10 md:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                  <Cpu className="h-3 w-3" /> AI Intelligence Center
                </div>
                <h2 className="mt-4 text-3xl font-bold md:text-4xl">Ask your campus anything.</h2>
                <p className="mt-3 text-sm text-slate-400 md:text-base">
                  "Show me JSS2 students at dropout risk." "List dorms over 90% occupancy."
                  MSSE turns realtime signals into decisions, forecasts and natural-language answers.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-slate-300">
                  {['Dropout & academic-risk forecasts', 'Behaviour & attendance anomaly detection', 'Predictive hostel/transport demand', 'Natural-language "Ask MSSE" assistant'].map((x) => (
                    <li key={x} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {x}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-300/80">
                  <Radio className="h-3.5 w-3.5" /> Live feed
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {[
                    ['08:14', 'Gate A — face match: O. Adeyemi (SS3)'],
                    ['08:15', 'JSS2-B attendance synced (38/40)'],
                    ['08:16', 'Hostel Block C: curfew check OK'],
                    ['08:17', 'Library: 12 active readers'],
                    ['08:18', 'AI alert — 3 students flagged absent ≥5 days'],
                  ].map(([ts, label]) => (
                    <li key={label} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      <div className="flex-1 text-slate-200">{label}</div>
                      <span className="text-xs text-slate-500">{ts}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* SECURITY / PRIVACY */}
          <section id="security" className="py-16">
            <div className="mb-10 text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Security & privacy</div>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Enterprise-grade. African-aware.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Lock, t: 'Encryption at rest & in transit', d: 'AES-256, TLS 1.3, organization-scoped namespaces.' },
                { icon: ShieldCheck, t: 'NDPR compliant', d: 'Consent-first biometric capture; data residency in-region.' },
                { icon: Building2, t: 'On-prem option', d: 'Government & private institutions can deploy fully on-premise.' },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <Icon className="h-5 w-5 text-cyan-300" />
                  <div className="mt-3 font-semibold">{t}</div>
                  <div className="mt-1 text-sm text-slate-400">{d}</div>
                </div>
              ))}
            </div>
          </section>

          {/* USE CASES */}
          <section className="py-16">
            <div className="mb-10 text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Built for</div>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Every tier of African education.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {USE_CASES.map(({ t, d }) => (
                <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="text-sm font-semibold">{t}</div>
                  <div className="mt-1.5 text-sm text-slate-400">{d}</div>
                </div>
              ))}
            </div>
          </section>

          {/* PRICING */}
          <section id="pricing" className="py-16">
            <div className="mb-10 text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Pricing</div>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Transparent. Per term. Scale-friendly.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {PRICING.map((p) => (
                <div
                  key={p.name}
                  className={`relative rounded-2xl border p-6 backdrop-blur-xl ${
                    p.featured
                      ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 shadow-[0_8px_40px_-12px_rgba(34,211,238,0.4)]'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  {p.featured && (
                    <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-950">
                      Most popular
                    </div>
                  )}
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{p.price}</span>
                    <span className="text-sm text-slate-400">{p.period}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{p.tag}</div>
                  <ul className="mt-5 space-y-2 text-sm text-slate-300">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {f}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setDemoOpen(true)}
                    className={`mt-6 w-full rounded-full px-4 py-2.5 text-sm font-semibold ${
                      p.featured
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950'
                        : 'border border-white/15 hover:bg-white/5'
                    }`}
                  >
                    Book a demo
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="py-16">
            <div className="mb-10 text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">FAQ</div>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Questions, answered.</h2>
            </div>
            <div className="mx-auto max-w-3xl space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold">
                    {f.q}
                    <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/70 to-slate-950/70 p-10 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to upgrade your institution?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 md:text-base">
              See MSSE running on a real campus dataset. We'll tailor the demo to your structure, scale and security posture.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={() => setDemoOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950">
                Book a demo <ArrowRight className="h-4 w-4" />
              </button>
              <Link to="/msse/dashboard" className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium hover:bg-white/5">
                Open dashboard
              </Link>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-20 grid gap-8 border-t border-white/10 pt-10 text-sm text-slate-400 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-white">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
                  <ScanFace className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold">MSSE</span>
              </div>
              <p className="mt-3 text-xs">Mispar Smart School Ecosystem — a Mispar Technologies product.</p>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-300">Platform</div>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#platform" className="hover:text-white">Overview</a></li>
                <li><a href="#modules" className="hover:text-white">Modules</a></li>
                <li><a href="#ai" className="hover:text-white">AI</a></li>
                <li><a href="#security" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-300">Company</div>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/team" className="hover:text-white">Team</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-300">Contact</div>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> school@mispartechnologies.com</li>
                <li className="flex items-center gap-2"><Phone className="h-3 w-3" /> +234 800 MISPAR</li>
                <li className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Lagos, Nigeria</li>
              </ul>
            </div>
          </footer>
          <div className="mt-8 text-center text-[11px] text-slate-500">© {new Date().getFullYear()} Mispar Technologies. All rights reserved.</div>
        </main>

        <DemoRequestModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      </div>
    </MsseThemeProvider>
  );
};

export default MsseLanding;
