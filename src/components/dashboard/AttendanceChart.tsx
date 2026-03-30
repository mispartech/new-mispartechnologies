import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { djangoApi } from '@/lib/api/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, getDay } from 'date-fns';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useTerminology } from '@/contexts/TerminologyContext';

interface AttendanceChartProps { organizationId?: string; userId?: string; showVisitors?: boolean; }
interface DailyData { date: string; displayDate: string; members: number; visitors: number; total: number; }

const CHART_COLORS = { members: 'hsl(var(--primary))', visitors: 'hsl(30, 90%, 50%)', total: 'hsl(var(--accent))' };
const PIE_COLORS = ['hsl(270, 60%, 50%)', 'hsl(300, 40%, 50%)', 'hsl(220, 60%, 50%)', 'hsl(160, 60%, 50%)', 'hsl(30, 60%, 50%)', 'hsl(0, 60%, 50%)', 'hsl(90, 60%, 50%)'];
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AttendanceChart = ({ organizationId, userId, showVisitors = true }: AttendanceChartProps) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'month'>('7d');
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getTerm } = useTerminology();

  const getDateRange = () => {
    const today = new Date();
    switch (timeRange) {
      case '7d': return { start: subDays(today, 6), end: today };
      case '30d': return { start: subDays(today, 29), end: today };
      case 'month': return { start: startOfMonth(today), end: endOfMonth(today) };
      default: return { start: subDays(today, 6), end: today };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { start, end } = getDateRange();
        const params: any = {
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd'),
          page_size: 1000,
        };
        if (userId) params.user_id = userId;

        const [memberRes, tempRes] = await Promise.all([
          djangoApi.getAttendance(params, { silent: true }),
          !userId && showVisitors
            ? djangoApi.getTempAttendance({ start_date: params.start_date, end_date: params.end_date })
            : Promise.resolve({ data: [] }),
        ]);

        const memberData = Array.isArray(memberRes.data) ? memberRes.data : [];
        const tempData = Array.isArray(tempRes.data) ? tempRes.data : [];

        // Tag records so chart data can distinguish them
        const tagged = [
          ...memberData.map((r: any) => ({ ...r, _type: 'member' })),
          ...tempData.map((r: any) => ({ ...r, _type: 'visitor' })),
        ];
        setRawRecords(tagged);
      } catch {
        setRawRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [timeRange, organizationId, userId]);

  const chartData = useMemo<DailyData[]>(() => {
    const { start, end } = getDateRange();
    const days = eachDayOfInterval({ start, end });

    // Build a map of date -> { members, visitors }
    const dateMap = new Map<string, { members: number; visitors: number }>();
    days.forEach(d => dateMap.set(format(d, 'yyyy-MM-dd'), { members: 0, visitors: 0 }));

    rawRecords.forEach(record => {
      const dateStr = record.date || (record.created_at ? record.created_at.split('T')[0] : null);
      if (!dateStr) return;
      const entry = dateMap.get(dateStr);
      if (!entry) return;
      const isVisitor = record.is_visitor || record.record_type === 'visitor';
      if (isVisitor) {
        entry.visitors++;
      } else {
        entry.members++;
      }
    });

    return days.map(d => {
      const key = format(d, 'yyyy-MM-dd');
      const entry = dateMap.get(key) || { members: 0, visitors: 0 };
      return {
        date: key,
        displayDate: format(d, timeRange === '30d' ? 'MMM d' : 'EEE'),
        members: entry.members,
        visitors: entry.visitors,
        total: entry.members + entry.visitors,
      };
    });
  }, [rawRecords, timeRange]);

  const weekdayData = useMemo(() => {
    const counts = new Array(7).fill(0);
    rawRecords.forEach(record => {
      const dateStr = record.date || (record.created_at ? record.created_at.split('T')[0] : null);
      if (!dateStr) return;
      try {
        const d = parseISO(dateStr);
        if (!isNaN(d.getTime())) counts[getDay(d)]++;
      } catch { /* skip */ }
    });
    return WEEKDAY_NAMES.map((name, i) => ({ name, count: counts[i] }));
  }, [rawRecords]);

  const totalStats = useMemo(() => {
    const totalMembers = chartData.reduce((sum, d) => sum + d.members, 0);
    const totalVisitors = chartData.reduce((sum, d) => sum + d.visitors, 0);
    const avgDaily = chartData.length > 0 ? Math.round((totalMembers + totalVisitors) / chartData.length) : 0;
    return { totalMembers, totalVisitors, avgDaily };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-1">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-sm" style={{ color: entry.color }}>{entry.name}: {entry.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) return <Card><CardContent className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5" />Attendance Trends</CardTitle>
        <Select value={timeRange} onValueChange={(v: '7d' | '30d' | 'month') => setTimeRange(v)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{totalStats.totalMembers}</p>
            <p className="text-xs text-muted-foreground capitalize">{getTerm('plural', true)}</p>
          </div>
          {showVisitors && !userId && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-secondary">{totalStats.totalVisitors}</p>
              <p className="text-xs text-muted-foreground">Visitors</p>
            </div>
          )}
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{totalStats.avgDaily}</p>
            <p className="text-xs text-muted-foreground">Avg/Day</p>
          </div>
        </div>
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="bar" className="text-xs"><BarChart3 className="w-4 h-4 mr-1" />Bar</TabsTrigger>
            <TabsTrigger value="line" className="text-xs"><TrendingUp className="w-4 h-4 mr-1" />Trend</TabsTrigger>
            <TabsTrigger value="pie" className="text-xs"><PieChartIcon className="w-4 h-4 mr-1" />Weekday</TabsTrigger>
          </TabsList>
          <TabsContent value="bar" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="members" name={getTerm('title', true) + 's'} fill={CHART_COLORS.members} radius={[4, 4, 0, 0]} />
                {showVisitors && !userId && <Bar dataKey="visitors" name="Visitors" fill={CHART_COLORS.visitors} radius={[4, 4, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="line" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total" stroke={CHART_COLORS.total} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="members" name={getTerm('title', true) + 's'} stroke={CHART_COLORS.members} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="pie" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={weekdayData.filter(d => d.count > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="count" nameKey="name" label={({ name, count }) => `${name}: ${count}`}>
                  {weekdayData.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;
