import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface TrendPoint {
  date: string;
  rate: number; // 0..100
}

interface Props {
  data: TrendPoint[];
  height?: number;
}

export const AttendanceTrendChart = ({ data, height = 180 }: Props) => (
  <div style={{ width: '100%', height }}>
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--s-border))" />
        <XAxis dataKey="date" tick={{ fill: 'hsl(var(--s-text-subtle))', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'hsl(var(--s-text-subtle))', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip
          cursor={{ fill: 'hsl(var(--s-primary) / 0.08)' }}
          contentStyle={{
            background: 'hsl(var(--s-surface))',
            border: '1px solid hsl(var(--s-border))',
            borderRadius: 8,
            color: 'hsl(var(--s-text))',
            fontSize: 12,
          }}
          formatter={(v: number) => [`${v}%`, 'Attendance']}
        />
        <Bar dataKey="rate" fill="url(#schoolsTrendGrad)" radius={[6, 6, 0, 0]} />
        <defs>
          <linearGradient id="schoolsTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--s-primary))" stopOpacity={0.95} />
            <stop offset="100%" stopColor="hsl(var(--s-academic))" stopOpacity={0.55} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
