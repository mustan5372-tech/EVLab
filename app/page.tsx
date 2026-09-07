'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Sliders,
  Gauge,
  Activity,
  GitCompare,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { EnergyFlowHero } from '@/components/landing/EnergyFlowHero';
import { PRESET_VEHICLES } from '@/lib/storage/defaultPresets';

export default function LandingPage() {
  return (
    <AppShell>
      <div className="space-y-16 lg:space-y-24 py-4">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-200 border border-border text-xs font-semibold text-electric-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Automobile & EV Engineering Simulator</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
            Design. Simulate.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 via-sky-400 to-emerald-400">
              Optimize.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A modern, physics-accurate engineering platform for designing, analyzing, and validating electric vehicle
            powertrains. From cell series chemistry to high-speed aerodynamic road loads.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <Link href="/designer">
              <Button size="lg" pill className="gap-2.5 text-slate-950 font-bold shadow-glow">
                <span>Start Designing</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/simulation">
              <Button variant="secondary" size="lg" pill className="gap-2">
                <Gauge className="w-4 h-4 text-electric-400" />
                <span>Explore Simulation</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Animated Powertrain Energy Flow */}
        <section className="max-w-5xl mx-auto">
          <EnergyFlowHero />
        </section>

        {/* Core Capabilities Grid */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              A Complete EV Engineering Workflow
            </h2>
            <p className="text-sm text-slate-400">
              Everything needed to bridge theoretical equations with real-world powertrain performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <Card elevated highlight className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-electric-500/15 text-electric-400 flex items-center justify-center">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">EV Designer</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tailor vehicle mass, aerodynamics, rolling resistance, series/parallel battery packs, and PMSM/Induction
                  operating envelopes with live pack calculations.
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 mt-4">
                <Link
                  href="/designer"
                  className="text-xs font-semibold text-electric-400 flex items-center gap-1 hover:underline"
                >
                  Configure vehicle <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card elevated className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <Gauge className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Physics Simulation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Step-by-step numerical time-domain integration for 0–100 km/h acceleration splits, top speed road-load
                  equilibrium, and gradeability.
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 mt-4">
                <Link
                  href="/simulation"
                  className="text-xs font-semibold text-sky-400 flex items-center gap-1 hover:underline"
                >
                  Analyze graphs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card elevated className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Drive Cycles</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simulate your EV through standardized WLTP, NEDC, Urban UDDS, and Highway profiles with active
                  regenerative braking energy capture.
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 mt-4">
                <Link
                  href="/drive-cycles"
                  className="text-xs font-semibold text-emerald-400 flex items-center gap-1 hover:underline"
                >
                  Run test cycles <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card elevated className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <GitCompare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">EV Comparison</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Evaluate multiple EV powertrain architectures side-by-side to understand engineering trade-offs between
                  battery weight, motor torque, and range.
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 mt-4">
                <Link
                  href="/comparison"
                  className="text-xs font-semibold text-purple-400 flex items-center gap-1 hover:underline"
                >
                  Compare models <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* Engineering Presets Showcase */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Pre-Configured Vehicle Presets</h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore baseline architectures designed to reflect common production EV classes.
              </p>
            </div>
            <Link href="/designer">
              <Button variant="outline" size="sm" pill className="text-xs">
                Open in Designer
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_VEHICLES.map((preset) => (
              <div
                key={preset.id}
                className="p-5 rounded-3xl bg-surface-100 border border-border/80 hover:border-slate-600 transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{preset.name}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-surface-200 text-slate-400 font-semibold">
                      {preset.vehicle.drivenWheels.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{preset.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Mass</span>
                    <span className="font-semibold text-slate-200">{preset.vehicle.massKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Motor</span>
                    <span className="font-semibold text-slate-200">{preset.motor.peakPowerKw} kW</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Battery</span>
                    <span className="font-semibold text-slate-200">
                      {Math.round((preset.battery.cellsInSeries * preset.battery.cellNominalVoltage * preset.battery.cellsInParallel * preset.battery.cellCapacityAh) / 1000)} kWh
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Peak Torque</span>
                    <span className="font-semibold text-slate-200">{preset.motor.peakTorqueNm} Nm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Engineering Physics & Transparency Guarantee */}
        <section className="rounded-4xl bg-surface-100 border border-border p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Deterministic Engineering Transparency</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              No Fake Numbers. True Physical Models.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every single metric in EVLAB is derived from first-principles vehicle dynamics: aerodynamic quadratic drag
              equations, tire rolling resistance hysteresis, gravitational incline vectors, and physical motor torque-speed
              envelopes. Click &ldquo;How was this calculated?&rdquo; anywhere to inspect equations with your exact values.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link href="/learn">
                <Button variant="secondary" size="md" pill className="gap-2 text-xs">
                  <BookOpen className="w-4 h-4 text-electric-400" />
                  <span>Browse Engineering Theory</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-96 p-5 rounded-3xl bg-surface-200/90 border border-border font-mono text-xs space-y-3">
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Sample Equation Execution
            </div>
            <div className="p-3 rounded-2xl bg-surface-100 border border-border/80 space-y-1">
              <div className="text-electric-400 font-bold">F_d = ½ · ρ · C_d · A · v²</div>
              <div className="text-[11px] text-slate-400">0.5 × 1.225 × 0.28 × 2.2 × (27.78)²</div>
              <div className="text-emerald-400 font-bold text-sm">= 291.1 N Drag Force</div>
            </div>
            <div className="text-[11px] text-slate-400">
              Internally calculated in SI units, converted dynamically for intuitive engineering display.
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="text-center py-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Ready to Engineer Your EV?
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Design your powertrain, analyze performance graphs, and understand trade-offs in minutes.
          </p>
          <div>
            <Link href="/designer">
              <Button size="lg" pill className="font-bold text-slate-950 px-8 shadow-glow">
                Build Your First EV
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
