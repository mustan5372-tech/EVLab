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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Tractive & Resistive Forces vs Acceleration</CardTitle>
            <CardDescription>
              Force equilibrium: Wheel propulsive force opposing quadratic aero drag & tire hysteresis.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="h-64 sm:h-72 lg:h-80 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #212D40)" vertical={false} opacity={0.6} />
            <XAxis
              dataKey="timeS"
              tickFormatter={(v) => `${v}s`}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              yAxisId="force"
              stroke="#00D2FF"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              unit=" N"
              domain={[0, 'auto']}
              width={52}
            />
            <YAxis
              yAxisId="accel"
              orientation="right"
              stroke="#10B981"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              unit=" m/s²"
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
              formatter={(value: any, name: string) => {
                const num = Number(value);
                if (name === 'Acceleration') return [`${num.toFixed(2)} m/s² (${(num / 9.80665).toFixed(2)} G)`, name];
                return [`${num.toLocaleString()} N`, name];
              }}
              labelFormatter={(label) => `Time: ${Number(label).toFixed(2)} s`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line
              yAxisId="force"
              type="monotone"
              dataKey="tractiveForceN"
              name="Tractive Force"
              stroke="#00D2FF"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#00D2FF' }}
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
