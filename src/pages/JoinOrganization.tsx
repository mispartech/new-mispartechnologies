import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import useDocumentTitle from '@/hooks/useDocumentTitle';

const selfRegisterSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(100),
  last_name: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone_number: z.string().trim().max(20).optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  department_id: z.string().optional().or(z.literal('')),
});

interface OrgPublicInfo {
  name: string;
  slug: string;
  type: string;
  logo_url: string | null;
  departments: { id: string; name: string }[];
  allow_self_registration: boolean;
}

type PageState = 'loading' | 'form' | 'success' | 'not_found' | 'disabled';

const JoinOrganization = () => {
  const { slug } = useParams<{ slug: string }>();
  const [org, setOrg] = useState<OrgPublicInfo | null>(null);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    gender: '',
    department_id: '',
  });
  const { toast } = useToast();

  useDocumentTitle(org ? `Join ${org.name}` : 'Join Organization');

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
        setPageState('form');
      }
    })();
  }, [slug]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = selfRegisterSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach(issue => {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await djangoApi.selfRegister({
        org_slug: slug!,
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

  // ── Loading ──
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Not Found ──
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

  // ── Self-registration disabled ──
  if (pageState === 'disabled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Registration Closed</h2>
            <p className="text-muted-foreground mb-2">
              <strong>{org?.name}</strong> does not currently accept public registrations.
            </p>
            <p className="text-sm text-muted-foreground mb-6">Please contact your administrator for an invitation.</p>
            <Button asChild variant="outline"><Link to="/">Go Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Success ──
  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Registration Submitted!</h2>
            <p className="text-muted-foreground mb-2">
              Your request to join <strong>{org?.name}</strong> has been received.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Please check your email for a verification link to complete your registration.
            </p>
            <Button asChild variant="outline"><Link to="/auth">Sign In</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Registration Form ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center space-y-3">
          {org?.logo_url ? (
            <img src={org.logo_url} alt={org.name} className="w-16 h-16 mx-auto rounded-xl object-contain" />
          ) : (
            <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          )}
          <div>
            <CardTitle className="text-xl">Join {org?.name}</CardTitle>
            <CardDescription>
              Fill in your details to register with this organization
            </CardDescription>
          </div>
          <Badge variant="secondary" className="mx-auto capitalize">{org?.type}</Badge>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={e => handleChange('first_name', e.target.value)}
                  placeholder="John"
                />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={e => handleChange('last_name', e.target.value)}
                  placeholder="Doe"
                />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={form.phone_number}
                onChange={e => handleChange('phone_number', e.target.value)}
                placeholder="+234 800 000 0000"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={v => handleChange('gender', v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {org?.departments && org.departments.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select value={form.department_id} onValueChange={v => handleChange('department_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {org.departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Register'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth" className="text-primary hover:underline">Sign In</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinOrganization;
