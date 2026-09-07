'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  GitCompare,
  Plus,
  Trash2,
  Sliders,
  Gauge,
  Check,
  Award,
  Zap,
  Battery,
  Timer,
  Truck,
  TrendingUp,
} from 'lucide-react';
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
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEVStore } from '@/hooks/useEVStore';
import { PRESET_VEHICLES } from '@/lib/storage/defaultPresets';
import { calculateBatteryPackMetrics } from '@/lib/physics/batteryModel';
import { calculateTotalGearRatio } from '@/lib/physics/transmission';
import { simulateAcceleration } from '@/lib/simulation/accelerationSimulator';
import { calculateTopSpeed } from '@/lib/simulation/topSpeedCalculator';
import { calculateRange } from '@/lib/simulation/rangeCalculator';
import { calculateGradeability } from '@/lib/simulation/gradeabilityCalculator';
import { EVConfiguration } from '@/types/ev';

export default function ComparisonPage() {
  const {
    currentVehicle,
    comparisonVehicles,
    addToComparison,
    removeFromComparison,
    clearComparison,
  } = useEVStore();

  // If comparison list is empty, initialize with Current Vehicle + Performance EV
  const activeComparisons: EVConfiguration[] = useMemo(() => {
    if (comparisonVehicles.length > 0) {
      return comparisonVehicles;
    }
    const perf = PRESET_VEHICLES.find((p) => p.id === 'preset-performance-ev') || PRESET_VEHICLES[1];
    return [currentVehicle, perf];
  }, [comparisonVehicles, currentVehicle]);

  // Compute full simulation metrics for each comparison vehicle
  const comparisonData = useMemo(() => {
    return activeComparisons.map((v) => {
      const pack = calculateBatteryPackMetrics(v.battery);
      const totalRatio = calculateTotalGearRatio(v.transmission);
      const accel = simulateAcceleration(v);
      const topSpeed = calculateTopSpeed(v);
      const range = calculateRange(v);
      const grade = calculateGradeability(v);

      return {
        vehicle: v,
        pack,
        totalRatio,
        accelTime100: accel.timeTo100Kmh,
        topSpeedKmh: topSpeed.topSpeedKmh,
        range90Kmh: range.steadyState90Kmh,
        consumptionWhKm: range.consumptionWhPerKmAt90,
        maxGrade: grade.maxGradeAt20Kmh,
      };
    });
  }, [activeComparisons]);

  // Bar chart data preparation
  const chartData = [
    {
      metric: '0–100 km/h (s)',
      ...Object.fromEntries(comparisonData.map((d) => [d.vehicle.name, d.accelTime100 || 0])),
    },
    {
      metric: 'Top Speed (km/h)',
      ...Object.fromEntries(comparisonData.map((d) => [d.vehicle.name, d.topSpeedKmh])),
    },
    {
      metric: 'Range @ 90km/h (km)',
      ...Object.fromEntries(comparisonData.map((d) => [d.vehicle.name, d.range90Kmh])),
    },
    {
      metric: 'Consumption (Wh/km)',
      ...Object.fromEntries(comparisonData.map((d) => [d.vehicle.name, d.consumptionWhKm])),
    },
    {
      metric: 'Max Grade (%)',
      ...Object.fromEntries(comparisonData.map((d) => [d.vehicle.name, d.maxGrade])),
    },
  ];

  const barColors = ['#00D2FF', '#A855F7', '#10B981', '#F59E0B'];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-electric-400 uppercase tracking-wider">
              <GitCompare className="w-4 h-4" />
              <span>Multi-Configuration Benchmarking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Vehicle Comparison Matrix
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Benchmark powertrain architectures side-by-side to understand engineering trade-offs between speed, mass, and efficiency.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeComparisons.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                pill
                onClick={() => clearComparison()}
                className="gap-1.5 text-xs text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}

            <Link href="/designer">
              <Button variant="primary" size="sm" pill className="gap-1.5 text-xs font-bold shadow-glow text-slate-950">
                <Sliders className="w-3.5 h-3.5" />
                <span>Tweak in Designer</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Add Presets Bar */}
        <div className="p-4 rounded-3xl bg-surface-100 border border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Add to Comparison:</span>
            <span className="text-[11px] text-slate-400">
              ({activeComparisons.length}/4 selected)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Current Edited Vehicle */}
            <button
              type="button"
              onClick={() => addToComparison(currentVehicle)}
              disabled={activeComparisons.some((v) => v.id === currentVehicle.id)}
              className="px-3 py-1.5 rounded-2xl text-xs font-semibold border border-electric-500/50 bg-electric-500/10 text-electric-300 hover:bg-electric-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              + Current ({currentVehicle.name})
            </button>

            {/* Presets */}
            {PRESET_VEHICLES.map((preset) => {
              const isIncluded = activeComparisons.some((v) => v.id === preset.id || v.name === preset.name);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => addToComparison(preset)}
                  disabled={isIncluded || activeComparisons.length >= 4}
                  className="px-3 py-1.5 rounded-2xl text-xs font-semibold border border-border bg-surface-200 text-slate-300 hover:bg-surface-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  + {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparative Bar Chart */}
        <Card elevated className="space-y-4">
          <CardHeader className="mb-1">
            <div>
              <CardTitle>Comparative Performance Benchmarks</CardTitle>
              <CardDescription>
                Direct quantitative comparison across acceleration, velocity, range, consumption, and gradeability.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#212D40" vertical={false} />
                <XAxis dataKey="metric" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121824',
                    borderColor: '#24334E',
                    borderRadius: '16px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {comparisonData.map((d, idx) => (
                  <Bar
                    key={d.vehicle.id}
                    dataKey={d.vehicle.name}
                    fill={barColors[idx % barColors.length]}
                    radius={[6, 6, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Side-by-Side Specifications Matrix Table */}
        <Card elevated className="space-y-4 overflow-hidden">
          <CardHeader className="mb-1">
            <CardTitle>Powertrain Architecture & Performance Matrix</CardTitle>
            <CardDescription>
              Detailed subsystem line-item breakdown across vehicle chassis, motor envelope, electrochemical storage, and reduction gearing.
            </CardDescription>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 text-slate-400 bg-surface-200/50">
                  <th className="p-3 font-bold text-foreground">Engineering Metric</th>
                  {comparisonData.map((d) => (
                    <th key={d.vehicle.id} className="p-3 font-bold text-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-electric-300 font-bold">{d.vehicle.name}</span>
                        {activeComparisons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFromComparison(d.vehicle.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border/40 font-tabular">
                {/* Performance Section */}
                <tr className="bg-surface-300/30 text-slate-300 font-bold">
                  <td colSpan={comparisonData.length + 1} className="p-2.5 uppercase text-[10px] tracking-wider text-electric-400">
                    Simulated Dynamic Performance
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">0–100 km/h Acceleration</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 font-bold text-foreground">
                      {d.accelTime100 !== null ? `${d.accelTime100.toFixed(2)} s` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Top Speed</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 font-bold text-foreground">
                      {d.topSpeedKmh} km/h
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Range @ 90 km/h Steady</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 font-bold text-emerald-400">
                      {d.range90Kmh} km
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Specific Consumption (90 km/h)</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 font-bold text-amber-400">
                      {d.consumptionWhKm} Wh/km
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Max Incline Gradeability</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 font-bold text-purple-400">
                      {d.maxGrade}%
                    </td>
                  ))}
                </tr>

                {/* Chassis Section */}
                <tr className="bg-surface-300/30 text-slate-300 font-bold">
                  <td colSpan={comparisonData.length + 1} className="p-2.5 uppercase text-[10px] tracking-wider text-electric-400">
                    Chassis & Aerodynamics
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Vehicle Mass</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 text-slate-200">
                      {d.vehicle.vehicle.massKg} kg
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Drag Coefficient (Cd)</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 text-slate-200">
                      {d.vehicle.vehicle.cd}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Frontal Area (A)</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 text-slate-200">
                      {d.vehicle.vehicle.frontalAreaM2} m²
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Drivetrain Layout</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 uppercase text-electric-400 font-semibold">
                      {d.vehicle.vehicle.drivenWheels}
                    </td>
                  ))}
                </tr>

                {/* Motor Section */}
                <tr className="bg-surface-300/30 text-slate-300 font-bold">
                  <td colSpan={comparisonData.length + 1} className="p-2.5 uppercase text-[10px] tracking-wider text-electric-400">
                    Electric Traction Motor
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Motor Architecture</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 uppercase text-slate-200">
                      {d.vehicle.motor.type}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Peak Mechanical Power</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 font-semibold text-foreground">
                      {d.vehicle.motor.peakPowerKw} kW ({Math.round(d.vehicle.motor.peakPowerKw * 1.341)} hp)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Peak Torque</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 font-semibold text-foreground">
                      {d.vehicle.motor.peakTorqueNm} Nm
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Max Redline Speed</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 text-slate-200">
                      {d.vehicle.motor.maxRpm} RPM
                    </td>
                  ))}
                </tr>

                {/* Battery Section */}
                <tr className="bg-surface-300/30 text-slate-300 font-bold">
                  <td colSpan={comparisonData.length + 1} className="p-2.5 uppercase text-[10px] tracking-wider text-electric-400">
                    Battery Pack
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Total Installed Energy</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 font-bold text-emerald-400">
                      {d.pack.totalEnergyKwh} kWh
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Nominal Voltage</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 text-slate-200">
                      {d.pack.packNominalVoltageV} V
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Max Peak Discharge Power</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 text-slate-200">
                      {d.pack.maxPeakDischargePowerKw} kW
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Transmission Gear Ratio</td>
                  {comparisonData.map((d) => (
                    <td key={d.vehicle.id} className="p-3 text-purple-400 font-semibold">
                      {d.totalRatio} : 1
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
