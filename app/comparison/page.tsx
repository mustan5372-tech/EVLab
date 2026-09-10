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

  const [selectedMetric, setSelectedMetric] = React.useState<string>('accel');

  const barColors = ['#00D2FF', '#A855F7', '#10B981', '#F59E0B'];

  // Metrics definitions for precise per-metric visualization
  const metricsMeta: Record<string, { label: string; unit: string; higherIsBetter: boolean }> = {
    accel: { label: '0–100 km/h Acceleration', unit: ' s', higherIsBetter: false },
    topSpeed: { label: 'Top Speed', unit: ' km/h', higherIsBetter: true },
    range: { label: 'Range @ 90 km/h', unit: ' km', higherIsBetter: true },
    consumption: { label: 'Energy Consumption', unit: ' Wh/km', higherIsBetter: false },
    grade: { label: 'Max Incline Gradeability', unit: '%', higherIsBetter: true },
    normalized: { label: 'Overall Normalized Efficiency Score', unit: '%', higherIsBetter: true },
  };

  // Dedicated single-metric comparative data (vehicles on X axis)
  const singleMetricData = comparisonData.map((d, idx) => {
    let val = 0;
    if (selectedMetric === 'accel') val = d.accelTime100 || 0;
    else if (selectedMetric === 'topSpeed') val = d.topSpeedKmh;
    else if (selectedMetric === 'range') val = d.range90Kmh;
    else if (selectedMetric === 'consumption') val = d.consumptionWhKm;
    else if (selectedMetric === 'grade') val = d.maxGrade;

    return {
      name: d.vehicle.name,
      value: val,
      color: barColors[idx % barColors.length],
    };
  });

  // Normalized (0-100%) multi-metric benchmark data
  const normalizedData = [
    {
      metric: '0–100 km/h (Fastest = 100%)',
      ...Object.fromEntries(
        comparisonData.map((d) => {
          const minVal = Math.min(...comparisonData.map((c) => c.accelTime100 || 99));
          const score = d.accelTime100 ? Math.round((minVal / d.accelTime100) * 100) : 0;
          return [d.vehicle.name, score];
        })
      ),
    },
    {
      metric: 'Top Speed (Highest = 100%)',
      ...Object.fromEntries(
        comparisonData.map((d) => {
          const maxVal = Math.max(...comparisonData.map((c) => c.topSpeedKmh));
          const score = Math.round((d.topSpeedKmh / maxVal) * 100);
          return [d.vehicle.name, score];
        })
      ),
    },
    {
      metric: 'Range @ 90km/h (Longest = 100%)',
      ...Object.fromEntries(
        comparisonData.map((d) => {
          const maxVal = Math.max(...comparisonData.map((c) => c.range90Kmh));
          const score = Math.round((d.range90Kmh / maxVal) * 100);
          return [d.vehicle.name, score];
        })
      ),
    },
    {
      metric: 'Efficiency (Lowest Wh/km = 100%)',
      ...Object.fromEntries(
        comparisonData.map((d) => {
          const minVal = Math.min(...comparisonData.map((c) => c.consumptionWhKm));
          const score = Math.round((minVal / d.consumptionWhKm) * 100);
          return [d.vehicle.name, score];
        })
      ),
    },
    {
      metric: 'Gradeability (Steepest = 100%)',
      ...Object.fromEntries(
        comparisonData.map((d) => {
          const maxVal = Math.max(...comparisonData.map((c) => c.maxGrade));
          const score = Math.round((d.maxGrade / maxVal) * 100);
          return [d.vehicle.name, score];
        })
      ),
    },
  ];

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
        <div className="p-3.5 sm:p-4 rounded-3xl bg-surface-100 border border-border flex items-center justify-between gap-3 flex-wrap">
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

        {/* Comparative Chart with Metric Switcher */}
        <Card elevated className="space-y-4">
          <CardHeader className="mb-1">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <CardTitle>Comparative Performance Benchmarks</CardTitle>
                <CardDescription>
                  {metricsMeta[selectedMetric]?.label}: Dedicated scaling and high-precision evaluation.
                </CardDescription>
              </div>

              {/* Metric Switcher Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none text-[11px] font-semibold">
                {[
                  { id: 'accel', label: '0–100 km/h' },
                  { id: 'topSpeed', label: 'Top Speed' },
                  { id: 'range', label: 'Range' },
                  { id: 'consumption', label: 'Consumption' },
                  { id: 'grade', label: 'Gradeability' },
                  { id: 'normalized', label: 'Normalized %' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedMetric(tab.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      selectedMetric === tab.id
                        ? 'bg-electric-500 text-slate-950 font-bold shadow-glow'
                        : 'bg-surface-200 border border-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <div className="h-64 sm:h-72 lg:h-80 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              {selectedMetric === 'normalized' ? (
                <BarChart data={normalizedData} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #212D40)" vertical={false} opacity={0.6} />
                  <XAxis dataKey="metric" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} unit="%" domain={[0, 100]} width={48} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.94)',
                      borderColor: 'rgba(0, 210, 255, 0.3)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: '#F8FAFC',
                      backdropFilter: 'blur(12px)',
                    }}
                    itemStyle={{ color: '#F8FAFC' }}
                    formatter={(val: any) => [`${val}% of benchmark`, 'Relative Score']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  {comparisonData.map((d, idx) => (
                    <Bar
                      key={d.vehicle.id}
                      dataKey={d.vehicle.name}
                      fill={barColors[idx % barColors.length]}
                      radius={[6, 6, 0, 0]}
                    />
                  ))}
                </BarChart>
              ) : (
                <BarChart data={singleMetricData} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #212D40)" vertical={false} opacity={0.6} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    unit={metricsMeta[selectedMetric]?.unit}
                    domain={[0, 'auto']}
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
                    }}
                    itemStyle={{ color: '#F8FAFC' }}
                    formatter={(val: any) => [`${val}${metricsMeta[selectedMetric]?.unit}`, metricsMeta[selectedMetric]?.label]}
                  />
                  <Bar
                    dataKey="value"
                    name={metricsMeta[selectedMetric]?.label}
                    radius={[8, 8, 0, 0]}
                    fill="#00D2FF"
                  />
                </BarChart>
              )}
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
