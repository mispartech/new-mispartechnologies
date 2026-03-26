import { useState, useEffect } from 'react';
import { djangoApi } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface Admin {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Server-side role filtering via query params
      const [superAdminRes, adminRes, managerRes] = await Promise.all([
        djangoApi.getMembers({ role: 'super_admin' }),
        djangoApi.getMembers({ role: 'admin' }),
        djangoApi.getMembers({ role: 'manager' }),
      ]);

      const merged: Admin[] = [
        ...(superAdminRes.data || []),
        ...(adminRes.data || []),
        ...(managerRes.data || []),
      ];

      // Deduplicate by id
      const seen = new Set<string>();
      const deduped = merged.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      setAdmins(deduped);
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to load admin data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase?.().replace(/\s+/g, '_')) {
      case 'super_admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) return (<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Management</h1><p className="text-sm sm:text-base text-muted-foreground">View administrators in your organization</p></div>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" />Current Administrators</CardTitle><CardDescription>All users with administrative privileges</CardDescription></CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="hidden md:block">
            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Since</TableHead></TableRow></TableHeader>
              <TableBody>
                {admins.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No administrators found</TableCell></TableRow> : admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.first_name && admin.last_name ? `${admin.first_name} ${admin.last_name}` : 'Not set'}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell><Badge className={getRoleBadgeColor(admin.role)}>{admin.role?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{admin.created_at ? format(new Date(admin.created_at), 'MMM d, yyyy') : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden divide-y divide-border">
            {admins.length === 0 ? <div className="text-center text-muted-foreground py-8 px-4">No administrators found</div> : admins.map((admin) => (
              <div key={admin.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between"><div><p className="font-medium">{admin.first_name && admin.last_name ? `${admin.first_name} ${admin.last_name}` : 'Not set'}</p><p className="text-sm text-muted-foreground">{admin.email}</p></div><Badge className={getRoleBadgeColor(admin.role)}>{admin.role?.replace('_', ' ')}</Badge></div>
                <p className="text-xs text-muted-foreground">Since {admin.created_at ? format(new Date(admin.created_at), 'MMM d, yyyy') : '-'}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Admin Invitations</CardTitle><CardDescription>Invite new administrators to your organization</CardDescription></CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Admin invitations feature is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
