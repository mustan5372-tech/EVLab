import { describe, it, expect } from 'vitest';
import { calculateAerodynamicDrag, calculateAerodynamicPowerLossW } from '../lib/physics/aerodynamics';
import { calculateRollingResistance, calculateRollingPowerLossW } from '../lib/physics/rollingResistance';
import { calculateGradeResistance, gradePercentToRadians } from '../lib/physics/gradeResistance';
import { calculateTotalGearRatio, vehicleSpeedMsToMotorRpm, motorRpmToVehicleSpeedMs } from '../lib/physics/transmission';
import { calculateMotorBaseRpm, getMotorOperatingLimits } from '../lib/physics/motorModel';
import { calculateBatteryPackMetrics } from '../lib/physics/batteryModel';
import { calculateTotalTractiveForce, calculateTireTractionLimit } from '../lib/physics/tractiveForce';
import { DEFAULT_CITY_EV, DEFAULT_PERFORMANCE_EV } from '../lib/storage/defaultPresets';

describe('Aerodynamic Drag Physics', () => {
  it('should calculate zero drag at zero speed', () => {
    expect(calculateAerodynamicDrag(0, 0.28, 2.2)).toBe(0);
  });

  it('should correctly calculate aerodynamic drag at 100 km/h (27.78 m/s)', () => {
    const speedMs = 100 / 3.6;
    const dragN = calculateAerodynamicDrag(speedMs, 0.28, 2.2, 1.225);
    // 0.5 * 1.225 * 0.28 * 2.2 * (27.7778)^2 ≈ 291.13 N
    expect(dragN).toBeGreaterThan(290);
    expect(dragN).toBeLessThan(293);
  });

  it('should scale quadratically when velocity doubles', () => {
    const dragAt30Ms = calculateAerodynamicDrag(30, 0.30, 2.0, 1.225);
    const dragAt60Ms = calculateAerodynamicDrag(60, 0.30, 2.0, 1.225);
    expect(dragAt60Ms / dragAt30Ms).toBeCloseTo(4.0, 2);
  });

  it('should correctly calculate power loss in Watts', () => {
    const powerW = calculateAerodynamicPowerLossW(30, 0.30, 2.0, 1.225);
    const dragN = calculateAerodynamicDrag(30, 0.30, 2.0, 1.225);
    expect(powerW).toBeCloseTo(dragN * 30, 2);
  });
});

describe('Rolling Resistance Physics', () => {
  it('should correctly calculate rolling resistance force', () => {
    // Frr = Crr * m * g = 0.012 * 1500 * 9.80665 ≈ 176.52 N
    const frr = calculateRollingResistance(1500, 0.012);
    expect(frr).toBeCloseTo(176.52, 1);
  });

  it('should scale linearly with vehicle mass', () => {
    const frr1000 = calculateRollingResistance(1000, 0.01);
    const frr2000 = calculateRollingResistance(2000, 0.01);
    expect(frr2000 / frr1000).toBeCloseTo(2.0, 2);
  });
});

describe('Grade Resistance Physics', () => {
  it('should produce zero resistance on flat ground (0% grade)', () => {
    expect(calculateGradeResistance(1500, 0)).toBe(0);
  });

  it('should calculate accurate incline force for 10% grade', () => {
    // theta = atan(0.10) ≈ 0.099668 rad
    // Fg = 1500 * 9.80665 * sin(0.099668) ≈ 1463.7 N
    const fg = calculateGradeResistance(1500, 10);
    expect(fg).toBeGreaterThan(1460);
    expect(fg).toBeLessThan(1466);
  });

  it('should convert grade percentage to radians accurately', () => {
    const rad = gradePercentToRadians(100); // 100% grade = 45 degrees
    expect(rad).toBeCloseTo(Math.PI / 4, 4);
  });
});

describe('Transmission Kinematics', () => {
  it('should correctly calculate total reduction ratio', () => {
    expect(calculateTotalGearRatio({ gearRatio: 8.5, differentialRatio: 1.0, drivetrainEfficiency: 0.96 })).toBe(8.5);
  });

  it('should be reversible between vehicle speed and motor RPM', () => {
    const speedMs = 25.0; // 90 km/h
    const wheelRadius = 0.32;
    const gearRatio = 9.0;
    const rpm = vehicleSpeedMsToMotorRpm(speedMs, wheelRadius, gearRatio);
    const backToSpeedMs = motorRpmToVehicleSpeedMs(rpm, wheelRadius, gearRatio);
    expect(backToSpeedMs).toBeCloseTo(speedMs, 3);
  });
});

describe('Motor Operating Model', () => {
  it('should calculate base corner speed RPM correctly', () => {
    // 100 kW, 250 Nm -> omega = 100000 / 250 = 400 rad/s -> RPM = 400 * 60 / (2 * pi) ≈ 3819.7 RPM
    const baseRpm = calculateMotorBaseRpm(100, 250);
    expect(baseRpm).toBeGreaterThan(3815);
    expect(baseRpm).toBeLessThan(3825);
  });

  it('should maintain constant torque below base RPM and constant power above base RPM', () => {
    const motor = {
      type: 'pmsm' as const,
      peakPowerKw: 150,
      continuousPowerKw: 100,
      peakTorqueNm: 300,
      continuousTorqueNm: 180,
      maxRpm: 15000,
      baseEfficiency: 0.95,
    };

    const baseRpm = calculateMotorBaseRpm(motor.peakPowerKw, motor.peakTorqueNm); // ~4775 RPM

    // Below base speed: torque must be at peak limit
    const lowRpmPoint = getMotorOperatingLimits(2000, motor);
    expect(lowRpmPoint.availablePeakTorqueNm).toBeCloseTo(300, 1);
    expect(lowRpmPoint.isFieldWeakening).toBe(false);

    // Above base speed: power must be capped at peak kW, torque must decrease
    const highRpmPoint = getMotorOperatingLimits(8000, motor);
    expect(highRpmPoint.isFieldWeakening).toBe(true);
    expect(highRpmPoint.availablePeakPowerKw).toBeCloseTo(150, 1);
    expect(highRpmPoint.availablePeakTorqueNm).toBeLessThan(300);
  });
});

describe('Battery Pack Calculations', () => {
  it('should compute exact nominal voltage, total capacity and energy', () => {
    const pack = calculateBatteryPackMetrics({
      cellNominalVoltage: 3.7,
      cellsInSeries: 96,
      cellsInParallel: 3,
      cellCapacityAh: 50,
      usableSocMinPercent: 5,
      usableSocMaxPercent: 95,
      maxDischargeC: 3.0,
      maxChargeC: 1.0,
      internalResistanceMohm: 30,
      chargingEfficiency: 0.92,
      dischargeEfficiency: 0.96,
      initialSocPercent: 90,
    });

    expect(pack.packNominalVoltageV).toBeCloseTo(355.2, 1);
    expect(pack.packCapacityAh).toBe(150);
    expect(pack.totalEnergyKwh).toBeCloseTo(53.28, 1);
    expect(pack.usableEnergyKwh).toBeCloseTo(53.28 * 0.9, 1);
    expect(pack.maxDischargeCurrentA).toBe(450);
  });
});
