'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gauge,
  Sliders,
  Download,
  Share2,
  Layers,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { MetricsStrip } from '@/components/simulation/MetricsStrip';
import { AccelerationChart } from '@/components/simulation/AccelerationChart';
import { PowerTorqueChart } from '@/components/simulation/PowerTorqueChart';
import { TractiveForceChart } from '@/components/simulation/TractiveForceChart';
import { TopSpeedEquilibriumChart } from '@/components/simulation/TopSpeedEquilibriumChart';
import { GradeabilityChart } from '@/components/simulation/GradeabilityChart';
import { useEVStore } from '@/hooks/useEVStore';
import { PRESET_VEHICLES } from '@/lib/storage/defaultPresets';

export default function SimulationPage() {
  const { currentVehicle, simulation, runSimulation } = useEVStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Fallback if simulation has not run yet
  const sim = simulation || runSimulation();

  const tabs = [
    { id: 'all', label: 'All Graphs', icon: <Layers className="w-4 h-4" /> },
    { id: 'accel', label: 'Acceleration (v & s)', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'power', label: 'Power & Torque', icon: <Zap className="w-4 h-4" /> },
    { id: 'forces', label: 'Tractive Forces', icon: <Activity className="w-4 h-4" /> },
    { id: 'topspeed', label: 'Top Speed Balance', icon: <Gauge className="w-4 h-4" /> },
    { id: 'grade', label: 'Gradeability Incline', icon: <Layers className="w-4 h-4" /> },
  ];

  // Export handlers
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      vehicleConfig: currentVehicle,
      simulationResults: sim,
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EVLAB_${currentVehicle.name.replace(/\s+/g, '_')}_Simulation.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const headers = [
      'Time_s',
      'Speed_kmh',
      'Distance_m',
      'Acceleration_ms2',
      'Motor_RPM',
      'Motor_Torque_Nm',
      'Motor_Power_kW',
      'Battery_Power_kW',
      'Tractive_Force_N',
      'Aero_Drag_N',
      'Rolling_Resistance_N',
    ];

    const rows = sim.acceleration.timeSeries.map((t: any) => [
      t.timeS,
      t.speedKmh,
      t.distanceM,
      t.accelerationMs2,
      t.motorRpm,
      t.motorTorqueNm,
      t.motorPowerKw,
      t.batteryPowerKw,
      t.tractiveForceN,
      t.aeroDragForceN,
      t.rollingResistForceN,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `EVLAB_${currentVehicle.name.replace(/\s+/g, '_')}_Telemetry.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header & Quick Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-electric-400 uppercase tracking-wider">
              <Gauge className="w-4 h-4" />
              <span>Simulation Engine & Performance Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Vehicle Dynamic Telemetry
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live numerical time-domain simulation results for{' '}
              <strong className="text-electric-300">{currentVehicle.name}</strong> ({currentVehicle.vehicle.massKg} kg,{' '}
              {currentVehicle.motor.peakPowerKw} kW).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/designer">
              <Button variant="outline" size="sm" pill className="gap-1.5 text-xs font-semibold">
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Powertrain</span>
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="sm"
              pill
              onClick={handleExportCsv}
              className="gap-1.5 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              pill
              onClick={handleExportJson}
              className="gap-1.5 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </Button>
          </div>
        </div>

        {/* Executive KPI Metrics Strip */}
        <MetricsStrip simulation={sim} config={currentVehicle} />

        {/* Tabs Filter */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <Link href="/drive-cycles">
            <Button
              variant="ghost"
              size="sm"
              pill
              className="gap-1.5 text-xs font-semibold text-electric-400 hover:text-electric-300"
            >
              <span>Test Standard Drive Cycles (WLTP)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Dynamic Visualizations Grid */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AccelerationChart acceleration={sim.acceleration} />
              <PowerTorqueChart acceleration={sim.acceleration} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TractiveForceChart acceleration={sim.acceleration} />
              <TopSpeedEquilibriumChart topSpeed={sim.topSpeed} />
            </div>

            <GradeabilityChart gradeability={sim.gradeability} />
          </div>
        )}

        {activeTab === 'accel' && <AccelerationChart acceleration={sim.acceleration} />}
        {activeTab === 'power' && <PowerTorqueChart acceleration={sim.acceleration} />}
        {activeTab === 'forces' && <TractiveForceChart acceleration={sim.acceleration} />}
        {activeTab === 'topspeed' && <TopSpeedEquilibriumChart topSpeed={sim.topSpeed} />}
        {activeTab === 'grade' && <GradeabilityChart gradeability={sim.gradeability} />}
      </div>
    </AppShell>
  );
}
