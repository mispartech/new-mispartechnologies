import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Download, RefreshCw, Search, Users, UserCheck, Clock, Filter, Building2 } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { djangoApi } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import PaginationControls from '@/components/dashboard/PaginationControls';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import { useTerminology } from '@/contexts/TerminologyContext';

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  time: string;
  confidence_score: number | null;
  face_detections: number | null;
  created_at: string;
  profiles?: { first_name: string | null; last_name: string | null; email: string | null; department_id: string | null; department?: string | null; };
  member_name?: string;
  member_email?: string;
  department_id?: string;
}

interface TempAttendanceRecord {
  id: string;
  temp_face_id: string;
  date: string;
  time: string;
  face_detections: number | null;
  status: string | null;
  created_at: string;
}

interface Department { id: string; name: string; }

const AttendanceHistory = () => {
  const { profile } = useOutletContext<{ profile: any }>();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [tempRecords, setTempRecords] = useState<TempAttendanceRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<'members' | 'visitors' | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [stats, setStats] = useState({ total: 0, members: 0, visitors: 0, avgConfidence: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { toast } = useToast();
  const { getTerm, personPlural } = useTerminology();

  useEffect(() => {
    const fetchDepts = async () => {
      const result = await djangoApi.getDepartments();
      if (!result.error && result.data) setDepartments(result.data);
    };
    fetchDepts();
  }, []);

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const fromDate = format(startOfDay(dateFrom), 'yyyy-MM-dd');
      const toDate = format(endOfDay(dateTo), 'yyyy-MM-dd');

      const [memberResult, tempResult] = await Promise.all([
        djangoApi.getAttendance({ start_date: fromDate, end_date: toDate, include_profiles: 'true' }),
        djangoApi.getTempAttendance({ start_date: fromDate, end_date: toDate }),
      ]);

      if (memberResult.error) throw new Error(memberResult.error);
      if (tempResult.error) throw new Error(tempResult.error);

      const memberData = memberResult.data || [];
      const tempData = tempResult.data || [];

      setAttendanceRecords(memberData);
      setTempRecords(tempData);

      const memberCount = memberData.length;
      const visitorCount = tempData.length;
      const totalConfidence = memberData.reduce((sum: number, r: any) => sum + (r.confidence_score || 0), 0);
      const avgConfidence = memberCount > 0 ? totalConfidence / memberCount : 0;

      setStats({ total: memberCount + visitorCount, members: memberCount, visitors: visitorCount, avgConfidence: Math.round(avgConfidence * 100) });
      setCurrentPage(1);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch attendance records', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAttendanceData(); }, [dateFrom, dateTo]);

  const filteredMembers = useMemo(() =>
    attendanceRecords.filter(record => {
      const fullName = record.member_name || `${record.profiles?.first_name || ''} ${record.profiles?.last_name || ''}`.toLowerCase();
      const email = record.member_email || record.profiles?.email || '';
      const matchesSearch = !searchQuery || fullName.toLowerCase().includes(searchQuery.toLowerCase()) || email.toLowerCase().includes(searchQuery.toLowerCase());
      const deptId = record.department_id || record.profiles?.department_id;
      const matchesDepartment = selectedDepartment === 'all' || deptId === selectedDepartment;
      return matchesSearch && matchesDepartment;
    }), [attendanceRecords, searchQuery, selectedDepartment]);

  const filteredVisitors = useMemo(() =>
    tempRecords.filter(record => !searchQuery || record.temp_face_id.toLowerCase().includes(searchQuery.toLowerCase())),
    [tempRecords, searchQuery]);

  const combinedData = useMemo(() => {
    let data: Array<{ type: 'member' | 'visitor'; record: AttendanceRecord | TempAttendanceRecord }> = [];
    if (viewType !== 'visitors') filteredMembers.forEach(record => data.push({ type: 'member', record }));
    if (viewType !== 'members') filteredVisitors.forEach(record => data.push({ type: 'visitor', record }));
    data.sort((a, b) => new Date(`${b.record.date}T${b.record.time}`).getTime() - new Date(`${a.record.date}T${a.record.time}`).getTime());
    return data;
  }, [filteredMembers, filteredVisitors, viewType]);

  const totalPages = Math.ceil(combinedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return combinedData.slice(start, start + itemsPerPage);
  }, [combinedData, currentPage, itemsPerPage]);

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Type', 'Name/ID', 'Confidence', 'Detections'];
    const rows: string[][] = [];
    filteredMembers.forEach(record => {
      const name = record.member_name || `${record.profiles?.first_name || ''} ${record.profiles?.last_name || ''}`.trim() || 'Unknown';
      rows.push([record.date, record.time, getTerm('title', true), name, record.confidence_score ? `${Math.round(record.confidence_score * 100)}%` : 'N/A', String(record.face_detections || 1)]);
    });
    filteredVisitors.forEach(record => { rows.push([record.date, record.time, 'Visitor', record.temp_face_id, 'N/A', String(record.face_detections || 1)]); });
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(dateFrom, 'yyyy-MM-dd')}_to_${format(dateTo, 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Attendance data exported to CSV' });
  };

  const getMemberName = (record: AttendanceRecord) =>
    record.member_name || `${record.profiles?.first_name || ''} ${record.profiles?.last_name || ''}`.trim() || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Attendance History</h1><p className="text-muted-foreground">View and analyze attendance records</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAttendanceData} disabled={isLoading}><RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />Refresh</Button>
          <Button onClick={exportToCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><Users className="w-5 h-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Total Records</span></div><p className="text-2xl font-bold mt-1">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><UserCheck className="w-5 h-5 text-primary" /><span className="text-sm text-muted-foreground capitalize">{personPlural}</span></div><p className="text-2xl font-bold mt-1 text-primary">{stats.members}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><Users className="w-5 h-5 text-accent-foreground" /><span className="text-sm text-muted-foreground">Visitors</span></div><p className="text-2xl font-bold mt-1 text-accent-foreground">{stats.visitors}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><Clock className="w-5 h-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Avg Confidence</span></div><p className="text-2xl font-bold mt-1">{stats.avgConfidence}%</p></CardContent></Card>
      </div>

      <AttendanceChart organizationId={profile?.organization_id} showVisitors={true} />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5" />Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search by name..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-9" /></div>
            <Popover><PopoverTrigger asChild><Button variant="outline" className="justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{format(dateFrom, 'PPP')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={dateFrom} onSelect={(date) => date && setDateFrom(date)} initialFocus className="p-3 pointer-events-auto" /></PopoverContent></Popover>
            <Popover><PopoverTrigger asChild><Button variant="outline" className="justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{format(dateTo, 'PPP')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={dateTo} onSelect={(date) => date && setDateTo(date)} initialFocus className="p-3 pointer-events-auto" /></PopoverContent></Popover>
            <Select value={selectedDepartment} onValueChange={(v) => { setSelectedDepartment(v); setCurrentPage(1); }}><SelectTrigger><Building2 className="w-4 h-4 mr-2" /><SelectValue placeholder="Department" /></SelectTrigger><SelectContent><SelectItem value="all">All Departments</SelectItem>{departments.map((dept) => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}</SelectContent></Select>
            <Select value={viewType} onValueChange={(v: 'members' | 'visitors' | 'all') => { setViewType(v); setCurrentPage(1); }}><SelectTrigger><SelectValue placeholder="View type" /></SelectTrigger><SelectContent><SelectItem value="all">All Records</SelectItem><SelectItem value="members">{getTerm('plural', true)} Only</SelectItem><SelectItem value="visitors">Visitors Only</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attendance Records</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Type</TableHead><TableHead>Name / ID</TableHead><TableHead>Confidence</TableHead><TableHead>Detections</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {paginatedData.map(({ type, record }) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{record.time.slice(0, 5)}</TableCell>
                        <TableCell><Badge variant={type === 'member' ? 'default' : 'secondary'}>{type === 'member' ? getTerm('title', true) : 'Visitor'}</Badge></TableCell>
                        <TableCell className="font-medium">{type === 'member' ? getMemberName(record as AttendanceRecord) : (record as TempAttendanceRecord).temp_face_id}</TableCell>
                        <TableCell>
                          {type === 'member' && (record as AttendanceRecord).confidence_score ? (
                            <Badge variant={(record as AttendanceRecord).confidence_score! > 0.8 ? 'default' : 'secondary'}>{Math.round((record as AttendanceRecord).confidence_score! * 100)}%</Badge>
                          ) : <span className="text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell>{record.face_detections || 1}</TableCell>
                        <TableCell><Badge variant="outline" className="text-green-600">Recorded</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={combinedData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceHistory;
