'use client';

import React, { useState } from 'react';
import { BatteryCharging, Cpu, Zap, Cog, Disc, ArrowRight, RefreshCw } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export function EnergyFlowHero() {
  const [flowMode, setFlowMode] = useState<'propulsion' | 'regeneration'>('propulsion');

  return (
    <div className="w-full relative rounded-4xl bg-surface-100/90 border border-border p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden backdrop-blur-2xl">
      {/* Background ambient lighting glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Mode Switcher */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-electric-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Interactive Powertrain Schematic
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-200 border border-border/80">
          <button
            type="button"
            onClick={() => setFlowMode('propulsion')}
            className={twMerge(
              'px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200',
              flowMode === 'propulsion'
                ? 'bg-electric-500 text-slate-950 shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Forward Propulsion
          </button>
          <button
            type="button"
            onClick={() => setFlowMode('regeneration')}
            className={twMerge(
              'px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200',
              flowMode === 'regeneration'
                ? 'bg-emerald-500 text-slate-950 shadow-glow-green'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Regenerative Braking
          </button>
        </div>
      </div>

      {/* SVG Animated Circuit & Node Pipeline */}
      <div className="relative py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6 relative z-10">
          {/* 1. Battery Pack */}
          <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-surface-200/90 border border-border hover:border-electric-500/40 transition-all duration-200 group">
            <div className="w-14 h-14 rounded-2xl bg-surface-300 flex items-center justify-center text-electric-400 mb-3 shadow-inner group-hover:scale-105 transition-transform">
              <BatteryCharging className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-foreground">Battery Pack</span>
            <span className="text-[11px] font-mono text-slate-400 mt-0.5">355V • 82 kWh</span>
            <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-electric-500/10 text-electric-400 font-semibold">
              {flowMode === 'propulsion' ? 'Discharge: 120 kW' : 'Charge: +45 kW'}
            </div>
          </div>

          {/* 2. Inverter / Controller */}
          <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-surface-200/90 border border-border hover:border-electric-500/40 transition-all duration-200 group">
            <div className="w-14 h-14 rounded-2xl bg-surface-300 flex items-center justify-center text-sky-400 mb-3 shadow-inner group-hover:scale-105 transition-transform">
              <Cpu className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-foreground">SiC Inverter</span>
            <span className="text-[11px] font-mono text-slate-400 mt-0.5">DC ⇄ 3-Phase AC</span>
            <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-semibold">
              97.5% Efficiency
            </div>
          </div>

          {/* 3. Traction Motor */}
          <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-surface-200/90 border border-border hover:border-electric-500/40 transition-all duration-200 group">
            <div className="w-14 h-14 rounded-2xl bg-surface-300 flex items-center justify-center text-amber-400 mb-3 shadow-inner group-hover:scale-105 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-foreground">PMSM Motor</span>
            <span className="text-[11px] font-mono text-slate-400 mt-0.5">180 kW • 390 Nm</span>
            <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold">
              {flowMode === 'propulsion' ? '8,400 RPM' : 'Generator Mode'}
            </div>
          </div>

          {/* 4. Single-Speed Reduction */}
          <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-surface-200/90 border border-border hover:border-electric-500/40 transition-all duration-200 group">
            <div className="w-14 h-14 rounded-2xl bg-surface-300 flex items-center justify-center text-purple-400 mb-3 shadow-inner group-hover:scale-105 transition-transform">
              <Cog className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-foreground">Transmission</span>
            <span className="text-[11px] font-mono text-slate-400 mt-0.5">8.6 : 1 Ratio</span>
            <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-semibold">
              3,250 Nm Wheel Tq
            </div>
          </div>

          {/* 5. Wheels & Road */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center text-center p-4 rounded-3xl bg-surface-200/90 border border-border hover:border-electric-500/40 transition-all duration-200 group">
            <div className="w-14 h-14 rounded-2xl bg-surface-300 flex items-center justify-center text-emerald-400 mb-3 shadow-inner group-hover:scale-105 transition-transform">
              <Disc className="w-7 h-7 animate-spin-slow" />
            </div>
            <span className="text-xs font-bold text-foreground">Driven Wheels</span>
            <span className="text-[11px] font-mono text-slate-400 mt-0.5">0.32m Dynamic Radius</span>
            <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
              {flowMode === 'propulsion' ? 'Ft: 10.1 kN' : 'Regen Decel: 0.18g'}
            </div>
          </div>
        </div>

        {/* Animated Connector Line */}
        <div className="hidden md:block absolute top-[52px] left-12 right-12 h-1 pointer-events-none -z-0">
          <svg className="w-full h-4 overflow-visible">
            <line
              x1="0"
              y1="2"
              x2="100%"
              y2="2"
              stroke="var(--border-color)"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="2"
              x2="100%"
              y2="2"
              stroke={flowMode === 'propulsion' ? '#00D2FF' : '#10B981'}
              strokeWidth="3"
              className={twMerge(
                'animate-energy-flow',
                flowMode === 'regeneration' && 'direction-reverse'
              )}
            />
          </svg>
        </div>
      </div>

      {/* Dynamic Summary Strip */}
      <div className="mt-6 pt-5 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {flowMode === 'propulsion' ? (
            <ArrowRight className="w-4 h-4 text-electric-400" />
          ) : (
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          )}
          <span>
            {flowMode === 'propulsion'
              ? 'Power Flow: Electrochemical DC → 3Φ AC Inverter → Electromagnetic Torque → Mechanical Reduction → Road Contact'
              : 'Energy Capture: Vehicle Kinetic Momentum → Wheel Torque → Motor Regenerative Back-EMF → AC/DC Rectification → Battery Pack Charge'}
          </span>
        </div>
        <div className="font-mono text-slate-300 font-semibold">
          {flowMode === 'propulsion' ? 'Total Efficiency: ~88.2%' : 'Regen Recovery: ~78.4%'}
        </div>
      </div>
    </div>
  );
}
