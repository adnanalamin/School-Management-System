import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AttendancePoint } from './types';

type Range = 'week' | 'month';

const axisTick = { fill: 'hsl(var(--muted-foreground))', fontSize: 12 };

function AttendanceAreaChart({ points, targetRate, caption }: { points: AttendancePoint[]; targetRate: number; caption: string }) {
  return (
    <figure>
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
            <YAxis domain={[85, 100]} tickLine={false} axisLine={false} tick={axisTick} tickFormatter={(value: number) => `${value}%`} />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--border))' }}
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                color: 'hsl(var(--popover-foreground))',
                fontSize: 13,
              }}
            />
            <ReferenceLine
              y={targetRate}
              stroke="hsl(var(--chart-2))"
              strokeDasharray="4 4"
              label={{ value: `Target ${targetRate}%`, position: 'insideBottomRight', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="rate" name="Attendance" unit="%" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#attendanceFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{caption}</figcaption>
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Attendance rate</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{point.rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

interface AttendanceChartProps {
  week: AttendancePoint[];
  month: AttendancePoint[];
  targetRate: number;
}

export function AttendanceChart({ week, month, targetRate }: AttendanceChartProps) {
  const [range, setRange] = useState<Range>('week');

  return (
    <Tabs value={range} onValueChange={(value) => setRange(value === 'month' ? 'month' : 'week')}>
      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Attendance rate</CardTitle>
            <CardDescription>Share of enrolled students present</CardDescription>
          </div>
          <TabsList>
            <TabsTrigger value="week">This week</TabsTrigger>
            <TabsTrigger value="month">This month</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="week" className="mt-0">
            <AttendanceAreaChart points={week} targetRate={targetRate} caption="Daily attendance rate this week" />
          </TabsContent>
          <TabsContent value="month" className="mt-0">
            <AttendanceAreaChart points={month} targetRate={targetRate} caption="Weekly attendance rate this month" />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
