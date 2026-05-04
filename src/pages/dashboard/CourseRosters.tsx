import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCheck, Plus, Trash2, Info, UserPlus } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { toast } from '@/hooks/use-toast';

interface DashboardContext { profile: any; }

interface Course { id: string; code: string; title: string; }
interface Lecturer { id: string; name: string; }
interface Student { id: string; name: string; matric: string; }
interface Assignment { id: string; course_id: string; lecturer_id: string; }
interface Enrollment { id: string; course_id: string; student_id: string; }

const uid = () => Math.random().toString(36).slice(2, 10);

// Demo data — in real use this comes from /api/courses, /api/members?role=lecturer, etc.
const DEMO_COURSES: Course[] = [
  { id: 'c1', code: 'CSC101', title: 'Intro to Computing' },
  { id: 'c2', code: 'MTH101', title: 'Calculus I' },
];
const DEMO_LECTURERS: Lecturer[] = [
  { id: 'l1', name: 'Dr. Adaeze Okoro' },
  { id: 'l2', name: 'Prof. Bayo Adeyemi' },
];
const DEMO_STUDENTS: Student[] = [
  { id: 's1', name: 'Chidi Eze', matric: 'CSC/2024/001' },
  { id: 's2', name: 'Fatima Bello', matric: 'CSC/2024/002' },
  { id: 's3', name: 'Tunde Salami', matric: 'MTH/2024/014' },
];

const CourseRosters = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const isSchool = profile?.organization_type === 'school';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [aCourse, setACourse] = useState('');
  const [aLecturer, setALecturer] = useState('');
  const [eCourse, setECourse] = useState('');
  const [eStudent, setEStudent] = useState('');

  const stub = (msg: string) => toast({ title: 'Saved locally', description: `${msg} — backend endpoint pending.` });

  const addAssignment = () => {
    if (!aCourse || !aLecturer) return;
    setAssignments(arr => [...arr, { id: uid(), course_id: aCourse, lecturer_id: aLecturer }]);
    setACourse(''); setALecturer('');
    stub('Lecturer assigned');
  };
  const addEnrollment = () => {
    if (!eCourse || !eStudent) return;
    if (enrollments.some(e => e.course_id === eCourse && e.student_id === eStudent)) {
      toast({ title: 'Already enrolled', variant: 'destructive' as any });
      return;
    }
    setEnrollments(arr => [...arr, { id: uid(), course_id: eCourse, student_id: eStudent }]);
    setEStudent('');
    stub('Student enrolled');
  };

  if (!isSchool) {
    return (
      <div className="p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Education feature</AlertTitle>
          <AlertDescription>Course Rosters are only available for school organizations.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Course Rosters"
        subtitle="Assign lecturers to courses and enroll students."
       
      />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Demo data</AlertTitle>
        <AlertDescription>
          Courses, lecturers, and students shown here are placeholders. Once Phase 2 endpoints
          (<code>/api/academic/courses/</code>, <code>/api/members/?role=lecturer</code>, <code>/api/academic/enrollments/</code>) are live,
          this page will load real data.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Lecturer Assignments</CardTitle>
          <CardDescription>Map a lecturer to a course.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label>Course</Label>
              <Select value={aCourse} onValueChange={setACourse}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {DEMO_COURSES.map(c => <SelectItem key={c.id} value={c.id}>{c.code} — {c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lecturer</Label>
              <Select value={aLecturer} onValueChange={setALecturer}>
                <SelectTrigger><SelectValue placeholder="Select lecturer" /></SelectTrigger>
                <SelectContent>
                  {DEMO_LECTURERS.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addAssignment} className="w-full"><Plus className="w-4 h-4 mr-1" />Assign</Button>
            </div>
          </div>
          <div className="space-y-2">
            {assignments.map(a => {
              const c = DEMO_COURSES.find(x => x.id === a.course_id);
              const l = DEMO_LECTURERS.find(x => x.id === a.lecturer_id);
              return (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">{c?.code} — {c?.title}</p>
                    <p className="text-xs text-muted-foreground">Lecturer: {l?.name}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setAssignments(arr => arr.filter(x => x.id !== a.id))}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
            {assignments.length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Enrollment</CardTitle>
          <CardDescription>Add students to a course roster.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label>Course</Label>
              <Select value={eCourse} onValueChange={setECourse}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {DEMO_COURSES.map(c => <SelectItem key={c.id} value={c.id}>{c.code} — {c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Student</Label>
              <Select value={eStudent} onValueChange={setEStudent}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {DEMO_STUDENTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — {s.matric}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addEnrollment} className="w-full"><UserPlus className="w-4 h-4 mr-1" />Enroll</Button>
            </div>
          </div>

          {DEMO_COURSES.map(c => {
            const roster = enrollments.filter(e => e.course_id === c.id);
            if (roster.length === 0) return null;
            return (
              <div key={c.id} className="rounded-lg border bg-card p-3">
                <p className="font-medium mb-2">{c.code} — {c.title} <Badge variant="secondary" className="ml-2">{roster.length}</Badge></p>
                <div className="space-y-1">
                  {roster.map(e => {
                    const s = DEMO_STUDENTS.find(x => x.id === e.student_id);
                    return (
                      <div key={e.id} className="flex items-center justify-between text-sm py-1">
                        <span>{s?.name} <span className="text-muted-foreground">({s?.matric})</span></span>
                        <Button variant="ghost" size="icon" onClick={() => setEnrollments(arr => arr.filter(x => x.id !== e.id))}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {enrollments.length === 0 && <p className="text-sm text-muted-foreground">No enrollments yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseRosters;
