import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ScanFace, Mail, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/schools/GlassCard';
import { PersonAttendanceTab } from '@/components/schools/PersonAttendanceTab';
import { Phase2Tab } from '@/components/schools/Phase2Tab';
import { PunctualityBadge } from '@/components/schools/PunctualityBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { staffApi } from '@/lib/api/schools/staff';

export default function SchoolsStaffProfile() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: s } = useQuery({ queryKey: ['schools-staff', id], queryFn: () => staffApi.get(id), enabled: !!id });

  if (!s) return <div className="p-10 text-white/60">Loading staff…</div>;

  return (
    <div className="p-6 space-y-5">
      <Link to="/schools/dashboard/staff" className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200">
        <ArrowLeft className="h-3 w-3" /> Back to staff
      </Link>

      <GlassCard glow>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 flex items-center justify-center text-white text-xl font-bold ${s.enrollment === 'enrolled' ? 'border-emerald-400/60' : 'border-amber-400/60'}`}>
            {s.full_name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-white">{s.full_name}</div>
            <div className="text-sm text-white/60">{s.staff_no} · {s.role} · {s.department}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/15 text-white/70 capitalize">{s.status.replace('_', ' ')}</Badge>
              <Badge variant="outline" className="border-white/15 text-white/70 capitalize">{s.employment_type.replace('_', ' ')}</Badge>
              <Badge variant="outline" className="border-white/15 text-white/70 capitalize">
                <ScanFace className="w-3 h-3 mr-1" />{s.enrollment.replace('_', ' ')}
              </Badge>
              <PunctualityBadge pct={s.punctuality_pct_30d} />
              <Badge variant="outline" className="border-white/15 text-white/70"><Mail className="w-3 h-3 mr-1" />{s.email}</Badge>
              <Badge variant="outline" className="border-white/15 text-white/70"><Phone className="w-3 h-3 mr-1" />{s.phone}</Badge>
            </div>
          </div>
        </div>
      </GlassCard>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll link</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="allocation">Teaching allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <PersonAttendanceTab
            personId={s.id}
            personName={s.full_name}
            fetcher={staffApi.attendance}
            onNotify={() => staffApi.notifyManager(s.id)}
            notifyLabel="Notify manager"
          />
        </TabsContent>
        <TabsContent value="payroll"><Phase2Tab title="Payroll-attendance integration" description="Auto-deductions, overtime, and payslip exports — Phase 2." /></TabsContent>
        <TabsContent value="leave"><Phase2Tab title="Leave management" description="Leave balance, approvals, and calendar — Phase 2." /></TabsContent>
        <TabsContent value="allocation"><Phase2Tab title="Teaching allocation" description="Subject load, timetable, and substitution — Phase 2." /></TabsContent>
      </Tabs>
    </div>
  );
}
