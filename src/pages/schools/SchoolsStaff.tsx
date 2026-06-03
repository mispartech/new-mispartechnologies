import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Users, AlertTriangle, ScanFace, UserCheck, Briefcase } from 'lucide-react';
import {
  SchoolsCard, StatCard, Badge, SchoolsButton, Avatar, EmptyState, TabBar,
} from '@/components/schools/ui/SchoolsUI';
import { staffApi, type Staff } from '@/lib/api/schools/staff';

type RoleFilter = 'all' | 'lecturer' | 'admin' | 'security' | 'support';

const matchRole = (s: Staff, f: RoleFilter) => {
  if (f === 'all') return true;
  const r = s.role.toLowerCase();
  if (f === 'lecturer') return r.includes('lecturer') || r.includes('teacher') || r.includes('hod');
  if (f === 'admin') return r.includes('bursar') || r.includes('admin') || r.includes('principal') || r.includes('registrar');
  if (f === 'security') return r.includes('security');
  if (f === 'support') return !r.includes('lecturer') && !r.includes('admin') && !r.includes('security') && !r.includes('hod') && !r.includes('teacher');
  return true;
};

const SchoolsStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');

  useEffect(() => { staffApi.list().then(setStaff); }, []);

  const filtered = useMemo(() => {
    return staff.filter(s => {
      if (!matchRole(s, role)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return s.full_name.toLowerCase().includes(q) || s.staff_no.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
    });
  }, [staff, search, role]);

  const stats = useMemo(() => {
    const total = staff.length;
    const present = staff.filter(s => s.status === 'active').length;
    const onLeave = staff.filter(s => s.status === 'on_leave').length;
    const punctuality = total ? Math.round(staff.reduce((a, s) => a + s.punctuality_pct_30d, 0) / total) : 0;
    return { total, present, onLeave, punctuality };
  }, [staff]);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-8 space-y-6 s-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--s-accent))]">People</div>
          <h1 className="mt-1 font-display text-2xl lg:text-3xl font-bold text-[hsl(var(--s-primary-ink))]">
            Staff
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--s-text-muted))]">
            Teachers, leadership and support staff — attendance, enrollment and roles.
          </p>
        </div>
        <SchoolsButton variant="primary"><Plus className="h-4 w-4" /> Invite staff</SchoolsButton>
      </div>

      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total staff" value={stats.total} icon={Users} tone="primary" />
        <StatCard label="Active today" value={stats.present} icon={UserCheck} tone="accent" />
        <StatCard label="On leave" value={stats.onLeave} icon={Briefcase} tone="warning" />
        <StatCard label="Avg punctuality" value={`${stats.punctuality}%`} icon={ScanFace} tone="accent" />
      </section>

      <SchoolsCard padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[hsl(var(--s-border))]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--s-text-subtle))]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, staff no, department…"
              className="h-10 w-full rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] pl-9 pr-3 text-sm text-[hsl(var(--s-text))] placeholder:text-[hsl(var(--s-text-subtle))] focus:outline-none focus:border-[hsl(var(--s-primary))]"
            />
          </div>
          <TabBar<RoleFilter>
            value={role}
            onChange={setRole}
            tabs={[
              { value: 'all', label: 'All' },
              { value: 'lecturer', label: 'Teaching' },
              { value: 'admin', label: 'Admin' },
              { value: 'security', label: 'Security' },
              { value: 'support', label: 'Support' },
            ]}
          />
          <SchoolsButton variant="outline" size="md"><Filter className="h-4 w-4" /> Filter</SchoolsButton>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No staff match" description="Try a different filter or search term." />
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(s => (
              <Link
                key={s.id}
                to={`/schools/dashboard/staff/${s.id}`}
                className="group rounded-xl border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface))] p-4 hover:border-[hsl(var(--s-primary))] hover:shadow-[var(--s-shadow-md)] transition"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={s.full_name} attendancePct={s.attendance_pct_30d} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[hsl(var(--s-text))] truncate group-hover:text-[hsl(var(--s-primary))]">
                      {s.full_name}
                    </div>
                    <div className="text-[11px] text-[hsl(var(--s-text-subtle))]">{s.staff_no}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge tone="primary">{s.role}</Badge>
                      <Badge tone="subtle">{s.department}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[hsl(var(--s-text-subtle))]">Attendance</div>
                    <div className="font-display font-semibold tabular-nums text-[hsl(var(--s-primary-ink))]">{s.attendance_pct_30d}%</div>
                  </div>
                  <div>
                    <div className="text-[hsl(var(--s-text-subtle))]">Punctuality</div>
                    <div className="font-display font-semibold tabular-nums text-[hsl(var(--s-primary-ink))]">{s.punctuality_pct_30d}%</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Badge tone={s.status === 'active' ? 'accent' : s.status === 'on_leave' ? 'warning' : 'subtle'}>
                    {s.status.replace('_', ' ')}
                  </Badge>
                  <Badge tone={s.enrollment === 'enrolled' ? 'accent' : 'warning'}>
                    {s.enrollment === 'enrolled' ? 'Enrolled' : s.enrollment === 'pending' ? 'Pending' : 'No biometric'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SchoolsCard>
    </div>
  );
};

export default SchoolsStaff;
