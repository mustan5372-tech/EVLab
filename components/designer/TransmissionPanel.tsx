'use client';

import React from 'react';
import { Cog, RefreshCw } from 'lucide-react';
import { useEVStore } from '@/hooks/useEVStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { Input } from '../ui/Input';
import { RegenMode } from '@/types/ev';
import { calculateTotalGearRatio } from '@/lib/physics/transmission';

const REGEN_MODES: Array<{ mode: RegenMode; label: string; desc: string }> = [
  { mode: 'off', label: 'Off', desc: '100% friction brakes. Zero electrical energy recovery.' },
  { mode: 'low', label: 'Low', desc: 'Mild coasting regen (~0.06g max). Gliding feel.' },
  { mode: 'medium', label: 'Medium', desc: 'Moderate deceleration (~0.14g max). Balanced driveability.' },
  { mode: 'high', label: 'One-Pedal', desc: 'Aggressive regen (~0.24g max). Maximizes energy recovery in city.' },
];

export function TransmissionPanel() {
  const { currentVehicle, updateTransmissionParams, setRegenMode } = useEVStore();
  const t = currentVehicle.transmission;
  const currentRegen = currentVehicle.regenMode;

  const totalRatio = calculateTotalGearRatio(t);

  return (
    <Card elevated className="space-y-6">
      <CardHeader className="mb-2">
        <div>
          <CardTitle>
            <Cog className="w-5 h-5 text-purple-400" />
            <span>Transmission & Regenerative Braking</span>
          </CardTitle>
          <CardDescription>
            Fixed single-speed reduction gearing, differential kinematics, and brake energy capture mode.
          </CardDescription>
        </div>
      </CardHeader>

      {/* Calculated Total Gear Reduction Banner */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-surface-200/80 border border-border/80">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Reduction Ratio</span>
          <span className="text-xl font-bold text-purple-400 font-tabular">{totalRatio} : 1</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Drivetrain Efficiency</span>
          <span className="text-base font-bold text-foreground font-tabular">
            {Math.round(t.drivetrainEfficiency * 100)}%
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Gear Ratio */}
        <Slider
          label="Single-Speed Gear Ratio"
          value={t.gearRatio}
          min={5.0}
          max={15.0}
          step={0.1}
          onChange={(val) => updateTransmissionParams({ gearRatio: Math.round(val * 10) / 10 })}
          helperText="Higher ratio = harder wheel launch torque, but lower top speed limit."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Differential Ratio */}
          <Input
            label="Differential Ratio"
            type="number"
            step="0.05"
            min="1.0"
            max="5.0"
            value={t.differentialRatio}
            onChange={(e) => updateTransmissionParams({ differentialRatio: parseFloat(e.target.value) || 1.0 })}
            helperText="Integrated final drive multiplier (usually 1.0 for single reduction gearboxes)."
          />

          {/* Drivetrain Efficiency */}
          <Input
            label="Mechanical Efficiency"
            type="number"
            step="0.01"
            min="0.85"
            max="0.99"
            value={t.drivetrainEfficiency}
            onChange={(e) => updateTransmissionParams({ drivetrainEfficiency: parseFloat(e.target.value) || 0.96 })}
            helperText="Helical gear meshing + CV joint losses (~0.95 to 0.98)."
          />
        </div>

        {/* Regenerative Braking Mode Selection */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Regenerative Braking Calibration</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REGEN_MODES.map((rm) => (
              <button
                key={rm.mode}
                type="button"
                onClick={() => setRegenMode(rm.mode)}
                className={`p-3 rounded-2xl text-left border transition-all duration-150 cursor-pointer ${
                  currentRegen === rm.mode
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-surface-200 border-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{rm.label}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">{rm.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
