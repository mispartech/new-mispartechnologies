import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, UserPlus, Upload, GraduationCap, ScanFace } from 'lucide-react';
import { GlassCard } from '@/components/msse/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '@/lib/api/msse/students';
import { toast } from '@/hooks/use-toast';

const riskTone = {
  low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  high: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  critical: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
} as const;

export default function MsseStudents() {
  const { data: students = [] } = useQuery({ queryKey: ['msse-students'], queryFn: () => studentsApi.list() });
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const [enr, setEnr] = useState('all');

  const filtered = useMemo(() => students.filter(s =>
    (level === 'all' || s.level === level) &&
    (status === 'all' || s.status === status) &&
    (enr === 'all' || s.enrollment === enr) &&
    (!q || s.full_name.toLowerCase().includes(q.toLowerCase()) || s.admission_no.toLowerCase().includes(q.toLowerCase()))
  ), [students, q, level, status, enr]);

  const levels = Array.from(new Set(students.map(s => s.level)));

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-cyan-400" /> Students
          </h1>
          <p className="text-white/60 mt-1">Directory of enrolled students. MVP focus: attendance oversight.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/15 text-white/80 hover:bg-white/10"
            onClick={() => toast({ title: 'Bulk import', description: 'CSV import — backend endpoint pending.' })}>
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
            onClick={() => toast({ title: 'Add student', description: 'Enrollment wizard ships with backend Step 5.' })}>
            <UserPlus className="w-4 h-4 mr-2" /> Add student
          </Button>
        </div>
      </div>

      <GlassCard>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="flex items-center gap-2 text-white/70 text-sm"><Filter className="w-4 h-4" /> Filters</div>
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <Input placeholder="Name or admission no…" value={q} onChange={e => setQ(e.target.value)} className="pl-9 bg-white/5 border-white/10 text-white" />
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="md:w-40 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="md:w-40 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="graduated">Graduated</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={enr} onValueChange={setEnr}>
            <SelectTrigger className="md:w-44 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any enrollment</SelectItem>
              <SelectItem value="enrolled">Biometric enrolled</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="not_enrolled">Not enrolled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden lg:block">
          <table className="w-full text-sm">
            <thead className="text-left text-white/50 text-xs uppercase tracking-wide">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Guardian</th>
                <th className="px-5 py-3">Enrollment</th>
                <th className="px-5 py-3">Attendance (30d)</th>
                <th className="px-5 py-3">Risk</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 flex items-center justify-center text-white text-sm font-semibold ${s.enrollment === 'enrolled' ? 'border-emerald-400/60' : 'border-amber-400/60'}`}>
                        {s.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{s.full_name}</div>
                        <div className="text-xs text-white/50">{s.admission_no}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/80">{s.class}</td>
                  <td className="px-5 py-3 text-white/70">
                    <div>{s.guardian_name}</div>
                    <div className="text-xs text-white/40">{s.guardian_phone}</div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className="border-white/15 text-white/70 capitalize">
                      <ScanFace className="w-3 h-3 mr-1" />{s.enrollment.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-white font-semibold">{s.attendance_pct_30d}%</td>
                  <td className="px-5 py-3"><Badge className={`${riskTone[s.risk]} border capitalize`}>{s.risk}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/msse/dashboard/students/${s.id}`}>
                      <Button size="sm" variant="outline" className="border-white/15 text-white/80 hover:bg-white/10">View attendance</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-white/5">
          {filtered.map(s => (
            <Link to={`/msse/dashboard/students/${s.id}`} key={s.id} className="block p-4 hover:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 flex items-center justify-center text-white text-sm font-semibold ${s.enrollment === 'enrolled' ? 'border-emerald-400/60' : 'border-amber-400/60'}`}>
                    {s.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{s.full_name}</div>
                    <div className="text-xs text-white/50">{s.class} · {s.admission_no}</div>
                  </div>
                </div>
                <Badge className={`${riskTone[s.risk]} border capitalize`}>{s.risk}</Badge>
              </div>
              <div className="mt-2 text-xs text-white/60 flex justify-between">
                <span>{s.attendance_pct_30d}% (30d)</span>
                <span>{s.late_count_30d} late · {s.absent_days_30d} absent</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && <div className="p-10 text-center text-white/50 text-sm">No matching students.</div>}
      </GlassCard>
    </div>
  );
}
