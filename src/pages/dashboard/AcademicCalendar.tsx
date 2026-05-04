import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Plus, Trash2, Info, Star } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { toast } from '@/hooks/use-toast';

interface DashboardContext { profile: any; }
interface Session { id: string; name: string; start_date: string; end_date: string; is_current: boolean; }
interface Term { id: string; session_id: string; name: 'first' | 'second' | 'third' | 'harmattan' | 'rain'; start_date: string; end_date: string; }

const uid = () => Math.random().toString(36).slice(2, 10);

const AcademicCalendar = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const isSchool = profile?.organization_type === 'school';

  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  const [sName, setSName] = useState('');
  const [sStart, setSStart] = useState('');
  const [sEnd, setSEnd] = useState('');

  const [tSession, setTSession] = useState('');
  const [tName, setTName] = useState<Term['name']>('first');
  const [tStart, setTStart] = useState('');
  const [tEnd, setTEnd] = useState('');

  const stub = (msg: string) => toast({ title: 'Saved locally', description: `${msg} — backend endpoint pending.` });

  const addSession = () => {
    if (!sName.trim() || !sStart || !sEnd) return;
    setSessions(arr => [...arr, { id: uid(), name: sName.trim(), start_date: sStart, end_date: sEnd, is_current: arr.length === 0 }]);
    setSName(''); setSStart(''); setSEnd('');
    stub('Session created');
  };
  const setCurrent = (id: string) => {
    setSessions(arr => arr.map(s => ({ ...s, is_current: s.id === id })));
    stub('Current session updated');
  };
  const addTerm = () => {
    if (!tSession || !tStart || !tEnd) return;
    setTerms(arr => [...arr, { id: uid(), session_id: tSession, name: tName, start_date: tStart, end_date: tEnd }]);
    setTSession(''); setTName('first'); setTStart(''); setTEnd('');
    stub('Term created');
  };

  if (!isSchool) {
    return (
      <div className="p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Education feature</AlertTitle>
          <AlertDescription>Academic Calendar is only available for school organizations.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title="Academic Calendar" description="Manage academic sessions and terms / semesters." icon={CalendarDays} />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Backend pending</AlertTitle>
        <AlertDescription>
          Wired to in-memory state. Persists once Django ships <code>/api/academic/sessions/</code> and <code>/api/academic/terms/</code>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Academic Sessions</CardTitle>
          <CardDescription>Yearly cycle, e.g. 2025/2026.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <div>
              <Label>Name</Label>
              <Input value={sName} onChange={e => setSName(e.target.value)} placeholder="2025/2026" />
            </div>
            <div>
              <Label>Start</Label>
              <Input type="date" value={sStart} onChange={e => setSStart(e.target.value)} />
            </div>
            <div>
              <Label>End</Label>
              <Input type="date" value={sEnd} onChange={e => setSEnd(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={addSession} className="w-full"><Plus className="w-4 h-4 mr-1" />Add</Button>
            </div>
          </div>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {s.name}
                    {s.is_current && <Badge className="bg-primary"><Star className="w-3 h-3 mr-1" />Current</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.start_date} → {s.end_date}</p>
                </div>
                <div className="flex gap-1">
                  {!s.is_current && (
                    <Button variant="outline" size="sm" onClick={() => setCurrent(s.id)}>Set current</Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setSessions(arr => arr.filter(x => x.id !== s.id))}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terms / Semesters</CardTitle>
          <CardDescription>Sub-divisions within a session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-5 gap-3">
            <div>
              <Label>Session</Label>
              <Select value={tSession} onValueChange={setTSession}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {sessions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Term</Label>
              <Select value={tName} onValueChange={(v) => setTName(v as Term['name'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Term</SelectItem>
                  <SelectItem value="second">Second Term</SelectItem>
                  <SelectItem value="third">Third Term</SelectItem>
                  <SelectItem value="harmattan">Harmattan Semester</SelectItem>
                  <SelectItem value="rain">Rain Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start</Label>
              <Input type="date" value={tStart} onChange={e => setTStart(e.target.value)} />
            </div>
            <div>
              <Label>End</Label>
              <Input type="date" value={tEnd} onChange={e => setTEnd(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={addTerm} className="w-full"><Plus className="w-4 h-4 mr-1" />Add</Button>
            </div>
          </div>
          <div className="space-y-2">
            {terms.map(t => {
              const sess = sessions.find(s => s.id === t.session_id);
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium capitalize">{t.name} term</p>
                    <p className="text-xs text-muted-foreground">{sess?.name} • {t.start_date} → {t.end_date}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setTerms(arr => arr.filter(x => x.id !== t.id))}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
            {terms.length === 0 && <p className="text-sm text-muted-foreground">No terms yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicCalendar;
