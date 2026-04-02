import { useState, useEffect } from 'react';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, MoreVertical, Edit, Trash2, Plus, Building2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Department {
  id: string;
  name: string;
  description: string;
  allowed_roles: string[];
  department_head_id: string;
  created_at: string;
  head_name?: string;
  member_count?: number;
}

const DepartmentsList = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const result = await djangoApi.getDepartments();
      if (result.error) throw new Error(result.error);
      setDepartments(result.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({ title: 'Error', description: 'Failed to fetch departments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Department name is required', variant: 'destructive' });
      return;
    }
    try {
      const result = await djangoApi.createDepartment({ name: formData.name, description: formData.description });
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Department created successfully' });
      setIsCreateOpen(false);
      setFormData({ name: '', description: '' });
      fetchDepartments();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create department', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!editingDepartment || !formData.name.trim()) return;
    try {
      const result = await djangoApi.updateDepartment(editingDepartment.id, { name: formData.name, description: formData.description });
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Department updated successfully' });
      setEditingDepartment(null);
      setFormData({ name: '', description: '' });
      fetchDepartments();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update department', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletingDepartmentId) return;
    try {
      const result = await djangoApi.deleteDepartment(deletingDepartmentId);
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Department deleted successfully' });
      fetchDepartments();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete department', variant: 'destructive' });
    } finally {
      setDeletingDepartmentId(null);
    }
  };

  const openEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground">Manage organization departments</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setFormData({ name: '', description: '' }); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Add Department</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Department</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter department name" /></div>
              <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter description" /></div>
              <Button onClick={handleCreate} className="w-full">Create Department</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search departments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div></CardContent></Card>

      <Card>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No departments found</TableCell></TableRow>
                ) : (
                  filteredDepartments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Building2 className="w-4 h-4 text-primary" /></div><span className="font-medium">{dept.name}</span></div></TableCell>
                      <TableCell className="text-muted-foreground">{dept.description || '-'}</TableCell>
                      <TableCell>{dept.head_name || <span className="text-muted-foreground">Not assigned</span>}</TableCell>
                      <TableCell><Badge variant="secondary" className="gap-1"><Users className="w-3 h-3" />{dept.member_count || 0}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(dept)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingDepartmentId(dept.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-border">
            {filteredDepartments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No departments found</div>
            ) : (
              filteredDepartments.map((dept) => (
                <div key={dept.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0"><Building2 className="w-4 h-4 text-primary" /></div>
                      <span className="font-medium truncate">{dept.name}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(dept)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingDepartmentId(dept.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {dept.description && <p className="text-sm text-muted-foreground">{dept.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Head: {dept.head_name || 'Not assigned'}</span>
                    <Badge variant="secondary" className="gap-1 text-xs"><Users className="w-3 h-3" />{dept.member_count || 0}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingDepartment} onOpenChange={(open) => !open && setEditingDepartment(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Department</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="edit-name">Name</Label><Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edit-description">Description</Label><Textarea id="edit-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <Button onClick={handleUpdate} className="w-full">Update Department</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDepartmentId} onOpenChange={(open) => !open && setDeletingDepartmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this department? This action cannot be undone. Members assigned to this department will be unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentsList;
