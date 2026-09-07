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

interface PowerTorqueChartProps {
  acceleration: AccelerationSimulationResult;
}

export function PowerTorqueChart({ acceleration }: PowerTorqueChartProps) {
  const data = acceleration.timeSeries;

  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-1">
        <div>
          <CardTitle>Powertrain Operating Points (Power, Torque & RPM)</CardTitle>
          <CardDescription>
            Dynamic interplay between battery pack discharge, motor mechanical power, and rotor speed.
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
              yAxisId="power"
              stroke="#F59E0B"
              fontSize={11}
              tickLine={false}
              unit=" kW"
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="rpm"
              orientation="right"
              stroke="#A855F7"
              fontSize={11}
              tickLine={false}
              unit=" RPM"
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121824',
                borderColor: '#24334E',
                borderRadius: '16px',
                fontSize: '12px',
              }}
              formatter={(value: any, name: string) => {
                if (name === 'Motor Power') return [`${value} kW`, name];
                if (name === 'Battery Power') return [`${value} kW`, name];
                if (name === 'Motor Torque') return [`${value} Nm`, name];
                if (name === 'Motor RPM') return [`${value} RPM`, name];
                return [value, name];
              }}
              labelFormatter={(label) => `Time: ${label} s`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="motorPowerKw"
              name="Motor Power"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="batteryPowerKw"
              name="Battery Power"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="motorTorqueNm"
              name="Motor Torque"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="rpm"
              type="monotone"
              dataKey="motorRpm"
              name="Motor RPM"
              stroke="#A855F7"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
