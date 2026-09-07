'use client';

import React from 'react';
import { Zap, Activity } from 'lucide-react';
import { useEVStore } from '@/hooks/useEVStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { Input } from '../ui/Input';
import { MotorType } from '@/types/ev';
import { calculateMotorBaseRpm } from '@/lib/physics/motorModel';

const MOTOR_TYPES: Array<{ type: MotorType; label: string; desc: string }> = [
  { type: 'pmsm', label: 'PMSM', desc: 'Permanent Magnet Synchronous. Maximum torque density & peak efficiency.' },
  { type: 'induction', label: 'AC Induction', desc: 'Asynchronous squirrel-cage. Low coasting drag, zero rare-earths.' },
  { type: 'srm', label: 'SRM', desc: 'Switched Reluctance. Extreme thermal resilience, rugged design.' },
  { type: 'axial-flux', label: 'Axial Flux', desc: 'Pancake motor. Exceptional torque-to-weight ratio.' },
];

export function MotorPanel() {
  const { currentVehicle, updateMotorParams } = useEVStore();
  const m = currentVehicle.motor;

  const baseRpm = calculateMotorBaseRpm(m.peakPowerKw, m.peakTorqueNm);

  // Generate SVG curve points for torque-speed characteristic
  const svgWidth = 260;
  const svgHeight = 100;
  const maxRpm = Math.max(m.maxRpm, 12000);
  const maxTorque = Math.max(m.peakTorqueNm, 400);

  const baseRpmX = (baseRpm / maxRpm) * svgWidth;
  const peakTorqueY = svgHeight - (m.peakTorqueNm / maxTorque) * (svgHeight - 20) - 10;
  const endTorqueY =
    svgHeight -
    (((m.peakPowerKw * 1000) / ((m.maxRpm * 2 * Math.PI) / 60)) / maxTorque) * (svgHeight - 20) -
    10;

  const torquePath = `M 0,${peakTorqueY} L ${baseRpmX},${peakTorqueY} Q ${(baseRpmX + svgWidth) / 2},${(peakTorqueY + endTorqueY) / 1.5} ${svgWidth},${endTorqueY}`;

  return (
    <Card elevated className="space-y-6">
      <CardHeader className="mb-2">
        <div>
          <CardTitle>
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Electric Traction Motor</span>
          </CardTitle>
          <CardDescription>
            Torque-speed operating envelope, field weakening threshold, and motor architecture.
          </CardDescription>
        </div>
      </CardHeader>

      {/* Motor Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-300">Motor Architecture</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MOTOR_TYPES.map((mt) => (
            <button
              key={mt.type}
              type="button"
              onClick={() => updateMotorParams({ type: mt.type })}
              className={`p-2.5 rounded-2xl text-left border transition-all duration-150 cursor-pointer ${
                m.type === mt.type
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-surface-200 border-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold">{mt.label}</div>
              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{mt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mini Torque-Speed Curve Characteristic */}
      <div className="p-4 rounded-3xl bg-surface-200/80 border border-border/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Operating Envelope</span>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-bold">
            Corner Base Speed: {baseRpm} RPM
          </span>
        </div>

        <div className="relative h-28 w-full flex items-center justify-center pt-2">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            {/* Grid line at base RPM */}
            <line
              x1={baseRpmX}
              y1="0"
              x2={baseRpmX}
              y2={svgHeight}
              stroke="var(--border-color)"
              strokeDasharray="3 3"
            />
            {/* Torque curve */}
            <path d={torquePath} fill="none" stroke="#F59E0B" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-border/60 pt-2">
          <span>0 RPM: Constant Torque ({m.peakTorqueNm} Nm)</span>
          <span>{baseRpm} RPM (Base)</span>
          <span>{m.maxRpm} RPM (Field-Weakened)</span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Peak Power */}
        <Slider
          label="Peak Motor Power"
          value={m.peakPowerKw}
          min={30}
          max={650}
          step={5}
          unit="kW"
          onChange={(val) => updateMotorParams({ peakPowerKw: val })}
          helperText="Maximum instantaneous power rating (10-30s acceleration limit)."
        />

        {/* Continuous Power */}
        <Slider
          label="Continuous Motor Power"
          value={m.continuousPowerKw}
          min={20}
          max={450}
          step={5}
          unit="kW"
          onChange={(val) => updateMotorParams({ continuousPowerKw: val })}
          helperText="Thermally sustainable power limit for prolonged cruising & hill climbing."
        />

        {/* Peak Torque */}
        <Slider
          label="Peak Motor Torque"
          value={m.peakTorqueNm}
          min={50}
          max={900}
          step={10}
          unit="Nm"
          onChange={(val) => updateMotorParams({ peakTorqueNm: val })}
          helperText="Maximum low-speed electromagnetic torque."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Max RPM */}
          <Input
            label="Maximum Motor RPM"
            type="number"
            step="500"
            min="5000"
            max="25000"
            unit="RPM"
            value={m.maxRpm}
            onChange={(e) => updateMotorParams({ maxRpm: parseInt(e.target.value, 10) || 12000 })}
            helperText="Rotor mechanical speed threshold (typically 12,000 to 20,000 RPM)."
          />

          {/* Base Efficiency */}
          <Input
            label="Motor Base Efficiency"
            type="number"
            step="0.01"
            min="0.80"
            max="0.99"
            value={m.baseEfficiency}
            onChange={(e) => updateMotorParams({ baseEfficiency: parseFloat(e.target.value) || 0.95 })}
            helperText="Peak electromagnetic conversion efficiency (0.94 - 0.97)."
          />
        </div>
      </div>
    </Card>
  );
}
