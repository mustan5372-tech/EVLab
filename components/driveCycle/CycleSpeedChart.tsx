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
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              unit=" km/h"
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121824',
                borderColor: '#24334E',
                borderRadius: '16px',
                fontSize: '12px',
              }}
              formatter={(value: any, name: string) => [`${value} km/h`, name]}
              labelFormatter={(label) => `Time: ${label} s (${(Number(label) / 60).toFixed(1)} min)`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="targetSpeedKmh"
              name="Cycle Target Speed"
              stroke="#64748B"
              strokeWidth={2}
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
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
