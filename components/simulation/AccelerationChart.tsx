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

interface AccelerationChartProps {
  acceleration: AccelerationSimulationResult;
}

export function AccelerationChart({ acceleration }: AccelerationChartProps) {
  const data = acceleration.timeSeries;

  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-1">
        <div>
          <CardTitle>Acceleration Profile (Speed & Distance vs Time)</CardTitle>
          <CardDescription>
            High-resolution numerical integration of full-throttle launch from standstill.
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
              yAxisId="speed"
              stroke="#00D2FF"
              fontSize={11}
              tickLine={false}
              unit=" km/h"
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="distance"
              orientation="right"
              stroke="#38BDF8"
              fontSize={11}
              tickLine={false}
              unit=" m"
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
                if (name === 'Vehicle Speed') return [`${value} km/h`, name];
                if (name === 'Distance Covered') return [`${value} m`, name];
                return [value, name];
              }}
              labelFormatter={(label) => `Time: ${label} s`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line
              yAxisId="speed"
              type="monotone"
              dataKey="speedKmh"
              name="Vehicle Speed"
              stroke="#00D2FF"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#00D2FF' }}
            />
            <Line
              yAxisId="distance"
              type="monotone"
              dataKey="distanceM"
              name="Distance Covered"
              stroke="#38BDF8"
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
