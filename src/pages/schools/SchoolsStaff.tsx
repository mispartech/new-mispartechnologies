import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, UserPlus, Users } from 'lucide-react';
import { GlassCard } from '@/components/schools/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '@/lib/api/schools/staff';
import { PunctualityBadge } from '@/components/schools/PunctualityBadge';
import { toast } from '@/hooks/use-toast';

export default function SchoolsStaff() {
  const { data: staff = [] } = useQuery({ queryKey: ['schools-staff'], queryFn: () => staffApi.list() });
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('all');
  const [emp, setEmp] = useState('all');

  const filtered = useMemo(() => staff.filter(s =>
    (dept === 'all' || s.department === dept) &&
    (emp === 'all' || s.employment_type === emp) &&
    (!q || s.full_name.toLowerCase().includes(q.toLowerCase()) || s.staff_no.toLowerCase().includes(q.toLowerCase()))
  ), [staff, q, dept, emp]);

  const depts = Array.from(new Set(staff.map(s => s.department)));

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400" /> Staff
          </h1>
          <p className="text-white/60 mt-1">Teaching and non-teaching staff. MVP focus: attendance & punctuality.</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
          onClick={() => toast({ title: 'Onboard staff', description: 'Staff onboarding wizard ships with Step 6 backend.' })}>
          <UserPlus className="w-4 h-4 mr-2" /> Onboard staff
        </Button>
      </div>

      <GlassCard>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="flex items-center gap-2 text-white/70 text-sm"><Filter className="w-4 h-4" /> Filters</div>
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <Input placeholder="Name or staff no…" value={q} onChange={e => setQ(e.target.value)} className="pl-9 bg-white/5 border-white/10 text-white" />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="md:w-52 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {depts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={emp} onValueChange={setEmp}>
            <SelectTrigger className="md:w-44 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any employment</SelectItem>
              <SelectItem value="full_time">Full-time</SelectItem>
              <SelectItem value="part_time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="visiting">Visiting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="hidden lg:block">
          <table className="w-full text-sm">
            <thead className="text-left text-white/50 text-xs uppercase tracking-wide">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Staff</th>
                <th className="px-5 py-3">Role / Dept</th>
                <th className="px-5 py-3">Employment</th>
                <th className="px-5 py-3">Punctuality</th>
                <th className="px-5 py-3">Attendance (30d)</th>
                <th className="px-5 py-3">Status</th>
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
                        <div className="text-xs text-white/50">{s.staff_no}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/80">
                    <div>{s.role}</div>
                    <div className="text-xs text-white/50">{s.department}</div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className="border-white/15 text-white/70 capitalize">{s.employment_type.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-5 py-3"><PunctualityBadge pct={s.punctuality_pct_30d} /></td>
                  <td className="px-5 py-3 text-white font-semibold">{s.attendance_pct_30d}%</td>
                  <td className="px-5 py-3">
                    <Badge className={`${s.status === 'active' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'} border capitalize`}>{s.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/schools/dashboard/staff/${s.id}`}>
                      <Button size="sm" variant="outline" className="border-white/15 text-white/80 hover:bg-white/10">View attendance</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden divide-y divide-white/5">
          {filtered.map(s => (
            <Link to={`/schools/dashboard/staff/${s.id}`} key={s.id} className="block p-4 hover:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 flex items-center justify-center text-white text-sm font-semibold ${s.enrollment === 'enrolled' ? 'border-emerald-400/60' : 'border-amber-400/60'}`}>
                    {s.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{s.full_name}</div>
                    <div className="text-xs text-white/50">{s.role} · {s.department}</div>
                  </div>
                </div>
                <PunctualityBadge pct={s.punctuality_pct_30d} />
              </div>
              <div className="mt-2 text-xs text-white/60 flex justify-between">
                <span>{s.attendance_pct_30d}% (30d)</span>
                <span>{s.late_count_30d} late · {s.absent_days_30d} absent</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && <div className="p-10 text-center text-white/50 text-sm">No matching staff.</div>}
      </GlassCard>
    </div>
  );
}
