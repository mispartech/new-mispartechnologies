/**
 * Schools Onboarding Wizard — /schools/onboarding
 * Backend spec: docs/schools/schools-onboarding-backend-prompt.md
 *
 * Revamped to the Academic Trust design system. Theme-aware (light/dark),
 * sidebar step navigator on desktop, full-width on mobile. Logic unchanged.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, ArrowLeft, ArrowRight, Check, MapPin, Building2, Users,
  Camera, Clock, ShieldCheck, CreditCard, Plus, Trash2, Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { SchoolsThemeProvider, useSchoolsTheme } from '@/contexts/SchoolsThemeContext';
import {
  SchoolsCard, SchoolsButton, Badge, ThemeToggle, ProgressBar,
} from '@/components/schools/ui/SchoolsUI';
import { schoolsOnboardingApi, type SchoolsOnboardingPayload } from '@/lib/api/schools/onboarding';
import { getCountries, getStates } from '@/lib/locationData';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'schools_onboarding_draft_v1';

const STEPS = [
  { key: 'profile',    title: 'Institution',    subtitle: 'Identity & brand',         icon: GraduationCap },
  { key: 'location',   title: 'Location',       subtitle: 'Address & contact',        icon: MapPin },
  { key: 'academic',   title: 'Academic',       subtitle: 'Structure & calendar',     icon: Building2 },
  { key: 'population', title: 'Population',     subtitle: 'Students, staff, guardians', icon: Users },
  { key: 'policy',     title: 'Attendance',     subtitle: 'Hours & late thresholds',  icon: Clock },
  { key: 'capture',    title: 'Capture Points', subtitle: 'Where biometrics happen',  icon: Camera },
  { key: 'admin',      title: 'Admin Account',  subtitle: 'Primary administrator',    icon: ShieldCheck },
  { key: 'plan',       title: 'Plan',           subtitle: 'Pick & launch',            icon: CreditCard },
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

const Shell = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resolved } = useSchoolsTheme();
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

  // Per-step validation. Returns null when valid, otherwise a human-readable reason.
  const stepError = useMemo<string | null>(() => {
    switch (step) {
      case 0:
        if (!data.name.trim()) return 'Institution name is required.';
        if (!/^[A-Z0-9]{2,8}$/.test(data.short_code)) return 'Short code must be 2–8 uppercase letters or digits.';
        return null;
      case 1:
        if (!data.country) return 'Country is required.';
        if (!data.state) return 'State / region is required.';
        if (!data.city.trim()) return 'City is required.';
        if (!data.phone.trim()) return 'Phone is required.';
        if (!/^\S+@\S+\.\S+$/.test(data.email)) return 'A valid email address is required.';
        if (!data.address.trim()) return 'Address is required.';
        return null;
      case 2:
        if (!data.campus_count || data.campus_count < 1) return 'At least one campus is required.';
        if (!data.session_start_date) return 'Session start date is required.';
        if (!data.hierarchy_levels.length) return 'Pick at least one hierarchy level.';
        return null;
      case 3:
        if (!data.expected_students || data.expected_students < 1) return 'Expected students must be at least 1.';
        if (data.expected_teaching_staff < 0) return 'Teaching staff cannot be negative.';
        return null;
      case 4:
        if (!data.policy.day_start || !data.policy.day_end) return 'Day start and end are required.';
        if (data.policy.late_threshold_min < 0) return 'Late threshold cannot be negative.';
        if (data.policy.very_late_threshold_min < data.policy.late_threshold_min) return 'Very-late threshold must be ≥ late threshold.';
        return null;
      case 5:
        if (!data.capture_points.length) return 'Add at least one capture point.';
        if (data.capture_points.some((c) => !c.label.trim())) return 'Every capture point needs a label.';
        return null;
      case 6:
        if (!data.admin_first_name.trim()) return 'Admin first name is required.';
        if (!data.admin_last_name.trim()) return 'Admin last name is required.';
        if (!data.admin_phone.trim()) return 'Admin phone is required.';
        return null;
      case 7:
        if (!data.plan) return 'Select a plan.';
        if (!data.accepted_biometric_terms) return 'Accept the biometric & privacy terms to continue.';
        return null;
      default:
        return null;
    }
  }, [step, data]);

  const canContinue = stepError === null;

  const goNext = () => {
    if (!canContinue) {
      toast({ variant: 'destructive', title: 'Complete this step first', description: stepError ?? '' });
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goToStep = (i: number) => {
    // Allow going back to any prior step. Forward jumps require all preceding steps to be valid.
    if (i <= step) { setStep(i); return; }
    if (!canContinue) {
      toast({ variant: 'destructive', title: 'Complete this step first', description: stepError ?? '' });
      return;
    }
    setStep(i);
  };


  const submit = async () => {
    if (stepError) {
      toast({ variant: 'destructive', title: 'Complete this step first', description: stepError });
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

  const Current = STEPS[step];
  const Icon = Current.icon;

  return (
    <div className="schools-root" data-theme={resolved}>
      <div className="min-h-dvh">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface)/0.85)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 py-3">
            <button onClick={() => navigate('/schools')} className="flex items-center gap-2.5 group">
              <div
                className="grid h-9 w-9 place-items-center rounded-xl s-glow-primary"
                style={{ background: 'linear-gradient(135deg, hsl(var(--s-academic)), hsl(var(--s-primary)))' }}
              >
                <GraduationCap className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-display text-sm font-semibold text-[hsl(var(--s-primary-ink))] leading-tight">
                  Mispar Schools
                </div>
                <div className="text-[10px] uppercase tracking-widest text-[hsl(var(--s-text-subtle))]">
                  Onboarding
                </div>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <Badge tone="accent" className="hidden sm:inline-flex">
                <Sparkles className="h-3 w-3" /> 14-day free trial
              </Badge>
              <ThemeToggle />
            </div>
          </div>
          {/* Mobile progress strip */}
          <div className="lg:hidden border-t border-[hsl(var(--s-border))] px-4 py-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-medium text-[hsl(var(--s-text))]">
                Step {step + 1} of {STEPS.length} — {Current.title}
              </span>
              <span className="tabular-nums text-[hsl(var(--s-text-muted))]">{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 py-6 lg:py-10 lg:grid-cols-[280px_1fr]">
          {/* Step rail (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--s-text-subtle))]">
                  Setup progress
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold tabular-nums text-[hsl(var(--s-primary-ink))]">
                    {progress}%
                  </span>
                  <span className="text-xs text-[hsl(var(--s-text-muted))]">complete</span>
                </div>
                <div className="mt-2"><ProgressBar value={progress} /></div>
              </div>

              <nav aria-label="Onboarding steps" className="space-y-1">
                {STEPS.map((s, i) => {
                  const StepIcon = s.icon;
                  const state = i === step ? 'current' : i < step ? 'done' : 'todo';
                  return (
                    <button
                      key={s.key}
                      onClick={() => setStep(i)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition group',
                        state === 'current' && 'bg-[hsl(var(--s-primary)/0.08)] ring-1 ring-[hsl(var(--s-primary)/0.25)]',
                        state !== 'current' && 'hover:bg-[hsl(var(--s-surface-2))]',
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-[11px] font-semibold',
                          state === 'done' && 'bg-[hsl(var(--s-accent))] text-[hsl(var(--s-accent-fg))] border-transparent',
                          state === 'current' && 'bg-[hsl(var(--s-primary))] text-[hsl(var(--s-primary-fg))] border-transparent shadow-[var(--s-shadow-sm)]',
                          state === 'todo' && 'bg-[hsl(var(--s-surface))] text-[hsl(var(--s-text-muted))] border-[hsl(var(--s-border))]',
                        )}
                      >
                        {state === 'done' ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0">
                        <span className={cn(
                          'block text-sm font-medium leading-tight',
                          state === 'current' ? 'text-[hsl(var(--s-primary-ink))]' : 'text-[hsl(var(--s-text))]',
                        )}>
                          {s.title}
                        </span>
                        <span className="block text-[11px] text-[hsl(var(--s-text-subtle))] truncate">
                          {s.subtitle}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>

              <SchoolsCard className="text-xs text-[hsl(var(--s-text-muted))]">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-[hsl(var(--s-accent))] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-[hsl(var(--s-text))] mb-0.5">Your data is safe</div>
                    Biometric data is org-scoped and never shared. Progress auto-saves to this device.
                  </div>
                </div>
              </SchoolsCard>
            </div>
          </aside>

          {/* Main panel */}
          <section className="min-w-0">
            <SchoolsCard className="s-fade-up" padded={false}>
              <div className="border-b border-[hsl(var(--s-border))] p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                    style={{
                      background: 'hsl(var(--s-primary) / 0.12)',
                      color: 'hsl(var(--s-primary))',
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--s-text-subtle))]">
                      Step {step + 1} of {STEPS.length}
                    </div>
                    <h1 className="font-display text-xl sm:text-2xl font-semibold text-[hsl(var(--s-primary-ink))] leading-tight">
                      {Current.title}
                    </h1>
                    <p className="mt-0.5 text-sm text-[hsl(var(--s-text-muted))]">{Current.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {/* STEP 0 — Institution profile */}
                {step === 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Institution name" required>
                      <Input value={data.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Greenwood Academy" />
                    </Field>
                    <Field label="Short code" required hint="Uppercase, 2–8 chars">
                      <Input value={data.short_code} onChange={(e) => set('short_code', e.target.value.toUpperCase())} placeholder="GWA" maxLength={8} />
                    </Field>
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
                      <Input type="number" value={data.founded_year ?? ''} onChange={(e) => set('founded_year', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 1998" />
                    </Field>
                    <Field label="Motto" className="sm:col-span-2">
                      <Input value={data.motto ?? ''} onChange={(e) => set('motto', e.target.value)} placeholder="Knowledge. Character. Service." />
                    </Field>
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
                    <Field label="State / Region">
                      <Select value={data.state} onValueChange={(v) => set('state', v)}>
                        <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="City"><Input value={data.city} onChange={(e) => set('city', e.target.value)} /></Field>
                    <Field label="Phone" required><Input value={data.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234…" /></Field>
                    <Field label="Email" required><Input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} placeholder="admin@school.edu" /></Field>
                    <Field label="Website"><Input value={data.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></Field>
                    <Field label="Address" className="sm:col-span-2">
                      <Textarea rows={2} value={data.address} onChange={(e) => set('address', e.target.value)} placeholder="Street, area, landmark" />
                    </Field>
                  </div>
                )}

                {/* STEP 2 — Academic structure */}
                {step === 2 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Campuses">
                      <Input type="number" min={1} value={data.campus_count} onChange={(e) => set('campus_count', Math.max(1, Number(e.target.value) || 1))} />
                    </Field>
                    <Field label="Term system">
                      <Select value={data.term_system} onValueChange={(v: any) => set('term_system', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3-term">3 terms (Sept–July)</SelectItem>
                          <SelectItem value="2-semester">2 semesters</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Session start date">
                      <Input type="date" value={data.session_start_date} onChange={(e) => set('session_start_date', e.target.value)} />
                    </Field>
                    <Field label="Hierarchy levels enabled" className="sm:col-span-2" hint="Pick the org levels your institution uses.">
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(['faculty', 'department', 'programme', 'level', 'class'] as const).map((lvl) => {
                          const on = data.hierarchy_levels.includes(lvl);
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => {
                                const next = new Set(data.hierarchy_levels);
                                if (on) next.delete(lvl); else next.add(lvl);
                                set('hierarchy_levels', Array.from(next) as any);
                              }}
                              className={cn(
                                'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition',
                                on
                                  ? 'bg-[hsl(var(--s-primary)/0.12)] border-[hsl(var(--s-primary)/0.4)] text-[hsl(var(--s-primary))]'
                                  : 'bg-[hsl(var(--s-surface))] border-[hsl(var(--s-border))] text-[hsl(var(--s-text-muted))] hover:border-[hsl(var(--s-border-strong))]',
                              )}
                            >
                              {on && <Check className="inline h-3 w-3 mr-1 -mt-0.5" />}
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                  </div>
                )}

                {/* STEP 3 — Population */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Expected students"><Input type="number" value={data.expected_students} onChange={(e) => set('expected_students', Number(e.target.value) || 0)} /></Field>
                      <Field label="Teaching staff"><Input type="number" value={data.expected_teaching_staff} onChange={(e) => set('expected_teaching_staff', Number(e.target.value) || 0)} /></Field>
                      <Field label="Non-teaching staff"><Input type="number" value={data.expected_nonteaching_staff} onChange={(e) => set('expected_nonteaching_staff', Number(e.target.value) || 0)} /></Field>
                      <Field label="Guardians / parents"><Input type="number" value={data.expected_guardians} onChange={(e) => set('expected_guardians', Number(e.target.value) || 0)} /></Field>
                    </div>
                    <div className="rounded-lg bg-[hsl(var(--s-info)/0.08)] border border-[hsl(var(--s-info)/0.2)] p-3 text-xs text-[hsl(var(--s-text-muted))]">
                      Rough counts are fine — you can bulk-import the actual roster via CSV after onboarding.
                    </div>
                  </div>
                )}

                {/* STEP 4 — Attendance policy */}
                {step === 4 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Day start"><Input type="time" value={data.policy.day_start} onChange={(e) => set('policy', { ...data.policy, day_start: e.target.value })} /></Field>
                    <Field label="Day end"><Input type="time" value={data.policy.day_end} onChange={(e) => set('policy', { ...data.policy, day_end: e.target.value })} /></Field>
                    <Field label="Late after (minutes)"><Input type="number" value={data.policy.late_threshold_min} onChange={(e) => set('policy', { ...data.policy, late_threshold_min: Number(e.target.value) || 0 })} /></Field>
                    <Field label="Very late after (minutes)"><Input type="number" value={data.policy.very_late_threshold_min} onChange={(e) => set('policy', { ...data.policy, very_late_threshold_min: Number(e.target.value) || 0 })} /></Field>
                    <Field label="Half-day cutoff"><Input type="time" value={data.policy.half_day_cutoff} onChange={(e) => set('policy', { ...data.policy, half_day_cutoff: e.target.value })} /></Field>
                    <Field label="Grace days per term"><Input type="number" value={data.policy.grace_days_per_term} onChange={(e) => set('policy', { ...data.policy, grace_days_per_term: Number(e.target.value) || 0 })} /></Field>
                  </div>
                )}

                {/* STEP 5 — Capture points */}
                {step === 5 && (
                  <div className="space-y-3">
                    <div className="text-xs text-[hsl(var(--s-text-muted))]">
                      Add the physical locations where students & staff will be recognised. You can add more later.
                    </div>
                    {data.capture_points.map((cp, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <Input
                          className="col-span-12 sm:col-span-7"
                          value={cp.label}
                          placeholder="Location label, e.g. Main Gate"
                          onChange={(e) => {
                            const next = [...data.capture_points];
                            next[i] = { ...cp, label: e.target.value };
                            set('capture_points', next);
                          }}
                        />
                        <Select
                          value={cp.mode}
                          onValueChange={(v: any) => {
                            const next = [...data.capture_points];
                            next[i] = { ...cp, mode: v };
                            set('capture_points', next);
                          }}
                        >
                          <SelectTrigger className="col-span-10 sm:col-span-4"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gate">Gate</SelectItem>
                            <SelectItem value="classroom">Classroom</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="kiosk">Kiosk</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                        <SchoolsButton
                          variant="ghost"
                          size="icon"
                          className="col-span-2 sm:col-span-1"
                          aria-label="Remove capture point"
                          onClick={() => {
                            const next = data.capture_points.filter((_, x) => x !== i);
                            set('capture_points', next.length ? next : [{ label: 'Main Gate', mode: 'gate' }]);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </SchoolsButton>
                      </div>
                    ))}
                    <SchoolsButton
                      variant="outline"
                      size="sm"
                      onClick={() => set('capture_points', [...data.capture_points, { label: '', mode: 'classroom' }])}
                    >
                      <Plus className="h-4 w-4" /> Add capture point
                    </SchoolsButton>
                  </div>
                )}

                {/* STEP 6 — Admin */}
                {step === 6 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First name" required><Input value={data.admin_first_name} onChange={(e) => set('admin_first_name', e.target.value)} /></Field>
                    <Field label="Last name" required><Input value={data.admin_last_name} onChange={(e) => set('admin_last_name', e.target.value)} /></Field>
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
                    <div className="sm:col-span-2 rounded-lg bg-[hsl(var(--s-primary)/0.06)] border border-[hsl(var(--s-primary)/0.2)] p-3 text-xs text-[hsl(var(--s-text-muted))]">
                      A magic-link invite will be sent to <span className="font-medium text-[hsl(var(--s-primary-ink))]">{data.email || 'the email you entered earlier'}</span> after onboarding completes.
                    </div>
                  </div>
                )}

                {/* STEP 7 — Plan */}
                {step === 7 && (
                  <div className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {([
                        { id: 'starter',  name: 'Starter',  price: '$35',  blurb: 'Single campus, under 300 students', popular: false },
                        { id: 'pro',      name: 'Pro',      price: '$65',  blurb: 'Multi-campus, full analytics',       popular: true  },
                        { id: 'business', name: 'Business', price: '$100', blurb: 'Tertiary scale + parent portal',     popular: false },
                      ] as const).map((p) => {
                        const active = data.plan === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => set('plan', p.id)}
                            className={cn(
                              'relative rounded-xl border p-4 text-left transition',
                              active
                                ? 'border-[hsl(var(--s-primary))] bg-[hsl(var(--s-primary)/0.06)] ring-2 ring-[hsl(var(--s-primary)/0.25)]'
                                : 'border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface))] hover:border-[hsl(var(--s-border-strong))]',
                            )}
                          >
                            {p.popular && (
                              <span className="absolute -top-2 right-3"><Badge tone="accent">Most popular</Badge></span>
                            )}
                            <div className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--s-primary))]">
                              {p.name}
                            </div>
                            <div className="mt-1 font-display text-2xl font-bold text-[hsl(var(--s-primary-ink))]">
                              {p.price}
                              <span className="text-xs font-normal text-[hsl(var(--s-text-muted))]"> /mo</span>
                            </div>
                            <p className="mt-1 text-xs text-[hsl(var(--s-text-muted))] leading-snug">{p.blurb}</p>
                          </button>
                        );
                      })}
                    </div>
                    <label className="flex items-start gap-3 rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] p-3.5 text-sm text-[hsl(var(--s-text))]">
                      <Checkbox
                        checked={data.accepted_biometric_terms}
                        onCheckedChange={(c) => set('accepted_biometric_terms', !!c)}
                        className="mt-0.5"
                      />
                      <span>
                        I accept the <span className="font-medium">biometric &amp; privacy terms</span>. Biometric data stays
                        org-scoped, is encrypted at rest, and is never shared or sold to third parties.
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Footer nav */}
              <div className="border-t border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2)/0.5)] px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
                <SchoolsButton variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </SchoolsButton>
                <div className="hidden sm:block text-xs text-[hsl(var(--s-text-subtle))]">
                  Progress is saved automatically
                </div>
                {step < STEPS.length - 1 ? (
                  <SchoolsButton onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </SchoolsButton>
                ) : (
                  <SchoolsButton onClick={submit} disabled={submitting}>
                    {submitting ? 'Setting up…' : (<><Check className="h-4 w-4" /> Finish onboarding</>)}
                  </SchoolsButton>
                )}
              </div>
            </SchoolsCard>
          </section>
        </div>
      </div>
    </div>
  );
};

export default function SchoolsOnboarding() {
  return (
    <SchoolsThemeProvider>
      <Shell />
    </SchoolsThemeProvider>
  );
}

function Field({
  label, children, className, required, hint,
}: { label: string; children: React.ReactNode; className?: string; required?: boolean; hint?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--s-text-muted))]">
        {label}
        {required && <span className="text-[hsl(var(--s-danger))]">*</span>}
      </Label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-[hsl(var(--s-text-subtle))]">{hint}</p>}
    </div>
  );
}
