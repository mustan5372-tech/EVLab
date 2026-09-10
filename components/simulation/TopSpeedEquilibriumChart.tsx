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

  // Find the exact or closest equilibrium point for highlighting
  const equilibriumPoint = data.find((p) => Math.abs(p.speedKmh - topSpeed.topSpeedKmh) < 0.2) ||
    data.reduce((prev, curr) =>
      Math.abs(curr.speedKmh - topSpeed.topSpeedKmh) < Math.abs(prev.speedKmh - topSpeed.topSpeedKmh) ? curr : prev
    , data[0]);

  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Top Speed Road-Load Equilibrium</CardTitle>
            <CardDescription>
              Aero-power balance: Available tractive effort meets aggregate resistive forces.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-xl bg-electric-500/10 border border-electric-500/30 text-xs font-mono font-bold text-electric-400">
              {topSpeed.topSpeedKmh} km/h
            </span>
          </div>
        </div>
      </CardHeader>

      <div className="h-64 sm:h-72 lg:h-80 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #212D40)" vertical={false} opacity={0.6} />
            <XAxis
              dataKey="speedKmh"
              tickFormatter={(v) => `${v}k`}
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
              unit=" N"
              domain={[0, 'auto']}
              width={52}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.94)',
                borderColor: 'rgba(56, 189, 248, 0.3)',
                borderRadius: '16px',
                fontSize: '12px',
                color: '#F8FAFC',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              itemStyle={{ color: '#F8FAFC' }}
              formatter={(value: any, name: string, item: any) => {
                const numVal = Number(value);
                if (name === 'Available Tractive Force') {
                  const roadLoad = item?.payload?.totalRoadLoadN || 0;
                  const reserve = numVal - roadLoad;
                  return [`${numVal.toLocaleString()} N (Net: ${reserve > 0 ? '+' : ''}${reserve.toLocaleString()} N)`, name];
                }
                return [`${numVal.toLocaleString()} N`, name];
              }}
              labelFormatter={(label) => `Vehicle Velocity: ${label} km/h`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line
              type="monotone"
              dataKey="availableForceN"
              name="Available Tractive Force"
              stroke="#00D2FF"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#00D2FF', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="totalRoadLoadN"
              name="Total Road Load (Resistive)"
              stroke="#EF4444"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#EF4444', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="aeroDragN"
              name="Aerodynamic Drag"
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
            {equilibriumPoint && (
              <ReferenceDot
                x={equilibriumPoint.speedKmh}
                y={equilibriumPoint.availableForceN}
                r={6}
                fill="#00D2FF"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400 px-1 pt-2 border-t border-border/60">
        <span className="font-medium">
          Equilibrium Speed:{' '}
          <strong className="text-foreground">{topSpeed.topSpeedKmh} km/h</strong> at {topSpeed.topSpeedRpm} Motor RPM
        </span>
        <span className="capitalize font-semibold text-electric-400">
          Governing Ceiling: {topSpeed.limitingFactor.replace('_', ' ')}
        </span>
      </div>
    </Card>
  );
}
