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
  ReferenceDot,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { TopSpeedResult } from '@/types/simulation';

interface TopSpeedEquilibriumChartProps {
  topSpeed: TopSpeedResult;
}

export function TopSpeedEquilibriumChart({ topSpeed }: TopSpeedEquilibriumChartProps) {
  const data = topSpeed.equilibriumPoints;

  // Find point closest to top speed
  const nearestEquilibriumPoint = data.reduce((prev, curr) =>
    Math.abs(curr.speedKmh - topSpeed.topSpeedKmh) < Math.abs(prev.speedKmh - topSpeed.topSpeedKmh) ? curr : prev
  , data[0]);

  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-1">
        <div>
          <CardTitle>Top Speed Road-Load Equilibrium</CardTitle>
          <CardDescription>
            Equilibrium between available tractive force and combined road resistance forces (Aero + Rolling + Grade).
          </CardDescription>
        </div>
      </CardHeader>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#212D40" vertical={false} />
            <XAxis
              dataKey="speedKmh"
              tickFormatter={(v) => `${v} km/h`}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              unit=" N"
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121824',
                borderColor: '#24334E',
                borderRadius: '16px',
                fontSize: '12px',
              }}
              formatter={(value: any, name: string) => [`${value} N`, name]}
              labelFormatter={(label) => `Vehicle Speed: ${label} km/h`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="availableForceN"
              name="Available Tractive Force"
              stroke="#00D2FF"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="totalRoadLoadN"
              name="Total Road Load (Resistive)"
              stroke="#EF4444"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="aeroDragN"
              name="Aerodynamic Drag Force"
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="rollingResistN"
              name="Rolling Resistance"
              stroke="#10B981"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              dot={false}
            />
            {nearestEquilibriumPoint && (
              <ReferenceDot
                x={nearestEquilibriumPoint.speedKmh}
                y={nearestEquilibriumPoint.availableForceN}
                r={6}
                fill="#00D2FF"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1 border-t border-border/60">
        <span className="font-medium">
          Equilibrium Speed:{' '}
          <strong className="text-foreground">{topSpeed.topSpeedKmh} km/h</strong> at {topSpeed.topSpeedRpm} Motor RPM
        </span>
        <span className="capitalize font-semibold text-electric-400">
          Mode: {topSpeed.limitingFactor.replace('_', ' ')}
        </span>
      </div>
    </Card>
  );
}
