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
  const [viewMode, setViewMode] = React.useState<'combined' | 'power' | 'mechanical'>('combined');

  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Powertrain Operating Points</CardTitle>
            <CardDescription>
              Dynamic interplay between pack electrical discharge, motor torque output, and rotor RPM.
            </CardDescription>
          </div>
          <div className="inline-flex p-1 rounded-xl bg-surface-200 border border-border self-start sm:self-auto text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setViewMode('combined')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'combined'
                  ? 'bg-surface-elevated text-electric-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Signals
            </button>
            <button
              type="button"
              onClick={() => setViewMode('power')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'power'
                  ? 'bg-surface-elevated text-amber-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Power (kW)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mechanical')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'mechanical'
                  ? 'bg-surface-elevated text-purple-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Torque & RPM
            </button>
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
            {viewMode !== 'mechanical' && (
              <YAxis
                yAxisId="power"
                stroke="#F59E0B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit=" kW"
                domain={[0, 'auto']}
                width={50}
              />
            )}
            {viewMode === 'mechanical' && (
              <YAxis
                yAxisId="torque"
                stroke="#10B981"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit=" Nm"
                domain={[0, 'auto']}
                width={52}
              />
            )}
            {(viewMode === 'combined' || viewMode === 'mechanical') && (
              <YAxis
                yAxisId="rpm"
                orientation="right"
                stroke="#A855F7"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit=" RPM"
                domain={[0, 'auto']}
                width={56}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.94)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                borderRadius: '16px',
                fontSize: '12px',
                color: '#F8FAFC',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              itemStyle={{ color: '#F8FAFC' }}
              formatter={(value: any, name: string) => {
                const num = Number(value);
                if (name === 'Motor Power') return [`${num.toFixed(1)} kW`, name];
                if (name === 'Battery Power') return [`${num.toFixed(1)} kW`, name];
                if (name === 'Motor Torque') return [`${num.toFixed(1)} Nm`, name];
                if (name === 'Motor RPM') return [`${Math.round(num).toLocaleString()} RPM`, name];
                return [value, name];
              }}
              labelFormatter={(label) => `Time: ${Number(label).toFixed(2)} s`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

            {(viewMode === 'combined' || viewMode === 'power') && (
              <>
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="motorPowerKw"
                  name="Motor Power"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#F59E0B' }}
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
              </>
            )}

            {viewMode === 'mechanical' && (
              <Line
                yAxisId="torque"
                type="monotone"
                dataKey="motorTorqueNm"
                name="Motor Torque"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#10B981' }}
              />
            )}

            {(viewMode === 'combined' || viewMode === 'mechanical') && (
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
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
