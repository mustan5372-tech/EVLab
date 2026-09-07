'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { DriveCycleTimeStep } from '@/types/driveCycle';

interface CycleEnergySocChartProps {
  timeSeries: DriveCycleTimeStep[];
}

export function CycleEnergySocChart({ timeSeries }: CycleEnergySocChartProps) {
  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-1">
        <div>
          <CardTitle>State of Charge (SOC) & Energy Depletion</CardTitle>
          <CardDescription>
            Continuous progression of battery pack SOC percentage and cumulative net electrical energy consumed.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#212D40" vertical={false} />
            <XAxis
              dataKey="timeS"
              tickFormatter={(v) => `${Math.floor(v / 60)}m`}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              yAxisId="soc"
              stroke="#10B981"
              fontSize={11}
              tickLine={false}
              unit="%"
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <YAxis
              yAxisId="energy"
              orientation="right"
              stroke="#F59E0B"
              fontSize={11}
              tickLine={false}
              unit=" Wh"
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-100)',
                borderColor: 'var(--border-color)',
                borderRadius: '16px',
                fontSize: '12px',
                color: 'var(--foreground)',
              }}
              itemStyle={{ color: 'var(--foreground)' }}
              formatter={(value: any, name: string) => {
                if (name === 'Battery SOC') return [`${value}%`, name];
                if (name === 'Net Energy Consumed') return [`${value} Wh`, name];
                return [value, name];
              }}
              labelFormatter={(label) => `Time: ${label} s`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line
              yAxisId="soc"
              type="monotone"
              dataKey="batterySocPercent"
              name="Battery SOC"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              yAxisId="energy"
              type="monotone"
              dataKey="cumulativeEnergyWh"
              name="Net Energy Consumed"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
