import { useState, useEffect } from 'react';
import { djangoApi } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Search, ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

const ACTION_TYPES = [
  { value: '', label: 'All Actions' },
  { value: 'member_created', label: 'Member Created' },
  { value: 'member_updated', label: 'Member Updated' },
  { value: 'member_deleted', label: 'Member Deleted' },
  { value: 'department_created', label: 'Department Created' },
  { value: 'department_updated', label: 'Department Updated' },
  { value: 'department_deleted', label: 'Department Deleted' },
  { value: 'attendance_marked', label: 'Attendance Marked' },
  { value: 'face_enrolled', label: 'Face Enrolled' },
  { value: 'settings_updated', label: 'Settings Updated' },
  { value: 'login', label: 'Login' },
  { value: 'role_changed', label: 'Role Changed' },
];

const getActionColor = (action: string): string => {
  if (action.includes('created') || action === 'login' || action === 'face_enrolled') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (action.includes('updated') || action.includes('changed')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  if (action.includes('deleted')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-muted text-muted-foreground';
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const pageSize = 20;

  useEffect(() => {
    fetchLogs();
  }, [page, actionType, startDate, endDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await djangoApi.getActivityLogs({
        page,
        page_size: pageSize,
        action_type: actionType || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      if (!result.error) {
        setLogs(result.data || []);
        setTotalCount(result.count || 0);
      } else {
        setLogs([]);
        setTotalCount(0);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatDetails = (details: Record<string, any> | null): string => {
    if (!details) return '-';
    const entries = Object.entries(details).slice(0, 3);
    return entries.map(([k, v]) => `${k}: ${v}`).join(', ') || '-';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-muted-foreground">Track all user actions in your organization</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={actionType} onValueChange={(v) => { setActionType(v); setPage(1); }}>
                <SelectTrigger className="h-9">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="All Actions" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value || 'all'}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="h-9 pl-10 w-[160px]"
                  placeholder="Start date"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="h-9 pl-10 w-[160px]"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Activity className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Activity Logs</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {actionType || startDate || endDate
                  ? 'No logs match your filters. Try adjusting the date range or action type.'
                  : 'Activity logs will appear here as users perform actions in your organization.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium">{log.user_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs ${getActionColor(log.action)}`}>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {formatDetails(log.details)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.ip_address || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card view */}
              <div className="md:hidden divide-y divide-border">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{log.user_name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                    {log.details && (
                      <p className="text-xs text-muted-foreground">{formatDetails(log.details)}</p>
                    )}
                    {log.ip_address && (
                      <p className="text-xs text-muted-foreground">IP: {log.ip_address}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
