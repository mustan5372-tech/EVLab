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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Acceleration Profile (Speed & Distance vs Time)</CardTitle>
            <CardDescription>
              High-resolution numerical integration of full-throttle launch from standstill.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {acceleration.timeTo60Kmh && (
              <span className="px-2 py-0.5 rounded-lg bg-surface-200 border border-border text-[11px] font-mono text-slate-300">
                0-60: <strong className="text-electric-400">{acceleration.timeTo60Kmh}s</strong>
              </span>
            )}
            {acceleration.timeTo100Kmh && (
              <span className="px-2 py-0.5 rounded-lg bg-electric-500/10 border border-electric-500/30 text-[11px] font-mono text-electric-300 font-bold">
                0-100: <strong className="text-electric-400">{acceleration.timeTo100Kmh}s</strong>
              </span>
            )}
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
              yAxisId="speed"
              stroke="#00D2FF"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              unit=" km/h"
              domain={[0, 'auto']}
              width={52}
            />
            <YAxis
              yAxisId="distance"
              orientation="right"
              stroke="#38BDF8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              unit=" m"
              domain={[0, 'auto']}
              width={50}
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
              formatter={(value: any, name: string, item: any) => {
                const num = Number(value);
                if (name === 'Vehicle Speed') {
                  const g = item?.payload?.accelerationG ?? 0;
                  return [`${num.toFixed(1)} km/h (${g.toFixed(2)} G)`, name];
                }
                if (name === 'Distance Covered') return [`${num.toFixed(1)} m`, name];
                return [value, name];
              }}
              labelFormatter={(label) => `Elapsed Time: ${Number(label).toFixed(2)} s`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line
              yAxisId="speed"
              type="monotone"
              dataKey="speedKmh"
              name="Vehicle Speed"
              stroke="#00D2FF"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#00D2FF', stroke: '#FFFFFF', strokeWidth: 2 }}
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

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1 pt-2 border-t border-border/60 font-mono">
        <span>Peak Launch: <strong className="text-emerald-400">{acceleration.peakAccelerationG} G</strong></span>
        {acceleration.quarterMileTimeS && (
          <span>1/4 Mile: <strong className="text-sky-300">{acceleration.quarterMileTimeS}s</strong> @ {acceleration.quarterMileSpeedKmh} km/h</span>
        )}
        <span>Tractive Ceiling: <strong className="text-foreground">{acceleration.maxTractiveForceN.toLocaleString()} N</strong></span>
      </div>
    </Card>
  );
}
