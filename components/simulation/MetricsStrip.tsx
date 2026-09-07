'use client';

import React, { useState } from 'react';
import {
  Timer,
  Gauge,
  Battery,
  Mountain,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { SimulationOverview } from '@/types/simulation';
import { EVConfiguration } from '@/types/ev';
import { Modal } from '../ui/Modal';
import { explainRangeCalculation } from '@/lib/simulation/rangeCalculator';

interface MetricsStripProps {
  simulation: SimulationOverview;
  config: EVConfiguration;
}

export function MetricsStrip({ simulation, config }: MetricsStripProps) {
  const { acceleration, topSpeed, gradeability, range } = simulation;
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const rangeExplanation = explainRangeCalculation(config, 90);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 0-100 km/h */}
        <div
          onClick={() => setActiveModal('accel')}
          className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 hover:border-electric-500/40 transition-all duration-200 cursor-pointer group shadow-soft"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">0–100 km/h</span>
            <Timer className="w-4 h-4 text-electric-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground font-tabular">
              {acceleration.timeTo100Kmh !== null ? acceleration.timeTo100Kmh.toFixed(2) : 'N/A'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">s</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>0-60: {acceleration.timeTo60Kmh?.toFixed(2)}s</span>
            <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-electric-400" />
          </div>
        </div>

        {/* Top Speed */}
        <div
          onClick={() => setActiveModal('topSpeed')}
          className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 hover:border-sky-500/40 transition-all duration-200 cursor-pointer group shadow-soft"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Top Speed</span>
            <Gauge className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground font-tabular">
              {topSpeed.topSpeedKmh}
            </span>
            <span className="text-xs text-slate-400 font-semibold">km/h</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span className="capitalize">{topSpeed.limitingFactor} limit</span>
            <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-sky-400" />
          </div>
        </div>

        {/* Range @ 90 km/h */}
        <div
          onClick={() => setActiveModal('range')}
          className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer group shadow-soft"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Range (90 km/h)</span>
            <Battery className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400 font-tabular">
              {range.steadyState90Kmh}
            </span>
            <span className="text-xs text-slate-400 font-semibold">km</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>60km/h: {range.steadyState60Kmh}km</span>
            <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
          </div>
        </div>

        {/* Specific Consumption */}
        <div
          onClick={() => setActiveModal('consumption')}
          className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 hover:border-amber-500/40 transition-all duration-200 cursor-pointer group shadow-soft"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Consumption</span>
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground font-tabular">
              {range.consumptionWhPerKmAt90}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Wh/km</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>At 90 km/h steady</span>
            <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
          </div>
        </div>

        {/* Max Gradeability */}
        <div
          onClick={() => setActiveModal('grade')}
          className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 hover:border-purple-500/40 transition-all duration-200 cursor-pointer group shadow-soft"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Max Grade</span>
            <Mountain className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground font-tabular">
              {gradeability.maxGradeAt20Kmh}%
            </span>
            <span className="text-xs text-slate-400 font-semibold">incline</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>At 20 km/h crawl</span>
            <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-purple-400" />
          </div>
        </div>

        {/* Quarter Mile */}
        <div
          onClick={() => setActiveModal('accel')}
          className="p-4 rounded-3xl bg-surface-100/90 border border-border/80 hover:border-rose-500/40 transition-all duration-200 cursor-pointer group shadow-soft"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">¼ Mile (402m)</span>
            <Timer className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground font-tabular">
              {acceleration.quarterMileTimeS !== null ? acceleration.quarterMileTimeS.toFixed(2) : 'N/A'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">s</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Trap: {acceleration.quarterMileSpeedKmh?.toFixed(0)} km/h</span>
            <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-rose-400" />
          </div>
        </div>
      </div>

      {/* Explanation Modals */}
      <Modal
        isOpen={activeModal === 'accel'}
        onClose={() => setActiveModal(null)}
        title="0–100 km/h Acceleration Derivation"
        subtitle="Time-domain forward Euler numerical integration of vehicle dynamics"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
            <span className="font-bold text-electric-400 uppercase text-[11px] block">Governing Dynamic Equation</span>
            <code className="text-foreground block font-semibold text-sm">
              a(t) = [ F_tractive(v) - F_aero(v) - F_rolling - F_grade ] ÷ m_effective
            </code>
            <p className="text-slate-400 leading-relaxed mt-2">
              Where <code className="text-slate-200 font-mono">m_effective = m × 1.05</code> to account for rotational
              inertia of rotor, transmission gears, half-shafts, and wheels.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-2">
            <span className="font-bold text-amber-400 uppercase text-[11px] block">Tire Adhesion Boundary</span>
            <code className="text-foreground block font-semibold text-sm">
              F_tractive_max = μ_tire × m × g × weight_transfer_ratio
            </code>
            <p className="text-slate-400">
              On launch, traction force cannot exceed tire road adhesion. Excessive torque will trigger simulated traction
              control capping tractive force at physical friction limits.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'topSpeed'}
        onClose={() => setActiveModal(null)}
        title="Top Speed Equilibrium Derivation"
        subtitle="Road-load balance between aerodynamic drag, rolling resistance, and available power"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-2">
            <span className="font-bold text-sky-400 uppercase text-[11px] block">Equilibrium Criterion</span>
            <code className="text-foreground block font-semibold text-sm">
              P_motor(v) · η_drivetrain = [ ½ · ρ · C_d · A · v³ ] + [ C_rr · m · g · v ]
            </code>
            <p className="text-slate-400 leading-relaxed">
              At maximum velocity, acceleration drops to zero: <code className="text-slate-200">F_net = 0</code>.
              Because aerodynamic power loss scales with the cube of speed (<code className="text-slate-200">v³</code>),
              doubling top speed requires 8× the mechanical power!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-200 border border-border">
            <span className="font-bold text-slate-300 block mb-1">Limiting Mode:</span>
            <span className="text-electric-400 font-semibold uppercase">{topSpeed.limitingFactor}</span>
            <p className="text-slate-400 mt-1">
              {topSpeed.limitingFactor === 'motor_rpm'
                ? 'The motor has hit its maximum mechanical redline speed limit before running out of power.'
                : 'Available continuous motor/battery power exactly balances aerodynamic drag and tire resistance.'}
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'range' || activeModal === 'consumption'}
        onClose={() => setActiveModal(null)}
        title="Steady-State Range & Consumption"
        subtitle="Energy expenditure model at 90 km/h cruise"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
            <span className="font-bold text-emerald-400 uppercase text-[11px] block">Range Formula</span>
            <code className="text-foreground block font-semibold text-sm">{rangeExplanation.formula}</code>
          </div>

          <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
            <span className="font-bold text-slate-300 block text-[11px] uppercase">Active Vehicle Substitution</span>
            <code className="text-electric-400 block font-semibold text-xs">{rangeExplanation.substitutedValues}</code>
            <p className="text-slate-400 mt-2 leading-relaxed">{rangeExplanation.explanation}</p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'grade'}
        onClose={() => setActiveModal(null)}
        title="Gradeability Incline Model"
        subtitle="Gravitational resistance vector analysis"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
            <span className="font-bold text-purple-400 uppercase text-[11px] block">Incline Force Equation</span>
            <code className="text-foreground block font-semibold text-sm">
              F_grade = m · g · sin(arctan(grade% / 100))
            </code>
            <p className="text-slate-400 leading-relaxed mt-2">
              Maximum hill climbing capability is governed by low-end motor peak torque and single-speed reduction gearing.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
