import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GraduationCap, Plus, Trash2, Info, BookOpen, Layers, School } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { toast } from '@/hooks/use-toast';

interface DashboardContext { profile: any; }

interface Faculty { id: string; name: string; code: string; }
interface Programme { id: string; faculty_id: string; name: string; code: string; duration_years: number; }
interface Level { id: string; programme_id: string; name: string; order: number; }
interface Course { id: string; programme_id: string; level_id: string; code: string; title: string; credit_units: number; }

const uid = () => Math.random().toString(36).slice(2, 10);

const AcademicStructure = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const isSchool = profile?.organization_type === 'school';

  const [faculties, setFaculties] = useState<Faculty[]>([
    { id: uid(), name: 'Faculty of Science', code: 'SCI' },
    { id: uid(), name: 'Faculty of Arts', code: 'ART' },
  ]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [facName, setFacName] = useState('');
  const [facCode, setFacCode] = useState('');
  const [progName, setProgName] = useState('');
  const [progCode, setProgCode] = useState('');
  const [progFaculty, setProgFaculty] = useState('');
  const [progDuration, setProgDuration] = useState('4');
  const [lvlName, setLvlName] = useState('');
  const [lvlProg, setLvlProg] = useState('');
  const [lvlOrder, setLvlOrder] = useState('1');
  const [crsCode, setCrsCode] = useState('');
  const [crsTitle, setCrsTitle] = useState('');
  const [crsProg, setCrsProg] = useState('');
  const [crsLvl, setCrsLvl] = useState('');
  const [crsUnits, setCrsUnits] = useState('3');

  const stub = (msg: string) => toast({ title: 'Saved locally', description: `${msg} — backend endpoint pending.` });

  const addFaculty = () => {
    if (!facName.trim()) return;
    setFaculties(f => [...f, { id: uid(), name: facName.trim(), code: facCode.trim().toUpperCase() }]);
    setFacName(''); setFacCode('');
    stub('Faculty created');
  };
  const addProgramme = () => {
    if (!progName.trim() || !progFaculty) return;
    setProgrammes(p => [...p, {
      id: uid(), faculty_id: progFaculty, name: progName.trim(),
      code: progCode.trim().toUpperCase(), duration_years: Number(progDuration) || 4,
    }]);
    setProgName(''); setProgCode(''); setProgFaculty(''); setProgDuration('4');
    stub('Programme created');
  };
  const addLevel = () => {
    if (!lvlName.trim() || !lvlProg) return;
    setLevels(l => [...l, { id: uid(), programme_id: lvlProg, name: lvlName.trim(), order: Number(lvlOrder) || 1 }]);
    setLvlName(''); setLvlProg(''); setLvlOrder('1');
    stub('Level created');
  };
  const addCourse = () => {
    if (!crsCode.trim() || !crsTitle.trim() || !crsProg || !crsLvl) return;
    setCourses(c => [...c, {
      id: uid(), programme_id: crsProg, level_id: crsLvl,
      code: crsCode.trim().toUpperCase(), title: crsTitle.trim(),
      credit_units: Number(crsUnits) || 3,
    }]);
    setCrsCode(''); setCrsTitle(''); setCrsProg(''); setCrsLvl(''); setCrsUnits('3');
    stub('Course created');
  };

  if (!isSchool) {
    return (
      <div className="p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Education feature</AlertTitle>
          <AlertDescription>
            Academic Structure is only available for organizations of type <strong>school</strong>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Academic Structure"
        subtitle="Manage faculties, programmes, levels, and courses for your institution."
       
      />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Backend pending</AlertTitle>
        <AlertDescription>
          This UI is wired to in-memory state. Once the Django team ships the Phase 2 endpoints
          (see <code>docs/education-phase2-backend-prompt.md</code>), changes here will persist.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="faculties" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="faculties"><School className="w-4 h-4 mr-2" />Faculties</TabsTrigger>
          <TabsTrigger value="programmes"><Layers className="w-4 h-4 mr-2" />Programmes</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="courses"><BookOpen className="w-4 h-4 mr-2" />Courses</TabsTrigger>
        </TabsList>

        {/* Faculties */}
        <TabsContent value="faculties">
          <Card>
            <CardHeader>
              <CardTitle>Faculties / Schools</CardTitle>
              <CardDescription>Top-level academic divisions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-[1fr_140px_auto] gap-3">
                <div>
                  <Label>Name</Label>
                  <Input value={facName} onChange={e => setFacName(e.target.value)} placeholder="e.g. Faculty of Engineering" />
                </div>
                <div>
                  <Label>Code</Label>
                  <Input value={facCode} onChange={e => setFacCode(e.target.value)} placeholder="ENG" />
                </div>
                <div className="flex items-end">
                  <Button onClick={addFaculty} className="w-full"><Plus className="w-4 h-4 mr-1" />Add</Button>
                </div>
              </div>
              <div className="space-y-2">
                {faculties.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{f.name}</p>
                      {f.code && <Badge variant="secondary" className="mt-1">{f.code}</Badge>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setFaculties(arr => arr.filter(x => x.id !== f.id))}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {faculties.length === 0 && <p className="text-sm text-muted-foreground">No faculties yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programmes */}
        <TabsContent value="programmes">
          <Card>
            <CardHeader>
              <CardTitle>Programmes / Departments</CardTitle>
              <CardDescription>Degree or class streams within a faculty.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2">
                  <Label>Name</Label>
                  <Input value={progName} onChange={e => setProgName(e.target.value)} placeholder="Computer Science" />
                </div>
                <div>
                  <Label>Code</Label>
                  <Input value={progCode} onChange={e => setProgCode(e.target.value)} placeholder="CSC" />
                </div>
                <div>
                  <Label>Faculty</Label>
                  <Select value={progFaculty} onValueChange={setProgFaculty}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {faculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (years)</Label>
                  <Input type="number" value={progDuration} onChange={e => setProgDuration(e.target.value)} />
                </div>
                <div className="lg:col-span-5">
                  <Button onClick={addProgramme}><Plus className="w-4 h-4 mr-1" />Add programme</Button>
                </div>
              </div>
              <div className="space-y-2">
                {programmes.map(p => {
                  const fac = faculties.find(f => f.id === p.faculty_id);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium">{p.name} <span className="text-xs text-muted-foreground">({p.code})</span></p>
                        <p className="text-xs text-muted-foreground">{fac?.name} • {p.duration_years} year(s)</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setProgrammes(arr => arr.filter(x => x.id !== p.id))}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
                {programmes.length === 0 && <p className="text-sm text-muted-foreground">No programmes yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Levels */}
        <TabsContent value="levels">
          <Card>
            <CardHeader>
              <CardTitle>Levels / Year Groups</CardTitle>
              <CardDescription>e.g. 100 Level, JSS1, Year 7.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-4 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input value={lvlName} onChange={e => setLvlName(e.target.value)} placeholder="100 Level" />
                </div>
                <div>
                  <Label>Programme</Label>
                  <Select value={lvlProg} onValueChange={setLvlProg}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {programmes.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={lvlOrder} onChange={e => setLvlOrder(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button onClick={addLevel} className="w-full"><Plus className="w-4 h-4 mr-1" />Add</Button>
                </div>
              </div>
              <div className="space-y-2">
                {levels.sort((a, b) => a.order - b.order).map(l => {
                  const prog = programmes.find(p => p.id === l.programme_id);
                  return (
                    <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium">{l.name}</p>
                        <p className="text-xs text-muted-foreground">{prog?.name} • Order {l.order}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setLevels(arr => arr.filter(x => x.id !== l.id))}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
                {levels.length === 0 && <p className="text-sm text-muted-foreground">No levels yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Courses / Subjects</CardTitle>
              <CardDescription>Individual courses or subjects taught at a level.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div>
                  <Label>Code</Label>
                  <Input value={crsCode} onChange={e => setCrsCode(e.target.value)} placeholder="CSC101" />
                </div>
                <div className="lg:col-span-2">
                  <Label>Title</Label>
                  <Input value={crsTitle} onChange={e => setCrsTitle(e.target.value)} placeholder="Intro to Computing" />
                </div>
                <div>
                  <Label>Programme</Label>
                  <Select value={crsProg} onValueChange={(v) => { setCrsProg(v); setCrsLvl(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {programmes.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select value={crsLvl} onValueChange={setCrsLvl} disabled={!crsProg}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {levels.filter(l => l.programme_id === crsProg).map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Units</Label>
                  <Input type="number" value={crsUnits} onChange={e => setCrsUnits(e.target.value)} />
                </div>
                <div className="lg:col-span-6">
                  <Button onClick={addCourse}><Plus className="w-4 h-4 mr-1" />Add course</Button>
                </div>
              </div>
              <div className="space-y-2">
                {courses.map(c => {
                  const prog = programmes.find(p => p.id === c.programme_id);
                  const lvl = levels.find(l => l.id === c.level_id);
                  return (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium">{c.code} — {c.title}</p>
                        <p className="text-xs text-muted-foreground">{prog?.name} • {lvl?.name} • {c.credit_units} units</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setCourses(arr => arr.filter(x => x.id !== c.id))}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
                {courses.length === 0 && <p className="text-sm text-muted-foreground">No courses yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcademicStructure;
