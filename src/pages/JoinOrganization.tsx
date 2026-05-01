import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, CheckCircle, AlertCircle, Loader2, UserPlus, GraduationCap, Mail, IdCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import useDocumentTitle from '@/hooks/useDocumentTitle';

const emailSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(100),
  last_name: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone_number: z.string().trim().max(20).optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  department_id: z.string().optional().or(z.literal('')),
});

const idDobSchema = z.object({
  identifier: z.string().trim().min(1, 'Required').max(64),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date'),
  first_name: z.string().trim().min(1, 'First name is required').max(100),
  last_name: z.string().trim().min(1, 'Last name is required').max(100),
  phone_number: z.string().trim().max(20).optional().or(z.literal('')),
  guardian_email: z.string().trim().email('Invalid email').max(255).optional().or(z.literal('')),
  level: z.string().optional().or(z.literal('')),
  faculty_id: z.string().optional().or(z.literal('')),
  programme_id: z.string().optional().or(z.literal('')),
  department_id: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
});

interface Faculty { id: string; name: string; programmes?: { id: string; name: string }[] }
interface OrgPublicInfo {
  name: string;
  slug: string;
  type: string;
  logo_url: string | null;
  departments: { id: string; name: string }[];
  allow_self_registration: boolean;
  // Phase 1 additions (backend pending — gracefully fall back when missing)
  self_register_mode?: 'email' | 'identifier_dob' | 'both';
  identifier_label?: string;
  education_meta?: {
    levels?: string[];
    faculties?: Faculty[];
  };
}

type PageState = 'loading' | 'form' | 'success' | 'not_found' | 'disabled';
type Mode = 'email' | 'identifier_dob';

