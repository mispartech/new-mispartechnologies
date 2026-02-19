import { useState, useEffect } from 'react';
import { djangoApi } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TempMember { id: string; temp_face_id: string; face_roi_url: string | null; date: string; time: string; face_detections: number; }
interface ClaimVisitorModalProps { isOpen: boolean; onClose: () => void; visitor: TempMember | null; onSuccess: () => void; }
interface Department { id: string; name: string; }

const ClaimVisitorModal = ({ isOpen, onClose, visitor, onSuccess }: ClaimVisitorModalProps) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', phoneNumber: '', gender: '', departmentId: '' });
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      setFormData({ email: '', password: '', firstName: '', lastName: '', phoneNumber: '', gender: '', departmentId: '' });
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    const result = await djangoApi.getDepartments();
    if (!result.error && result.data) setDepartments(result.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitor) return;
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // All claim logic is handled by Django
      const result = await djangoApi.claimVisitor({
        temp_attendance_id: visitor.id,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber || undefined,
        gender: formData.gender || undefined,
        department_id: formData.departmentId || undefined,
      });

      if (result.error) throw new Error(result.error);

      await logActivity({
        action: 'claim', entityType: 'visitor', entityId: visitor.id,
        metadata: { temp_face_id: visitor.temp_face_id, name: `${formData.firstName} ${formData.lastName}` },
      });

      toast({ title: 'Visitor Registered', description: `${formData.firstName} ${formData.lastName} has been registered as a member.` });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: 'Registration Failed', description: error.message || 'Failed to register visitor as member.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!visitor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Register Visitor as Member</DialogTitle>
          <DialogDescription>Convert this visitor to a registered member with face recognition</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Avatar className="h-16 w-16"><AvatarImage src={visitor.face_roi_url || ''} alt="Visitor" /><AvatarFallback>V</AvatarFallback></Avatar>
          <div>
            <p className="font-medium">Temp ID: {visitor.temp_face_id.slice(0, 12)}...</p>
            <p className="text-sm text-muted-foreground">First seen: {visitor.date} at {visitor.time}</p>
            <p className="text-sm text-muted-foreground">Appearances: {visitor.face_detections}</p>
          </div>
        </div>

        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>This will create a new account and register their face for attendance tracking.</AlertDescription></Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="firstName">First Name *</Label><Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required /></div>
            <div className="space-y-2"><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
          <div className="space-y-2"><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="phoneNumber">Phone Number</Label><Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="gender">Gender</Label><Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label htmlFor="department">Department</Label><Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map((dept) => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}</SelectContent></Select></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Registering...</>) : 'Register Member'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimVisitorModal;
