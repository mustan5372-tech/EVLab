'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Play,
  Layers,
  Truck,
  BatteryCharging,
  Zap,
  Cog,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { VehiclePanel } from '@/components/designer/VehiclePanel';
import { BatteryPanel } from '@/components/designer/BatteryPanel';
import { MotorPanel } from '@/components/designer/MotorPanel';
import { TransmissionPanel } from '@/components/designer/TransmissionPanel';
import { ValidationStatusCard } from '@/components/designer/ValidationStatusCard';
import { useEVStore } from '@/hooks/useEVStore';
import { PRESET_VEHICLES } from '@/lib/storage/defaultPresets';
import { calculateBatteryPackMetrics } from '@/lib/physics/batteryModel';
import { calculateTotalGearRatio } from '@/lib/physics/transmission';

export default function DesignerPage() {
  const { currentVehicle, loadPreset, runSimulation } = useEVStore();
  const [activeTab, setActiveTab] = useState<string>('all');

  const pack = calculateBatteryPackMetrics(currentVehicle.battery);
  const totalRatio = calculateTotalGearRatio(currentVehicle.transmission);

  const tabs = [
    { id: 'all', label: 'All Subsystems', icon: <Layers className="w-4 h-4" /> },
    { id: 'vehicle', label: 'Chassis & Aero', icon: <Truck className="w-4 h-4" /> },
    { id: 'battery', label: 'Battery Pack', icon: <BatteryCharging className="w-4 h-4" /> },
    { id: 'motor', label: 'Motor Envelope', icon: <Zap className="w-4 h-4" /> },
    { id: 'transmission', label: 'Gearing & Regen', icon: <Cog className="w-4 h-4" /> },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Title & Presets Quick Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-electric-400 uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>Powertrain Configuration Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              EV Architecture Designer
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure parameters across chassis, electrochemical storage, traction motor, and transmission.
            </p>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 uppercase mr-1">Presets:</span>
            {PRESET_VEHICLES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all duration-150 border ${
                  currentVehicle.name === preset.name
                    ? 'bg-electric-500/20 border-electric-500 text-electric-300 shadow-sm'
                    : 'bg-surface-200 border-border/80 text-slate-400 hover:text-slate-200 hover:bg-surface-300'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Architecture Spec Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-3xl bg-surface-100/90 border border-border shadow-soft backdrop-blur-md">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Mass</span>
            <span className="text-base sm:text-lg font-bold text-foreground font-tabular">
              {currentVehicle.vehicle.massKg} kg
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Peak Power</span>
            <span className="text-base sm:text-lg font-bold text-electric-400 font-tabular">
              {currentVehicle.motor.peakPowerKw} kW
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Peak Torque</span>
            <span className="text-base sm:text-lg font-bold text-amber-400 font-tabular">
              {currentVehicle.motor.peakTorqueNm} Nm
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Pack Energy</span>
            <span className="text-base sm:text-lg font-bold text-emerald-400 font-tabular">
              {pack.totalEnergyKwh} kWh
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">System Voltage</span>
            <span className="text-base sm:text-lg font-bold text-foreground font-tabular">
              {pack.packNominalVoltageV} V
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Gearing</span>
            <span className="text-base sm:text-lg font-bold text-purple-400 font-tabular">
              {totalRatio} : 1
            </span>
          </div>
        </div>

        {/* Subsystem Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <Link href="/simulation">
            <Button
              variant="primary"
              size="md"
              pill
              onClick={() => runSimulation()}
              className="gap-2 shadow-glow text-slate-950 font-bold"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Simulate Vehicle</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Dynamic Panel Views */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VehiclePanel />
            <BatteryPanel />
            <MotorPanel />
            <TransmissionPanel />
          </div>
        )}

        {activeTab === 'vehicle' && <VehiclePanel />}
        {activeTab === 'battery' && <BatteryPanel />}
        {activeTab === 'motor' && <MotorPanel />}
        {activeTab === 'transmission' && <TransmissionPanel />}

        {/* Validation & Compatibility Check */}
        <div className="pt-2">
          <ValidationStatusCard />
        </div>
      </div>
    </AppShell>
  );
}
