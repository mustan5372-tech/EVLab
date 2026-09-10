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

interface CycleSpeedChartProps {
  timeSeries: DriveCycleTimeStep[];
  cycleName: string;
}

export function CycleSpeedChart({ timeSeries, cycleName }: CycleSpeedChartProps) {
  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-1">
        <div>
          <CardTitle>Velocity Profile & Schedule Tracking</CardTitle>
          <CardDescription>
            {cycleName} target speed trace versus simulated vehicle achieved velocity.
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
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              unit=" km/h"
              domain={[0, 'auto']}
              width={52}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.94)',
                borderColor: 'rgba(0, 210, 255, 0.3)',
                borderRadius: '16px',
                fontSize: '12px',
                color: '#F8FAFC',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              itemStyle={{ color: '#F8FAFC' }}
              formatter={(value: any, name: string) => [`${Number(value).toFixed(1)} km/h`, name]}
              labelFormatter={(label) => `Time: ${label}s (${(Number(label) / 60).toFixed(1)} min)`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line
              type="monotone"
              dataKey="targetSpeedKmh"
              name="Cycle Target Speed"
              stroke="#64748B"
              strokeWidth={1.75}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actualSpeedKmh"
              name="Achieved Vehicle Speed"
              stroke="#00D2FF"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#00D2FF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
