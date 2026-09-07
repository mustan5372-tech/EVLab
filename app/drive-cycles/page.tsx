'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  Sliders,
  Play,
  RotateCcw,
  BatteryCharging,
  Download,
  Info,
  Layers,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CycleSummaryCards } from '@/components/driveCycle/CycleSummaryCards';
import { CycleSpeedChart } from '@/components/driveCycle/CycleSpeedChart';
import { CyclePowerRegenChart } from '@/components/driveCycle/CyclePowerRegenChart';
import { CycleEnergySocChart } from '@/components/driveCycle/CycleEnergySocChart';
import { useEVStore } from '@/hooks/useEVStore';
import { STANDARD_DRIVE_CYCLES } from '@/lib/simulation/driveCyclesData';
import { simulateDriveCycle } from '@/lib/simulation/driveCycleSimulator';
import { RegenMode } from '@/types/ev';

export default function DriveCyclesPage() {
  const { currentVehicle, setRegenMode } = useEVStore();
  const [selectedCycleId, setSelectedCycleId] = useState<string>('wltp-class-3');

  const selectedCycle = useMemo(() => {
    return STANDARD_DRIVE_CYCLES.find((c) => c.id === selectedCycleId) || STANDARD_DRIVE_CYCLES[0];
  }, [selectedCycleId]);

  // Run drive cycle simulation dynamically with active vehicle and selected cycle
  const simulationSummary = useMemo(() => {
    return simulateDriveCycle(currentVehicle, selectedCycle);
  }, [currentVehicle, selectedCycle]);

  const regenModes: Array<{ id: RegenMode; label: string; desc: string }> = [
    { id: 'off', label: 'Off', desc: 'Zero electrical recuperation (coasting)' },
    { id: 'low', label: 'Low', desc: 'Mild retardation (0.06g, ~30% recovery)' },
    { id: 'medium', label: 'Medium', desc: 'Balanced ICE-like drag (0.14g, ~60% recovery)' },
    { id: 'high', label: 'High (1-Pedal)', desc: 'Aggressive single-pedal braking (0.24g, ~85% recovery)' },
  ];

  const handleExportTelemetryCsv = () => {
    const headers = [
      'Time_s',
      'TargetSpeed_kmh',
      'ActualSpeed_kmh',
      'Acceleration_ms2',
      'Motor_RPM',
      'Motor_Torque_Nm',
      'Motor_Power_kW',
      'Battery_Power_kW',
      'Battery_SOC_Percent',
      'Net_Energy_Wh',
      'Energy_Recovered_Wh',
    ];

    const rows = simulationSummary.timeSeries.map((t) => [
      t.timeS,
      t.targetSpeedKmh,
      t.actualSpeedKmh,
      t.accelerationMs2,
      t.motorRpm,
      t.motorTorqueNm,
      t.motorPowerKw,
      t.batteryPowerKw,
      t.batterySocPercent,
      t.cumulativeEnergyWh,
      t.energyRecoveredWh,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `EVLAB_${selectedCycle.name.replace(/\s+/g, '_')}_Telemetry.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-electric-400 uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Standard Regulatory Testing Cycles</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Drive Cycle Simulation & Energy Audit
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Simulate standard homologation cycles (WLTP Class 3, Urban UDDS, HWFET, NEDC) with time-resolved regenerative braking.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              pill
              onClick={handleExportTelemetryCsv}
              className="gap-1.5 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Cycle CSV</span>
            </Button>

            <Link href="/designer">
              <Button variant="outline" size="sm" pill className="gap-1.5 text-xs font-semibold">
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Vehicle</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Cycle Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STANDARD_DRIVE_CYCLES.map((cycle) => (
            <button
              key={cycle.id}
              type="button"
              onClick={() => setSelectedCycleId(cycle.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-150 whitespace-nowrap border ${
                selectedCycleId === cycle.id
                  ? 'bg-electric-500 text-slate-950 border-electric-400 shadow-glow'
                  : 'bg-surface-200 border-border/80 text-slate-300 hover:text-white hover:bg-surface-300'
              }`}
            >
              {cycle.name}
            </button>
          ))}
        </div>

        {/* Cycle Description & Regen Mode Controller */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cycle Info */}
          <Card elevated className="space-y-2 lg:col-span-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-electric-400" />
                <h3 className="text-sm font-bold text-foreground">{selectedCycle.name}</h3>
              </div>
              <Badge variant="neutral">
                {selectedCycle.distanceKm} km • {Math.floor(selectedCycle.durationS / 60)} min • Max: {selectedCycle.maxSpeedKmh} km/h
              </Badge>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {selectedCycle.description}
            </p>
          </Card>

          {/* Regen Mode Selector */}
          <Card elevated className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-eco-400" />
                <span>Regen Braking Calibration</span>
              </span>
              <Badge variant="optimal" className="uppercase text-[10px]">
                {currentVehicle.regenMode}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {regenModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setRegenMode(m.id)}
                  className={`p-2 rounded-xl text-left border transition-all text-xs ${
                    currentVehicle.regenMode === m.id
                      ? 'bg-eco-500/20 border-eco-500 text-eco-300 font-bold'
                      : 'bg-surface-200 border-border/80 text-slate-400 hover:bg-surface-300 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold">{m.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{m.desc}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Live Cycle Summary KPIs */}
        <CycleSummaryCards summary={simulationSummary} />

        {/* High-Resolution Dynamic Charts */}
        <div className="space-y-6">
          <CycleSpeedChart
            timeSeries={simulationSummary.timeSeries}
            cycleName={selectedCycle.name}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CyclePowerRegenChart timeSeries={simulationSummary.timeSeries} />
            <CycleEnergySocChart timeSeries={simulationSummary.timeSeries} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
