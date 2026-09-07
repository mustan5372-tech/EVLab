'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { GradeabilityResult } from '@/types/simulation';
import { Check, X } from 'lucide-react';

interface GradeabilityChartProps {
  gradeability: GradeabilityResult;
}

export function GradeabilityChart({ gradeability }: GradeabilityChartProps) {
  const data = gradeability.grades.map((g) => ({
    grade: `${g.gradePercent}%`,
    maxSpeedKmh: g.maxSpeedKmh,
    requiredPowerKw: g.requiredPowerKw,
    requiredTorqueNm: g.requiredTorqueNm,
    feasible: g.feasible,
  }));

  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-1">
        <div>
          <CardTitle>Gradeability & Incline Climbing Performance</CardTitle>
          <CardDescription>
            Maximum sustainable road speed across varying road gradients from 5% to 30% steep climbs.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#212D40" vertical={false} />
            <XAxis
              dataKey="grade"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              yAxisId="speed"
              stroke="#A855F7"
              fontSize={11}
              tickLine={false}
              unit=" km/h"
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
                if (name === 'Max Climbing Speed') return [`${value} km/h`, name];
                if (name === 'Power Demanded') return [`${value} kW`, name];
                return [value, name];
              }}
              labelFormatter={(label) => `Road Incline Grade: ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar
              yAxisId="speed"
              dataKey="maxSpeedKmh"
              name="Max Climbing Speed"
              fill="#A855F7"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gradeability Feasibility Table */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/80 text-slate-400">
              <th className="pb-2 font-semibold">Grade</th>
              <th className="pb-2 font-semibold">Max Speed</th>
              <th className="pb-2 font-semibold">Required Power</th>
              <th className="pb-2 font-semibold">Required Wheel Torque</th>
              <th className="pb-2 font-semibold text-right">Feasibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-tabular">
            {gradeability.grades.map((item) => (
              <tr key={item.gradePercent} className="hover:bg-surface-200/50">
                <td className="py-2.5 font-bold text-foreground">{item.gradePercent}%</td>
                <td className="py-2.5 text-purple-400 font-semibold">{item.maxSpeedKmh} km/h</td>
                <td className="py-2.5 text-slate-300">{item.requiredPowerKw} kW</td>
                <td className="py-2.5 text-slate-300">{item.requiredTorqueNm} Nm</td>
                <td className="py-2.5 text-right">
                  {item.feasible ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span>Pass</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                      <X className="w-3.5 h-3.5" />
                      <span>Stall</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
