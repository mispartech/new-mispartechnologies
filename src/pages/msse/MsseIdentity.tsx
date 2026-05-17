import { useEffect, useMemo, useState } from 'react';
import {
  ScanFace, Search, UserPlus, ShieldAlert, Filter, BadgeCheck, Clock,
  AlertTriangle, Camera, Upload, CheckCircle2, X, Loader2, Fingerprint,
  CreditCard, QrCode, Radio, ArrowLeft, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/msse/GlassCard';
import { LiveStatBadge } from '@/components/msse/LiveStatBadge';
import { AiInsightCallout } from '@/components/msse/AiInsightCallout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  msseIdentityApi, MOCK_IDENTITIES, MOCK_DUPLICATES,
  type IdentityProfile, type DuplicateSuspect, type EnrollmentStatus, type IdentityRole,
} from '@/lib/api/msse/identity';

type Tab = 'directory' | 'enroll' | 'duplicates';

const ROLE_LABEL: Record<IdentityRole, string> = {
  student: 'Student', teacher: 'Teacher', staff: 'Staff', admin: 'Admin', visitor: 'Visitor',
};

const statusColor = (s: EnrollmentStatus) =>
  s === 'enrolled' ? 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/30'
  : s === 'pending' ? 'text-amber-300 bg-amber-400/10 ring-amber-400/30'
  : s === 'expired' ? 'text-orange-300 bg-orange-400/10 ring-orange-400/30'
  : 'text-rose-300 bg-rose-400/10 ring-rose-400/30';

const credIcon = (c: string) => {
  switch (c) {
    case 'face': return <ScanFace className="h-3 w-3" />;
    case 'rfid': return <Radio className="h-3 w-3" />;
    case 'nfc':  return <CreditCard className="h-3 w-3" />;
    case 'qr':   return <QrCode className="h-3 w-3" />;
    default:     return <Fingerprint className="h-3 w-3" />;
  }
};

