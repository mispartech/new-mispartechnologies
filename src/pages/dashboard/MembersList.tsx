import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, MoreVertical, Edit, Trash2, UserPlus, Grid, Upload, List, CheckCircle, XCircle, Clock, Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddMemberModal from '@/components/dashboard/AddMemberModal';
import EditMemberModal from '@/components/dashboard/EditMemberModal';
import { ImportMembersModal } from '@/components/dashboard/ImportMembersModal';
import { useTerminology } from '@/contexts/TerminologyContext';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department_id: string;
  role: string;
  gender: string;
  face_image_url: string;
  created_at: string;
  status?: string;
  departments?: { name: string };
  department_name?: string;
}

const MembersList = () => {
  const { profile } = useOutletContext<{ profile: any }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { toast } = useToast();
  const { getTerm, personPlural, personSingular } = useTerminology();

  useEffect(() => { fetchMembers(); }, []);
  useEffect(() => { if (activeTab === 'pending') fetchPendingMembers(); }, [activeTab]);

  const fetchMembers = async () => {
    try {
      const result = await djangoApi.getMembers({ role: 'member', order_by: '-created_at' });
      if (result.error) throw new Error(result.error);
      setMembers(result.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({ title: 'Error', description: `Failed to fetch ${personPlural}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingMembers = async () => {
    setPendingLoading(true);
    try {
      const result = await djangoApi.getMembers({ role: 'pending', order_by: '-created_at' });
      if (result.error) throw new Error(result.error);
      setPendingMembers(result.data || []);
    } catch (error) {
      console.error('Error fetching pending members:', error);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm(`Are you sure you want to delete this ${personSingular}?`)) return;
    try {
      const result = await djangoApi.deleteMember(memberId);
      if (result.error) throw new Error(result.error);
      setMembers(members.filter(m => m.id !== memberId));
      setPendingMembers(pendingMembers.filter(m => m.id !== memberId));
      toast({ title: 'Success', description: `${getTerm('title')} deleted successfully` });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({ title: 'Error', description: 'Failed to delete member', variant: 'destructive' });
    }
  };

  const handleApprove = async (member: Member) => {
    try {
      const result = await djangoApi.updateMember(member.id, { role: 'member' });
      if (result.error) throw new Error(result.error);
      setPendingMembers(prev => prev.filter(m => m.id !== member.id));
      toast({ title: 'Approved', description: `${member.first_name} ${member.last_name} has been approved.` });
      fetchMembers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleReject = async (member: Member) => {
    if (!confirm(`Reject and remove ${member.first_name} ${member.last_name}?`)) return;
    try {
      const result = await djangoApi.deleteMember(member.id);
      if (result.error) throw new Error(result.error);
      setPendingMembers(prev => prev.filter(m => m.id !== member.id));
      toast({ title: 'Rejected', description: `Registration for ${member.first_name} ${member.last_name} has been rejected.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to reject', variant: 'destructive' });
    }
  };

  const filteredMembers = members.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.first_name?.toLowerCase().includes(searchLower) ||
      member.last_name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower)
    );
  });

  const filteredPending = pendingMembers.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.first_name?.toLowerCase().includes(searchLower) ||
      member.last_name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower)
    );
  });

  const getDeptName = (member: Member) => member.departments?.name || member.department_name || 'Unassigned';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderMemberTable = (list: Member[], isPending = false) => (
    <Card>
      <CardContent className="p-0">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="capitalize">{getTerm('title', true)}</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {isPending ? 'No pending registrations' : `No ${personPlural} found`}
                </TableCell></TableRow>
              ) : (
                list.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarImage src={member.face_image_url} /><AvatarFallback className="bg-primary/10 text-primary">{member.first_name?.[0]}{member.last_name?.[0]}</AvatarFallback></Avatar>
                        <span className="font-medium">{member.first_name} {member.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone_number || '-'}</TableCell>
                    <TableCell><Badge variant="outline">{getDeptName(member)}</Badge></TableCell>
                    <TableCell className="capitalize">{member.gender || '-'}</TableCell>
                    <TableCell>
                      {isPending ? (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="text-primary" onClick={() => handleApprove(member)} title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleReject(member)} title="Reject">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingMember(member)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(member.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border">
          {list.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isPending ? 'No pending registrations' : `No ${personPlural} found`}
            </div>
          ) : (
            list.map((member) => (
              <div key={member.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarImage src={member.face_image_url} /><AvatarFallback className="bg-primary/10 text-primary">{member.first_name?.[0]}{member.last_name?.[0]}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{member.first_name} {member.last_name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  {isPending ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="text-primary" onClick={() => handleApprove(member)}><CheckCircle className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleReject(member)}><XCircle className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingMember(member)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(member.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline">{getDeptName(member)}</Badge>
                  {member.phone_number && <Badge variant="secondary">{member.phone_number}</Badge>}
                  {member.gender && <Badge variant="secondary" className="capitalize">{member.gender}</Badge>}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground capitalize">{personPlural}</h1>
          <p className="text-muted-foreground">Manage registered {personPlural}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="gap-2">
            <Upload className="w-4 h-4" />Import CSV
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />Add {getTerm('title', true)}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={`Search ${personPlural}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><Grid className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Active + Pending */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-nowrap overflow-x-auto w-full h-auto gap-1 p-1">
          <TabsTrigger value="active" className="gap-2">
            <CheckCircle className="w-4 h-4" />Active
            <Badge variant="secondary" className="ml-1 text-xs">{members.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />Pending
            {pendingMembers.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">{pendingMembers.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {viewMode === 'list' ? (
            renderMemberTable(filteredMembers)
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-20 h-20 mb-4"><AvatarImage src={member.face_image_url} /><AvatarFallback className="bg-primary/10 text-primary text-xl">{member.first_name?.[0]}{member.last_name?.[0]}</AvatarFallback></Avatar>
                      <h3 className="font-semibold text-foreground">{member.first_name} {member.last_name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{member.email}</p>
                      <Badge variant="outline" className="mb-4">{getDeptName(member)}</Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingMember(member)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(member.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            renderMemberTable(filteredPending, true)
          )}
        </TabsContent>
      </Tabs>

      <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchMembers} />
      <ImportMembersModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={fetchMembers} />
      {editingMember && (
        <EditMemberModal isOpen={!!editingMember} onClose={() => setEditingMember(null)} member={editingMember} onSuccess={fetchMembers} />
      )}
    </div>
  );
};

export default MembersList;
