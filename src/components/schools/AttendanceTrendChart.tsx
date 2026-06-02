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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip
          cursor={{ fill: 'rgba(34,211,238,0.08)' }}
          contentStyle={{ background: 'rgba(8,18,40,0.95)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 8, color: '#fff' }}
          formatter={(v: number) => [`${v}%`, 'Attendance']}
        />
        <Bar dataKey="rate" fill="url(#trendGrad)" radius={[4, 4, 0, 0]} />
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="rgb(37,99,235)" stopOpacity={0.5} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
