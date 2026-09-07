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
import { AccelerationSimulationResult } from '@/types/simulation';

interface TractiveForceChartProps {
  acceleration: AccelerationSimulationResult;
}

export function TractiveForceChart({ acceleration }: TractiveForceChartProps) {
  const data = acceleration.timeSeries;

  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-1">
        <div>
          <CardTitle>Tractive & Resistive Forces vs Acceleration</CardTitle>
          <CardDescription>
            Forces acting on the vehicle: Wheel tractive effort vs quadratic aerodynamic drag & tire hysteresis.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#212D40" vertical={false} />
            <XAxis
              dataKey="timeS"
              tickFormatter={(v) => `${v}s`}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              yAxisId="force"
              stroke="#00D2FF"
              fontSize={11}
              tickLine={false}
              unit=" N"
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="accel"
              orientation="right"
              stroke="#10B981"
              fontSize={11}
              tickLine={false}
              unit=" m/s²"
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
                if (name === 'Tractive Force') return [`${value} N`, name];
                if (name === 'Aero Drag Force') return [`${value} N`, name];
                if (name === 'Rolling Resistance') return [`${value} N`, name];
                if (name === 'Acceleration') return [`${value} m/s²`, name];
                return [value, name];
              }}
              labelFormatter={(label) => `Time: ${label} s`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line
              yAxisId="force"
              type="monotone"
              dataKey="tractiveForceN"
              name="Tractive Force"
              stroke="#00D2FF"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              yAxisId="force"
              type="monotone"
              dataKey="aeroDragForceN"
              name="Aero Drag Force"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="force"
              type="monotone"
              dataKey="rollingResistForceN"
              name="Rolling Resistance"
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              yAxisId="accel"
              type="monotone"
              dataKey="accelerationMs2"
              name="Acceleration"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="2 2"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
