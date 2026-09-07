'use client';

import React from 'react';
import {
  Battery,
  BatteryCharging,
  Zap,
  RotateCcw,
  Gauge,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { DriveCycleSimulationSummary } from '@/types/driveCycle';
import { Badge } from '../ui/Badge';

interface CycleSummaryCardsProps {
  summary: DriveCycleSimulationSummary;
}

export function CycleSummaryCards({ summary }: CycleSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Specific Consumption */}
      <div className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Net Consumption</span>
          <Zap className="w-4 h-4 text-electric-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-foreground font-tabular">
            {summary.averageConsumptionWhPerKm}
          </span>
          <span className="text-xs text-slate-400 font-semibold">Wh/km</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
          Total: {summary.netEnergyConsumedKwh} kWh net
        </div>
      </div>

      {/* Real-World Projected Range */}
      <div className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Cycle Range</span>
          <Battery className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-emerald-400 font-tabular">
            {summary.estimatedFullCycleRangeKm}
          </span>
          <span className="text-xs text-slate-400 font-semibold">km</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
          Full usable pack capacity
        </div>
      </div>

      {/* Regen Energy Recaptured */}
      <div className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Regen Energy</span>
          <BatteryCharging className="w-4 h-4 text-eco-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-eco-400 font-tabular">
            {summary.energyRegeneratedKwh}
          </span>
          <span className="text-xs text-slate-400 font-semibold">kWh</span>
        </div>
        <div className="mt-1 text-[10px] text-eco-400/90 font-medium">
          +{summary.regenEnergyPercentage}% energy recovered
        </div>
      </div>

      {/* Cycle Distance */}
      <div className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Test Distance</span>
          <Gauge className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-foreground font-tabular">
            {summary.totalDistanceKm}
          </span>
          <span className="text-xs text-slate-400 font-semibold">km</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
          Duration: {Math.floor(summary.durationS / 60)}m {summary.durationS % 60}s
        </div>
      </div>

      {/* Battery SOC Drop */}
      <div className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pack SOC Delta</span>
          <Battery className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-foreground font-tabular">
            {(summary.initialSocPercent - summary.finalSocPercent).toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-semibold">%</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 font-tabular">
          {summary.initialSocPercent}% → {summary.finalSocPercent}%
        </div>
      </div>

      {/* Gross vs Net Efficiency */}
      <div className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Gross Expenditure</span>
          <RotateCcw className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-foreground font-tabular">
            {summary.grossEnergyConsumedKwh}
          </span>
          <span className="text-xs text-slate-400 font-semibold">kWh</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
          Braking recaptured {summary.energyRegeneratedKwh} kWh
        </div>
      </div>
    </div>
  );
}
