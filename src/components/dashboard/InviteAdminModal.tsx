import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { djangoApi } from '@/lib/api/client';
import { useTerminology } from '@/contexts/TerminologyContext';
import { ASSIGNABLE_ROLES, ROLE_LABELS, rolesByType, type OrganizationType, type SystemRole } from '@/lib/roleConfig';
import { Loader2 } from 'lucide-react';

interface InviteAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: string;
  organizationType?: string;
  onSuccess: () => void;
}

const InviteAdminModal = ({ open, onOpenChange, currentUserRole, organizationType, onSuccess }: InviteAdminModalProps) => {
  const { toast } = useToast();
  const { getTerm } = useTerminology();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: '' as string,
    job_title: '',
  });

  const assignableRoles = ASSIGNABLE_ROLES[currentUserRole] || [];
  const orgType = (organizationType || 'other') as OrganizationType;
  const jobTitles = rolesByType[orgType] || rolesByType.other;

  const resetForm = () => {
    setForm({ first_name: '', last_name: '', email: '', phone_number: '', role: '', job_title: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.first_name || !form.last_name || !form.role) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
      };
      if (form.phone_number) payload.phone_number = form.phone_number;
      if (form.job_title) payload.job_title = form.job_title;

      const res = await djangoApi.createMember(payload);
      if (res.error) {
        toast({ title: 'Invitation Failed', description: res.error, variant: 'destructive' });
      } else {
        toast({ title: 'Invitation Sent', description: `${form.first_name} ${form.last_name} has been invited as ${ROLE_LABELS[form.role] || form.role}.` });
        resetForm();
        onOpenChange(false);
        onSuccess();
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Administrator</DialogTitle>
          <DialogDescription>
            Send an invitation to a new administrator. They'll receive an email to set up their password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-fname">First Name *</Label>
              <Input id="inv-fname" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="John" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-lname">Last Name *</Label>
              <Input id="inv-lname" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Doe" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-email">Email *</Label>
            <Input id="inv-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-phone">Phone (optional)</Label>
            <Input id="inv-phone" type="tel" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} placeholder="+1 234 567 8900" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-role">Role *</Label>
            <Select value={form.role} onValueChange={val => setForm(f => ({ ...f, role: val }))}>
              <SelectTrigger id="inv-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map(r => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-job">Job Title (optional)</Label>
            <Select value={form.job_title} onValueChange={val => setForm(f => ({ ...f, job_title: val }))}>
              <SelectTrigger id="inv-job">
                <SelectValue placeholder="Select job title" />
              </SelectTrigger>
              <SelectContent>
                {jobTitles.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteAdminModal;