const JoinOrganization = () => {
  const { slug } = useParams<{ slug: string }>();
  const [org, setOrg] = useState<OrgPublicInfo | null>(null);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<Mode>('email');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailForm, setEmailForm] = useState({
    first_name: '', last_name: '', email: '', phone_number: '', gender: '', department_id: '',
  });
  const [idForm, setIdForm] = useState({
    identifier: '', date_of_birth: '', first_name: '', last_name: '',
    phone_number: '', guardian_email: '', level: '', faculty_id: '', programme_id: '',
    department_id: '', gender: '',
  });
  const { toast } = useToast();

  useDocumentTitle(org ? `Join ${org.name}` : 'Join Organization');

  const isSchool = org?.type === 'school';
  const idLabel = org?.identifier_label || (isSchool ? 'Matric / Student ID' : 'Member ID');
  const allowedMode: Mode | 'both' = (org?.self_register_mode) ?? (isSchool ? 'both' : 'email');
  const showEmailTab = allowedMode === 'email' || allowedMode === 'both';
  const showIdTab = allowedMode === 'identifier_dob' || allowedMode === 'both';
  const faculties = org?.education_meta?.faculties || [];
  const levels = org?.education_meta?.levels || [];
  const selectedFaculty = faculties.find(f => f.id === idForm.faculty_id);

  useEffect(() => {
    if (!slug) { setPageState('not_found'); return; }
    (async () => {
      const result = await djangoApi.getOrgPublicInfo(slug);
      if (result.error || !result.data) {
        setPageState('not_found');
        return;
      }
      const data = result.data as OrgPublicInfo;
      setOrg(data);
      if (!data.allow_self_registration) {
        setPageState('disabled');
      } else {
        // Pick a sensible default tab
        const m: Mode | 'both' = data.self_register_mode ?? (data.type === 'school' ? 'both' : 'email');
        setMode(m === 'email' ? 'email' : m === 'identifier_dob' ? 'identifier_dob' : (data.type === 'school' ? 'identifier_dob' : 'email'));
        setPageState('form');
      }
    })();
  }, [slug]);

  const setEmail = (k: string, v: string) => {
    setEmailForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };
  const setId = (k: string, v: string) => {
    setIdForm(p => ({ ...p, [k]: v, ...(k === 'faculty_id' ? { programme_id: '' } : {}) }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = emailSchema.safeParse(emailForm);
    if (!parsed.success) {
      const f: Record<string, string> = {};
      parsed.error.issues.forEach(i => { const k = i.path[0] as string; if (!f[k]) f[k] = i.message; });
      setErrors(f);
      return;
    }
    setSubmitting(true);
    try {
      const result = await djangoApi.selfRegister({
        org_slug: slug!,
        mode: 'email',
        email: parsed.data.email,
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        phone_number: parsed.data.phone_number || undefined,
        gender: parsed.data.gender || undefined,
        department_id: parsed.data.department_id || undefined,
      });
      if (result.error) {
        toast({ variant: 'destructive', title: 'Registration Failed', description: result.error });
        return;
      }
      setPageState('success');
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitId = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = idDobSchema.safeParse(idForm);
    if (!parsed.success) {
      const f: Record<string, string> = {};
      parsed.error.issues.forEach(i => { const k = i.path[0] as string; if (!f[k]) f[k] = i.message; });
      setErrors(f);
      return;
    }
    setSubmitting(true);
    try {
      const result = await djangoApi.selfRegister({
        org_slug: slug!,
        mode: 'identifier_dob',
        identifier: parsed.data.identifier,
        date_of_birth: parsed.data.date_of_birth,
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        phone_number: parsed.data.phone_number || undefined,
        guardian_email: parsed.data.guardian_email || undefined,
        level: parsed.data.level || undefined,
        faculty_id: parsed.data.faculty_id || undefined,
        programme_id: parsed.data.programme_id || undefined,
        department_id: parsed.data.department_id || undefined,
        gender: parsed.data.gender || undefined,
      });
      if (result.status === 404) {
        toast({
          variant: 'destructive',
          title: 'Coming Soon',
          description: 'Student ID registration is launching soon. Please contact your school administrator for now.',
        });
        return;
      }
      if (result.error) {
        toast({ variant: 'destructive', title: 'Registration Failed', description: result.error });
        return;
      }
      setPageState('success');
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (pageState === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (pageState === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Organization Not Found</h2>
            <p className="text-muted-foreground mb-6">This registration link is invalid or the organization does not exist.</p>
            <Button asChild variant="outline"><Link to="/">Go Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageState === 'disabled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Registration Closed</h2>
            <p className="text-muted-foreground mb-2"><strong>{org?.name}</strong> does not currently accept public registrations.</p>
            <p className="text-sm text-muted-foreground mb-6">Please contact your administrator for an invitation.</p>
            <Button asChild variant="outline"><Link to="/">Go Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Registration Submitted!</h2>
            <p className="text-muted-foreground mb-2">Your request to join <strong>{org?.name}</strong> has been received.</p>
            <p className="text-sm text-muted-foreground mb-6">
              {mode === 'identifier_dob'
                ? "We've sent an activation link via SMS or to your guardian's email."
                : 'Please check your email for a verification link to complete your registration.'}
            </p>
            <Button asChild variant="outline"><Link to="/auth">Sign In</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center space-y-3">
          {org?.logo_url ? (
            <img src={org.logo_url} alt={org.name} className="w-16 h-16 mx-auto rounded-xl object-contain" />
          ) : (
            <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
              {isSchool ? <GraduationCap className="w-8 h-8 text-primary" /> : <Building2 className="w-8 h-8 text-primary" />}
            </div>
          )}
          <div>
            <CardTitle className="text-xl">Join {org?.name}</CardTitle>
            <CardDescription>
              {isSchool ? 'Register as a student or staff member' : 'Fill in your details to register'}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="mx-auto capitalize">{org?.type}</Badge>
        </CardHeader>

        <CardContent>
          {showEmailTab && showIdTab ? (
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="mb-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="identifier_dob" className="gap-1.5"><IdCard className="w-3.5 h-3.5" /> Student ID</TabsTrigger>
                <TabsTrigger value="email" className="gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</TabsTrigger>
              </TabsList>
              <TabsContent value="identifier_dob" className="mt-4">
                <IdDobForm
                  idLabel={idLabel}
                  form={idForm}
                  errors={errors}
                  setId={setId}
                  faculties={faculties}
                  levels={levels}
                  selectedFaculty={selectedFaculty}
                  departments={org?.departments || []}
                  submitting={submitting}
                  onSubmit={handleSubmitId}
                />
              </TabsContent>
              <TabsContent value="email" className="mt-4">
                <EmailForm form={emailForm} errors={errors} setEmail={setEmail} departments={org?.departments || []} submitting={submitting} onSubmit={handleSubmitEmail} />
              </TabsContent>
            </Tabs>
          ) : showIdTab ? (
            <IdDobForm
              idLabel={idLabel}
              form={idForm}
              errors={errors}
              setId={setId}
              faculties={faculties}
              levels={levels}
              selectedFaculty={selectedFaculty}
              departments={org?.departments || []}
              submitting={submitting}
              onSubmit={handleSubmitId}
            />
          ) : (
            <EmailForm form={emailForm} errors={errors} setEmail={setEmail} departments={org?.departments || []} submitting={submitting} onSubmit={handleSubmitEmail} />
          )}

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/auth" className="text-primary hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// ────────── Sub-forms ──────────

function EmailForm({ form, errors, setEmail, departments, submitting, onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First Name *</Label>
          <Input id="first_name" value={form.first_name} onChange={e => setEmail('first_name', e.target.value)} placeholder="John" />
          {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input id="last_name" value={form.last_name} onChange={e => setEmail('last_name', e.target.value)} placeholder="Doe" />
          {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email Address *</Label>
        <Input id="email" type="email" value={form.email} onChange={e => setEmail('email', e.target.value)} placeholder="john@example.com" />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input id="phone_number" value={form.phone_number} onChange={e => setEmail('phone_number', e.target.value)} placeholder="+234 800 000 0000" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <Select value={form.gender} onValueChange={v => setEmail('gender', v)}>
            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {departments.length > 0 && (
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={form.department_id} onValueChange={v => setEmail('department_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <Button type="submit" className="w-full gap-2" disabled={submitting}>
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        {submitting ? 'Submitting...' : 'Register'}
      </Button>
    </form>
  );
}

function IdDobForm({ idLabel, form, errors, setId, faculties, levels, selectedFaculty, departments, submitting, onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Alert>
        <GraduationCap className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Use the {idLabel} issued by your school and your date of birth — no email needed.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="identifier">{idLabel} *</Label>
          <Input id="identifier" value={form.identifier} onChange={e => setId('identifier', e.target.value)} placeholder="MAT/2024/00123" autoComplete="off" />
          {errors.identifier && <p className="text-sm text-destructive">{errors.identifier}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Input id="date_of_birth" type="date" value={form.date_of_birth} onChange={e => setId('date_of_birth', e.target.value)} />
          {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First Name *</Label>
          <Input id="first_name" value={form.first_name} onChange={e => setId('first_name', e.target.value)} placeholder="Adaeze" />
          {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input id="last_name" value={form.last_name} onChange={e => setId('last_name', e.target.value)} placeholder="Okafor" />
          {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
        </div>
      </div>

      {(faculties.length > 0 || levels.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {levels.length > 0 && (
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Select value={form.level} onValueChange={v => setId('level', v)}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  {levels.map((l: string) => <SelectItem key={l} value={l}>{l} Level</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {faculties.length > 0 && (
            <div className="space-y-1.5">
              <Label>Faculty</Label>
              <Select value={form.faculty_id} onValueChange={v => setId('faculty_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                <SelectContent>
                  {faculties.map((f: Faculty) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {selectedFaculty?.programmes && selectedFaculty.programmes.length > 0 && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Programme</Label>
              <Select value={form.programme_id} onValueChange={v => setId('programme_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select programme" /></SelectTrigger>
                <SelectContent>
                  {selectedFaculty.programmes.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="guardian_email">Parent / Guardian Email</Label>
          <Input id="guardian_email" type="email" value={form.guardian_email} onChange={e => setId('guardian_email', e.target.value)} placeholder="parent@example.com" />
          {errors.guardian_email && <p className="text-sm text-destructive">{errors.guardian_email}</p>}
          <p className="text-xs text-muted-foreground">For activation link & attendance updates</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone_number">Phone (optional)</Label>
          <Input id="phone_number" value={form.phone_number} onChange={e => setId('phone_number', e.target.value)} placeholder="+234 800 000 0000" />
        </div>
      </div>

      {departments.length > 0 && (
        <div className="space-y-1.5">
          <Label>Class / Department</Label>
          <Select value={form.department_id} onValueChange={v => setId('department_id', v)}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full gap-2" disabled={submitting}>
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        {submitting ? 'Submitting...' : 'Register as Student'}
      </Button>
    </form>
  );
}

export default JoinOrganization;
