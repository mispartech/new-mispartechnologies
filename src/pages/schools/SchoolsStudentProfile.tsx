import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ScanFace } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/msse/GlassCard';
import { PersonAttendanceTab } from '@/components/msse/PersonAttendanceTab';
import { Phase2Tab } from '@/components/msse/Phase2Tab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { studentsApi } from '@/lib/api/msse/students';

export default function MsseStudentProfile() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: student } = useQuery({ queryKey: ['msse-student', id], queryFn: () => studentsApi.get(id), enabled: !!id });

  if (!student) {
    return <div className="p-10 text-white/60">Loading student…</div>;
  }

  return (
    <div className="p-6 space-y-5">
      <Link to="/msse/dashboard/students" className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200">
        <ArrowLeft className="h-3 w-3" /> Back to students
      </Link>

      <GlassCard glow>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 flex items-center justify-center text-white text-xl font-bold ${student.enrollment === 'enrolled' ? 'border-emerald-400/60' : 'border-amber-400/60'}`}>
            {student.full_name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-white">{student.full_name}</div>
            <div className="text-sm text-white/60">{student.admission_no} · {student.class}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/15 text-white/70 capitalize">{student.status}</Badge>
              <Badge variant="outline" className="border-white/15 text-white/70 capitalize">
                <ScanFace className="w-3 h-3 mr-1" />{student.enrollment.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="border-white/15 text-white/70">Guardian: {student.guardian_name}</Badge>
              <Badge variant="outline" className="border-white/15 text-white/70">{student.guardian_phone}</Badge>
            </div>
          </div>
        </div>
      </GlassCard>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="discipline">Discipline</TabsTrigger>
          <TabsTrigger value="health">Health & Library</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <PersonAttendanceTab
            personId={student.id}
            personName={student.full_name}
            fetcher={studentsApi.attendance}
            onNotify={() => studentsApi.notifyParent(student.id)}
            notifyLabel="Notify parent"
          />
        </TabsContent>
        <TabsContent value="academic"><Phase2Tab title="Academic records" description="Grades, report cards, and timetable land in Phase 2." /></TabsContent>
        <TabsContent value="discipline"><Phase2Tab title="Discipline & incidents" description="Behavioural records and merit/demerit tracking — Phase 2." /></TabsContent>
        <TabsContent value="health"><Phase2Tab title="Health & library" description="Clinic visits, library activity, and hostel data — Phase 2." /></TabsContent>
      </Tabs>
    </div>
  );
}
