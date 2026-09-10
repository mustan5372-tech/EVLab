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

      <div className="h-64 sm:h-72 lg:h-80 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeSeries} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#00D2FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              unit=" kW"
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
              formatter={(value: any) => {
                const num = Number(value);
                if (num < 0) return [`${Math.abs(num).toFixed(1)} kW (Recapturing)`, 'Regen Power'];
                return [`${num.toFixed(1)} kW (Discharging)`, 'Propulsion Power'];
              }}
              labelFormatter={(label) => `Time: ${label}s (${(Number(label) / 60).toFixed(1)} min)`}
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