const MsseIdentity = () => {
  const [tab, setTab] = useState<Tab>('directory');
  const [identities, setIdentities] = useState<IdentityProfile[]>(MOCK_IDENTITIES);
  const [duplicates, setDuplicates] = useState<DuplicateSuspect[]>(MOCK_DUPLICATES);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | IdentityRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | EnrollmentStatus>('all');
  const [selected, setSelected] = useState<IdentityProfile | null>(null);

  // Fetch with graceful fallback to mock data
  useEffect(() => {
    msseIdentityApi.list()
      .then((r) => { if (r?.results?.length) setIdentities(r.results); })
      .catch(() => { /* backend pending */ });
    msseIdentityApi.duplicates()
      .then((r) => { if (r?.results?.length) setDuplicates(r.results); })
      .catch(() => { /* backend pending */ });
  }, []);

  const filtered = useMemo(() => identities.filter((i) => {
    const q = query.toLowerCase();
    const matchQ = !q || i.full_name.toLowerCase().includes(q) || i.reference_no.toLowerCase().includes(q);
    const matchR = roleFilter === 'all' || i.role === roleFilter;
    const matchS = statusFilter === 'all' || i.enrollment_status === statusFilter;
    return matchQ && matchR && matchS;
  }), [identities, query, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: identities.length,
    enrolled: identities.filter((i) => i.enrollment_status === 'enrolled').length,
    pending: identities.filter((i) => i.enrollment_status === 'pending').length,
    duplicates: duplicates.length,
  }), [identities, duplicates]);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link to="/msse/dashboard" className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
              <ScanFace className="h-5 w-5 text-white" />
            </span>
            Biometric Identity System
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enrol, manage, and verify every face on campus — students, teachers, staff & visitors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setTab('enroll')}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
          >
            <UserPlus className="h-4 w-4 mr-2" /> New Enrollment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <GlassCard className="!p-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Total Identities</div>
          <div className="mt-1 text-2xl font-bold text-white">{stats.total.toLocaleString()}</div>
          <LiveStatBadge label="indexed" />
        </GlassCard>
        <GlassCard className="!p-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Enrolled</div>
          <div className="mt-1 text-2xl font-bold text-emerald-300">{stats.enrolled}</div>
          <div className="text-[11px] text-slate-500 mt-1">{Math.round((stats.enrolled / Math.max(stats.total, 1)) * 100)}% coverage</div>
        </GlassCard>
        <GlassCard className="!p-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Pending</div>
          <div className="mt-1 text-2xl font-bold text-amber-300">{stats.pending}</div>
          <div className="text-[11px] text-slate-500 mt-1">awaiting biometric</div>
        </GlassCard>
        <GlassCard className="!p-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Duplicate Alerts</div>
          <div className="mt-1 text-2xl font-bold text-rose-300">{stats.duplicates}</div>
          <div className="text-[11px] text-slate-500 mt-1">need review</div>
        </GlassCard>
      </div>

      <AiInsightCallout className="mb-6">
        AI cross-checked {stats.total} embeddings — {stats.duplicates} potential duplicate
        {stats.duplicates === 1 ? '' : 's'} flagged at &gt;90% similarity. Review in the Duplicates tab.
      </AiInsightCallout>

      {/* Tabs */}
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-5">
        {([
          { id: 'directory',  label: 'Identity Directory',  icon: Search },
          { id: 'enroll',     label: 'Enrollment Wizard',   icon: Camera },
          { id: 'duplicates', label: `Duplicates (${stats.duplicates})`, icon: ShieldAlert },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5',
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'directory' && (
        <DirectoryTab
          filtered={filtered}
          query={query} setQuery={setQuery}
          roleFilter={roleFilter} setRoleFilter={setRoleFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          onSelect={setSelected}
        />
      )}

      {tab === 'enroll' && (
        <EnrollmentWizard
          onEnrolled={(profile) => {
            setIdentities((prev) => [profile, ...prev]);
            setTab('directory');
          }}
        />
      )}

      {tab === 'duplicates' && (
        <DuplicatesTab
          items={duplicates}
          onResolve={(id) => setDuplicates((prev) => prev.filter((d) => d.id !== id))}
        />
      )}

      {selected && (
        <ProfileDrawer profile={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

/* ----------------------------- Directory ----------------------------- */

const DirectoryTab = ({
  filtered, query, setQuery, roleFilter, setRoleFilter, statusFilter, setStatusFilter, onSelect,
}: {
  filtered: IdentityProfile[];
  query: string; setQuery: (s: string) => void;
  roleFilter: 'all' | IdentityRole; setRoleFilter: (r: 'all' | IdentityRole) => void;
  statusFilter: 'all' | EnrollmentStatus; setStatusFilter: (s: 'all' | EnrollmentStatus) => void;
  onSelect: (p: IdentityProfile) => void;
}) => (
  <GlassCard>
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or reference no…"
          className="pl-9 bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
        />
      </div>
      <div className="flex items-center gap-2 text-xs">
        <Filter className="h-4 w-4 text-slate-500" />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="bg-slate-900/60 border border-white/10 rounded-md px-2 py-1.5 text-white text-xs"
        >
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
          <option value="visitor">Visitors</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-900/60 border border-white/10 rounded-md px-2 py-1.5 text-white text-xs"
        >
          <option value="all">All status</option>
          <option value="enrolled">Enrolled</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <div className="overflow-x-auto -mx-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/10">
            <th className="text-left font-medium px-5 py-2">Identity</th>
            <th className="text-left font-medium px-3 py-2">Role</th>
            <th className="text-left font-medium px-3 py-2 hidden md:table-cell">Faculty / Dept</th>
            <th className="text-left font-medium px-3 py-2">Status</th>
            <th className="text-left font-medium px-3 py-2 hidden lg:table-cell">Credentials</th>
            <th className="text-left font-medium px-3 py-2 hidden lg:table-cell">Last Seen</th>
            <th className="px-5 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((i) => (
            <tr key={i.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-9 w-9 rounded-full grid place-items-center text-xs font-bold ring-2',
                    i.enrollment_status === 'enrolled' ? 'ring-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                    : i.enrollment_status === 'pending' ? 'ring-amber-400/60 bg-amber-400/10 text-amber-200'
                    : 'ring-rose-400/60 bg-rose-400/10 text-rose-200',
                  )}>
                    {i.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-white">{i.full_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{i.reference_no}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-slate-300">{ROLE_LABEL[i.role]}</td>
              <td className="px-3 py-3 text-slate-400 hidden md:table-cell">
                {i.faculty || '—'}{i.department ? ` · ${i.department}` : ''}
              </td>
              <td className="px-3 py-3">
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest ring-1',
                  statusColor(i.enrollment_status),
                )}>
                  {i.enrollment_status === 'enrolled' && <BadgeCheck className="h-3 w-3" />}
                  {i.enrollment_status === 'pending' && <Clock className="h-3 w-3" />}
                  {i.enrollment_status === 'expired' && <AlertTriangle className="h-3 w-3" />}
                  {i.enrollment_status}
                </span>
              </td>
              <td className="px-3 py-3 hidden lg:table-cell">
                <div className="flex items-center gap-1">
                  {i.credentials.length === 0 && <span className="text-slate-600 text-xs">none</span>}
                  {i.credentials.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-200 text-[10px] uppercase">
                      {credIcon(c)} {c}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-3 py-3 text-slate-500 text-xs hidden lg:table-cell">
                {i.last_seen_at ? new Date(i.last_seen_at).toLocaleString() : '—'}
              </td>
              <td className="px-5 py-3 text-right">
                <button
                  onClick={() => onSelect(i)}
                  className="text-cyan-300 hover:text-cyan-200 text-xs font-medium"
                >
                  View →
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-10 text-slate-500 text-sm">
                No identities match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </GlassCard>
);

/* --------------------------- Enrollment Wizard --------------------------- */

type WizStep = 1 | 2 | 3 | 4;

const EnrollmentWizard = ({ onEnrolled }: { onEnrolled: (p: IdentityProfile) => void }) => {
  const [step, setStep] = useState<WizStep>(1);
  const [form, setForm] = useState({
    full_name: '', reference_no: '', role: 'student' as IdentityRole,
    faculty: '', department: '', class_or_level: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [quality, setQuality] = useState<number | null>(null);

  const canNext1 = form.full_name.trim() && form.reference_no.trim();

  const handleImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      // Mock quality check
      setUploading(true);
      setTimeout(() => {
        const q = 0.85 + Math.random() * 0.13;
        setQuality(q);
        setUploading(false);
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const finish = () => {
    const profile: IdentityProfile = {
      id: `i-${Date.now()}`,
      full_name: form.full_name,
      reference_no: form.reference_no,
      role: form.role,
      campus: 'Main Campus',
      faculty: form.faculty || null,
      department: form.department || null,
      class_or_level: form.class_or_level || null,
      enrollment_status: 'enrolled',
      face_quality_score: quality,
      credentials: ['face'],
      photo_url: imagePreview,
      last_seen_at: null,
      created_at: new Date().toISOString(),
    };
    onEnrolled(profile);
  };

  return (
    <GlassCard>
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex items-center flex-1">
            <div className={cn(
              'h-8 w-8 rounded-full grid place-items-center text-xs font-bold ring-2 transition-colors',
              step === n ? 'bg-cyan-500 text-slate-950 ring-cyan-400'
              : step > n ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/40'
              : 'bg-white/5 text-slate-500 ring-white/10',
            )}>
              {step > n ? <CheckCircle2 className="h-4 w-4" /> : n}
            </div>
            {n < 4 && (
              <div className={cn('h-px flex-1 mx-2', step > n ? 'bg-emerald-400/40' : 'bg-white/10')} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Step 1</div>
            <h3 className="text-lg font-bold text-white">Bio data</h3>
            <p className="text-sm text-slate-400">Identify the person you are enrolling.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Full name *</label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="bg-slate-900/60 border-white/10 text-white"
                placeholder="e.g. Chinedu Eze"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Reference / matric no *</label>
              <Input
                value={form.reference_no}
                onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
                className="bg-slate-900/60 border-white/10 text-white font-mono"
                placeholder="e.g. CSC/2024/001"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as IdentityRole })}
                className="w-full bg-slate-900/60 border border-white/10 rounded-md px-3 py-2 text-white text-sm"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
                <option value="admin">Administrator</option>
                <option value="visitor">Visitor</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Class / Level</label>
              <Input
                value={form.class_or_level}
                onChange={(e) => setForm({ ...form, class_or_level: e.target.value })}
                className="bg-slate-900/60 border-white/10 text-white"
                placeholder="e.g. 300L or SS2"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Faculty</label>
              <Input
                value={form.faculty}
                onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                className="bg-slate-900/60 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Department</label>
              <Input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="bg-slate-900/60 border-white/10 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              disabled={!canNext1}
              onClick={() => setStep(2)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold disabled:opacity-40"
            >
              Continue →
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Step 2</div>
            <h3 className="text-lg font-bold text-white">Capture biometric</h3>
            <p className="text-sm text-slate-400">Upload a clear, front-facing photo. Good lighting, no sunglasses, no mask.</p>
          </div>

          <label className="block">
            <div className="relative aspect-video rounded-xl border-2 border-dashed border-white/15 bg-slate-900/40 hover:border-cyan-400/40 transition-colors cursor-pointer overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-center p-6">
                  <div>
                    <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-cyan-400/10 grid place-items-center">
                      <Upload className="h-6 w-6 text-cyan-300" />
                    </div>
                    <div className="text-white font-medium">Click to upload photo</div>
                    <div className="text-xs text-slate-500 mt-1">JPG or PNG · &lt; 5 MB</div>
                  </div>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-slate-950/70 grid place-items-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-cyan-300 animate-spin mx-auto mb-2" />
                    <div className="text-sm text-white">Analyzing face quality…</div>
                  </div>
                </div>
              )}
              <input
                type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
              />
            </div>
          </label>

          {quality !== null && !uploading && (
            <div className="rounded-lg bg-emerald-400/10 border border-emerald-400/20 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Face quality: <strong>{(quality * 100).toFixed(1)}%</strong>
                </span>
                <span className="text-xs text-emerald-300/70">
                  {quality > 0.9 ? 'Excellent' : quality > 0.8 ? 'Good' : 'Acceptable'}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-400">← Back</Button>
            <Button
              disabled={!imagePreview || uploading || quality === null}
              onClick={() => setStep(3)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold disabled:opacity-40"
            >
              Continue →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Step 3</div>
            <h3 className="text-lg font-bold text-white">Backup credentials</h3>
            <p className="text-sm text-slate-400">Optionally issue an RFID/NFC card or QR badge as fallback.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { type: 'rfid', label: 'RFID Card', icon: Radio, desc: 'Tap-to-verify cards for offline scenarios.' },
              { type: 'nfc',  label: 'NFC Tag',   icon: CreditCard, desc: 'Phone-tap verification at smart gates.' },
              { type: 'qr',   label: 'QR Badge',  icon: QrCode, desc: 'Printable backup badge with secure token.' },
            ].map((c) => (
              <div key={c.type} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-cyan-400/30 transition-colors">
                <c.icon className="h-5 w-5 text-cyan-300 mb-2" />
                <div className="font-semibold text-white text-sm">{c.label}</div>
                <div className="text-xs text-slate-400 mt-1 mb-3">{c.desc}</div>
                <button className="text-xs text-cyan-300 hover:text-cyan-200">+ Issue (optional)</button>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(2)} className="text-slate-400">← Back</Button>
            <Button
              onClick={() => setStep(4)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
            >
              Continue →
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Step 4</div>
            <h3 className="text-lg font-bold text-white">Review & confirm</h3>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex gap-4">
            {imagePreview && <img src={imagePreview} alt="" className="h-24 w-24 rounded-xl object-cover ring-2 ring-cyan-400/40" />}
            <div className="flex-1 text-sm">
              <div className="font-bold text-white text-lg">{form.full_name}</div>
              <div className="text-slate-400 font-mono text-xs">{form.reference_no}</div>
              <div className="mt-2 space-y-0.5 text-slate-400">
                <div>Role: <span className="text-white">{ROLE_LABEL[form.role]}</span></div>
                {form.faculty && <div>Faculty: <span className="text-white">{form.faculty}</span></div>}
                {form.department && <div>Department: <span className="text-white">{form.department}</span></div>}
                {form.class_or_level && <div>Class: <span className="text-white">{form.class_or_level}</span></div>}
                {quality !== null && <div>Face quality: <span className="text-emerald-300">{(quality * 100).toFixed(1)}%</span></div>}
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(3)} className="text-slate-400">← Back</Button>
            <Button onClick={finish} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Enrollment
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

/* ------------------------------ Duplicates ------------------------------ */

const DuplicatesTab = ({
  items, onResolve,
}: { items: DuplicateSuspect[]; onResolve: (id: string) => void }) => {
  if (items.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-400/10 grid place-items-center mb-3">
            <BadgeCheck className="h-7 w-7 text-emerald-300" />
          </div>
          <div className="text-white font-semibold">No duplicates detected</div>
          <div className="text-sm text-slate-400 mt-1">The AI hasn't flagged any matching biometric pairs.</div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((d) => (
        <GlassCard key={d.id}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-400/10 grid place-items-center">
                <ShieldAlert className="h-5 w-5 text-rose-300" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Potential duplicate · {(d.similarity * 100).toFixed(1)}% similarity
                </div>
                <div className="text-[11px] text-slate-500">
                  Detected {new Date(d.detected_at).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                onClick={() => onResolve(d.id)}
                className="border-white/15 text-slate-200 hover:bg-white/5"
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() => onResolve(d.id)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Merge profiles
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {[d.primary, d.candidate].map((p, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                  {idx === 0 ? 'Primary record' : 'Candidate match'}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-cyan-400/10 ring-2 ring-cyan-400/30 grid place-items-center text-xs font-bold text-cyan-200">
                    {p.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{p.full_name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{p.reference_no}</div>
                    <div className="text-[11px] text-slate-400">{p.department || '—'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

/* ------------------------------ Profile Drawer ------------------------------ */

const ProfileDrawer = ({ profile, onClose }: { profile: IdentityProfile; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-md h-full bg-slate-950 border-l border-white/10 overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="text-sm font-semibold text-white">Identity profile</div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-4">
          <div className={cn(
            'h-16 w-16 rounded-2xl grid place-items-center text-lg font-bold ring-2',
            profile.enrollment_status === 'enrolled' ? 'ring-emerald-400/60 bg-emerald-400/10 text-emerald-200'
            : 'ring-amber-400/60 bg-amber-400/10 text-amber-200',
          )}>
            {profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="font-bold text-white text-lg">{profile.full_name}</div>
            <div className="text-xs font-mono text-slate-500">{profile.reference_no}</div>
            <div className="text-xs text-slate-400 mt-0.5">{ROLE_LABEL[profile.role]}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2 text-sm">
          {profile.faculty && <Row label="Faculty" value={profile.faculty} />}
          {profile.department && <Row label="Department" value={profile.department} />}
          {profile.class_or_level && <Row label="Class / Level" value={profile.class_or_level} />}
          {profile.campus && <Row label="Campus" value={profile.campus} />}
          <Row label="Created" value={new Date(profile.created_at).toLocaleDateString()} />
          {profile.last_seen_at && <Row label="Last seen" value={new Date(profile.last_seen_at).toLocaleString()} />}
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Biometric credentials</div>
          <div className="flex flex-wrap gap-2">
            {profile.credentials.length === 0 && <span className="text-xs text-slate-500">None issued</span>}
            {profile.credentials.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-400/10 ring-1 ring-cyan-400/20 text-cyan-200 text-xs">
                {credIcon(c)} {c.toUpperCase()}
              </span>
            ))}
          </div>
          {profile.face_quality_score !== null && (
            <div className="mt-3 text-xs text-slate-400">
              Face embedding quality: <span className="text-emerald-300 font-semibold">{(profile.face_quality_score * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 border-white/15 text-slate-200 hover:bg-white/5">
            <RefreshCw className="h-4 w-4 mr-2" /> Re-enroll
          </Button>
          <Button className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold">
            <Fingerprint className="h-4 w-4 mr-2" /> Issue credential
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3">
    <span className="text-slate-500 text-xs">{label}</span>
    <span className="text-white text-xs text-right">{value}</span>
  </div>
);

export default MsseIdentity;
