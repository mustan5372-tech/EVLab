'use client';

import React from 'react';
import { Truck, Info } from 'lucide-react';
import { useEVStore } from '@/hooks/useEVStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { Input } from '../ui/Input';
import { DrivenWheels } from '@/types/ev';

export function VehiclePanel() {
  const { currentVehicle, updateVehicleParams } = useEVStore();
  const v = currentVehicle.vehicle;

  return (
    <Card elevated className="space-y-6">
      <CardHeader className="mb-2">
        <div>
          <CardTitle>
            <Truck className="w-5 h-5 text-electric-400" />
            <span>Vehicle Chassis & Aerodynamics</span>
          </CardTitle>
          <CardDescription>
            Defines vehicle mass, aerodynamic profile, and tire rolling friction.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="space-y-5">
        {/* Total Mass */}
        <Slider
          label="Curb Mass + Payload"
          value={v.massKg}
          min={600}
          max={3500}
          step={25}
          unit="kg"
          onChange={(val) => updateVehicleParams({ massKg: val })}
          helperText="Includes vehicle chassis, battery pack, motor, and driver."
        />

        {/* Drag Coefficient */}
        <Slider
          label="Drag Coefficient (Cd)"
          value={v.cd}
          min={0.18}
          max={0.48}
          step={0.01}
          onChange={(val) => updateVehicleParams({ cd: Math.round(val * 100) / 100 })}
          helperText="Aerodynamic drag factor. Typical EV: 0.23 (sedan) to 0.32 (SUV)."
        />

        {/* Frontal Area */}
        <Slider
          label="Frontal Area (A)"
          value={v.frontalAreaM2}
          min={1.5}
          max={3.8}
          step={0.05}
          unit="m²"
          onChange={(val) => updateVehicleParams({ frontalAreaM2: Math.round(val * 100) / 100 })}
          helperText="Front projected surface area facing oncoming airflow."
        />

        {/* Rolling Resistance Coefficient */}
        <Slider
          label="Rolling Resistance (Crr)"
          value={v.crr}
          min={0.006}
          max={0.025}
          step={0.001}
          onChange={(val) => updateVehicleParams({ crr: Math.round(val * 1000) / 1000 })}
          helperText="Tire deformation hysteresis. Low-rolling-resistance EV tires: ~0.008 - 0.011."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Wheel Radius */}
          <Input
            label="Dynamic Wheel Radius"
            type="number"
            step="0.01"
            min="0.20"
            max="0.50"
            unit="m"
            value={v.wheelRadiusM}
            onChange={(e) => updateVehicleParams({ wheelRadiusM: parseFloat(e.target.value) || 0.3 })}
            helperText="Nominal loaded radius (~0.31m for 235/45 R18)."
          />

          {/* Driven Wheels */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Drivetrain Architecture</label>
            <div className="grid grid-cols-3 gap-2">
              {(['fwd', 'rwd', 'awd'] as DrivenWheels[]).map((dw) => (
                <button
                  key={dw}
                  type="button"
                  onClick={() => updateVehicleParams({ drivenWheels: dw })}
                  className={`py-2 rounded-2xl text-xs font-bold uppercase transition-all duration-150 border ${
                    v.drivenWheels === dw
                      ? 'bg-electric-500/15 border-electric-500/40 text-electric-400'
                      : 'bg-surface-200 border-border text-slate-600 dark:text-slate-400 hover:text-foreground'
                  }`}
                >
                  {dw}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Affects max traction limit under hard acceleration.</p>
          </div>
        </div>

        {/* Road Grade */}
        <Slider
          label="Road Incline Grade"
          value={v.roadGradePercent || 0}
          min={0}
          max={30}
          step={1}
          unit="%"
          onChange={(val) => updateVehicleParams({ roadGradePercent: val })}
          helperText="Simulate uphill road gradients (0% = level highway, 15% = steep hill)."
        />
      </div>
    </Card>
  );
}
