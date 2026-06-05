import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, GraduationCap, AlertTriangle, ScanFace, UserCheck } from 'lucide-react';
import {
  SchoolsCard, StatCard, Badge, SchoolsButton, Avatar, EmptyState, TabBar,
} from '@/components/schools/ui/SchoolsUI';
import { studentsApi, type Student } from '@/lib/api/schools/students';

type LevelFilter = 'all' | 'JSS1' | 'JSS2' | 'JSS3' | 'SS1' | 'SS2' | 'SS3';

const SchoolsStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<LevelFilter>('all');

  useEffect(() => {
    studentsApi.list().then(setStudents).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return students.filter(s => {
      if (level !== 'all' && s.level !== level) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return s.full_name.toLowerCase().includes(q) || s.admission_no.toLowerCase().includes(q) || s.class.toLowerCase().includes(q);
    });
  }, [students, search, level]);

  const stats = useMemo(() => {
    const total = students.length;
    const enrolled = students.filter(s => s.enrollment === 'enrolled').length;
    const atRisk = students.filter(s => s.risk === 'high' || s.risk === 'critical').length;
    const avgAtt = total ? Math.round(students.reduce((a, s) => a + s.attendance_pct_30d, 0) / total) : 0;
    return { total, enrolled, atRisk, avgAtt };
  }, [students]);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-8 space-y-6 s-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--s-accent))]">People</div>
          <h1 className="mt-1 font-display text-2xl lg:text-3xl font-bold text-[hsl(var(--s-primary-ink))]">
            Students
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--s-text-muted))]">
            Directory of every learner, with biometric and attendance status.
          </p>
        </div>
        <SchoolsButton variant="primary"><Plus className="h-4 w-4" /> Enroll student</SchoolsButton>
      </div>

      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students" value={stats.total} icon={GraduationCap} tone="primary" />
        <StatCard label="Biometric enrolled" value={`${stats.enrolled}/${stats.total}`} icon={ScanFace} tone="accent" />
        <StatCard label="Avg attendance (30d)" value={`${stats.avgAtt}%`} icon={UserCheck} tone="accent" />
        <StatCard label="At-risk learners" value={stats.atRisk} icon={AlertTriangle} tone="danger" />
      </section>

      <SchoolsCard padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[hsl(var(--s-border))]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--s-text-subtle))]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, admission no, class…"
              className="h-10 w-full rounded-lg border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface-2))] pl-9 pr-3 text-sm text-[hsl(var(--s-text))] placeholder:text-[hsl(var(--s-text-subtle))] focus:outline-none focus:border-[hsl(var(--s-primary))]"
            />
          </div>
          <TabBar<LevelFilter>
            value={level}
            onChange={setLevel}
            tabs={[
              { value: 'all', label: 'All' },
              { value: 'JSS1', label: 'JSS1' },
              { value: 'JSS2', label: 'JSS2' },
              { value: 'JSS3', label: 'JSS3' },
              { value: 'SS1', label: 'SS1' },
              { value: 'SS2', label: 'SS2' },
              { value: 'SS3', label: 'SS3' },
            ]}
          />
          <SchoolsButton variant="outline" size="md"><Filter className="h-4 w-4" /> Filter</SchoolsButton>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No students match" description="Try a different filter or search term." />
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(s => (
              <Link
                key={s.id}
                to={`/schools/dashboard/students/${s.id}`}
                className="group rounded-xl border border-[hsl(var(--s-border))] bg-[hsl(var(--s-surface))] p-4 hover:border-[hsl(var(--s-primary))] hover:shadow-[var(--s-shadow-md)] transition"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={s.full_name} attendancePct={s.attendance_pct_30d} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[hsl(var(--s-text))] truncate group-hover:text-[hsl(var(--s-primary))]">
                      {s.full_name}
                    </div>
                    <div className="text-[11px] text-[hsl(var(--s-text-subtle))]">{s.admission_no}</div>
                    <Badge tone="subtle" className="mt-1.5">{s.class}</Badge>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[hsl(var(--s-text-muted))]">Attendance</span>
                  <span className="font-display font-semibold tabular-nums text-[hsl(var(--s-primary-ink))]">{s.attendance_pct_30d}%</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <Badge tone={s.enrollment === 'enrolled' ? 'accent' : s.enrollment === 'pending' ? 'warning' : 'subtle'}>
                    {s.enrollment === 'enrolled' ? 'Enrolled' : s.enrollment === 'pending' ? 'Pending' : 'Not enrolled'}
                  </Badge>
                  {(s.risk === 'high' || s.risk === 'critical') && (
                    <Badge tone={s.risk === 'critical' ? 'danger' : 'warning'}>
                      <AlertTriangle className="h-3 w-3" /> {s.risk}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </SchoolsCard>
    </div>
  );
};

export default SchoolsStudents;
