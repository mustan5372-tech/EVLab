'use client';

import React, { useState } from 'react';
import { BatteryCharging, HelpCircle, Zap } from 'lucide-react';
import { useEVStore } from '@/hooks/useEVStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { calculateBatteryPackMetrics } from '@/lib/physics/batteryModel';

export function BatteryPanel() {
  const { currentVehicle, updateBatteryParams } = useEVStore();
  const b = currentVehicle.battery;
  const metrics = calculateBatteryPackMetrics(b);

  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);

  return (
    <Card elevated className="space-y-6">
      <CardHeader className="mb-2">
        <div>
          <CardTitle>
            <BatteryCharging className="w-5 h-5 text-emerald-400" />
            <span>High Voltage Battery Pack</span>
          </CardTitle>
          <CardDescription>
            Electrochemical cell topology, series-parallel arrangement, and usable discharge limits.
          </CardDescription>
        </div>
        <button
          type="button"
          onClick={() => setIsFormulaModalOpen(true)}
          className="flex items-center gap-1.5 text-xs text-electric-400 hover:text-electric-300 font-medium px-3 py-1.5 rounded-xl bg-surface-200 hover:bg-surface-300 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Formulas</span>
        </button>
      </CardHeader>

      {/* Calculated Live Pack Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-3xl bg-surface-200/80 border border-border/80">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Pack Voltage</span>
          <span className="text-base sm:text-lg font-bold text-foreground font-tabular">
            {metrics.packNominalVoltageV} V
          </span>
          <span className="text-[10px] text-slate-500 block">
            {metrics.packNominalVoltageV >= 600 ? '800V Architecture' : '400V Architecture'}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Capacity</span>
          <span className="text-base sm:text-lg font-bold text-foreground font-tabular">
            {metrics.packCapacityAh} Ah
          </span>
          <span className="text-[10px] text-slate-500 block">{metrics.totalCellCount} Total Cells</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Energy</span>
          <span className="text-base sm:text-lg font-bold text-emerald-400 font-tabular">
            {metrics.totalEnergyKwh} kWh
          </span>
          <span className="text-[10px] text-slate-400 block font-medium">
            {metrics.usableEnergyKwh} kWh Usable
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Cont. Discharge</span>
          <span className="text-sm sm:text-base font-bold text-foreground font-tabular">
            {metrics.maxContinuousDischargePowerKw} kW
          </span>
          <span className="text-[10px] text-slate-500 block font-mono">{metrics.maxDischargeCurrentA} A</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Peak Discharge</span>
          <span className="text-sm sm:text-base font-bold text-electric-400 font-tabular">
            {metrics.maxPeakDischargePowerKw} kW
          </span>
          <span className="text-[10px] text-slate-500 block">10s Burst</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Charge Rate</span>
          <span className="text-sm sm:text-base font-bold text-sky-400 font-tabular">
            {Math.round((metrics.packNominalVoltageV * metrics.maxChargeCurrentA) / 1000)} kW
          </span>
          <span className="text-[10px] text-slate-500 block font-mono">{metrics.maxChargeCurrentA} A Fast Chg</span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Cells in Series */}
        <Slider
          label="Cells in Series (S)"
          value={b.cellsInSeries}
          min={48}
          max={240}
          step={2}
          onChange={(val) => updateBatteryParams({ cellsInSeries: Math.round(val) })}
          helperText="Determines pack nominal voltage: V_pack = S × V_cell (e.g. 96S ≈ 355V, 192S ≈ 710V)."
        />

        {/* Cells in Parallel */}
        <Slider
          label="Cells in Parallel (P)"
          value={b.cellsInParallel}
          min={1}
          max={10}
          step={1}
          onChange={(val) => updateBatteryParams({ cellsInParallel: Math.round(val) })}
          helperText="Determines total pack amp-hour capacity: Ah_pack = P × Ah_cell."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cell Nominal Voltage */}
          <Input
            label="Cell Nominal Voltage"
            type="number"
            step="0.05"
            min="2.5"
            max="4.5"
            unit="V"
            value={b.cellNominalVoltage}
            onChange={(e) => updateBatteryParams({ cellNominalVoltage: parseFloat(e.target.value) || 3.7 })}
            helperText="NMC/NCA ≈ 3.7V, LFP ≈ 3.2V, Solid-State ≈ 3.85V."
          />

          {/* Cell Capacity */}
          <Input
            label="Single Cell Capacity"
            type="number"
            step="1"
            min="10"
            max="300"
            unit="Ah"
            value={b.cellCapacityAh}
            onChange={(e) => updateBatteryParams({ cellCapacityAh: parseFloat(e.target.value) || 50 })}
            helperText="Prismatic / Pouch / Large Cylindrical (e.g. 4680: ~25Ah, Prismatic: 50-150Ah)."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Max Discharge C */}
          <Input
            label="Max Discharge C-Rate"
            type="number"
            step="0.5"
            min="1.0"
            max="8.0"
            unit="C"
            value={b.maxDischargeC}
            onChange={(e) => updateBatteryParams({ maxDischargeC: parseFloat(e.target.value) || 2.5 })}
            helperText="Peak continuous discharge multiplier."
          />

          {/* Initial SOC */}
          <Input
            label="Test Initial SOC"
            type="number"
            step="1"
            min="10"
            max="100"
            unit="%"
            value={b.initialSocPercent}
            onChange={(e) => updateBatteryParams({ initialSocPercent: parseFloat(e.target.value) || 90 })}
            helperText="State of Charge at simulation start."
          />
        </div>
      </div>

      {/* Battery Formulas Explanation Modal */}
      <Modal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        title="Battery Pack Derivations & Calculations"
        subtitle="First-principles electrochemical topology equations"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
            <span className="font-bold text-electric-400 uppercase text-[11px] block">1. Pack Nominal Voltage</span>
            <code className="text-foreground block font-semibold text-sm">V_pack = S × V_cell</code>
            <p className="text-slate-400">
              {b.cellsInSeries} cells in series × {b.cellNominalVoltage} V = {metrics.packNominalVoltageV} V
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
            <span className="font-bold text-emerald-400 uppercase text-[11px] block">2. Total Capacity & Energy</span>
            <code className="text-foreground block font-semibold text-sm">Ah_pack = P × Ah_cell</code>
            <p className="text-slate-400">
              {b.cellsInParallel} parallel strings × {b.cellCapacityAh} Ah = {metrics.packCapacityAh} Ah
            </p>
            <code className="text-foreground block font-semibold text-sm mt-2">
              E_total = (V_pack × Ah_pack) ÷ 1000
            </code>
            <p className="text-slate-400">
              ({metrics.packNominalVoltageV} V × {metrics.packCapacityAh} Ah) ÷ 1000 = {metrics.totalEnergyKwh} kWh
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
            <span className="font-bold text-sky-400 uppercase text-[11px] block">3. Usable Pack Window</span>
            <code className="text-foreground block font-semibold text-sm">
              E_usable = E_total × (SOC_max - SOC_min)
            </code>
            <p className="text-slate-400">
              {metrics.totalEnergyKwh} kWh × (({b.usableSocMaxPercent} - {b.usableSocMinPercent}) / 100) ={' '}
              {metrics.usableEnergyKwh} kWh
            </p>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
