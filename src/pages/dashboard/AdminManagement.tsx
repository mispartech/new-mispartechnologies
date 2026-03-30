import { useState, useEffect } from 'react';
import { djangoApi } from '@/lib/api/client';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Shield, Plus, UserMinus } from 'lucide-react';
import { format } from 'date-fns';
import InviteAdminModal from '@/components/dashboard/InviteAdminModal';
import { ADMIN_ROLES, ASSIGNABLE_ROLES, ROLE_LABELS } from '@/lib/roleConfig';

interface Admin {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  job_title?: string;
  status?: string;
  created_at: string;
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useDjangoAuth();

  const currentRole = user?.role || 'member';
  const canInvite = currentRole === 'super_admin' || currentRole === 'admin';
  const canChangeRoles = currentRole === 'super_admin';
  const assignableRoles = ASSIGNABLE_ROLES[currentRole] || [];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await djangoApi.getMembers({ page_size: 200 });
      const all: Admin[] = res.data || [];

      const active = all.filter(m =>
        ADMIN_ROLES.includes(m.role as any) && m.status !== 'pending'
      );
      const pending = all.filter(m =>
        ADMIN_ROLES.includes(m.role as any) && m.status === 'pending'
      );

      // Deduplicate
      const dedup = (arr: Admin[]) => {
        const seen = new Set<string>();
        return arr.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
      };

      setAdmins(dedup(active));
      setPendingAdmins(dedup(pending));
    } catch {
      toast({ title: 'Error', description: 'Failed to load admin data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (adminId: string, newRole: string) => {
    setUpdatingId(adminId);
    try {
      const res = await djangoApi.updateMember(adminId, { role: newRole });
      if (res.error) {
        toast({ title: 'Update Failed', description: res.error, variant: 'destructive' });
      } else {
        toast({ title: 'Role Updated', description: `Role changed to ${ROLE_LABELS[newRole] || newRole}.` });
        fetchData();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update role.', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRevoke = async (adminId: string, name: string) => {
    if (!confirm(`Demote ${name} to member? They will lose admin access.`)) return;
    await handleRoleChange(adminId, 'member');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase?.().replace(/\s+/g, '_')) {
      case 'super_admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getName = (a: Admin) => a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : 'Not set';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View and manage administrators in your organization</p>
        </div>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Invite Admin
          </Button>
        )}
      </div>

      {/* Current Administrators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" />Current Administrators</CardTitle>
          <CardDescription>All users with administrative privileges</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Since</TableHead>
                  {canChangeRoles && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow><TableCell colSpan={canChangeRoles ? 6 : 5} className="text-center text-muted-foreground py-8">No administrators found</TableCell></TableRow>
                ) : admins.map(admin => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{getName(admin)}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell><Badge className={getRoleBadgeColor(admin.role)}>{ROLE_LABELS[admin.role] || admin.role?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{admin.job_title || '-'}</TableCell>
                    <TableCell>{admin.created_at ? format(new Date(admin.created_at), 'MMM d, yyyy') : '-'}</TableCell>
                    {canChangeRoles && (
                      <TableCell>
                        {admin.role !== 'super_admin' && admin.id !== user?.id ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={admin.role}
                              onValueChange={val => handleRoleChange(admin.id, val)}
                              disabled={updatingId === admin.id}
                            >
                              <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {assignableRoles.map(r => (
                                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRevoke(admin.id, getName(admin))} disabled={updatingId === admin.id}>
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-border">
            {admins.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 px-4">No administrators found</div>
            ) : admins.map(admin => (
              <div key={admin.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{getName(admin)}</p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                  <Badge className={getRoleBadgeColor(admin.role)}>{ROLE_LABELS[admin.role] || admin.role?.replace('_', ' ')}</Badge>
                </div>
                {admin.job_title && <p className="text-xs text-muted-foreground">{admin.job_title}</p>}
                <p className="text-xs text-muted-foreground">Since {admin.created_at ? format(new Date(admin.created_at), 'MMM d, yyyy') : '-'}</p>
                {canChangeRoles && admin.role !== 'super_admin' && admin.id !== user?.id && (
                  <div className="flex items-center gap-2 pt-1">
                    <Select value={admin.role} onValueChange={val => handleRoleChange(admin.id, val)} disabled={updatingId === admin.id}>
                      <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {assignableRoles.map(r => (
                          <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRevoke(admin.id, getName(admin))} disabled={updatingId === admin.id}>
                      <UserMinus className="h-4 w-4 mr-1" />Revoke
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Invitations</CardTitle>
          <CardDescription>Administrators who have been invited but haven't set up their account yet</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {pendingAdmins.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No pending admin invitations.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Invited Role</TableHead>
                      <TableHead>Invited On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAdmins.map(admin => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{getName(admin)}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell><Badge variant="outline">{ROLE_LABELS[admin.role] || admin.role?.replace('_', ' ')}</Badge></TableCell>
                        <TableCell>{admin.created_at ? format(new Date(admin.created_at), 'MMM d, yyyy') : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden divide-y divide-border">
                {pendingAdmins.map(admin => (
                  <div key={admin.id} className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{getName(admin)}</p>
                      <Badge variant="outline">{ROLE_LABELS[admin.role] || admin.role?.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    <p className="text-xs text-muted-foreground">Invited {admin.created_at ? format(new Date(admin.created_at), 'MMM d, yyyy') : '-'}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <InviteAdminModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        currentUserRole={currentRole}
        organizationType={user?.organization_type}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminManagement;
