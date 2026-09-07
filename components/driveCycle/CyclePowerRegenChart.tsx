'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { DriveCycleTimeStep } from '@/types/driveCycle';

interface CyclePowerRegenChartProps {
  timeSeries: DriveCycleTimeStep[];
}

export function CyclePowerRegenChart({ timeSeries }: CyclePowerRegenChartProps) {
  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-1">
        <div>
          <CardTitle>Power Flow & Regenerative Braking</CardTitle>
          <CardDescription>
            Instantaneous battery power flow: Positive values represent motor propulsion; negative values represent kinetic energy capture.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#00D2FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              unit=" kW"
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
                const num = Number(value);
                if (num < 0) return [`${Math.abs(num)} kW (Recapturing)`, 'Regen Power'];
                return [`${num} kW (Discharging)`, 'Propulsion Power'];
              }}
              labelFormatter={(label) => `Time: ${label} s`}
            />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="batteryPowerKw"
              name="Battery Power (kW)"
              stroke="#00D2FF"
              strokeWidth={2}
              fill="url(#powerGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
