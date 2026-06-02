/**
 * Schools Onboarding Wizard — /schools/onboarding
 * Backend spec: docs/schools/schools-onboarding-backend-prompt.md
 *
 * Specialised version of /onboarding locked to organization_type = 'school'.
 * Persists draft in localStorage; final submit is a single atomic PUT.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, ArrowRight, Check, MapPin, Building2, Users, Camera, Clock, ShieldCheck, CreditCard, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { SchoolsThemeProvider } from '@/contexts/SchoolsThemeContext';
import { GlassCard } from '@/components/schools/GlassCard';
import { schoolsOnboardingApi, type SchoolsOnboardingPayload } from '@/lib/api/schools/onboarding';
import { getCountries, getStates } from '@/lib/locationData';

const STORAGE_KEY = 'schools_onboarding_draft_v1';

const STEPS = [
  { key: 'profile',   title: 'Institution',     icon: GraduationCap },
  { key: 'location',  title: 'Location',        icon: MapPin },
  { key: 'academic',  title: 'Academic',        icon: Building2 },
  { key: 'population',title: 'Population',      icon: Users },
  { key: 'policy',    title: 'Policy',          icon: Clock },
  { key: 'capture',   title: 'Capture Points',  icon: Camera },
  { key: 'admin',     title: 'Admin Account',   icon: ShieldCheck },
  { key: 'plan',      title: 'Plan',            icon: CreditCard },
] as const;

const defaultData: SchoolsOnboardingPayload = {
  name: '', short_code: '', motto: '', logo_url: '',
  institution_type: 'secondary', founded_year: undefined, ownership: 'private',
  country: 'Nigeria', state: '', city: '', address: '', phone: '', email: '', website: '',
  campus_count: 1, hierarchy_levels: ['department', 'class'], term_system: '3-term', session_start_date: '',
  expected_students: 0, expected_teaching_staff: 0, expected_nonteaching_staff: 0, expected_guardians: 0,
  policy: {
    day_start: '08:00', day_end: '15:00',
    late_threshold_min: 10, very_late_threshold_min: 30,
    weekend_days: [0, 6], half_day_cutoff: '12:00', grace_days_per_term: 3,
  },
  capture_points: [{ label: 'Main Gate', mode: 'gate' }],
  admin_first_name: '', admin_last_name: '', admin_role: 'principal', admin_phone: '',
  plan: 'pro', accepted_biometric_terms: false,
};

export default function SchoolsOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<SchoolsOnboardingPayload>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultData, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return defaultData;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data]);

  const set = <K extends keyof SchoolsOnboardingPayload>(k: K, v: SchoolsOnboardingPayload[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const countries = useMemo(() => getCountries(), []);
  const states = useMemo(() => getStates(data.country), [data.country]);

  const submit = async () => {
    if (!data.accepted_biometric_terms) {
      toast({ variant: 'destructive', title: 'Terms required', description: 'Please accept the biometric & privacy terms to continue.' });
      return;
    }
    setSubmitting(true);
    const res = await schoolsOnboardingApi.submit(data);
    setSubmitting(false);
    if (res.error) {
      toast({ variant: 'destructive', title: 'Onboarding failed', description: res.error });
      return;
    }
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    toast({ title: 'School onboarded', description: 'Welcome to Schools by Mispar Technologies.' });
    navigate('/schools/dashboard');
  };

  const CurrentStep = STEPS[step];
  const Icon = CurrentStep.icon;

  return (
    <SchoolsThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-100">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 py-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Onboard Your Institution</h1>
              <p className="text-sm text-slate-400">Set up face-recognition attendance for students &amp; staff.</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Step {step + 1} of {STEPS.length} — {CurrentStep.title}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          <GlassCard className="p-6">
            <div className="mb-5 flex items-center gap-2 text-cyan-300">
              <Icon className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-white">{CurrentStep.title}</h2>
            </div>

            {/* STEP 0 — Institution profile */}
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Institution name *"><Input value={data.name} onChange={(e) => set('name', e.target.value)} /></Field>
                <Field label="Short code *"><Input value={data.short_code} onChange={(e) => set('short_code', e.target.value.toUpperCase())} placeholder="GWA" /></Field>
                <Field label="Institution type">
                  <Select value={data.institution_type} onValueChange={(v: any) => set('institution_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nursery">Nursery</SelectItem>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="tertiary">Tertiary</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Ownership">
                  <Select value={data.ownership} onValueChange={(v: any) => set('ownership', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="mission">Mission</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Founded year">
                  <Input type="number" value={data.founded_year ?? ''} onChange={(e) => set('founded_year', e.target.value ? Number(e.target.value) : undefined)} />
                </Field>
                <Field label="Motto" className="sm:col-span-2"><Input value={data.motto ?? ''} onChange={(e) => set('motto', e.target.value)} /></Field>
              </div>
            )}

            {/* STEP 1 — Location & contact */}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Country">
                  <Select value={data.country} onValueChange={(v) => set('country', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="State">
                  <Select value={data.state} onValueChange={(v) => set('state', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="City"><Input value={data.city} onChange={(e) => set('city', e.target.value)} /></Field>
                <Field label="Phone *"><Input value={data.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
                <Field label="Email *"><Input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} /></Field>
                <Field label="Website"><Input value={data.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></Field>
                <Field label="Address" className="sm:col-span-2"><Textarea rows={2} value={data.address} onChange={(e) => set('address', e.target.value)} /></Field>
              </div>
            )}

            {/* STEP 2 — Academic structure */}
            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Campuses"><Input type="number" min={1} value={data.campus_count} onChange={(e) => set('campus_count', Math.max(1, Number(e.target.value) || 1))} /></Field>
                <Field label="Term system">
                  <Select value={data.term_system} onValueChange={(v: any) => set('term_system', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-term">3 terms (Sept–July)</SelectItem>
                      <SelectItem value="2-semester">2 semesters</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Session start date"><Input type="date" value={data.session_start_date} onChange={(e) => set('session_start_date', e.target.value)} /></Field>
                <Field label="Hierarchy levels enabled" className="sm:col-span-2">
                  <div className="flex flex-wrap gap-3 pt-1">
                    {(['faculty','department','programme','level','class'] as const).map((lvl) => {
                      const on = data.hierarchy_levels.includes(lvl);
                      return (
                        <label key={lvl} className="flex items-center gap-2 text-sm capitalize text-slate-300">
                          <Checkbox checked={on} onCheckedChange={(c) => {
                            const set2 = new Set(data.hierarchy_levels);
                            if (c) set2.add(lvl); else set2.delete(lvl);
                            set('hierarchy_levels', Array.from(set2) as any);
                          }} />
                          {lvl}
                        </label>
                      );
                    })}
                  </div>
                </Field>
              </div>
            )}

            {/* STEP 3 — Population */}
            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Expected students"><Input type="number" value={data.expected_students} onChange={(e) => set('expected_students', Number(e.target.value) || 0)} /></Field>
                <Field label="Teaching staff"><Input type="number" value={data.expected_teaching_staff} onChange={(e) => set('expected_teaching_staff', Number(e.target.value) || 0)} /></Field>
                <Field label="Non-teaching staff"><Input type="number" value={data.expected_nonteaching_staff} onChange={(e) => set('expected_nonteaching_staff', Number(e.target.value) || 0)} /></Field>
                <Field label="Guardians / parents"><Input type="number" value={data.expected_guardians} onChange={(e) => set('expected_guardians', Number(e.target.value) || 0)} /></Field>
                <p className="sm:col-span-2 text-xs text-slate-400">CSV roster import is available from the dashboard after onboarding.</p>
              </div>
            )}

            {/* STEP 4 — Attendance policy */}
            {step === 4 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Day start"><Input type="time" value={data.policy.day_start} onChange={(e) => set('policy', { ...data.policy, day_start: e.target.value })} /></Field>
                <Field label="Day end"><Input type="time" value={data.policy.day_end} onChange={(e) => set('policy', { ...data.policy, day_end: e.target.value })} /></Field>
                <Field label="Late after (min)"><Input type="number" value={data.policy.late_threshold_min} onChange={(e) => set('policy', { ...data.policy, late_threshold_min: Number(e.target.value) || 0 })} /></Field>
                <Field label="Very late after (min)"><Input type="number" value={data.policy.very_late_threshold_min} onChange={(e) => set('policy', { ...data.policy, very_late_threshold_min: Number(e.target.value) || 0 })} /></Field>
                <Field label="Half-day cutoff"><Input type="time" value={data.policy.half_day_cutoff} onChange={(e) => set('policy', { ...data.policy, half_day_cutoff: e.target.value })} /></Field>
                <Field label="Grace days / term"><Input type="number" value={data.policy.grace_days_per_term} onChange={(e) => set('policy', { ...data.policy, grace_days_per_term: Number(e.target.value) || 0 })} /></Field>
              </div>
            )}

            {/* STEP 5 — Capture points */}
            {step === 5 && (
              <div className="space-y-3">
                {data.capture_points.map((cp, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2">
                    <Input className="col-span-7" value={cp.label} placeholder="Location label" onChange={(e) => {
                      const next = [...data.capture_points]; next[i] = { ...cp, label: e.target.value }; set('capture_points', next);
                    }} />
                    <Select value={cp.mode} onValueChange={(v: any) => {
                      const next = [...data.capture_points]; next[i] = { ...cp, mode: v }; set('capture_points', next);
                    }}>
                      <SelectTrigger className="col-span-4"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gate">Gate</SelectItem>
                        <SelectItem value="classroom">Classroom</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="kiosk">Kiosk</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="col-span-1" onClick={() => {
                      const next = data.capture_points.filter((_, x) => x !== i);
                      set('capture_points', next.length ? next : [{ label: 'Main Gate', mode: 'gate' }]);
                    }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => set('capture_points', [...data.capture_points, { label: '', mode: 'classroom' }])}>
                  <Plus className="h-4 w-4 mr-1" /> Add capture point
                </Button>
              </div>
            )}

            {/* STEP 6 — Admin */}
            {step === 6 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name *"><Input value={data.admin_first_name} onChange={(e) => set('admin_first_name', e.target.value)} /></Field>
                <Field label="Last name *"><Input value={data.admin_last_name} onChange={(e) => set('admin_last_name', e.target.value)} /></Field>
                <Field label="Role">
                  <Select value={data.admin_role} onValueChange={(v: any) => set('admin_role', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="vice_principal">Vice Principal</SelectItem>
                      <SelectItem value="bursar">Bursar</SelectItem>
                      <SelectItem value="registrar">Registrar</SelectItem>
                      <SelectItem value="it_admin">IT Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Phone"><Input value={data.admin_phone} onChange={(e) => set('admin_phone', e.target.value)} /></Field>
              </div>
            )}

            {/* STEP 7 — Plan */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {([
                    { id: 'starter',  name: 'Starter',  price: '$35' },
                    { id: 'pro',      name: 'Pro',      price: '$65' },
                    { id: 'business', name: 'Business', price: '$100' },
                  ] as const).map((p) => {
                    const active = data.plan === p.id;
                    return (
                      <button key={p.id} onClick={() => set('plan', p.id)}
                        className={`rounded-xl border p-4 text-left transition ${active ? 'border-cyan-400/60 bg-cyan-400/10 ring-2 ring-cyan-400/40' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                        <div className="text-sm uppercase tracking-widest text-cyan-300">{p.name}</div>
                        <div className="mt-1 text-2xl font-bold">{p.price}<span className="text-xs text-slate-400">/mo</span></div>
                      </button>
                    );
                  })}
                </div>
                <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                  <Checkbox checked={data.accepted_biometric_terms} onCheckedChange={(c) => set('accepted_biometric_terms', !!c)} className="mt-0.5" />
                  <span>I accept the biometric &amp; privacy terms. Biometrics remain org-scoped, never shared with third parties.</span>
                </label>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="bg-gradient-to-r from-cyan-400 to-blue-600">
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting} className="bg-gradient-to-r from-cyan-400 to-blue-600">
                  {submitting ? 'Submitting…' : (<><Check className="h-4 w-4 mr-1" /> Finish onboarding</>)}
                </Button>
              )}
            </div>
          </GlassCard>

          <p className="mt-4 text-center text-xs text-slate-500">Your progress is saved automatically.</p>
        </div>
      </div>
    </SchoolsThemeProvider>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs uppercase tracking-widest text-slate-400">{label}</Label>
      {children}
    </div>
  );
}
