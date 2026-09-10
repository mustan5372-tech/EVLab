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

      <div className="h-64 sm:h-72 lg:h-80 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeSeries} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #212D40)" vertical={false} opacity={0.6} />
            <XAxis
              dataKey="timeS"
              tickFormatter={(v) => `${Math.floor(v / 60)}m`}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              yAxisId="soc"
              stroke="#10B981"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              unit="%"
              domain={['dataMin - 1', 'dataMax + 1']}
              width={50}
            />
            <YAxis
              yAxisId="energy"
              orientation="right"
              stroke="#F59E0B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              unit=" Wh"
              domain={[0, 'auto']}
              width={54}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.94)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                fontSize: '12px',
                color: '#F8FAFC',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              itemStyle={{ color: '#F8FAFC' }}
              formatter={(value: any, name: string) => {
                const num = Number(value);
                if (name === 'Battery SOC') return [`${num.toFixed(2)}%`, name];
                if (name === 'Net Energy Consumed') return [`${num.toFixed(1)} Wh`, name];
                return [value, name];
              }}
              labelFormatter={(label) => `Time: ${label}s (${(Number(label) / 60).toFixed(1)} min)`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line
              yAxisId="soc"
              type="monotone"
              dataKey="batterySocPercent"
              name="Battery SOC"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#10B981' }}
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
