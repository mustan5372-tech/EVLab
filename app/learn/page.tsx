'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Zap,
  BatteryCharging,
  Sliders,
  Wind,
  Gauge,
  Mountain,
  Cog,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';

export default function LearnPage() {
  const [activeSection, setActiveSection] = useState<string>('longitudinal');

  // Interactive mini-calculator states for student experimentation
  const [calcSpeedKmh, setCalcSpeedKmh] = useState<number>(100);
  const [calcCd, setCalcCd] = useState<number>(0.24);
  const [calcArea, setCalcArea] = useState<number>(2.2);

  // Live calculation of drag force & power
  const vMs = calcSpeedKmh / 3.6;
  const rho = 1.225;
  const aeroDragN = 0.5 * rho * calcCd * calcArea * (vMs * vMs);
  const aeroPowerKw = (aeroDragN * vMs) / 1000;

  const sections = [
    { id: 'longitudinal', label: 'Vehicle Dynamics', icon: <Wind className="w-4 h-4" /> },
    { id: 'motors', label: 'Traction Motors', icon: <Zap className="w-4 h-4" /> },
    { id: 'batteries', label: 'Battery Packs', icon: <BatteryCharging className="w-4 h-4" /> },
    { id: 'gearing', label: 'Gearing & Regen', icon: <Cog className="w-4 h-4" /> },
    { id: 'glossary', label: 'Engineering Glossary', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-electric-400 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Automotive & EV Engineering Knowledge Base</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              EV Engineering Theory & Physics Principles
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Rigorous mathematical derivations, engineering trade-offs, and first-principles modeling for student engineers.
            </p>
          </div>

          <Link href="/designer">
            <Button variant="primary" size="sm" pill className="gap-1.5 text-xs font-bold text-slate-950 shadow-glow">
              <span>Apply in Designer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Section Navigation Tabs */}
        <Tabs tabs={sections} activeTab={activeSection} onChange={setActiveSection} />

        {/* 1. Longitudinal Dynamics */}
        {activeSection === 'longitudinal' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card elevated className="space-y-4">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-electric-400" />
                    <CardTitle>1. Aerodynamic Drag Force & Power Cube Law</CardTitle>
                  </div>
                </CardHeader>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    As an EV moves through air, it displaces air molecules, creating a turbulent low-pressure wake behind
                    the vehicle and skin friction along its panels.
                  </p>

                  <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
                    <span className="text-[10px] font-bold uppercase text-electric-400 block">Aerodynamic Drag Force</span>
                    <code className="text-foreground font-mono text-sm block">
                      F_drag = ½ · ρ · C_d · A · v²
                    </code>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block">Aerodynamic Power Loss (The v³ Law)</span>
                    <code className="text-foreground font-mono text-sm block">
                      P_drag = F_drag · v = ½ · ρ · C_d · A · v³
                    </code>
                  </div>

                  <p className="text-amber-300 font-medium">
                    ⚡ Key Engineering Takeaway: Because power scales with the <em>cube</em> of velocity (v³), traveling at 130 km/h
                    requires <strong>2.96× more aerodynamic power</strong> than cruising at 90 km/h, heavily degrading highway range!
                  </p>
                </div>
              </Card>

              {/* Interactive Mini Drag Calculator */}
              <Card elevated className="space-y-4">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-sky-400" />
                    <CardTitle>Interactive Aerodynamics Sandbox</CardTitle>
                  </div>
                  <Badge variant="electric">Live Model</Badge>
                </CardHeader>

                <CardDescription>
                  Experiment with speed, drag coefficient (Cd), and frontal area to observe immediate exponential force and power scaling.
                </CardDescription>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Vehicle Speed: {calcSpeedKmh} km/h</span>
                      <span className="text-electric-400">{vMs.toFixed(1)} m/s</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={200}
                      value={calcSpeedKmh}
                      onChange={(e) => setCalcSpeedKmh(Number(e.target.value))}
                      className="w-full accent-electric-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Drag Coefficient (Cd): {calcCd}</span>
                      <span className="text-slate-400">Sedan: 0.23, SUV: 0.32</span>
                    </div>
                    <input
                      type="range"
                      min={0.18}
                      max={0.45}
                      step={0.01}
                      value={calcCd}
                      onChange={(e) => setCalcCd(Number(e.target.value))}
                      className="w-full accent-sky-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-surface-200 border border-border mt-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Calculated Drag Force</span>
                      <span className="text-xl font-bold text-foreground font-tabular">{Math.round(aeroDragN)} N</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Aerodynamic Power Loss</span>
                      <span className="text-xl font-bold text-amber-400 font-tabular">{aeroPowerKw.toFixed(2)} kW</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Rolling Resistance & Grade */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card elevated className="space-y-4">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-emerald-400" />
                    <CardTitle>2. Tire Rolling Resistance (Hysteresis)</CardTitle>
                  </div>
                </CardHeader>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    Rolling resistance is caused by continuous viscoelastic deformation and damping hysteresis of the tire
                    rubber carcass as it rotates under vehicle payload.
                  </p>
                  <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 block">Rolling Resistance Force</span>
                    <code className="text-foreground font-mono text-sm block">
                      F_rr = C_rr · m · g · cos(θ)
                    </code>
                  </div>
                  <p>
                    Typical EV low-rolling-resistance tires achieve <code className="text-electric-300">Crr ≈ 0.008 to 0.010</code>.
                    Unlike aerodynamic drag, rolling resistance remains relatively constant regardless of vehicle speed,
                    making it the dominant resistance consumer at low urban city speeds below 50 km/h.
                  </p>
                </div>
              </Card>

              <Card elevated className="space-y-4">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-purple-400" />
                    <CardTitle>3. Incline & Rotational Inertia Acceleration</CardTitle>
                  </div>
                </CardHeader>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    Accelerating a vehicle requires overcoming linear curb mass plus the rotational inertia of rotating
                    powertrain components (motor rotor, differential gears, driveshafts, and wheel rims).
                  </p>
                  <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-1">
                    <span className="text-[10px] font-bold uppercase text-purple-400 block">Effective Mass Equation</span>
                    <code className="text-foreground font-mono text-sm block">
                      m_eff = m_curb · (1 + δ_rotational) ≈ 1.05 · m_curb
                    </code>
                  </div>
                  <p>
                    Newton&apos;s second law governing longitudinal acceleration:
                  </p>
                  <div className="p-4 rounded-2xl bg-surface-200 border border-border">
                    <code className="text-electric-400 font-mono text-sm block">
                      a = [ F_tractive - (F_aero + F_rr + F_grade) ] ÷ m_eff
                    </code>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 2. Traction Motors */}
        {activeSection === 'motors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card elevated className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-sm">PMSM (Permanent Magnet)</h3>
                  <Badge variant="optimal">95–97% Eff</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Utilizes Neodymium (NdFeB) rare-earth magnets embedded in the rotor. High power density, compact packaging,
                  and exceptional low-speed efficiency. Prone to back-EMF drag during high-speed highway coasting.
                </p>
                <div className="text-[11px] text-slate-400">Common: Tesla Model 3 Rear, Porsche Taycan, Hyundai Ioniq 5.</div>
              </Card>

              <Card elevated className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-sm">AC Induction (Asynchronous)</h3>
                  <Badge variant="good">92–94% Eff</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Induced current in copper/aluminum rotor bars creates magnetic field. Zero rare-earth magnet requirement.
                  Can be totally de-energized during coasting with zero cogging drag, making it ideal as secondary AWD front axle booster.
                </p>
                <div className="text-[11px] text-slate-400">Common: Tesla Model S/X Front, Audi e-tron.</div>
              </Card>

              <Card elevated className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-sm">Axial Flux Motor</h3>
                  <Badge variant="optimal">Ultra Torque</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Magnetic flux flows parallel to the axle rather than radially. Delivers unmatched torque density per kilogram
                  and pancake-thin packaging, making it dominant in hypercars and in-wheel hub architectures.
                </p>
                <div className="text-[11px] text-slate-400">Common: YASA (Mercedes-AMG), Koenigsegg Quark.</div>
              </Card>
            </div>

            <Card elevated className="space-y-4">
              <CardHeader>
                <CardTitle>Motor Characteristic Envelope: Constant Torque vs Field Weakening</CardTitle>
                <CardDescription>
                  How electric motors deliver instantaneous maximum torque from 0 RPM and transition into constant power.
                </CardDescription>
              </CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-2">
                  <h4 className="font-bold text-electric-400 text-sm">1. Constant Torque Region (0 to Base RPM)</h4>
                  <p>
                    From zero speed up to base speed (typically 3,000–5,000 RPM), the inverter provides maximum current
                    limited by thermal stator limits. Torque remains completely flat, giving EVs their trademark neck-snapping launch.
                  </p>
                  <code className="text-foreground block font-mono text-[11px]">P(ω) = T_max · ω (Linear Power Increase)</code>
                </div>

                <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-2">
                  <h4 className="font-bold text-amber-400 text-sm">2. Field Weakening Region (Base RPM to Max RPM)</h4>
                  <p>
                    Above base speed, back-EMF voltage matches the battery pack voltage ceiling. The inverter injects negative
                    d-axis demagnetizing current to weaken the rotor flux, maintaining constant power output while torque decreases hyperbolically.
                  </p>
                  <code className="text-foreground block font-mono text-[11px]">T(ω) = P_max ÷ ω (Hyperbolic Torque Decay)</code>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 3. Battery Packs */}
        {activeSection === 'batteries' && (
          <div className="space-y-6">
            <Card elevated className="space-y-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-5 h-5 text-emerald-400" />
                  <CardTitle>Electrochemical Pack Architecture: Series (S) & Parallel (P) Fundamentals</CardTitle>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-2">
                  <h4 className="font-bold text-emerald-400 text-sm">Series Configuration (e.g. 96S, 108S, 192S)</h4>
                  <p>
                    Connecting battery cells in series sums their individual voltages while keeping ampere-hour capacity constant.
                    High pack voltage (400V or 800V) allows delivering high kilowatt power at <em>lower electrical current</em>,
                    minimizing <code className="text-foreground">I²R</code> resistive heat losses in wiring and inverters.
                  </p>
                  <code className="text-foreground block font-mono text-[11px]">V_pack = N_series · V_cell_nominal</code>
                </div>

                <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-2">
                  <h4 className="font-bold text-sky-400 text-sm">Parallel Configuration (e.g. 2P, 4P, 6P)</h4>
                  <p>
                    Connecting cell strings in parallel sums their ampere-hour capacity and current capability while voltage
                    remains unchanged. More parallel cells distribute the discharge load across more cells, reducing individual cell C-rate stress.
                  </p>
                  <code className="text-foreground block font-mono text-[11px]">Ah_pack = N_parallel · Ah_cell</code>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-2 text-xs">
                <h4 className="font-bold text-amber-400 text-sm">C-Rate Discharge & Thermal Bottlenecks</h4>
                <p className="text-slate-300 leading-relaxed">
                  A cell rated at 1C can be fully discharged in 1 hour. Discharging at 3C discharges the full cell in 20 minutes.
                  When sizing an EV pack, if <code className="text-slate-200">P_batt_max = V_pack · (Ah_pack · C_max)</code> is
                  lower than motor demand, acceleration will be severely clipped to prevent cell thermal runaway.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* 4. Gearing & Regen */}
        {activeSection === 'gearing' && (
          <div className="space-y-6">
            <Card elevated className="space-y-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Cog className="w-5 h-5 text-purple-400" />
                  <CardTitle>Single-Speed Reduction Gear Ratio Trade-offs</CardTitle>
                </div>
              </CardHeader>

              <div className="text-xs text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Most production EVs utilize a single-speed fixed reduction gearbox (typically 7.5:1 to 10.5:1) rather than
                  a multi-ratio stepped transmission, because electric motors produce broad torque across a 0 to 18,000+ RPM range.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-2">
                    <h4 className="font-bold text-purple-400 text-sm">High Gear Ratio (e.g. 10.5 : 1)</h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li>Multiplies wheel torque: <code className="text-foreground">T_wheel = T_motor · i · η</code></li>
                      <li>Explosive 0–100 km/h acceleration launch</li>
                      <li>Exceptional steep hill gradeability</li>
                      <li className="text-rose-400">Lower top speed (motor hits RPM redline earlier)</li>
                      <li className="text-rose-400">Higher motor RPM at highway speeds increases iron core losses</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-200 border border-border space-y-2">
                    <h4 className="font-bold text-sky-400 text-sm">Low Gear Ratio (e.g. 6.5 : 1)</h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li>Enables high highway top speed (&gt;220 km/h)</li>
                      <li>Lower motor RPM at 120 km/h cruising saves energy</li>
                      <li className="text-amber-400">Reduced launch torque and slower 0–100 km/h time</li>
                      <li className="text-amber-400">Struggles with heavy payload hill starts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 5. Engineering Glossary */}
        {activeSection === 'glossary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { term: 'Cd (Drag Coefficient)', def: 'Dimensionless quantity representing the aerodynamic drag of an object shape through fluid.' },
              { term: 'Crr (Rolling Resistance Coefficient)', def: 'Ratio of rolling resistance force to total normal vehicle weight on the tires.' },
              { term: 'PMSM', def: 'Permanent Magnet Synchronous Motor. Rotor magnetic flux is generated by rare-earth magnets.' },
              { term: 'Field Weakening', def: 'Control technique reducing magnetic flux to extend motor operating speed past nominal base voltage.' },
              { term: 'C-Rate', def: 'Measure of the rate at which a battery is discharged relative to its maximum capacity (1C = full discharge in 1 hour).' },
              { term: 'SOC (State of Charge)', def: 'Available electrical capacity in a battery expressed as a percentage of total rated capacity.' },
              { term: 'WLTP', def: 'Worldwide Harmonized Light Vehicles Test Procedure. Modern global homologation standard for fuel consumption and range.' },
              { term: 'Regenerative Braking', def: 'Using the electric motor as a generator during deceleration to recover vehicle kinetic energy into the battery.' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface-100 border border-border space-y-1 text-xs">
                <div className="font-bold text-electric-400">{item.term}</div>
                <div className="text-slate-300 leading-relaxed">{item.def}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
